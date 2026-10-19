import { assertEquals, assertThrows } from "@std/assert";
import { ChecksumPolicy, SraSaveFile } from "../models/savefile.ts";
import { FileUtil } from "../utils/fileutil.ts";
import { CorrectionReview } from "./correctionreview.ts";

Deno.test("review recommends corrections without mutation and applies only on confirmation", () => {
  const save = new SraSaveFile();
  save.slots[0].data[0x1C] = 0;
  const before = save.getData();
  const review = new CorrectionReview(save);
  review.open();
  assertEquals(review.selected.length, 2);
  assertEquals(review.preview().changes.length, 1);
  assertEquals(save.getData(), before);
  review.confirm();
  assertEquals(save.slots[0].isValid, true);
  assertEquals(review.history.length, 1);
  assertEquals(
    review.findings.some((finding) => finding.ruleId === "slot.marker"),
    false,
  );
});

Deno.test("review selection updates checksum preview, cancels safely and preserves checksum opt-outs", () => {
  const save = new SraSaveFile();
  save.slots[0].data[0x1C] = 0;
  save.slots[0].checksum = 0x1234;
  const before = save.getData();
  const review = new CorrectionReview(save);
  review.open();
  const checksum = review.plan.suggestions.find((item) =>
    item.scope.field === "checksum"
  )!;
  review.toggle(checksum.id);
  assertEquals(review.preview().requiredCorrections, [checksum.id]);
  assertEquals(save.getData(), before);
  review.cancel();
  assertEquals(review.checksumPolicy, undefined);
  assertEquals(save.getData(), before);
  review.open();
  review.toggle(checksum.id);
  review.confirm();
  assertEquals(save.slots[0].checksum, 0x1234);
  assertEquals(review.checksumPolicy, ChecksumPolicy.Preserve);
  assertEquals(
    save.getData(undefined, review.checksumPolicy).slice(
      0x20 + 0x1352,
      0x20 + 0x1354,
    ),
    new Uint8Array([0x12, 0x34]),
  );
});

Deno.test("retaining a field requires explicitly changing the outcome before its correction can apply", () => {
  const save = new SraSaveFile();
  save.slots[0].checksum = 0x1234;
  const review = new CorrectionReview(save);
  review.open();
  const id = review.selected[0];
  review.retain(id);
  assertEquals(review.selected.includes(id), false);
  review.toggle(id);
  assertThrows(() => review.confirm(), Error, "requested value");
  assertEquals(save.slots[0].checksum, 0x1234);
  review.allowCorrection(id);
  review.confirm();
  assertEquals(save.slots[0].isChecksumValid(), true);
});

Deno.test("stale review fails atomically and refresh requires another confirmation", () => {
  const save = new SraSaveFile();
  save.slots[0].checksum = 0x1234;
  const review = new CorrectionReview(save);
  review.open();
  save.slots[0].rupees = 42;
  const edited = save.getData();
  assertThrows(() => review.confirm(), Error, "stale");
  assertEquals(save.getData(), edited);
  assertEquals(review.history, []);
  review.refresh();
  assertEquals(save.getData(), edited);
  review.confirm();
  assertEquals(save.slots[0].rupees, 42);
  assertEquals(save.slots[0].isChecksumValid(), true);
});

Deno.test("findings without corrections can be reviewed and decline-all preserves bytes", () => {
  const save = new SraSaveFile();
  const review = new CorrectionReview(save);
  review.open();
  assertEquals(review.plan.suggestions, []);
  assertEquals(
    review.findings.some((item) => item.category === "uncertainty"),
    true,
  );
  save.slots[0].checksum = 0x1234;
  review.open();
  const before = save.getData();
  review.declineAll();
  assertEquals(review.preview().changes, []);
  review.confirm();
  assertEquals(save.getData(undefined, review.checksumPolicy), before);
});

