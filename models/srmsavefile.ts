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
    srm.sram.set(save.getData(true), 0);

    return srm;
  }

  override getData(forceSwap = false): Uint8Array {
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

    return bytes;
  }

  override get data(): Uint8Array {
    return super.data;
  }

  override set data(bytes: Uint8Array) {
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
  }

  get saveFile(): SraSaveFile {
    const sra = new SraSaveFile();
    return sra.read(this.sram.slice(0, SrmSaveFile.SRAM_SIZE));
  }
}
