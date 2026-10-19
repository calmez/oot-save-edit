import { assertEquals } from "@std/assert";

import { SraSaveFile } from "../../models/savefile.ts";
import { Entrance, Room } from "../../models/scene.ts";
import { FileFormat, FileUtil } from "../../utils/fileutil.ts";
import { setAdditionalField } from "../additionalfields.ts";
import { applySlotFields, makeSlotFields } from "./slotdata.ts";

Deno.test("TUI writes Farore's Wind and Poe points through export and reload", () => {
  const save = new SraSaveFile();
  const before = makeSlotFields(0, save);
  const values = {
    ...before,
    slot_0_faroresWindWarp: { x: -1234, y: 567, z: -890, yRotation: -500 },
    slot_0_bigPoePoints: 900,
  };
  applySlotFields(save.slots[0], 0, values, before);
  const reread = FileUtil.loadFileFromBuffer(
    FileUtil.getFileData(save, FileFormat.SRA),
  );
  assertEquals(reread.slots[0].faroresWindWarp, values.slot_0_faroresWindWarp);
  assertEquals(reread.slots[0].bigPoePoints, 900);
  assertEquals(reread.slots[0].isValid, true);
});

Deno.test("unrelated TUI edits preserve direct advanced changes and backup edits", () => {
  const save = new SraSaveFile();
  const before = makeSlotFields(3, save);
  setAdditionalField(
    save.backups[0],
    "highScores",
    "100, 600, 20, 30, 40, 0, 50",
  );
  setAdditionalField(
    save.backups[0],
    "eventFlagWords",
    "32768, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0",
  );
  applySlotFields(
    save.backups[0],
    3,
    { ...before, slot_3_rupees: 100 },
    before,
  );
  assertEquals(save.backups[0].bigPoePoints, 600);
  assertEquals(save.backups[0].additionalData.eventFlagWords[0], 32768);
  assertEquals(save.backups[0].rupees, 100);
  assertEquals(
    FileUtil.loadFileFromBuffer(FileUtil.getFileData(save, FileFormat.SRA))
      .backups[0].isValid,
    true,
  );
});

Deno.test("TUI location editing changes the entrance without overwriting the saved scene ID", () => {
  const save = new SraSaveFile();
  const before = makeSlotFields(0, save);
  applySlotFields(save.slots[0], 0, {
    ...before,
    slot_0_roomWithEntrance: {
      room: Room.KokiriForest,
      entrance: Entrance.FromDekuTree,
    },
  }, before);
  assertEquals(save.slots[0].room, Room.KokiriForest);
  assertEquals(save.slots[0].entrance, Entrance.FromDekuTree);
  assertEquals(save.slots[0].savedSceneIndex, 0x34);
});

Deno.test("TUI keeps independent fields editable and leaves unavailable magic and checksums unchanged", () => {
  const save = new SraSaveFile();
  const slot = save.slots[0];
  slot.data[0x24] = 255;
  slot.data[0x3A] = 2;
  slot.data[0x3C] = 2;
  slot.entranceIndex = 0xFFFFFFFF;
  const checksum = slot.checksum;
  const before = makeSlotFields(0, save);
  assertEquals(before.slot_0_rupees, 0);
  applySlotFields(slot, 0, { ...before, slot_0_rupees: 42 }, before);
  assertEquals(slot.rupees, 42);
  assertEquals(slot.data[0x3A], 2);
  assertEquals(slot.data[0x3C], 2);
  assertEquals(slot.data[0x24], 255);
  assertEquals(slot.checksum, checksum);
});
