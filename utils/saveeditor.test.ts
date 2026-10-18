import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import { SraSaveFile } from "../models/savefile.ts";
import { Quiver } from "../models/saveslot.ts";
import {
  copySlot,
  getSlot,
  repairSave,
  resetSlot,
  selectUpgrade,
  updateNamedFlag,
} from "./saveeditor.ts";
import { FileFormat, FileUtil } from "./fileutil.ts";

Deno.test("named UI flag edits persist through file export and reload", () => {
  const save = new SraSaveFile();
  updateNamedFlag(save.slots[0], "eventFlags", "metDekuTree", true);
  updateNamedFlag(
    save.slots[0],
    "itemFlags",
    "obtainedGerudoQuiverUpgrade",
    true,
  );
  updateNamedFlag(save.slots[0], "otherFlags", "metMido", true);
  const reread = FileUtil.loadFileFromBuffer(
    FileUtil.getFileData(save, FileFormat.SRA),
  );
  assertEquals(reread.slots[0].eventFlags.metDekuTree, true);
  assertEquals(reread.slots[0].itemFlags.obtainedGerudoQuiverUpgrade, true);
  assertEquals(reread.slots[0].otherFlags.metMido, true);
  assertEquals(reread.slots[0].isValid, true);
  assertThrows(
    () => updateNamedFlag(save.slots[0], "eventFlags", "data", true),
    Error,
    "Unknown",
  );
});

Deno.test("copying and restoring backups produces independent slots with destination indices", () => {
  const save = new SraSaveFile();
  save.slots[0].playerName = "Link";
  save.slots[0].rupees = 200;
  copySlot(save, 0, 4);
  assertEquals(save.backups[1].playerName, "Link");
  assertEquals(save.backups[1].fileIndex, 1);
  save.slots[0].rupees = 0;
  assertEquals(save.backups[1].rupees, 200);
  copySlot(save, 4, 2);
  assertEquals(save.slots[2].rupees, 200);
  assertEquals(save.slots[2].fileIndex, 2);
  assertEquals(save.slots[2].isValid, true);
  resetSlot(save, 2);
  assertEquals(save.slots[2].playerName, "");
  assertEquals(save.slots[2].currentHealth, 48);
  assertNotEquals(save.slots[2].data, save.backups[1].data);
  assertThrows(() => getSlot(save, 6));
  assertThrows(() => copySlot(save, -1, 0));
});

Deno.test("repair restores signatures and checksums without discarding progress", () => {
  const save = new SraSaveFile();
  save.header.data[3] = 0;
  save.slots[0].data[0x1C] = 0;
  save.slots[0].rupees = 321;
  repairSave(save);
  assertEquals(save.header.isValid, true);
  assertEquals(save.slots[0].isValid, true);
  assertEquals(save.slots[0].rupees, 321);
});

Deno.test("UI upgrade selection replaces the previous level in the same group", () => {
  assertEquals(
    selectUpgrade([Quiver.QuiverHolds30], Quiver.QuiverHolds50, true),
    [Quiver.QuiverHolds50],
  );
  assertEquals(
    selectUpgrade([Quiver.QuiverHolds50], Quiver.QuiverHolds50, false),
    [],
  );
});
