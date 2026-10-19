import { assertEquals, assertThrows } from "@std/assert";
import {
  ChecksumPolicy,
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../models/savefile.ts";
import { SaveSlot } from "../models/saveslot.ts";
import {
  applyCorrections,
  discoverCorrections,
  previewCorrections,
} from "./corrections.ts";
import { FileFormat, FileUtil } from "./fileutil.ts";

function damagedPrimaryWithSmallerBackup(): SraSaveFile {
  const save = new SraSaveFile();
  save.slots[0].maxHealth = 160;
  save.slots[0].data[0x1C] = 0;
  save.slots[0].updateChecksum();
  save.backups[0].maxHealth = 48;
  save.backups[0].updateChecksum();
  return save;
}

Deno.test("recovery discovery offers repair and replacement separately without defaulting replacement", () => {
  const save = damagedPrimaryWithSmallerBackup();
  const before = save.getData();
  const plan = discoverCorrections(save);
  const restoration = plan.recovery.find((item) =>
    item.id.includes("backup.0.to.primary")
  )!;

  assertEquals(
    plan.suggestions.some((item) => item.scope.field === "marker"),
    true,
  );
  assertEquals(
    plan.suggestions.some((item) => item.scope.field === "checksum"),
    true,
  );
  assertEquals(restoration.action, "restore");
  assertEquals(restoration.sourceIntegrity.checksumValid, true);
  assertEquals(restoration.destinationIntegrity.markerValid, false);
  assertEquals(plan.suggestions.every((item) => item.recommended), true);
  assertEquals(before, save.getData());
});

Deno.test("restore preview protects source and destination index while showing copied checksum and optional recalculation", () => {
  const save = damagedPrimaryWithSmallerBackup();
  save.slots[0].fileIndex = 0;
  save.backups[0].fileIndex = 2;
  const before = save.getData();
  const source = save.backups[0].data.slice();
  const plan = discoverCorrections(save);
  const restoration = plan.recovery.find((item) =>
    item.id.includes("backup.0.to.primary")
  )!;

  const preserved = previewCorrections(save, plan, [restoration.id], {
    [restoration.id]: false,
  });
  assertEquals(save.getData(), before);
  assertEquals(preserved.replacements[0].checksumRecalculated, false);
  assertEquals(preserved.replacements[0].after.slice(0x1352, 0x1354), [
    ...source.slice(0x1352, 0x1354),
  ]);
  assertEquals(preserved.replacements[0].after.slice(0x1354, 0x1358), [
    ...save.slots[0].data.slice(0x1354, 0x1358),
  ]);

  const recalculated = previewCorrections(save, plan, [restoration.id]);
  assertEquals(recalculated.replacements[0].checksumRecalculated, true);
  assertEquals(
    recalculated.replacements[0].after[0x1352] * 256 +
      recalculated.replacements[0].after[0x1353],
    new SaveSlot(Uint8Array.from(recalculated.replacements[0].after))
      .calculateChecksum(),
  );
});

Deno.test("replacement selection is explicit, stale-safe, and exclusive per destination", () => {
  const save = damagedPrimaryWithSmallerBackup();
  const plan = discoverCorrections(save);
  const restore = plan.recovery.find((item) =>
    item.id.includes("backup.0.to.primary")
  )!;
  const sync = plan.recovery.find((item) =>
    item.action === "synchronize" && item.index === 0
  )!;
  const restoreToBackup = plan.recovery.find((item) =>
    item.action === "restore" && item.destination === "backup" &&
    item.index === 0
  )!;

  assertThrows(
    () => previewCorrections(save, plan, [restore.id, restoreToBackup.id]),
    Error,
  );
  save.backups[0].rupees = 10;
  assertThrows(
    () => previewCorrections(save, plan, [restore.id]),
    Error,
    "stale",
  );
  assertEquals(sync.destination, "backup");
});

Deno.test("declined replacement leaves both records and export bytes unchanged", () => {
  const save = damagedPrimaryWithSmallerBackup();
  const before = save.getDataForWrite(undefined, ChecksumPolicy.Preserve);
  const plan = discoverCorrections(save);

  previewCorrections(save, plan, []);

  assertEquals(
    save.getDataForWrite(undefined, ChecksumPolicy.Preserve),
    before,
  );
});

Deno.test("identical pairs produce no replacement and empty sources are never recommended", () => {
  const identical = new SraSaveFile();
  assertEquals(discoverCorrections(identical).recovery, []);

  const save = new SraSaveFile();
  save.slots[0].data.set(SaveSlot.createEmpty(0).data);
  save.backups[0].maxHealth = 48;
  save.backups[0].updateChecksum();
  const choices = discoverCorrections(save).recovery;
  assertEquals(choices.map((item) => item.id), [
    "recovery.restore:backup.0.to.primary",
  ]);
  assertEquals(choices[0].sourceIntegrity.checksumValid, true);
});

Deno.test("both damaged occupied records remain copy sources with integrity findings", () => {
  const save = damagedPrimaryWithSmallerBackup();
  save.backups[0].data[0x1C] = 0;
  save.backups[0].checksum ^= 1;
  save.slots[0].checksum ^= 1;

  const choices = discoverCorrections(save).recovery;

  assertEquals(choices.length, 2);
  assertEquals(
    choices.every((item) => !item.sourceIntegrity.markerValid),
    true,
  );
  assertEquals(
    choices.every((item) => !item.sourceIntegrity.checksumValid),
    true,
  );
});

Deno.test("primary-to-backup synchronization is explicit and preserves primary and destination index", () => {
  const save = new SraSaveFile();
  save.slots[0].rupees = 321;
  save.slots[0].updateChecksum();
  save.backups[0].rupees = 0;
  save.backups[0].fileIndex = 2;
  save.backups[0].updateChecksum();
  const primary = save.slots[0].data.slice();
  const plan = discoverCorrections(save);
  const synchronization = plan.recovery.find((item) =>
    item.action === "synchronize" && item.index === 0
  )!;
  const before = save.getData();

  const preview = previewCorrections(save, plan, []);
  assertEquals(preview.replacements, []);
  assertEquals(save.getData(), before);
  const result = applyCorrections(save, plan, [synchronization.id]);

  assertEquals(result.replacements.length, 1);
  assertEquals(save.slots[0].data, primary);
  assertEquals(save.backups[0].rupees, 321);
  assertEquals(save.backups[0].fileIndex, 2);
});

Deno.test("damaged-source marker repair is independent and checksum uses the final destination", () => {
  const save = new SraSaveFile();
  save.backups[0].rupees = 12;
  save.backups[0].data[0x1C] = 0;
  save.backups[0].updateChecksum();
  const source = save.backups[0].data.slice();
  const plan = discoverCorrections(save);
  const restore = plan.recovery.find((item) => item.action === "restore")!;
  const unrepaired = previewCorrections(save, plan, [restore.id]);
  assertEquals(
    new SaveSlot(Uint8Array.from(unrepaired.replacements[0].after))
      .isPatternValid,
    false,
  );
  const result = applyCorrections(save, plan, [restore.id], {}, {
    [restore.id]: true,
  });
  assertEquals(result.replacements[0].markerRepaired, true);
  assertEquals(save.slots[0].isPatternValid, true);
  assertEquals(save.slots[0].isChecksumValid(), true);
  assertEquals(save.backups[0].data, source);
});

Deno.test("recovery replacement round-trips through SRA and SRM in both byte orders", () => {
  for (const format of [FileFormat.SRA, FileFormat.SRM]) {
    for (
      const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
    ) {
      const source = new SraSaveFile();
      const sourceBytes = source.getData();
      sourceBytes.fill(0xA9, SraSaveFile.requiredSize);
      source.read(sourceBytes);
      source.slots[0].maxHealth = 160;
      source.backups[0].maxHealth = 48;
      source.backups[0].updateChecksum();
      source.backups[0].fileIndex = 2;
      const container = new SrmSaveFile();
      container.eeprom.fill(0x12);
      container.mempacks.forEach((pack, index) => pack.fill(0x20 + index));
      container.flashram.fill(0x56);
      source.sourceSrmData = container.data;
      const original = FileUtil.getFileData(
        source,
        format,
        order,
        ChecksumPolicy.Preserve,
      );
      const save = FileUtil.loadFileFromBuffer(original, order, "game.srm");
      const sourceRecord = save.backups[0].data.slice();
      const plan = discoverCorrections(save);
      const replacement = plan.recovery.find((item) =>
        item.action === "restore"
      )!;
      previewCorrections(save, plan, [replacement.id]);
      applyCorrections(save, plan, [replacement.id]);
      assertEquals(save.backups[0].data, sourceRecord);
      const result = FileUtil.getFileData(
        save,
        format,
        order,
        ChecksumPolicy.Preserve,
      );
      const reloaded = FileUtil.loadFileFromBuffer(result, order, "game.srm");
      assertEquals(reloaded.slots[0].maxHealth, 48);
      assertEquals(reloaded.slots[0].fileIndex, 0);
      assertEquals(reloaded.backups[0].data, sourceRecord);
      assertEquals(
        reloaded.getData().slice(SraSaveFile.requiredSize),
        new Uint8Array(SraSaveFile.acceptedSize - SraSaveFile.requiredSize)
          .fill(0xA9),
      );
      if (format === FileFormat.SRM) {
        const outputContainer = new SrmSaveFile().read(result, order);
        assertEquals(outputContainer.eeprom, container.eeprom);
        assertEquals(outputContainer.mempacks, container.mempacks);
        assertEquals(outputContainer.flashram, container.flashram);
      }
    }
  }
});
