import { FileUtil } from "../utils/fileutil.ts";
import { SaveFile } from "./savefile.ts";
import { SraSaveFile } from "./srasavefile.ts";

/**
 * SRM file wrapper that extracts SRAM, EEPROM, MemPak, and FlashRAM sections.
 * Offsets and sizes are typical but may need adjustment for specific emulators.
 */
export class SrmSaveFile implements SaveFile {
  eeprom: Uint8Array;
  mempacks: [Uint8Array, Uint8Array, Uint8Array, Uint8Array];
  sram: Uint8Array;
  flashram: Uint8Array;

  static EEPROM_SIZE = 0x800; // 2 KiB
  static MEMPACK_COUNT = 4;
  static MEMPACK_SIZE = 0x8000; // 32 KiB
  static SRAM_SIZE = 0x8000; // 32 KiB
  static FLASHRAM_SIZE = 0x20000; // 128 KiB

  static get requiredSize(): number {
    return (
      SrmSaveFile.EEPROM_SIZE +
      SrmSaveFile.MEMPACK_COUNT * SrmSaveFile.MEMPACK_SIZE +
      SrmSaveFile.SRAM_SIZE +
      SrmSaveFile.FLASHRAM_SIZE
    );
  }

  static get acceptedSize(): number {
    return SrmSaveFile.requiredSize;
  }

  constructor(file?: Deno.FsFile) {
    this.eeprom = new Uint8Array(SrmSaveFile.EEPROM_SIZE);
    this.mempacks = [
      new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
      new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
      new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
      new Uint8Array(SrmSaveFile.MEMPACK_SIZE),
    ];
    this.sram = new Uint8Array(SrmSaveFile.SRAM_SIZE);
    this.flashram = new Uint8Array(SrmSaveFile.FLASHRAM_SIZE);

    if (file) {
      this.read(file);
    }
  }
  
  static fromSaveFile(save: SraSaveFile): SrmSaveFile {
    const srm = new SrmSaveFile();
    srm.sram.set(FileUtil.byteSwap(save.data), 0);

    return srm;
  }

  get saveFile(): SraSaveFile {
    return new SraSaveFile(this.sram);
  }

  read(file: Deno.FsFile): this {
    const stat = file.statSync();
    const allBytes = new Uint8Array(stat.size);
    const readBytes = file.readSync(allBytes);
    if (readBytes !== stat.size) {
      throw new Error("Failed to read entire SRM file.");
    }
    if (SrmSaveFile.requiredSize !== readBytes) {
      throw new Error(
        `Incorrect file size, cannot read save file. Expected ${SrmSaveFile.requiredSize} bytes, got ${readBytes}.`,
      );
    }

    let currentOffset = 0x00;

    this.eeprom = allBytes.slice(
      currentOffset,
      currentOffset + SrmSaveFile.EEPROM_SIZE,
    );
    currentOffset += SrmSaveFile.EEPROM_SIZE;

    for (let i = 0; i < SrmSaveFile.MEMPACK_COUNT; i++) {
      this.mempacks[i] = allBytes.slice(
        currentOffset,
        currentOffset + SrmSaveFile.MEMPACK_SIZE,
      );
      currentOffset += SrmSaveFile.MEMPACK_SIZE;
    }

    this.sram = allBytes.slice(
      currentOffset,
      currentOffset + SrmSaveFile.SRAM_SIZE,
    );
    currentOffset += SrmSaveFile.SRAM_SIZE;

    this.flashram = allBytes.slice(
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
