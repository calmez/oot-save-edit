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
import { FileFormat, FileUtil } from "../utils/fileutil.ts";
import {
  ChecksumPolicy,
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "./savefile.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

function createSraWithTail(): Uint8Array {
  const bytes = new SraSaveFile().getData();
  for (let index = SraSaveFile.requiredSize; index < bytes.length; index++) {
    bytes[index] = (index % 255) + 1;
  }
  return bytes;
}

Deno.test("explicit SRA output order is independent of source order", () => {
  const native = createSraWithTail();
  native.set([0x12, 0x34, 0x56, 0x78], SraSaveFile.requiredSize);
  const swapped = FileUtil.byteSwap(native);
  for (const source of [native, swapped]) {
    const save = new SraSaveFile().read(source);
    assertEquals(save.getData(ExportByteOrder.BigEndian), native);
    assertEquals(save.getData(ExportByteOrder.WordSwapped), swapped);
    assertEquals(save.getData(), source);
  }
});

Deno.test("direct SRM export changes only SRAM to the requested order", () => {
  const native = createSraWithTail();
  const swapped = FileUtil.byteSwap(native);
  for (const source of [native, swapped]) {
    const original = Uint8Array.from(
      { length: SrmSaveFile.acceptedSize },
      (_, index) => (index % 251) + 1,
    );
    original.set(source, 0x20800);
    const save = new SrmSaveFile().read(original);
    for (
      const [order, expectedSram] of [
        [ExportByteOrder.BigEndian, native],
        [ExportByteOrder.WordSwapped, swapped],
      ] as const
    ) {
      const expected = original.slice();
      expected.set(expectedSram, 0x20800);
      const exported = save.getData(order);
      assertEquals(exported.length, expected.length);
      assert(exported.every((value, index) => value === expected[index]));
      assertEquals(save.getData(order), exported);
      let written = new Uint8Array();
      save.write({
        writeSync(data: Uint8Array) {
          written = data.slice();
          return data.length;
        },
      } as Deno.FsFile, order);
      assertEquals(written, expected);
      assertEquals(save.getData(), original);
      assertEquals(save.sram, source);
    }
  }
});

Deno.test("SRM exports retain known SRAM order after header-marker damage", () => {
  const native = createSraWithTail();
  for (const swapped of [false, true]) {
    const save = new SraSaveFile().read(
      swapped ? FileUtil.byteSwap(native) : native,
    );
    save.header.data.fill(0, 3, 12);
    save.slots[0].rupees = 123;
    for (
      const order of [ExportByteOrder.BigEndian, ExportByteOrder.WordSwapped]
    ) {
      const converted = SrmSaveFile.fromSaveFile(save, order);
      const expected = converted.getData();
      assertEquals(
        converted.getData(order).subarray(0x20854, 0x20858),
        new Uint8Array(
          order === ExportByteOrder.BigEndian ? [0, 123, 0, 0] : [0, 0, 123, 0],
        ),
      );
      assertEquals(converted.getData(order), expected);
      assertEquals(converted.getData(order), expected);
      assertEquals(converted.getData(), expected);
      assertEquals(
        FileUtil.getFileData(
          save,
          FileFormat.SRM,
          order,
          ChecksumPolicy.Preserve,
        ),
        expected,
      );
    }
  }

  const loaded = new SrmSaveFile();
  loaded.sram.set(FileUtil.byteSwap(native));
  const stored = loaded.getData();
  loaded.read(stored);
  loaded.sram.fill(0, 0, 0x20);
  assertEquals(loaded.getData(ExportByteOrder.WordSwapped), loaded.getData());
  assertEquals(loaded.saveFile.isByteSwapped, true);
  const highLevel = FileUtil.getFileData(
    loaded.saveFile,
    FileFormat.SRM,
    ExportByteOrder.WordSwapped,
    ChecksumPolicy.Preserve,
  );
  const direct = loaded.getData(ExportByteOrder.WordSwapped);
  assertEquals(highLevel.length, direct.length);
  assert(highLevel.every((value, index) => value === direct[index]));
  const extracted = loaded.saveFile;
  extracted.read(native);
  assertEquals(extracted.isByteSwapped, false);
  assertEquals(extracted.getData(), native);
});

for (const swapped of [false, true]) {
  Deno.test(`SRA buffer loading preserves the complete image in ${swapped ? "swapped" : "native"} byte order`, () => {
    const original = createSraWithTail();
    const stored = swapped ? FileUtil.byteSwap(original) : original;
    const save = new SraSaveFile().read(stored);

    assertEquals(save.getData(), stored);
    assertEquals(
      save.getData(
        swapped ? ExportByteOrder.BigEndian : ExportByteOrder.WordSwapped,
      ),
      FileUtil.byteSwap(stored),
    );
    assertEquals(save.isByteSwapped, swapped);
  });

  Deno.test(`SRA file loading and writing preserve the tail across partial reads in ${swapped ? "swapped" : "native"} byte order`, () => {
    const original = createSraWithTail();
    const stored = swapped ? FileUtil.byteSwap(original) : original;
    let offset = 0;
    let written = new Uint8Array();
    const file = {
      readSync(buffer: Uint8Array): number | null {
        if (offset === stored.length) return null;
        const length = Math.min(
          offset === 0 ? SraSaveFile.requiredSize : 0x101,
          buffer.length,
          stored.length - offset,
        );
        buffer.set(stored.subarray(offset, offset + length));
        offset += length;
        return length;
      },
      writeSync(buffer: Uint8Array): number {
        written = buffer.slice();
        return buffer.length;
      },
    } as Deno.FsFile;
    const save = new SraSaveFile().read(file);
    save.write(file);

    assertEquals(written.length, stored.length);
    assert(
      written.every((value, index) => value === stored[index]),
      "File round-trip must retain every byte, including the SRAM tail.",
    );
    save.write(
      file,
      swapped ? ExportByteOrder.BigEndian : ExportByteOrder.WordSwapped,
    );
    assertEquals(written, FileUtil.byteSwap(stored));
  });

  Deno.test(`SRA data copies preserve byte order and remain editable in ${swapped ? "swapped" : "native"} order`, () => {
    const original = createSraWithTail();
    const stored = swapped ? FileUtil.byteSwap(original) : original;
    const source = new SraSaveFile().read(stored);
    const copy = new SraSaveFile();
    copy.data = source.data;
    assertEquals(copy.isByteSwapped, swapped);
    assertEquals(copy.data, stored);

    copy.slots[0].rupees = 500;
    copy.slots[0].updateChecksum();
    const reloaded = new SraSaveFile().read(copy.data);
    assertEquals(reloaded.slots[0].rupees, 500);
    assert(reloaded.slots[0].isChecksumValid());
    assertEquals(
      reloaded.data.subarray(SraSaveFile.requiredSize),
      stored.subarray(SraSaveFile.requiredSize),
    );
    assertEquals(source.data, stored);
  });
}

Deno.test("SRA data copies retain independent SRAM tails", () => {
  const original = new SraSaveFile().getData();
  original.fill(0xA5, SraSaveFile.requiredSize);
  const save = new SraSaveFile();
  save.data = original;
  const expected = original.slice();
  original.fill(0, SraSaveFile.requiredSize);
  save.getData().fill(0, SraSaveFile.requiredSize);
  assertEquals(save.data, expected);

  const copy = new SraSaveFile();
  copy.data = save.data;
  save.read(new SraSaveFile().getData().slice(0, SraSaveFile.requiredSize));
  assertEquals(save.data, new SraSaveFile().getData());
  assertEquals(copy.data, expected);
});

Deno.test({
  name: "should create",
  fn() {
    const instance = new SraSaveFile();
    assertInstanceOf(instance, SraSaveFile);
  },
});

Deno.test({
  name:
    "new saves initialize only the first primary and backup as independent new-game slots",
  fn() {
    const instance = new SraSaveFile();
    assertInstanceOf(instance.header, SaveHeader);
    instance.slots.forEach((slot) => {
      assertInstanceOf(slot, SaveSlot);
    });
    instance.backups.forEach((slot) => {
      assertInstanceOf(slot, SaveSlot);
    });
    assertEquals(instance.slots.map((slot) => slot.isEmpty), [
      false,
      true,
      true,
    ]);
    assertEquals(instance.backups.map((slot) => slot.isEmpty), [
      false,
      true,
      true,
    ]);
    assertEquals(instance.slots.map((slot) => slot.fileIndex), [0, 1, 2]);
    assertEquals(instance.backups.map((slot) => slot.fileIndex), [0, 1, 2]);
    for (let index = 0; index < 3; index++) {
      assertEquals(instance.slots[index].data, instance.backups[index].data);
    }
    instance.slots[0].rupees = 99;
    assertEquals(instance.backups[0].rupees, 0);
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
      returnsNext([expectedFileSize, null]),
    );
    const instance = new SraSaveFile();
    instance.read(testFile);
    assertSpyCalls(readSyncStub, 2);
  },
});

