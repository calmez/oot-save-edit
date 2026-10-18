import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertThrows,
} from "@std/assert";
import { SraSaveFile, SrmSaveFile } from "../models/savefile.ts";
import { FileFormat, FileUtil } from "./fileutil.ts";

function createSraWithUnknownBytes(): Uint8Array {
  const save = new SraSaveFile();
  save.header.data.fill(0xA5, 0x11);
  [...save.slots, ...save.backups].forEach((slot, index) => {
    slot.data.fill(0xB1 + index, 0x1358);
  });
  const bytes = save.getData();
  for (let index = SraSaveFile.requiredSize; index < bytes.length; index++) {
    bytes[index] = (index % 255) + 1;
  }
  return bytes;
}

function createStoredSave(
  sra: Uint8Array,
  format: FileFormat,
  swapped: boolean,
): Uint8Array {
  const storedSram = swapped ? FileUtil.byteSwap(sra) : sra;
  if (format === FileFormat.SRA) return storedSram;
  const bytes = Uint8Array.from(
    { length: SrmSaveFile.acceptedSize },
    (_, index) => (index % 255) + 1,
  );
  bytes.set(storedSram, 0x20800);
  return bytes;
}

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  for (const swapped of [false, true]) {
    Deno.test(`${FileFormat[format]} preserves every byte across repeated unchanged exports in ${swapped ? "swapped" : "native"} SRAM order`, () => {
      const sra = createSraWithUnknownBytes();
      const original = createStoredSave(sra, format, swapped);
      let exported: Uint8Array = original.slice();

      for (let cycle = 0; cycle < 3; cycle++) {
        const save = FileUtil.loadFileFromBuffer(exported);
        assertEquals(save.isByteSwapped, swapped);
        exported = FileUtil.getFileData(save, format);
        assertEquals(exported.length, original.length);
        assert(
          exported.every((value, index) => value === original[index]),
          `Unchanged export ${cycle + 1} must preserve every source byte.`,
        );
      }
    });

    Deno.test(`${FileFormat[format]} editing changes only rupees and their checksum in ${swapped ? "swapped" : "native"} SRAM order`, () => {
      const sra = createSraWithUnknownBytes();
      const original = createStoredSave(sra, format, swapped);
      const expectedSram = sra.slice();
      expectedSram.set([0x01, 0xF4], 0x54);
      // Changing rupees from 0 to 500 adds 500 to the 16-bit checksum.
      const checksum = ((sra[0x1372] << 8) | sra[0x1373]) + 500;
      expectedSram.set([(checksum >> 8) & 0xFF, checksum & 0xFF], 0x1372);
      const expected = original.slice();
      expected.set(
        swapped ? FileUtil.byteSwap(expectedSram) : expectedSram,
        format === FileFormat.SRA ? 0 : 0x20800,
      );
      let exported: Uint8Array = original.slice();

      for (let cycle = 0; cycle < 3; cycle++) {
        const save = FileUtil.loadFileFromBuffer(exported);
        save.slots[0].rupees = 500;
        exported = FileUtil.getFileData(save, format);
        const reloaded = FileUtil.loadFileFromBuffer(exported);
        assertEquals(reloaded.slots[0].rupees, 500);
        assert(reloaded.slots[0].isChecksumValid());
        assertEquals(reloaded.isByteSwapped, swapped);

        assertEquals(exported.length, original.length);
        assert(
          exported.every((value, index) => value === expected[index]),
          `Edited export ${
            cycle + 1
          } must change only rupees and their checksum.`,
        );
      }
    });
  }
}

Deno.test({
  name: "should detect SRA file format by size",
  fn() {
    const file = {
      statSync: () => ({ size: SraSaveFile.acceptedSize }),
      seekSync: () => {},
    } as unknown as Deno.FsFile;
    assertEquals(FileUtil.detectFileFormatByFileSize(file), FileFormat.SRA);
  },
});

Deno.test({
  name: "should detect SRM file format by size",
  fn() {
    const file = {
      statSync: () => ({ size: SrmSaveFile.acceptedSize }),
      seekSync: () => {},
    } as unknown as Deno.FsFile;
    assertEquals(FileUtil.detectFileFormatByFileSize(file), FileFormat.SRM);
  },
});

Deno.test({
  name: "should throw on unknown file size",
  fn() {
    const file = {
      statSync: () => ({ size: 12345 }),
      seekSync: () => {},
    } as unknown as Deno.FsFile;
    assertThrows(() => FileUtil.detectFileFormatByFileSize(file));
  },
});

Deno.test({
  name: "should detect SRA file format by buffer size",
  fn() {
    const buffer = new Uint8Array(SraSaveFile.acceptedSize);
    assertEquals(FileUtil.detectFileFormatByBufferSize(buffer), FileFormat.SRA);
  },
});

Deno.test({
  name: "should detect SRM file format by buffer size",
  fn() {
    const buffer = new Uint8Array(SrmSaveFile.acceptedSize);
    assertEquals(FileUtil.detectFileFormatByBufferSize(buffer), FileFormat.SRM);
  },
});

Deno.test({
  name: "should throw on unknown buffer size",
  fn() {
    const buffer = new Uint8Array(12345);
    assertThrows(() => FileUtil.detectFileFormatByBufferSize(buffer));
  },
});

Deno.test({
  name: "should detect file format by extension",
  fn() {
    assertEquals(
      FileUtil.detectFileFormatByExtension("save.sra"),
      FileFormat.SRA,
    );
    assertEquals(
      FileUtil.detectFileFormatByExtension("save.srm"),
      FileFormat.SRM,
    );
  },
});

Deno.test({
  name: "should throw on unknown extension",
  fn() {
    assertThrows(() => FileUtil.detectFileFormatByExtension("save.bin"));
  },
});

