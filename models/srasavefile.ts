import { FileUtil } from "../utils/fileutil.ts";
import { SaveFile } from "./savefile.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

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

  private ensureByteOrder(bytes: Uint8Array): Uint8Array {
    if (
      SaveHeader.validCheckPattern.some((value, index) => {
        if (bytes[index + 0x03] === value) {
          return false;
        }
        return true;
      })
    ) {
      FileUtil.byteSwap(bytes);
      this.byteSwapped = true;
    }
    return bytes;
  }
}
