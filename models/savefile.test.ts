import {
  assert,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertThrows,
} from "@std/assert";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  returnsNext,
  stub,
} from "@std/testing/mock";
import { SraSaveFile, SrmSaveFile } from "./savefile.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

Deno.test({
  name: "should create",
  fn() {
    const instance = new SraSaveFile();
    assertInstanceOf(instance, SraSaveFile);
  },
});

Deno.test({
  name: "should initialize empty",
  fn() {
    const instance = new SraSaveFile();
    assertInstanceOf(instance.header, SaveHeader);
    instance.slots.forEach((slot) => {
      assertInstanceOf(slot, SaveSlot);
    });
    instance.backups.forEach((slot) => {
      assertInstanceOf(slot, SaveSlot);
    });
  },
});

Deno.test({
  name: "should read contents of a file",
  fn() {
    const expectedFileSize = 31232;
    const testFile = {} as Deno.FsFile;
    const readSyncStub = stub(
      testFile,
      "readSync",
      returnsNext([expectedFileSize]),
    );
    const instance = new SraSaveFile();
    instance.read(testFile);
    assertSpyCalls(readSyncStub, 1);
  },
});

Deno.test({
  name: "should read contents of a Uint8Array",
  fn() {
    const expectedFileSize = 31232;
    const testBytes = new Uint8Array(expectedFileSize);
    const instance = new SraSaveFile();
    instance.read(testBytes);
    assertEquals(instance.data.length, expectedFileSize);
  },
});

Deno.test({
  name: "should raise an error when file has incorrect size",
  fn() {
    const wrongFileSize = 42;
    const testFile = {} as Deno.FsFile;
    stub(
      testFile,
      "readSync",
      returnsNext([wrongFileSize]),
    );
    const instance = new SraSaveFile();
    assertThrows(() => instance.read(testFile));
  },
});

Deno.test({
  name: "should write contents to a file",
  fn() {
    const testFile = {} as Deno.FsFile;
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SraSaveFile();
    instance.write(testFile);
    assertSpyCallArgs(writeSyncStub, 0, 0, [
      new Uint8Array(SraSaveFile.requiredSize),
    ]);
  },
});

Deno.test({
  name: "should not be marked as byte-swapped for new SaveFile",
  fn() {
    const instance = new SraSaveFile();
    assertFalse(instance.isByteSwapped);
  },
});

Deno.test({
  name:
    "should not be marked as byte-swapped after reading a file with regular header",
  fn() {
    const fakeBytes = new Uint8Array(SraSaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SraSaveFile.requiredSize;
    });
    const instance = new SraSaveFile();
    instance.read(testFile);
    assertFalse(instance.isByteSwapped);
  },
});

Deno.test({
  name:
    "should be marked as byte-swapped after reading a file with byte-swapped header",
  fn() {
    const fakeBytes = new Uint8Array(SraSaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SraSaveFile.requiredSize;
    });
    const instance = new SraSaveFile();
    instance.read(testFile);
    assert(instance.isByteSwapped);
  },
});

Deno.test({
  name: "should byte-swap bytes when reading a file with byte-swapped header",
  fn() {
    const fakeBytes = new Uint8Array(SraSaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SraSaveFile.requiredSize;
    });
    const instance = new SraSaveFile();
    instance.read(testFile);
    assertEquals(
      instance.header.data.slice(0x03, 0x03 + 9),
      SaveHeader.validCheckPattern,
    );
  },
});

Deno.test({
  name:
    "should write byte-swapped bytes after having read a file with byte-swapped header",
  fn() {
    const fakeBytes = new Uint8Array(SraSaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SraSaveFile.requiredSize;
    });
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SraSaveFile();
    instance.read(testFile);
    assert(instance.isByteSwapped);
    instance.write(testFile);
    assertSpyCallArgs(writeSyncStub, 0, 0, [
      fakeBytes,
    ]);
  },
});

