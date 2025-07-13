import { SaveFile } from "./savefile.ts";

/**
 * SRM file wrapper that extracts SRAM, EEPROM, MemPak, and FlashRAM sections.
 * Offsets and sizes are typical but may need adjustment for specific emulators.
 */
export class SrmFile {
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
      SrmFile.EEPROM_SIZE +
      SrmFile.MEMPACK_COUNT * SrmFile.MEMPACK_SIZE +
      SrmFile.SRAM_SIZE +
      SrmFile.FLASHRAM_SIZE
    );
  }

  static get acceptedSize(): number {
    return SrmFile.requiredSize;
  }

  constructor(file?: Deno.FsFile) {
    this.eeprom = new Uint8Array(SrmFile.EEPROM_SIZE);
    this.mempacks = [
      new Uint8Array(SrmFile.MEMPACK_SIZE),
      new Uint8Array(SrmFile.MEMPACK_SIZE),
      new Uint8Array(SrmFile.MEMPACK_SIZE),
      new Uint8Array(SrmFile.MEMPACK_SIZE),
    ];
    this.sram = new Uint8Array(SrmFile.SRAM_SIZE);
    this.flashram = new Uint8Array(SrmFile.FLASHRAM_SIZE);

    if (file) {
      this.read(file);
    }
  }
  
  private static byteSwap(bytes: Uint8Array): Uint8Array {
    for (let i = 0; i < bytes.length; i += 4) {
      const temp = bytes.slice(i, i + 4);
      temp.reverse();
      bytes.set(temp, i);
    }
    return bytes;
  }
  
  static fromSaveFile(save: SaveFile): SrmFile {
    const srm = new SrmFile();
    srm.sram.set(this.byteSwap(save.data), 0);

    return srm;
  }

  get saveFile(): SaveFile {
    return new SaveFile(this.sram);
  }

  read(file: Deno.FsFile) {
    const stat = file.statSync();
    const allBytes = new Uint8Array(stat.size);
    const readBytes = file.readSync(allBytes);
    if (readBytes !== stat.size) {
      throw new Error("Failed to read entire SRM file.");
    }
    if (SrmFile.requiredSize !== readBytes) {
      throw new Error(
        `Incorrect file size, cannot read save file. Expected ${SrmFile.requiredSize} bytes, got ${readBytes}.`,
      );
    }

    let currentOffset = 0x00;

    this.eeprom = allBytes.slice(
      currentOffset,
      currentOffset + SrmFile.EEPROM_SIZE,
    );
    currentOffset += SrmFile.EEPROM_SIZE;

    for (let i = 0; i < SrmFile.MEMPACK_COUNT; i++) {
      this.mempacks[i] = allBytes.slice(
        currentOffset,
        currentOffset + SrmFile.MEMPACK_SIZE,
      );
      currentOffset += SrmFile.MEMPACK_SIZE;
    }

    this.sram = allBytes.slice(
      currentOffset,
      currentOffset + SrmFile.SRAM_SIZE,
    );
    currentOffset += SrmFile.SRAM_SIZE;

    this.flashram = allBytes.slice(
      currentOffset,
      currentOffset + SrmFile.FLASHRAM_SIZE,
    );
    currentOffset += SrmFile.FLASHRAM_SIZE;
  }

  write(file: Deno.FsFile, forceSwap = false) {
    const bytes = new Uint8Array(SrmFile.requiredSize);
    let currentOffset = 0x00;

    bytes.set(this.eeprom, currentOffset);
    currentOffset += SrmFile.EEPROM_SIZE;

    for (let i = 0; i < SrmFile.MEMPACK_COUNT; i++) {
      bytes.set(this.mempacks[i], currentOffset);
      currentOffset += SrmFile.MEMPACK_SIZE;
    }

    bytes.set(this.sram, currentOffset);
    currentOffset += SrmFile.SRAM_SIZE;

    bytes.set(this.flashram, currentOffset);
    currentOffset += SrmFile.FLASHRAM_SIZE;

    if (forceSwap) {
      SrmFile.byteSwap(bytes);
    }

    file.writeSync(bytes);
  }
}