Deno.test({
  name: "should read contents of a Uint8Array",
  fn() {
    const expectedFileSize = 32768;
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
      returnsNext([wrongFileSize, null]),
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
      new Uint8Array(instance.data),
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
      return buffer.length;
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
      return buffer.length;
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
      return buffer.length;
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
    const fakeBytes = new Uint8Array(SraSaveFile.acceptedSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    for (let i = 0; i < SaveHeader.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      fakeBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes.slice(0, SraSaveFile.requiredSize));
      return buffer.length;
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
    const fakeBytes = new Uint8Array(SraSaveFile.acceptedSize);
    fakeBytes.set(SaveHeader.validCheckPattern, 0x03);
    const swappedBytes = new Uint8Array(SraSaveFile.acceptedSize);
    for (let i = 0; i < SraSaveFile.requiredSize; i += 4) {
      const temp = fakeBytes.slice(i, i + 4);
      temp.reverse();
      swappedBytes.set(temp, i);
    }
    const testFile = {} as Deno.FsFile;
    stub(testFile, "readSync", (buffer: Uint8Array) => {
      buffer.set(fakeBytes.slice(0, SraSaveFile.requiredSize));
      return buffer.length;
    });
    const writeSyncStub = stub(testFile, "writeSync");
    const instance = new SraSaveFile();
    instance.read(testFile);
    assertFalse(instance.isByteSwapped);
    instance.write(testFile, ExportByteOrder.WordSwapped);
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
      readSync: returnsNext([wrongFileSize, null]),
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
    const sraData = new Uint8Array(SraSaveFile.acceptedSize);
    sraData.fill(0x33);
    const sra = new SraSaveFile();
    sra.read(sraData);
    const srm = SrmSaveFile.fromSaveFile(sra);
    assertEquals(srm.sram.slice(0, SraSaveFile.acceptedSize), sra.data);
  },
});

Deno.test("should return correct SraSaveFile from saveFile getter", () => {
  const srm = new SrmSaveFile();
  srm.sram.fill(0x88);
  const sra = srm.saveFile;
  assertInstanceOf(sra, SraSaveFile);
  assertEquals(
    sra.data.slice(0, SraSaveFile.requiredSize),
    srm.sram.slice(0, SraSaveFile.requiredSize),
  );
});
