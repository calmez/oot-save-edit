import { FileUtil } from "../utils/fileutil.ts";
import { SaveFile } from "./savefile.ts";
import { SraSaveFile } from "./srasavefile.ts";

/**
 * SRM file wrapper that extracts SRAM, EEPROM, MemPak, and FlashRAM sections.
 * Offsets and sizes are typical but may need adjustment for specific emulators.
 */
export class SrmSaveFile extends SaveFile {
  static EEPROM_SIZE = 0x800; // 2 KiB
  static MEMPACK_COUNT = 4;
  static MEMPACK_SIZE = 0x8000; // 32 KiB
  static SRAM_SIZE = 0x8000; // 32 KiB
  static FLASHRAM_SIZE = 0x20000; // 128 KiB

  eeprom = new Uint8Array(SrmSaveFile.EEPROM_SIZE);
  mempacks: [Uint8Array, Uint8Array, Uint8Array, Uint8Array] = [
    new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
    new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
    new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
    new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
  ];
  sram = new Uint8Array(SrmSaveFile.SRAM_SIZE);
  flashram = new Uint8Array(SrmSaveFile.FLASHRAM_SIZE);

  static override get requiredSize(): number {
    return (
      SrmSaveFile.EEPROM_SIZE +
      SrmSaveFile.MEMPACK_COUNT * SrmSaveFile.MEMPACK_SIZE +
      SrmSaveFile.SRAM_SIZE +
      SrmSaveFile.FLASHRAM_SIZE
    );
  }

  static override get acceptedSize(): number {
    return SrmSaveFile.requiredSize;
  }

  static fromSaveFile(save: SraSaveFile): SrmSaveFile {
    const srm = new SrmSaveFile();
    srm.sram.set(FileUtil.byteSwap(save.data), 0);

    return srm;
  }

  get data(): Uint8Array {
    const bytes = new Uint8Array(SrmSaveFile.requiredSize);
    let currentOffset = 0x00;

    bytes.set(this.eeprom, currentOffset);
    currentOffset += SrmSaveFile.EEPROM_SIZE;

    for (let i = 0; i < SrmSaveFile.MEMPACK_COUNT; i++) {
      bytes.set(this.mempacks[i], currentOffset);
      currentOffset += SrmSaveFile.MEMPACK_SIZE;
    }

    bytes.set(this.sram, currentOffset);
    currentOffset += SrmSaveFile.SRAM_SIZE;

    bytes.set(this.flashram, currentOffset);
    currentOffset += SrmSaveFile.FLASHRAM_SIZE;

    return bytes;
  }

  get saveFile(): SraSaveFile {
    const sra = new SraSaveFile();
    return sra.read(this.sram);
  }

  read(source: Deno.FsFile | Uint8Array): this {
    let bytes: Uint8Array;
    if (source instanceof Uint8Array) {
      if (source.length < SrmSaveFile.requiredSize) {
        throw Error(
          `Incorrect data size, cannot read save file. Expected at least ${SrmSaveFile.requiredSize} bytes, got ${source.length}.`,
        );
      }
      bytes = source.slice(0, SrmSaveFile.requiredSize);
    } else {
      bytes = new Uint8Array(SrmSaveFile.requiredSize);
      const readBytes = source.readSync(bytes);
      if (SrmSaveFile.requiredSize !== readBytes) {
        throw Error(
          `Incorrect file size, cannot read save file. Expected ${SrmSaveFile.requiredSize} bytes, got ${readBytes}.`,
        );
      }
    }

    let currentOffset = 0x00;

    this.eeprom = bytes.slice(
      currentOffset,
      currentOffset + SrmSaveFile.EEPROM_SIZE,
    );
    currentOffset += SrmSaveFile.EEPROM_SIZE;

    for (let i = 0; i < SrmSaveFile.MEMPACK_COUNT; i++) {
      this.mempacks[i] = bytes.slice(
        currentOffset,
        currentOffset + SrmSaveFile.MEMPACK_SIZE,
      );
      currentOffset += SrmSaveFile.MEMPACK_SIZE;
    }

    this.sram = bytes.slice(
      currentOffset,
      currentOffset + SrmSaveFile.SRAM_SIZE,
    );
    currentOffset += SrmSaveFile.SRAM_SIZE;

    this.flashram = bytes.slice(
      currentOffset,
      currentOffset + SrmSaveFile.FLASHRAM_SIZE,
    );
    currentOffset += SrmSaveFile.FLASHRAM_SIZE;

    return this;
  }

  write(file: Deno.FsFile, forceSwap = false) {
    const bytes = new Uint8Array(SrmSaveFile.requiredSize);
    let currentOffset = 0x00;

    bytes.set(this.eeprom, currentOffset);
    currentOffset += SrmSaveFile.EEPROM_SIZE;

    for (let i = 0; i < SrmSaveFile.MEMPACK_COUNT; i++) {
      bytes.set(this.mempacks[i], currentOffset);
      currentOffset += SrmSaveFile.MEMPACK_SIZE;
    }

    bytes.set(this.sram, currentOffset);
    currentOffset += SrmSaveFile.SRAM_SIZE;

    bytes.set(this.flashram, currentOffset);
    currentOffset += SrmSaveFile.FLASHRAM_SIZE;

    if (forceSwap) {
      FileUtil.byteSwap(bytes);
    }

    file.writeSync(bytes);
  }
}
