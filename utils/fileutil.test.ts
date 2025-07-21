import { FileFormat, FileUtil } from "./fileutil.ts";
import { SraSaveFile } from "../models/srasavefile.ts";
import { SrmSaveFile } from "../models/srmsavefile.ts";
import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";

Deno.test({
  name: "should detect SRA file format by size",
  fn() {
    const file = {
      statSync: () => ({ size: SraSaveFile.acceptedSize }),
      seekSync: () => {},
    } as unknown as Deno.FsFile;
    assertEquals(FileUtil.detectFileFormatBySize(file), FileFormat.SRA);
  },
});

Deno.test({
  name: "should detect SRM file format by size",
  fn() {
    const file = {
      statSync: () => ({ size: SrmSaveFile.acceptedSize }),
      seekSync: () => {},
    } as unknown as Deno.FsFile;
    assertEquals(FileUtil.detectFileFormatBySize(file), FileFormat.SRM);
  },
});

Deno.test({
  name: "should throw on unknown file size",
  fn() {
    const file = {
      statSync: () => ({ size: 12345 }),
      seekSync: () => {},
    } as unknown as Deno.FsFile;
    assertThrows(() => FileUtil.detectFileFormatBySize(file));
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
  name: "should swap bytes in byteSwap",
  fn() {
    const arr = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const swapped = FileUtil.byteSwap(arr.slice());
    assertEquals(Array.from(swapped), [4, 3, 2, 1, 8, 7, 6, 5]);
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
