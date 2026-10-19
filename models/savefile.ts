import { FileUtil } from "../utils/fileutil.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

/** Desired SRAM representation, independent of the source byte order. */
export enum ExportByteOrder {
  /** Preserve same-format source order; otherwise use the target layout default. */
  Automatic = "automatic",
  BigEndian = "big-endian",
  WordSwapped = "word-swapped",
}

function isWordSwapped(bytes: Uint8Array): boolean {
  const swapped = FileUtil.byteSwap(bytes);
  const score = (data: Uint8Array) =>
    SaveHeader.validCheckPattern.reduce(
      (total, value, index) => total + Number(data[index + 3] === value),
      0,
    );
  return score(swapped) > score(bytes);
}

function resolveByteOrder(
  order: ExportByteOrder,
  automatic: ExportByteOrder,
): ExportByteOrder {
  if (order === ExportByteOrder.Automatic) return automatic;
  if (
    order !== ExportByteOrder.BigEndian && order !== ExportByteOrder.WordSwapped
  ) {
    throw new Error(`Unsupported SRAM export byte order: ${order}.`);
  }
  return order;
}

/** Checksum handling for serialized output; neither policy mutates the save. */
export enum ChecksumPolicy {
  MaintainEdited = "maintain-edited",
  Preserve = "preserve",
}

export class SaveFile {
  static get requiredSize(): number {
    throw new Error("Method not implemented.");
  }

  static get acceptedSize(): number {
    throw new Error("Method not implemented.");
  }

  getData(_order = ExportByteOrder.Automatic): Uint8Array {
    throw new Error("Method not implemented.");
  }

  get data(): Uint8Array {
    return this.getData();
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
      bytes = source.slice(0, klass.acceptedSize);
    } else {
      bytes = new Uint8Array(klass.acceptedSize);
      let readBytes = 0;
      while (readBytes < bytes.length) {
        const count = source.readSync(bytes.subarray(readBytes));
        if (count === null || count === 0) break;
        readBytes += count;
      }
      if (readBytes < requiredSize) {
        throw Error(
          `Incorrect file size, cannot read save file. Expected at least ${requiredSize} bytes, got ${readBytes}.`,
        );
      }
    }

    this.data = this.checkDataOnRead(bytes);

    return this;
  }

  getDataForWrite(
    order = ExportByteOrder.Automatic,
    _checksumPolicy = ChecksumPolicy.MaintainEdited,
  ): Uint8Array {
    return this.getData(order);
  }

  write(
    file: Deno.FsFile,
    order = ExportByteOrder.Automatic,
    checksumPolicy = ChecksumPolicy.MaintainEdited,
  ): void {
    const data = this.getDataForWrite(order, checksumPolicy);
    file.writeSync(data);
  }
}

export class SraSaveFile extends SaveFile {
  sourceSrmData?: Uint8Array;
  header = SaveHeader.createBlank();
  slots: [SaveSlot, SaveSlot, SaveSlot] = [
    SaveSlot.createNewGame(0),
    SaveSlot.createEmpty(1),
    SaveSlot.createEmpty(2),
  ];
  backups: [SaveSlot, SaveSlot, SaveSlot] = [
    SaveSlot.createNewGame(0),
    SaveSlot.createEmpty(1),
    SaveSlot.createEmpty(2),
  ];
  private originalSlotData = [...this.slots, ...this.backups].map((slot) =>
    slot.data.slice()
  );
  private byteSwapped: boolean = false;
  private readByteOrder = ExportByteOrder.Automatic;
  private trailingData = new Uint8Array(
    SraSaveFile.acceptedSize - SraSaveFile.requiredSize,
  );

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

  /** An already known source order takes precedence over header detection. */
  override read(
    source: Deno.FsFile | Uint8Array,
    sourceOrder = ExportByteOrder.Automatic,
  ): this {
    this.readByteOrder = sourceOrder;
    try {
      return super.read(source);
    } finally {
      this.readByteOrder = ExportByteOrder.Automatic;
    }
  }

  /** Serializes SRAM with stored checksum bytes by default; never mutates the save. */
  override getData(
    order = ExportByteOrder.Automatic,
    checksumPolicy = ChecksumPolicy.Preserve,
  ): Uint8Array {
    const bytes = new Uint8Array(SraSaveFile.acceptedSize);

    let currentOffset = 0x00;

    bytes.set(this.header.data, currentOffset);
    currentOffset += SaveHeader.requiredSize;

    for (const [index, slot] of [...this.slots, ...this.backups].entries()) {
      bytes.set(slot.data, currentOffset);
      if (
        checksumPolicy === ChecksumPolicy.MaintainEdited &&
        slot.data.some((value, offset) =>
          offset !== 0x1352 && offset !== 0x1353 &&
          value !== this.originalSlotData[index][offset]
        )
      ) {
        const outputSlot = new SaveSlot(
          bytes.subarray(currentOffset, currentOffset + SaveSlot.requiredSize),
        );
        outputSlot.updateChecksum();
      }
      currentOffset += SaveSlot.requiredSize;
    }

    bytes.set(this.trailingData, currentOffset);

    const outputOrder = resolveByteOrder(
      order,
      this.byteSwapped && !this.sourceSrmData
        ? ExportByteOrder.WordSwapped
        : ExportByteOrder.BigEndian,
    );
    if (outputOrder === ExportByteOrder.WordSwapped) {
      FileUtil.byteSwap(bytes, true);
    }

    return bytes;
  }

