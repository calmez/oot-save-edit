import { assertEquals, assertThrows } from "@std/assert";

import { SraSaveFile, SrmSaveFile } from "../models/savefile.ts";
import { ChecksumPolicy, ExportByteOrder } from "../models/savefile.ts";
import { CorrectionReview } from "../ui/correctionreview.ts";
import { FileFormat, FileUtil } from "./fileutil.ts";
import {
  applyCorrections,
  applyRecommendedCorrections,
  previewCorrections,
} from "./corrections.ts";
import {
  prepareSkulltulaLocations,
  prepareSkulltulaTotal,
} from "./skulltulas.ts";

Deno.test("verified location intent stages only named bits and reports partial coverage", () => {
  const save = new SraSaveFile();
  // Synthetic source-backed fixture: group 0x0C is word 3's low byte.
  save.slots[0].data[0xEAB] = 0x80;
  const before = save.getData();
  const plan = prepareSkulltulaLocations(save, "primary", 0, {
    "kokiri-bean-patch": true,
  });
  assertEquals(save.getData(), before);
  const result = previewCorrections(save, plan, []);
  assertEquals(result.changes[0].after, [0x81]);
  assertEquals(
    plan.unresolved.some((item) =>
      item.ruleId === "skulltula.coverage" &&
      item.explanation.includes("3 of 100")
    ),
    true,
  );
  assertEquals(
    plan.suggestions.some((item) => item.scope.field === "goldSkulltulaTokens"),
    false,
  );
  applyCorrections(save, plan, []);
  assertEquals(save.slots[0].data[0xEAB], 0x81);
  assertEquals(save.slots[0].goldSkulltulaTokens, 0);
});

Deno.test("retaining the indicator conflicts atomically until explicitly allowed; checksum covers final intent", () => {
  const save = new SraSaveFile();
  const before = save.getData();
  const review = new CorrectionReview(save);
  review.stageSkulltula({
    kind: "locations",
    record: "backup",
    index: 0,
    locations: { "kokiri-house-of-twins": true },
  });
  const id =
    review.suggestions.find((item) =>
      item.scope.field === "skulltula.indicator"
    )!.id;
  review.retain(id);
  review.toggle(id);
  assertThrows(() => review.confirm(), Error, "requested value");
  assertEquals(save.getData(), before);
  review.allowCorrection(id);
  review.confirm();
  assertEquals(save.backups[0].data[0xEAB], 4);
  assertEquals(save.backups[0].isChecksumValid(), true);
  assertEquals(save.slots[0].data[0xEAB], 0);
});

Deno.test("zero and removal preserve the indicator; invalid requests and selections never partially apply", () => {
  const save = new SraSaveFile();
  save.slots[0].data[0xA5] |= 0x80;
  save.slots[0].data[0xEAB] = 0x81;
  const plan = prepareSkulltulaLocations(save, "primary", 0, {
    "kokiri-bean-patch": false,
  });
  assertEquals(
    plan.suggestions.some((item) => item.scope.field === "skulltula.indicator"),
    false,
  );
  applyRecommendedCorrections(save, plan);
  assertEquals(save.slots[0].data[0xEAB], 0x80);
  applyRecommendedCorrections(
    save,
    prepareSkulltulaTotal(save, "primary", 0, 0),
  );
  assertEquals(save.slots[0].data[0xA5] & 0x80, 0x80);
  const before = save.getData();
  for (const total of [-1, 101, 1.5, NaN]) {
    assertThrows(() => prepareSkulltulaTotal(save, "primary", 0, total));
  }
  assertThrows(() => prepareSkulltulaTotal(save, "primary", 3, 1));
  assertThrows(
    () => prepareSkulltulaTotal(save, "primary", 1, 1),
    Error,
    "Initialize",
  );
  assertThrows(() => prepareSkulltulaLocations(save, "primary", 0, {}));
  assertThrows(() =>
    prepareSkulltulaLocations(save, "primary", 0, { unknown: true } as never)
  );
  const valid = prepareSkulltulaTotal(save, "primary", 0, 5);
  assertThrows(() => applyCorrections(save, valid, ["invented"]));
  assertEquals(save.getData(), before);
});