Deno.test({
  name: "should swap bytes",
  fn() {
    const arr = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const swapped = FileUtil.byteSwap(arr.slice());
    assertEquals(Array.from(swapped), [4, 3, 2, 1, 8, 7, 6, 5]);
  },
});

Deno.test({
  name: "should swap bytes in place",
  fn() {
    const arr = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const swapped = FileUtil.byteSwap(arr, true);
    assertEquals(Array.from(swapped), [4, 3, 2, 1, 8, 7, 6, 5]);
    assertEquals(arr, swapped); // should modify original array
  },
});

Deno.test({
  name: "should load SRA file",
  fn() {
    let readCalled = false;
    const file = {
      statSync: () => ({ size: SraSaveFile.acceptedSize }),
      seekSync: () => {},
      readSync: (_buf: Uint8Array) => {
        readCalled = true;
        return SraSaveFile.acceptedSize;
      },
      close: () => {},
    } as unknown as Deno.FsFile;

    const origOpenSync = Deno.openSync;
    // deno-lint-ignore no-explicit-any
    (Deno as any).openSync = () => file;
    try {
      const save = FileUtil.loadFile("save.sra");
      assertInstanceOf(save, SraSaveFile);
      if (!readCalled) throw new Error("readSync not called");
    } finally {
      // deno-lint-ignore no-explicit-any
      (Deno as any).openSync = origOpenSync;
    }
  },
});

Deno.test({
  name: "should load SRM file and return SraSaveFile",
  fn() {
    let readCalled = false;
    const file = {
      statSync: () => ({ size: SrmSaveFile.acceptedSize }),
      seekSync: () => {},
      readSync: (_buf: Uint8Array) => {
        readCalled = true;
        return SrmSaveFile.acceptedSize;
      },
      close: () => {},
    } as unknown as Deno.FsFile;

    const origOpenSync = Deno.openSync;
    // deno-lint-ignore no-explicit-any
    (Deno as any).openSync = () => file;
    try {
      const save = FileUtil.loadFile("save.srm");
      assertInstanceOf(save, SraSaveFile);
      if (!readCalled) throw new Error("readSync not called");
    } finally {
      // deno-lint-ignore no-explicit-any
      (Deno as any).openSync = origOpenSync;
    }
  },
});

Deno.test({
  name: "should throw on file format mismatch",
  fn() {
    const file = {
      statSync: () => ({ size: SraSaveFile.acceptedSize }),
      seekSync: () => {},
      readSync: (_buf: Uint8Array) => SraSaveFile.acceptedSize,
      close: () => {},
    } as unknown as Deno.FsFile;

    const origOpenSync = Deno.openSync;
    // deno-lint-ignore no-explicit-any
    (Deno as any).openSync = () => file;
    try {
      assertThrows(() => FileUtil.loadFile("save.srm"));
    } finally {
      // deno-lint-ignore no-explicit-any
      (Deno as any).openSync = origOpenSync;
    }
  },
});

Deno.test("SRM editing preserves emulator sections and writes word-swapped SRAM", () => {
  const original = new SrmSaveFile();
  original.eeprom.fill(0x11);
  original.mempacks.forEach((pack, index) => pack.fill(0x22 + index));
  original.flashram.fill(0x77);
  const save = new SraSaveFile();
  original.sram.set(FileUtil.byteSwap(save.getData()));
  const editor = FileUtil.loadFileFromBuffer(original.getData());
  assertEquals(editor.isByteSwapped, true);
  editor.slots[0].rupees = 500;
  const exported = new SrmSaveFile().read(
    FileUtil.getFileData(editor, FileFormat.SRM),
  );
  assertEquals(exported.eeprom, original.eeprom);
  assertEquals(exported.mempacks, original.mempacks);
  assertEquals(exported.flashram, original.flashram);
  assertEquals(
    exported.sram.slice(0, 4),
    FileUtil.byteSwap(editor.getData(true)).slice(0, 4),
  );
  assertEquals(exported.saveFile.slots[0].rupees, 500);
  assertEquals(exported.saveFile.slots[0].isValid, true);
});

Deno.test("SRA exports retain the loaded word order and allow an explicit swap", () => {
  const save = new SraSaveFile();
  const swapped = FileUtil.byteSwap(save.getData());
  const loaded = FileUtil.loadFileFromBuffer(swapped);
  assertEquals(loaded.isByteSwapped, true);
  assertEquals(FileUtil.getFileData(loaded, FileFormat.SRA), swapped);
  assertEquals(
    FileUtil.getFileData(loaded, FileFormat.SRA, true),
    save.getData(),
  );
});

for (const format of [FileFormat.SRA, FileFormat.SRM]) {
  Deno.test(`browser buffer editing and export work for ${FileFormat[format]} without Deno`, () => {
    const original = FileUtil.getFileData(new SraSaveFile(), format);
    const denoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Deno");
    if (!denoDescriptor) throw new Error("Missing test runtime descriptor.");
    Reflect.deleteProperty(globalThis, "Deno");
    try {
      const editor = FileUtil.loadFileFromBuffer(original);
      editor.slots[0].playerName = "Link";
      editor.slots[0].rupees = 123;
      const exported = FileUtil.getFileData(editor, format);
      const reloaded = FileUtil.loadFileFromBuffer(exported);
      assertEquals(reloaded.slots[0].playerName, "Link");
      assertEquals(reloaded.slots[0].rupees, 123);
      assertEquals(reloaded.slots[0].isValid, true);
      assertThrows(
        () => FileUtil.loadFileFromBuffer(new Uint8Array(1)),
        Error,
        "Cannot detect file type by size. Unknown buffer size: 1.",
      );
    } finally {
      Object.defineProperty(globalThis, "Deno", denoDescriptor);
    }
  });
}
