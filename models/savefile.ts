import { FileUtil } from "../utils/fileutil.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

export class SaveFile {
  static get requiredSize(): number {
    throw new Error("Method not implemented.");
  }

  static get acceptedSize(): number {
    throw new Error("Method not implemented.");
  }

  getData(_forceSwap: boolean = false): Uint8Array {
    throw new Error("Method not implemented.");
  }

  get data(): Uint8Array {
    return this.getData(false);
  }

  set data(_bytes: Uint8Array) {
    throw new Error("Method not implemented.");
  }

  protected checkDataOnRead(bytes: Uint8Array): Uint8Array {
    return bytes;
  }

  read(source: Deno.FsFile | Uint8Array): this {
    const klass = this.constructor as typeof SaveFile;
    const requiredSize = klass.requiredSize;

    let bytes: Uint8Array;
    if (source instanceof Uint8Array) {
      if (source.length < requiredSize) {
        throw Error(
          `Incorrect data size, cannot read save file. Expected at least ${requiredSize} bytes, got ${source.length}.`,
        );
      }
      bytes = source.slice(0, requiredSize);
    } else {
      bytes = new Uint8Array(requiredSize);
      const readBytes = source.readSync(bytes);
      if ((readBytes ?? 0) < requiredSize) {
        throw Error(
          `Incorrect file size, cannot read save file. Expected at least ${requiredSize} bytes, got ${readBytes}.`,
        );
      }
    }

    this.data = this.checkDataOnRead(bytes);

    return this;
  }

  getDataForWrite(): Uint8Array {
    return this.getData();
  }

  write(file: Deno.FsFile, forceSwap: boolean = false): void {
    const data = this.getDataForWrite();
    if (forceSwap) {
      FileUtil.byteSwap(data, true);
    }
    file.writeSync(data);
  }
}

export class SraSaveFile extends SaveFile {
  header = new SaveHeader();
  slots: [SaveSlot, SaveSlot, SaveSlot] = [
    new SaveSlot(),
    new SaveSlot(),
    new SaveSlot(),
  ];
  backups: [SaveSlot, SaveSlot, SaveSlot] = [
    new SaveSlot(),
    new SaveSlot(),
    new SaveSlot(),
  ];
  private byteSwapped: boolean = false;

  private static get saveSlots(): number {
    return 3;
  }

  static override get requiredSize(): number {
    return SaveHeader.requiredSize + this.saveSlots * SaveSlot.requiredSize +
      this.saveSlots * SaveSlot.requiredSize;
  }

  static override get acceptedSize(): number {
    return 0x8000;
  }

  get isByteSwapped(): boolean {
    return this.byteSwapped;
  }

  override getData(forceSwap = false): Uint8Array {
    const bytes = new Uint8Array(SraSaveFile.requiredSize);

    let currentOffset = 0x00;

    bytes.set(this.header.data, currentOffset);
    currentOffset += SaveHeader.requiredSize;

    for (let i = 0; i < SraSaveFile.saveSlots; i++) {
      bytes.set(this.slots[i].data, currentOffset);
      currentOffset += SaveSlot.requiredSize;
    }

    for (let i = 0; i < SraSaveFile.saveSlots; i++) {
      bytes.set(this.backups[i].data, currentOffset);
      currentOffset += SaveSlot.requiredSize;
    }

    if ((this.byteSwapped && !forceSwap) || (!this.byteSwapped && forceSwap)) {
      FileUtil.byteSwap(bytes);
    }

    return bytes;
  }

  override get data(): Uint8Array {
    return super.data;
  }

  override set data(bytes: Uint8Array) {
    let currentOffset = 0x00;

    this.header = new SaveHeader(
      bytes.slice(currentOffset, SaveHeader.requiredSize),
    );
    currentOffset += SaveHeader.requiredSize;

    for (let i = 0; i < SraSaveFile.saveSlots; i++) {
      this.slots[i] = new SaveSlot(
        bytes.slice(currentOffset, currentOffset + SaveSlot.requiredSize),
      );
      currentOffset += SaveSlot.requiredSize;
    }

    for (let i = 0; i < SraSaveFile.saveSlots; i++) {
      this.backups[i] = new SaveSlot(
        bytes.slice(currentOffset, currentOffset + SaveSlot.requiredSize),
      );
      currentOffset += SaveSlot.requiredSize;
    }
  }

  protected override checkDataOnRead(bytes: Uint8Array): Uint8Array {
    return this.ensureByteOrder(bytes);
  }

  override getDataForWrite(): Uint8Array {
    const data = super.getDataForWrite();
    if (this.byteSwapped) {
      FileUtil.byteSwap(data, true);
    }
    return data;
  }

  private ensureByteOrder(bytes: Uint8Array): Uint8Array {
    if (
      SaveHeader.validCheckPattern.some((value, index) => {
        if (bytes[index + 0x03] === value) {
          return false;
        }
        return true;
      })
    ) {
      bytes = FileUtil.byteSwap(bytes);
      this.byteSwapped = true;
    }
    return bytes;
  }
}

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
    return sra.read(this.sram);
  }
}
