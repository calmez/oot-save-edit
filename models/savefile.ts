import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

export class SaveFile {
  header: SaveHeader;
  slots: [SaveSlot, SaveSlot, SaveSlot];
  backups: [SaveSlot, SaveSlot, SaveSlot];

  constructor(file?: Deno.FsFile) {
    this.header = new SaveHeader();
    this.slots = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    this.backups = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    if (file) {
      this.read(file);
    }
  }

  read(file: Deno.FsFile): SaveFile {
    // TODO refactor these magic numbers
    const expectedFileSize = 0x0020 + 6 * 0x1450;
    const bytes = new Uint8Array(expectedFileSize);
    const readBytes = file.readSync(bytes);
    if (expectedFileSize !== readBytes) {
      throw Error(
        `Incorrect file size, cannot read save file. Expected ${expectedFileSize} bytes, got ${readBytes}.`,
      );
    }
    this.header = new SaveHeader(bytes.slice(0x00, 0x20));
    this.slots[0] = new SaveSlot(bytes.slice(0x20, 0x20 + 0x1450));
    // TODO init other slots
    // TODO init backups
    return this;
  }
}
