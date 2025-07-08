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
import { SaveFile } from "./savefile.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

Deno.test({
  name: "should create",
  fn() {
    const instance = new SaveFile();
    assertInstanceOf(instance, SaveFile);
  },
});

Deno.test({
  name: "should initialize empty",
  fn() {
    const instance = new SaveFile();
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
    new SaveFile(testFile);
    assertSpyCalls(readSyncStub, 1);
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
    assertThrows(() => new SaveFile(testFile));
  },
});

Deno.test({
  name: "should write contents to a file",
  fn() {
    const testFile = {} as Deno.FsFile;
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SaveFile();
    instance.write(testFile);
    assertSpyCallArgs(writeSyncStub, 0, 0, [
      new Uint8Array(SaveFile.requiredSize),
    ]);
  },
});

Deno.test({
  name: "should not be marked as byte-swapped for new SaveFile",
  fn() {
    const instance = new SaveFile();
    assertFalse(instance.isByteSwapped);
  },
});

Deno.test({
  name:
    "should not be marked as byte-swapped after reading a file with regular header",
  fn() {
    const fakeBytes = new Uint8Array(SaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SaveFile.requiredSize;
    });
    const instance = new SaveFile(testFile);
    assertFalse(instance.isByteSwapped);
  },
});

Deno.test({
  name:
    "should be marked as byte-swapped after reading a file with byte-swapped header",
  fn() {
    const fakeBytes = new Uint8Array(SaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SaveFile.requiredSize;
    });
    const instance = new SaveFile(testFile);
    assert(instance.isByteSwapped);
  },
});

Deno.test({
  name: "should byte-swap bytes when reading a file with byte-swapped header",
  fn() {
    const fakeBytes = new Uint8Array(SaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SaveFile.requiredSize;
    });
    const instance = new SaveFile(testFile);
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
    const fakeBytes = new Uint8Array(SaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SaveFile.requiredSize;
    });
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SaveFile(testFile);
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
    const fakeBytes = new Uint8Array(SaveFile.requiredSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    const swappedBytes = new Uint8Array(SaveFile.requiredSize);
    for (let i = 0; i < SaveFile.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      swappedBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes);
      return SaveFile.requiredSize;
    });
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SaveFile(testFile);
    assertFalse(instance.isByteSwapped);
    instance.write(testFile, true);
    assertSpyCallArgs(writeSyncStub, 0, 0, [
      swappedBytes,
    ]);
  },
});
