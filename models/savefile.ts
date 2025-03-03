import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

export class SaveFile {
  header: SaveHeader;
  slots: [SaveSlot, SaveSlot, SaveSlot];
  backups: [SaveSlot, SaveSlot, SaveSlot];

  private static get saveSlots(): number {
    return 3;
  }

  static get requiredSize(): number {
    return SaveHeader.requiredSize + this.saveSlots * SaveSlot.requiredSize +
      this.saveSlots * SaveSlot.requiredSize;
  }

  constructor(file?: Deno.FsFile) {
    this.header = new SaveHeader();
    this.slots = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    this.backups = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    if (file) {
      this.read(file);
    }
  }

  read(file: Deno.FsFile): SaveFile {
    const bytes = new Uint8Array(SaveFile.requiredSize);
    const readBytes = file.readSync(bytes);
    if (SaveFile.requiredSize !== readBytes) {
      throw Error(
        `Incorrect file size, cannot read save file. Expected ${SaveFile.requiredSize} bytes, got ${readBytes}.`,
      );
    }

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

  write(file: Deno.FsFile): void {
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

    file.writeSync(bytes);
  }
}