Deno.test("source evidence stays inspectable separately from current findings after correction", () => {
  const source = new SraSaveFile();
  source.header.data[3] = 0;
  const save = FileUtil.loadFileFromBuffer(
    source.getData(),
    undefined,
    "source.srm",
  );
  const evidence = structuredClone(save.inputInterpretation);
  const review = new CorrectionReview(save);
  review.open();
  review.confirm();
  assertEquals(
    review.findings.some((item) => item.ruleId === "header.signature"),
    false,
  );
  assertEquals(
    review.findings.some((item) => item.ruleId === "file.extension-mismatch"),
    false,
  );
  assertEquals(
    review.sourceFindings.some((item) =>
      item.ruleId === "file.extension-mismatch"
    ),
    true,
  );
  assertEquals(save.inputInterpretation, evidence);
});

Deno.test("a retained outcome survives confirmation and reopening until explicitly changed", () => {
  const save = new SraSaveFile();
  save.slots[0].checksum = 0x1234;
  const review = new CorrectionReview(save);
  review.open();
  const id = review.selected[0];
  review.retain(id);
  review.confirm();
  review.open();
  assertEquals(review.selected.includes(id), false);
  review.allowCorrection(id);
  review.confirm();
  assertEquals(save.slots[0].isChecksumValid(), true);
});

Deno.test("review compares paired progress and replaces only after explicit selection and confirmation", () => {
  const save = new SraSaveFile();
  save.slots[0].maxHealth = 160;
  save.backups[0].maxHealth = 48;
  save.backups[0].updateChecksum();
  save.backups[0].fileIndex = 2;
  const source = save.backups[0].data.slice();
  const before = save.getData();
  const review = new CorrectionReview(save);
  review.open();
  const recovery = review.plan.recovery.find((item) =>
    item.action === "restore"
  )!;

  assertEquals(
    review.recoveryPairs[0].comparisons.find((item) =>
      item.field === "healthCapacity"
    )?.equal,
    false,
  );
  assertEquals(review.selected.includes(recovery.id), false);
  assertEquals(save.getData(), before);
  review.toggle(recovery.id);
  const preview = review.preview();
  assertEquals(preview.replacements.length, 1);
  assertEquals(save.getData(), before);
  const result = review.confirm();
  assertEquals(result.replacements.length, 1);
  assertEquals(save.slots[0].maxHealth, 48);
  assertEquals(save.slots[0].fileIndex, 0);
  assertEquals(save.backups[0].data, source);
});

Deno.test("declining restoration checksum recalculation preserves the copied checksum through export", () => {
  const save = new SraSaveFile();
  save.slots[0].maxHealth = 160;
  save.backups[0].maxHealth = 48;
  save.backups[0].checksum = 0x1234;
  const review = new CorrectionReview(save);
  review.open();
  const recovery = review.plan.recovery.find((item) =>
    item.action === "restore"
  )!;
  review.toggle(recovery.id);
  review.setReplacementChecksum(recovery.id, false);
  review.confirm();

  assertEquals(save.slots[0].checksum, 0x1234);
  assertEquals(review.checksumPolicy, ChecksumPolicy.Preserve);
  assertEquals(
    save.getDataForWrite(undefined, review.checksumPolicy).slice(
      0x20 + 0x1352,
      0x20 + 0x1354,
    ),
    new Uint8Array([0x12, 0x34]),
  );
});

Deno.test("stale recovery records require a refreshed review", () => {
  const save = new SraSaveFile();
  save.slots[0].maxHealth = 160;
  save.backups[0].maxHealth = 48;
  const review = new CorrectionReview(save);
  review.open();
  const recovery = review.plan.recovery.find((item) =>
    item.action === "restore"
  )!;
  review.toggle(recovery.id);
  save.backups[0].rupees = 10;
  const edited = save.getData();

  assertThrows(() => review.confirm(), Error, "stale");
  assertEquals(save.getData(), edited);
});
