import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import { SraSaveFile } from "../models/savefile.ts";
import { Age, Quiver } from "../models/saveslot.ts";
import {
  copySlot,
  getSlot,
  repairSave,
  resetSlotToNewGame,
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
  resetSlotToNewGame(save, 2);
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

Deno.test("new-file empty pairs survive diagnosis, repair, synchronization and SRA/SRM round trips", () => {
  for (const format of [FileFormat.SRA, FileFormat.SRM]) {
    const save = new SraSaveFile();
    const empty = save.slots[1].data.slice();
    repairSave(save);
    for (let index = 0; index < 3; index++) copySlot(save, index, index + 3);
    const reread = FileUtil.loadFileFromBuffer(
      FileUtil.getFileData(save, format),
    );
    assertEquals(reread.slots.map((slot) => slot.isEmpty), [false, true, true]);
    assertEquals(reread.backups.map((slot) => slot.isEmpty), [
      false,
      true,
      true,
    ]);
    assertEquals(reread.slots[1].data, empty);
    assertEquals(reread.slots[0].isValid, true);
    for (let index = 0; index < 3; index++) {
      assertEquals(reread.slots[index].data, reread.backups[index].data);
      assertEquals(reread.slots[index].fileIndex, index);
    }
  }
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

Deno.test("explicit new-game creation replaces only the selected record with its destination index", () => {
  for (let target = 0; target < 6; target++) {
    const save = new SraSaveFile();
    const before = [...save.slots, ...save.backups].map((slot) =>
      slot.data.slice()
    );
    resetSlotToNewGame(save, target);
    for (let index = 0; index < 6; index++) {
      const slot = getSlot(save, index);
      if (index !== target) {
        assertEquals(slot.data, before[index]);
        continue;
      }
      assertEquals(slot.isEmpty, false);
      assertEquals(slot.isValid, true);
      assertEquals(slot.fileIndex, target % 3);
      assertEquals(slot.age, Age.Child);
      assertEquals(slot.currentHealth, 48);
      assertEquals(slot.cutSceneNumber, 0xFFF1);
    }
    assertThrows(() => resetSlotToNewGame(save, 6), Error, "Slot index");
  }
});
