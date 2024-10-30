import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

export class SaveFile {
  header: SaveHeader;
  slots: [SaveSlot, SaveSlot, SaveSlot];
  backups: [SaveSlot, SaveSlot, SaveSlot];

  constructor() {
    this.header = new SaveHeader();
    this.slots = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    this.backups = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
  }

  async read(filename: string): Promise<SaveFile> {
    const bytes = await Deno.readFile(filename);
    this.header = new SaveHeader(bytes.slice(0x00, 0x20));
    this.slots[0] = new SaveSlot(bytes.slice(0x20, 0x20 + 0x1450));
    // TODO init other slots
    // TODO init backups
    return this;
  }
}