Deno.test({
  name:
    "should write byte-swapped bytes after having read a file with regular header when forced",
  fn() {
    const fakeBytes = new Uint8Array(SraSaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    const swappedBytes = new Uint8Array(SraSaveFile.requiredSize);
    for (let i = 0; i < SraSaveFile.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      swappedBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SraSaveFile.requiredSize;
    });
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SraSaveFile();
    instance.read(testFile);
    assertFalse(instance.isByteSwapped);
    instance.write(testFile, true);
    assertSpyCallArgs(writeSyncStub, 0, 0, [
      swappedBytes,
    ]);
  },
});

Deno.test({
  name: "should create",
  fn() {
    const srm = new SrmSaveFile();
    assertInstanceOf(srm, SrmSaveFile);
    assertEquals(srm.eeprom.length, SrmSaveFile.EEPROM_SIZE);
    assertEquals(srm.mempacks.length, SrmSaveFile.MEMPACK_COUNT);
    srm.mempacks.forEach((mempack) => {
      assertEquals(mempack.length, SrmSaveFile.MEMPACK_SIZE);
    });
    assertEquals(srm.sram.length, SrmSaveFile.SRAM_SIZE);
    assertEquals(srm.flashram.length, SrmSaveFile.FLASHRAM_SIZE);
  },
});

Deno.test({
  name: "should initialize empty",
  fn() {
    const srm = new SrmSaveFile();
    assertEquals(srm.eeprom.length, SrmSaveFile.EEPROM_SIZE);
    assertEquals(srm.mempacks.length, SrmSaveFile.MEMPACK_COUNT);
    srm.mempacks.forEach((mempack) => {
      assertEquals(mempack.length, SrmSaveFile.MEMPACK_SIZE);
    });
    assertEquals(srm.sram.length, SrmSaveFile.SRAM_SIZE);
    assertInstanceOf(srm.saveFile, SraSaveFile);
    assertEquals(srm.flashram.length, SrmSaveFile.FLASHRAM_SIZE);
  },
});

Deno.test({
  name: "should read contents of a file",
  fn() {
    const expectedFileSize = 296960;
    const testFile = {} as Deno.FsFile;
    const readSyncStub = stub(
      testFile,
      "readSync",
      returnsNext([expectedFileSize]),
    );
    const instance = new SrmSaveFile();
    instance.read(testFile);
    assertSpyCalls(readSyncStub, 1);
  },
});

Deno.test({
  name: "should read contents of a Uint8Array",
  fn() {
    const expectedFileSize = 296960;
    const testBytes = new Uint8Array(expectedFileSize);
    const instance = new SrmSaveFile();
    instance.read(testBytes);
    assertEquals(instance.data.length, expectedFileSize);
  },
});

Deno.test({
  name: "should raise an error when file has incorrect size",
  fn() {
    const wrongFileSize = 1234;
    const testFile = {
      statSync: () => ({ size: wrongFileSize }),
      readSync: (_: Uint8Array) => wrongFileSize,
    } as Deno.FsFile;
    const instance = new SrmSaveFile();
    assertThrows(() => instance.read(testFile));
  },
});

Deno.test({
  name: "should write contents to a file",
  fn() {
    const testFile = {} as Deno.FsFile;
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SrmSaveFile();
    instance.write(testFile);
    assertSpyCallArgs(writeSyncStub, 0, 0, [
      new Uint8Array(SrmSaveFile.requiredSize),
    ]);
  },
});

Deno.test({
  name: "should set SRAM from SraSaveFile",
  fn() {
    const sraData = new Uint8Array(SraSaveFile.requiredSize);
    sraData.fill(0x33);
    const sra = new SraSaveFile();
    sra.read(sraData);
    const srm = SrmSaveFile.fromSaveFile(sra);
    assertEquals(srm.sram.slice(0, SraSaveFile.requiredSize), sra.data);
  },
});

Deno.test("should return correct SraSaveFile from saveFile getter", () => {
  const srm = new SrmSaveFile();
  srm.sram.fill(0x88);
  const sra = srm.saveFile;
  assertInstanceOf(sra, SraSaveFile);
  assertEquals(sra.data, srm.sram.slice(0, SraSaveFile.requiredSize));
});