  override get data(): Uint8Array {
    return super.data;
  }

  override set data(bytes: Uint8Array) {
    this.sourceSrmData = undefined;
    bytes = this.ensureByteOrder(bytes);
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

    this.trailingData = bytes.slice(currentOffset, SraSaveFile.acceptedSize);
    this.originalSlotData = [...this.slots, ...this.backups].map((slot) =>
      slot.data.slice()
    );
  }

  override getDataForWrite(
    order = ExportByteOrder.Automatic,
    checksumPolicy = ChecksumPolicy.MaintainEdited,
  ): Uint8Array {
    return this.getData(order, checksumPolicy);
  }

  private ensureByteOrder(bytes: Uint8Array): Uint8Array {
    this.byteSwapped = resolveByteOrder(
      this.readByteOrder,
      isWordSwapped(bytes)
        ? ExportByteOrder.WordSwapped
        : ExportByteOrder.BigEndian,
    ) === ExportByteOrder.WordSwapped;
    return this.byteSwapped ? FileUtil.byteSwap(bytes) : bytes;
  }
}

/**
 * Mupen64Plus-Next SRM layout: EEPROM, four MemPaks, SRAM, then FlashRAM.
 * New containers retain provisional zero-filled non-SRAM sections.
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
  // Header edits must not discard the order known from a read or conversion.
  private sramByteSwapped?: boolean;

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

  static fromSaveFile(
    save: SraSaveFile,
    order = ExportByteOrder.Automatic,
    checksumPolicy = ChecksumPolicy.Preserve,
  ): SrmSaveFile {
    const srm = save.sourceSrmData
      ? new SrmSaveFile().read(save.sourceSrmData)
      : new SrmSaveFile();
    const outputOrder = resolveByteOrder(
      order,
      save.sourceSrmData && !save.isByteSwapped
        ? ExportByteOrder.BigEndian
        : ExportByteOrder.WordSwapped,
    );
    srm.sram.set(save.getData(outputOrder, checksumPolicy), 0);
    srm.sramByteSwapped = outputOrder === ExportByteOrder.WordSwapped;

    return srm;
  }

  override getData(order = ExportByteOrder.Automatic): Uint8Array {
    const bytes = new Uint8Array(SrmSaveFile.acceptedSize);
    let currentOffset = 0x00;

    bytes.set(this.eeprom, currentOffset);
    currentOffset += SrmSaveFile.EEPROM_SIZE;

    for (let i = 0; i < SrmSaveFile.MEMPACK_COUNT; i++) {
      bytes.set(this.mempacks[i], currentOffset);
      currentOffset += SrmSaveFile.MEMPACK_SIZE;
    }

    const sourceSwapped = this.sramByteSwapped ?? isWordSwapped(this.sram);
    const outputOrder = resolveByteOrder(
      order,
      sourceSwapped ? ExportByteOrder.WordSwapped : ExportByteOrder.BigEndian,
    );
    const swap = (outputOrder === ExportByteOrder.WordSwapped) !==
      sourceSwapped;
    bytes.set(swap ? FileUtil.byteSwap(this.sram) : this.sram, currentOffset);
    currentOffset += SrmSaveFile.SRAM_SIZE;

    bytes.set(this.flashram, currentOffset);
    currentOffset += SrmSaveFile.FLASHRAM_SIZE;

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
    this.sramByteSwapped = isWordSwapped(this.sram);
    currentOffset += SrmSaveFile.SRAM_SIZE;

    this.flashram = bytes.slice(
      currentOffset,
      currentOffset + SrmSaveFile.FLASHRAM_SIZE,
    );
    currentOffset += SrmSaveFile.FLASHRAM_SIZE;
  }

  get saveFile(): SraSaveFile {
    const sra = new SraSaveFile();
    sra.read(
      this.sram,
      (this.sramByteSwapped ?? isWordSwapped(this.sram))
        ? ExportByteOrder.WordSwapped
        : ExportByteOrder.BigEndian,
    );
    sra.sourceSrmData = this.data;
    return sra;
  }
}
