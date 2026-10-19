import { assertEquals, assertThrows } from "@std/assert";
import { stub } from "@std/testing/mock";

import {
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../models/savefile.ts";
import { SaveHeader } from "../models/saveheader.ts";
import { diagnoseSave, DiagnosticCategory } from "./diagnostics.ts";
import { FileFormat, FileUtil } from "./fileutil.ts";
import { inspectInputByteOrder, UnresolvedByteOrderError } from "../index.ts";

Deno.test("loading ambiguous SRAM requires an explicit input choice", () => {
  const source = new Uint8Array(SraSaveFile.acceptedSize);
  assertThrows(() => FileUtil.loadFileFromBuffer(source), Error, "byte order");
  const save = new SraSaveFile().read(source, ExportByteOrder.WordSwapped);
  assertEquals(save.isByteSwapped, true);
  assertEquals(save.getData(), source);
});

Deno.test("conflicting input evidence stays visible after explicit SRA and SRM selection", () => {
  const sram = FileUtil.byteSwap(new SraSaveFile().getData());
  sram.set(SaveHeader.createBlank().data);
  const inspection = inspectInputByteOrder(sram);
  assertEquals(inspection.state, "unresolved");
  assertEquals(inspection.candidates.map((candidate) => candidate.supported), [
    true,
    true,
  ]);
  for (const format of [FileFormat.SRA, FileFormat.SRM]) {
    const source = format === FileFormat.SRA
      ? sram.slice()
      : new Uint8Array(SrmSaveFile.acceptedSize).fill(0xA5);
    if (format === FileFormat.SRM) source.set(sram, 0x20800);
    const before = source.slice();
    const error = assertThrows(
      () => FileUtil.loadFileFromBuffer(source),
      UnresolvedByteOrderError,
    );
    assertEquals(error.inspection.state, "unresolved");
    for (
      const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
    ) {
      const save = FileUtil.loadFileFromBuffer(source, order);
      assertEquals(save.inputInterpretation?.state, "overridden");
      assertEquals(save.inputInterpretation?.selectedOrder, order);
      assertEquals(
        save.inputInterpretation?.candidates.map((candidate) =>
          candidate.supported
        ),
        [true, true],
      );
      assertEquals(
        diagnoseSave(save).findings.some((finding) =>
          finding.ruleId === "input.byte-order.conflict" &&
          finding.category === DiagnosticCategory.Uncertainty
        ),
        true,
      );
      assertEquals(FileUtil.getFileData(save, format), before);
      assertEquals(source, before);
    }
  }
});

Deno.test("inspection uses occupied markers despite damaged headers and checksums", () => {
  const original = new SraSaveFile();
  original.header.data.fill(0);
  original.slots[0].checksum ^= 1;
  const source = FileUtil.byteSwap(original.getData());
  const before = source.slice();
  const result = inspectInputByteOrder(source);
  assertEquals(result.state, "detected");
  assertEquals(result.selectedOrder, ExportByteOrder.WordSwapped);
  assertEquals(result.candidates[1].slots[0].markerValid, true);
  assertEquals(result.candidates[1].slots[0].checksumValid, false);
  assertEquals(source, before);
  assertEquals(inspectInputByteOrder(source), result);
});

Deno.test("only complete directional evidence selects an input order", () => {
  for (
    const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
  ) {
    const store = (bytes: Uint8Array) =>
      order === ExportByteOrder.BigEndian ? bytes : FileUtil.byteSwap(bytes);
    const headerOnly = new Uint8Array(SraSaveFile.acceptedSize);
    headerOnly.set(SaveHeader.createBlank().data);
    assertEquals(inspectInputByteOrder(store(headerOnly)).selectedOrder, order);

    const partial = headerOnly.slice();
    partial[3] = 0;
    assertEquals(inspectInputByteOrder(store(partial)).state, "unresolved");
    const tied = new Uint8Array(SraSaveFile.acceptedSize);
    tied[0] = 0x98;
    tied[3] = 0x98;
    assertEquals(
      inspectInputByteOrder(store(tied)).candidates.map((candidate) =>
        candidate.headerMatches
      ),
      [1, 1],
    );
    assertEquals(inspectInputByteOrder(store(tied)).state, "unresolved");

    const backupOnly = new Uint8Array(SraSaveFile.acceptedSize);
    backupOnly.set(new SraSaveFile().backups[0].data, 0x20 + 3 * 0x1450);
    const detected = FileUtil.loadFileFromBuffer(store(backupOnly));
    assertEquals(detected.inputInterpretation?.state, "detected");
    assertEquals(detected.inputInterpretation?.selectedOrder, order);

    const empty = new SraSaveFile();
    empty.header.data.fill(0);
    empty.slots[0] = empty.slots[1];
    empty.backups[0] = empty.backups[1];
    assertEquals(
      inspectInputByteOrder(store(empty.getData())).state,
      "unresolved",
    );
  }
});

Deno.test("conflicting records cannot be resolved by a majority of markers", () => {
  const source = new SraSaveFile();
  source.header.data.fill(0);
  source.slots[1] = source.slots[0];
  const bytes = source.getData();
  bytes.set(FileUtil.byteSwap(source.backups[0].data), 0x20 + 3 * 0x1450);
  const inspection = inspectInputByteOrder(bytes);
  assertEquals(inspection.state, "unresolved");
  assertEquals(
    inspection.candidates.map((candidate) =>
      candidate.slots.filter((slot) => slot.markerValid).length
    ),
    [2, 1],
  );
});

Deno.test("checksum-only evidence remains unresolved for zero and nonzero records", () => {
  for (const nonzero of [false, true]) {
    const bytes = new Uint8Array(SraSaveFile.acceptedSize);
    if (nonzero) {
      // Worked example: checksum word 0x1234 moves into the summed region on reversal.
      bytes.set([0x12, 0x34, 0x12, 0x34], 0x20 + 0x1350);
    }
    const inspection = inspectInputByteOrder(bytes);
    assertEquals(inspection.state, "unresolved");
    assertEquals(
      inspection.candidates.map((candidate) =>
        candidate.slots[0].checksumValid
      ),
      [true, true],
    );
    assertEquals(
      inspection.candidates.map((candidate) => candidate.slots[0].empty),
      [!nonzero, !nonzero],
    );
  }
});

Deno.test("failed interpretation leaves an existing editable save unchanged", () => {
  const save = new SraSaveFile();
  const before = save.getData();
  assertThrows(
    () => save.read(new Uint8Array(SraSaveFile.acceptedSize)),
    UnresolvedByteOrderError,
  );
  assertEquals(save.getData(), before);
  assertThrows(
    () => inspectInputByteOrder(new Uint8Array(12)),
    Error,
    "expected",
  );
  assertThrows(
    () => inspectInputByteOrder(before, "invalid" as ExportByteOrder),
    Error,
    "Unsupported",
  );
});

Deno.test("public inspection and explicit buffer loading work without Deno", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Deno")!;
  const source = new Uint8Array(SraSaveFile.acceptedSize);
  Reflect.deleteProperty(globalThis, "Deno");
  try {
    assertEquals(inspectInputByteOrder(source).state, "unresolved");
    const save = FileUtil.loadFileFromBuffer(
      source,
      ExportByteOrder.WordSwapped,
    );
    assertEquals(
      save.inputInterpretation?.selectedOrder,
      ExportByteOrder.WordSwapped,
    );
    assertEquals(
      diagnoseSave(save).findings[0].category,
      DiagnosticCategory.Uncertainty,
    );
    assertEquals(FileUtil.getFileData(save, FileFormat.SRA), source);
  } finally {
    Object.defineProperty(globalThis, "Deno", descriptor);
  }
});

