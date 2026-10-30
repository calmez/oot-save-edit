import { assertEquals, assertThrows } from "@std/assert";

import {
  applyCorrections,
  applyRecommendedCorrections,
  ChecksumPolicy,
  CorrectionError,
  DiagnosticConfidence,
  discoverCorrections,
  ExportByteOrder,
  FileFormat,
  FileUtil,
  previewCorrections,
  SraSaveFile,
  SrmSaveFile,
} from "../index.ts";

Deno.test("correction discovery describes structural changes without mutating evidence", () => {
  const save = new SraSaveFile();
  save.header.data[3] = 0;
  const before = save.getData();
  const plan = discoverCorrections(save);
  assertEquals(plan.suggestions.map((suggestion) => suggestion.id), [
    "header.signature:header.signature",
  ]);
  assertEquals(plan.suggestions[0].changes[0].after, [
    0x98,
    9,
    0x10,
    0x21,
    0x5A,
    0x45,
    0x4C,
    0x44,
    0x41,
  ]);
  assertEquals(save.getData(), before);
});

Deno.test("preview and single signature application preserve valid debug padding and record identities", () => {
  const save = new SraSaveFile();
  save.header.makeValid(true);
  save.header.data[3] = 0;
  save.header.data[20] = 0xAB;
  const before = save.getData();
  const header = save.header;
  const slot = save.slots[0];
  const plan = discoverCorrections(save);
  const ids = plan.suggestions.map((item) => item.id);
  const preview = previewCorrections(save, plan, ids);
  assertEquals(preview.changes.length, 1);
  assertEquals(save.getData(), before);
  assertEquals(applyCorrections(save, plan, ids), preview);
  const expected = before.slice();
  expected[3] = 0x98;
  assertEquals(save.getData(), expected);
  assertEquals(save.header === header, true);
  assertEquals(save.slots[0] === slot, true);
});

Deno.test("outcome constraints exclude conflicting recommendations and reject explicit selections atomically", () => {
  const save = new SraSaveFile();
  save.header.data[3] = 0;
  save.header.data[12] = 9;
  const before = save.getData();
  const plan = discoverCorrections(save, [{
    scope: { kind: "header", field: "signature" },
    value: [...save.header.data.slice(3, 12)],
  }]);
  assertEquals(plan.conflicts[0].code, "outcome");
  assertEquals(plan.suggestions.map((item) => item.recommended), [false, true]);
  const error = assertThrows(
    () => applyCorrections(save, plan, plan.suggestions.map((item) => item.id)),
    CorrectionError,
  );
  assertEquals(error.conflicts[0].code, "outcome");
  assertEquals(save.getData(), before);
  const result = applyRecommendedCorrections(save, plan);
  assertEquals(result.excluded, [plan.suggestions[0].id]);
  assertEquals(result.conflicts[0].code, "outcome");
  const expected = before.slice();
  expected[12] = 0;
  assertEquals(save.getData(), expected);
});

Deno.test("marker and checksum selections are independent and combined results are order independent", () => {
  for (const originallyValid of [false, true]) {
    for (const selection of ["none", "marker", "checksum", "both", "reverse"]) {
      const save = new SraSaveFile();
      save.slots[0].data[0x1C] = 0;
      if (originallyValid) save.slots[0].updateChecksum();
      const storedChecksum = save.slots[0].checksum;
      const before = save.getData();
      const plan = discoverCorrections(save);
      const marker = plan.suggestions.find((item) =>
        item.scope.field === "marker"
      )!;
      const checksum = plan.suggestions.find((item) =>
        item.scope.field === "checksum"
      )!;
      assertEquals(checksum.dependsOn, [marker.id]);
      const ids = selection === "none"
        ? []
        : selection === "marker"
        ? [marker.id]
        : selection === "checksum"
        ? [checksum.id]
        : selection === "both"
        ? [marker.id, checksum.id]
        : [checksum.id, marker.id];
      const preview = previewCorrections(save, plan, ids);
      assertEquals(save.getData(), before);
      assertEquals(applyCorrections(save, plan, ids), preview);
      const expected = before.slice();
      if (ids.includes(marker.id)) expected[0x20 + 0x1C] = 0x5A;
      if (ids.includes(checksum.id)) {
        // Replacing the missing high byte of the first marker word adds 0x5A00.
        const value = originallyValid && !ids.includes(marker.id)
          ? storedChecksum
          : originallyValid
          ? (storedChecksum + 0x5A00) & 0xFFFF
          : storedChecksum;
        expected[0x20 + 0x1352] = value >>> 8;
        expected[0x20 + 0x1353] = value & 0xFF;
        if (!originallyValid && !ids.includes(marker.id)) {
          const corruptedChecksum = (storedChecksum - 0x5A00) & 0xFFFF;
          expected[0x20 + 0x1352] = corruptedChecksum >>> 8;
          expected[0x20 + 0x1353] = corruptedChecksum & 0xFF;
        }
      }
      assertEquals(save.getData(), expected, `${originallyValid}/${selection}`);
      assertEquals(
        preview.requiredCorrections,
        selection === "marker" && originallyValid ? [checksum.id] : [],
      );
    }
  }
});

