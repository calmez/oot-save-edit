import { SrmSaveFile } from "./srmsavefile.ts";
import { SraSaveFile } from "./srasavefile.ts";
import { assertEquals } from "@std/assert/equals";
import { assertInstanceOf } from "@std/assert/instance-of";
import { assertSpyCallArgs, assertSpyCalls, returnsNext, stub } from "@std/testing/mock";
import { assertThrows } from "@std/assert/throws";

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
  }
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
  }
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
  }
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
  }
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
  }
});

Deno.test("should return correct SraSaveFile from saveFile getter", () => {
  const srm = new SrmSaveFile();
  srm.sram.fill(0x88);
  const sra = srm.saveFile;
  assertInstanceOf(sra, SraSaveFile);
  assertEquals(sra.data, srm.sram.slice(0, SraSaveFile.requiredSize));
});