Deno.test("conversion preserves input provenance separately from its output representation", () => {
  const source = new Uint8Array(SrmSaveFile.acceptedSize).fill(0xA5);
  source.fill(0, 0x20800, 0x28800);
  for (
    const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
  ) {
    const save = FileUtil.loadFileFromBuffer(source, order);
    const opposite = order === ExportByteOrder.BigEndian
      ? ExportByteOrder.WordSwapped
      : ExportByteOrder.BigEndian;
    const converted = SrmSaveFile.fromSaveFile(save, opposite);
    const editable = converted.saveFile;
    assertEquals(editable.inputInterpretation?.selectedOrder, order);
    assertEquals(
      editable.isByteSwapped,
      opposite === ExportByteOrder.WordSwapped,
    );
    assertEquals(
      converted.getData().subarray(0, 0x20800),
      source.subarray(0, 0x20800),
    );
    assertEquals(editable.slots[0].data, save.slots[0].data);
  }
});

Deno.test("an override against detected evidence remains an unverified explicit choice", () => {
  const source = new SraSaveFile().getData();
  assertEquals(
    inspectInputByteOrder(source).selectedOrder,
    ExportByteOrder.BigEndian,
  );
  const save = FileUtil.loadFileFromBuffer(source, ExportByteOrder.WordSwapped);
  assertEquals(save.inputInterpretation?.state, "overridden");
  assertEquals(save.inputInterpretation?.confidence, "unknown");
  assertEquals(
    save.inputInterpretation?.candidates.map((candidate) =>
      candidate.supported
    ),
    [true, false],
  );
  assertEquals(FileUtil.getFileData(save, FileFormat.SRA), source);
});

Deno.test("filesystem loading retains ambiguous source bytes and accepts both explicit orders", () => {
  for (const format of [FileFormat.SRA, FileFormat.SRM]) {
    const bytes = new Uint8Array(
      format === FileFormat.SRA
        ? SraSaveFile.acceptedSize
        : SrmSaveFile.acceptedSize,
    );
    const open = stub(Deno, "openSync", () =>
      ({
        statSync: () => ({ size: bytes.length }),
        seekSync() {},
        readSync(buffer: Uint8Array) {
          buffer.set(bytes);
          return bytes.length;
        },
        close() {},
      }) as unknown as Deno.FsFile);
    try {
      const filename = `ambiguous.${FileFormat[format].toLowerCase()}`;
      const error = assertThrows(
        () => FileUtil.loadFile(filename),
        UnresolvedByteOrderError,
      );
      assertEquals(error.sourceData, bytes);
      assertEquals(
        error.inspection.findings[0].context.container,
        FileFormat[format].toLowerCase(),
      );
      for (
        const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
      ) {
        const save = FileUtil.loadFile(filename, order);
        assertEquals(save.inputInterpretation?.selectedOrder, order);
        assertEquals(FileUtil.getFileData(save, format), bytes);
      }
    } finally {
      open.restore();
    }
  }
});

Deno.test("automatic conversion does not invent an explicit input override", () => {
  const save = FileUtil.loadFileFromBuffer(new SraSaveFile().getData());
  const converted = SrmSaveFile.fromSaveFile(save).saveFile;
  assertEquals(converted.inputInterpretation, save.inputInterpretation);
  assertEquals(converted.inputInterpretation?.state, "detected");
  assertEquals(converted.isByteSwapped, true);
});
