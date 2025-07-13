import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

export class SaveFile {
  header: SaveHeader;
  slots: [SaveSlot, SaveSlot, SaveSlot];
  backups: [SaveSlot, SaveSlot, SaveSlot];
  private byteSwapped: boolean = false;

  private static get saveSlots(): number {
    return 3;
  }

  static get requiredSize(): number {
    return SaveHeader.requiredSize + this.saveSlots * SaveSlot.requiredSize +
      this.saveSlots * SaveSlot.requiredSize;
  }

  static get acceptedSize(): number {
    return 0x8000;
  }

  constructor(source?: Deno.FsFile | Uint8Array) {
    this.header = new SaveHeader();
    this.slots = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    this.backups = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    if (source) {
      this.read(source);
    }
  }

  get isByteSwapped(): boolean {
    return this.byteSwapped;
  }

  read(source: Deno.FsFile | Uint8Array): SaveFile {
    let bytes: Uint8Array;
    if (source instanceof Uint8Array) {
      if (source.length < SaveFile.requiredSize) {
        throw Error(
          `Incorrect data size, cannot read save file. Expected at least ${SaveFile.requiredSize} bytes, got ${source.length}.`,
        );
      }
      bytes = source.slice(0, SaveFile.requiredSize);
    } else {
      bytes = new Uint8Array(SaveFile.requiredSize);
      const readBytes = source.readSync(bytes);
      if (SaveFile.requiredSize !== readBytes) {
        throw Error(
          `Incorrect file size, cannot read save file. Expected ${SaveFile.requiredSize} bytes, got ${readBytes}.`,
        );
      }
    }

    this.ensureByteOrder(bytes);

    let currentOffset = 0x00;

    this.header = new SaveHeader(
      bytes.slice(currentOffset, SaveHeader.requiredSize),
    );
    currentOffset += SaveHeader.requiredSize;

    for (let i = 0; i < SaveFile.saveSlots; i++) {
      this.slots[i] = new SaveSlot(
        bytes.slice(currentOffset, currentOffset + SaveSlot.requiredSize),
      );
      currentOffset += SaveSlot.requiredSize;
    }

    for (let i = 0; i < SaveFile.saveSlots; i++) {
      this.backups[i] = new SaveSlot(
        bytes.slice(currentOffset, currentOffset + SaveSlot.requiredSize),
      );
      currentOffset += SaveSlot.requiredSize;
    }

    return this;
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
      this.byteSwap(bytes);
      this.byteSwapped = true;
    }
    return bytes;
  }

  private byteSwap(bytes: Uint8Array): Uint8Array {
    for (let i = 0; i < bytes.length; i += 4) {
      const temp = bytes.slice(i, i + 4);
      temp.reverse();
      bytes.set(temp, i);
    }
    return bytes;
  }

  write(file: Deno.FsFile, forceSwap: boolean = false): void {
    const bytes = new Uint8Array(SaveFile.requiredSize);

    let currentOffset = 0x00;

    bytes.set(this.header.data, currentOffset);
    currentOffset += SaveHeader.requiredSize;

    for (let i = 0; i < SaveFile.saveSlots; i++) {
      bytes.set(this.slots[i].data, currentOffset);
      currentOffset += SaveSlot.requiredSize;
    }

    for (let i = 0; i < SaveFile.saveSlots; i++) {
      bytes.set(this.backups[i].data, currentOffset);
      currentOffset += SaveSlot.requiredSize;
    }

    if ((this.byteSwapped && !forceSwap) || (!this.byteSwapped && forceSwap)) {
      this.byteSwap(bytes);
    }

    file.writeSync(bytes);
  }
}