Deno.test("stale, duplicate, unsupported and modified selections fail before any writes", () => {
  for (
    const failure of ["stale", "duplicate", "unknown", "modified", "uncertain"]
  ) {
    const save = new SraSaveFile();
    save.header.data[3] = 0;
    save.backups[0].checksum ^= 1;
    const plan = discoverCorrections(save);
    const ids = plan.suggestions.map((item) => item.id);
    if (failure === "stale") save.backups[0].playerName = "LINK";
    if (failure === "duplicate") ids.push(ids[0]);
    if (failure === "unknown") ids.push("restore-backup");
    if (failure === "modified") plan.suggestions[1].changes[0].after = [0, 0];
    if (failure === "uncertain") {
      plan.suggestions[1].confidence = DiagnosticConfidence.Unknown;
    }
    const before = save.getData();
    const exportBefore = save.getDataForWrite();
    const error = assertThrows(
      () => applyCorrections(save, plan, ids),
      CorrectionError,
    );
    assertEquals(
      error.conflicts[0].code,
      failure === "stale"
        ? "stale"
        : failure === "duplicate"
        ? "selection"
        : "unsupported",
    );
    assertEquals(save.getData(), before);
    assertEquals(save.getDataForWrite(), exportBefore);
  }
});

Deno.test("uncertain interpretations have no speculative corrections and empty records stay untouched", () => {
  const save = new SraSaveFile();
  save.slots[0].data.fill(0xEE, 4, 8);
  save.slots[0].updateChecksum();
  save.slots[1].checksum ^= 1;
  const before = save.getData();
  const plan = discoverCorrections(save);
  assertEquals(plan.suggestions, []);
  assertEquals(
    plan.unresolved.some((item) => item.ruleId === "age.unknown"),
    true,
  );
  assertEquals(applyRecommendedCorrections(save, plan).changes, []);
  assertEquals(save.getData(), before);
});

Deno.test("invalid outcome constraints fail contextually without writes", () => {
  const save = new SraSaveFile();
  const before = save.getData();
  const error = assertThrows(
    () =>
      discoverCorrections(save, [{
        scope: { kind: "header", field: "signature" },
        value: [999],
      }]),
    CorrectionError,
  );
  assertEquals(error.conflicts[0].code, "unsupported");
  assertEquals(save.getData(), before);
});

Deno.test("marker-only correction preserves source evidence and checksum opt-out across layouts and byte orders without Deno", () => {
  for (const format of [FileFormat.SRA, FileFormat.SRM]) {
    for (
      const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
    ) {
      const source = new SraSaveFile().getData();
      source.fill(0x78, SraSaveFile.requiredSize);
      const model = new SraSaveFile().read(source);
      model.slots[0].data[0x1C] = 0;
      model.slots[0].updateChecksum();
      const container = new SrmSaveFile();
      container.eeprom.fill(0x12);
      container.mempacks.forEach((pack) => pack.fill(0x34));
      container.flashram.fill(0x56);
      model.sourceSrmData = container.data;
      const original = FileUtil.getFileData(
        model,
        format,
        order,
        ChecksumPolicy.Preserve,
      );
      const save = FileUtil.loadFileFromBuffer(original, order, "game.sra");
      const evidence = structuredClone({
        input: save.inputInterpretation,
        source: save.sourceFile,
        container: save.sourceSrmData,
      });
      const exportBefore = FileUtil.getFileData(save, format);
      const slot = save.slots[0];
      const checksum = slot.checksum;
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Deno")!;
      Reflect.deleteProperty(globalThis, "Deno");
      try {
        const plan = discoverCorrections(save);
        const marker = plan.suggestions.find((item) =>
          item.scope.field === "marker"
        )!;
        const preview = previewCorrections(save, plan, [marker.id]);
        assertEquals(FileUtil.getFileData(save, format), exportBefore);
        assertEquals(
          FileUtil.getFileData(save, format, order, ChecksumPolicy.Preserve),
          original,
        );
        assertEquals(applyCorrections(save, plan, [marker.id]), preview);
        assertEquals(slot.checksum, checksum);
        assertEquals(slot.isChecksumValid(), false);
        const expected = original.slice();
        const sramOffset = format === FileFormat.SRA
          ? 0
          : SrmSaveFile.EEPROM_SIZE +
            SrmSaveFile.MEMPACK_COUNT * SrmSaveFile.MEMPACK_SIZE;
        expected[
          sramOffset + 0x20 + 0x1C +
          (order === ExportByteOrder.WordSwapped ? 3 : 0)
        ] = 0x5A;
        assertEquals(
          FileUtil.getFileData(
            save,
            format,
            ExportByteOrder.Automatic,
            ChecksumPolicy.Preserve,
          ),
          expected,
        );
        assertEquals(save.slots[0] === slot, true);
        assertEquals({
          input: save.inputInterpretation,
          source: save.sourceFile,
          container: save.sourceSrmData,
        }, evidence);
        const ordinary = FileUtil.getFileData(save, format);
        assertEquals(
          FileUtil.loadFileFromBuffer(ordinary, order).slots[0]
            .isChecksumValid(),
          true,
        );
        assertEquals(slot.checksum, checksum);
      } finally {
        Object.defineProperty(globalThis, "Deno", descriptor);
      }
    }
  }
});

Deno.test("serialized plans remain applicable when callers reconstruct property order", () => {
  const save = new SraSaveFile();
  save.header.data[3] = 0;
  const plan = JSON.parse(JSON.stringify(discoverCorrections(save)));
  plan.suggestions[0].scope = { field: "signature", kind: "header" };
  plan.suggestions[0].changes[0].scope = { field: "signature", kind: "header" };
  const result = applyCorrections(save, plan, [plan.suggestions[0].id]);
  assertEquals(result.changes.length, 1);
  assertEquals(save.header.isPatternValid, true);
});