Deno.test("declined adjustments preserve unknown bytes and container sections through both SRAM byte orders", () => {
  for (
    const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
  ) {
    const original = new SraSaveFile();
    original.slots[0].data[0xEAB] = 0x80;
    const native = original.getData();
    native[0x7FFF] = 0x63;
    const container = new SrmSaveFile();
    container.eeprom[0] = 0x42;
    container.flashram[0] = 0x71;
    container.sram.set(
      order === ExportByteOrder.BigEndian ? native : FileUtil.byteSwap(native),
    );
    const bytes = container.getData();
    const save = new SrmSaveFile().read(bytes).saveFile;
    const plan = prepareSkulltulaLocations(save, "primary", 0, {
      "kokiri-bean-patch": true,
    });
    applyCorrections(save, plan, []);
    const actual = FileUtil.getFileData(
      save,
      FileFormat.SRM,
      ExportByteOrder.Automatic,
      ChecksumPolicy.Preserve,
    );
    const expected = new SrmSaveFile().read(bytes);
    const changed = native.slice();
    changed[0x20 + 0xEAB] = 0x81;
    expected.sram.set(
      order === ExportByteOrder.BigEndian
        ? changed
        : FileUtil.byteSwap(changed),
    );
    assertEquals(actual, expected.getData());
  }
});

Deno.test("Skulltula review declines adjustments, cancels, refreshes stale edits and preserves exported bytes", () => {
  const save = new SraSaveFile();
  save.slots[0].data[0xEAB] = 0x80;
  save.slots[0].data[0xED4] = 0x42; // Acquisition history remains independent.
  save.slots[0].updateChecksum();
  const original = save.getData();
  const review = new CorrectionReview(save);
  const intent = {
    kind: "locations",
    record: "primary",
    index: 0,
    locations: { "kokiri-bean-patch": true },
  } as const;
  review.stageSkulltula(intent);
  assertEquals(
    review.suggestions.find((item) =>
      item.scope.field === "skulltula.indicator"
    )?.recommended,
    true,
  );
  review.preview();
  review.cancel();
  assertEquals(save.getData(), original);
  review.stageSkulltula(intent);
  review.declineAll();
  save.slots[0].rupees = 12;
  const changed = save.getData();
  assertThrows(() => review.confirm(), Error, "stale");
  assertEquals(save.getData(), changed);
  review.refresh();
  review.declineAll();
  review.confirm();
  assertEquals(review.checksumPolicy, ChecksumPolicy.Preserve);
  const exported = FileUtil.getFileData(
    save,
    FileFormat.SRA,
    ExportByteOrder.BigEndian,
    review.checksumPolicy,
  );
  const expected = changed.slice();
  expected[0x20 + 0xEAB] = 0x81;
  assertEquals(exported, expected);
});

Deno.test("total intent keeps the requested total without inventing locations; indicator is an optional alternative", () => {
  const save = new SraSaveFile();
  save.slots[0].data[0xEAB] = 0x83;
  save.slots[0].data[0xA4] = 0xA0; // Pieces of Heart, unrelated to token indicator.
  save.slots[0].data[0xA5] = 0x41;
  const plan = prepareSkulltulaTotal(save, "primary", 0, 1);
  const indicator = plan.suggestions.find((item) =>
    item.scope.field === "skulltula.indicator"
  )!;
  assertEquals(indicator.recommended, false);
  assertEquals(
    plan.unresolved.some((item) => item.ruleId === "skulltula.disagreement"),
    true,
  );
  applyCorrections(save, plan, [indicator.id]);
  assertEquals(save.slots[0].goldSkulltulaTokens, 1);
  assertEquals(save.slots[0].data[0xEAB], 0x83);
  assertEquals([...save.slots[0].data.slice(0xA4, 0xA6)], [0xA0, 0xC1]);
});
