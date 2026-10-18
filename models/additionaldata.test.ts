import { assertEquals, assertThrows } from "@std/assert";
import { SaveSlot, Songs } from "./saveslot.ts";

Deno.test("additional progress writes the documented offsets and preserves adjacent data", () => {
  const slot = new SaveSlot();
  slot.data[0xF34] = 0xA5;
  const data = slot.additionalData;
  data.totalDays = -2;
  data.biggoronDays = 3;
  data.swordHealth = 8;
  data.doubleDefenseAcquired = true;
  data.ocarinaGameRound = 2;
  data.childButtonItems = [0xFF, 3, 4, 5];
  data.childButtonSlots = [3, 4, 5];
  data.childEquipment = 0x1121;
  data.adultButtonItems = [6, 7, 8, 9];
  data.adultButtonSlots = [6, 7, 8];
  data.adultEquipment = 0x3322;
  data.warpPlayerParams = -1;
  data.warpSwitchFlags = 0x80000000;
  data.warpCollectibleFlags = 0xFFFFFFFF;
  data.skulltulaFlags[5] = 0x12345678;
  data.highScores = [1000, 500, 0x80000400, 60, 120, 0, 45];
  data.worldMapAreas = 0x12345;
  data.scarecrowLongSongSet = true;
  data.scarecrowLongSong[863] = 0xFF;
  data.scarecrowSpawnSongSet = true;
  data.scarecrowSpawnSong[127] = 0xA5;
  data.horseScene = 0x51;
  data.horseX = -1840;
  data.horseY = 72;
  data.horseZ = 5497;
  data.horseAngle = -0x6AD9;
  data.eventFlagWords[13] = 0x8000;
  data.itemFlagWords[3] = 0x1234;
  data.otherFlagWords[29] = 0x5678;
  data.heartPieces = 3;
  slot.additionalData = data;
  const view = new DataView(slot.data.buffer);
  assertEquals(view.getInt32(0x14), -2);
  assertEquals(view.getUint16(0x36), 8);
  assertEquals(slot.data[0x3D], 1);
  assertEquals(view.getUint16(0x48), 0x1121);
  assertEquals(view.getUint16(0x52), 0x3322);
  assertEquals(view.getInt32(0xE74), -1);
  assertEquals(view.getUint32(0xEB0), 0x12345678);
  assertEquals(slot.bigPoePoints, 500);
  assertEquals(view.getUint32(0xF38), 0x12345);
  assertEquals(slot.data[0x12A0], 0xFF);
  assertEquals(slot.data[0x1345], 0xA5);
  assertEquals(view.getInt16(0x134A), -1840);
  assertEquals(view.getUint16(0xEEE), 0x8000);
  assertEquals(view.getUint16(0xEF6), 0x1234);
  assertEquals(view.getUint16(0xF32), 0x5678);
  assertEquals(slot.data[0xF34], 0xA5);
  assertEquals(new SaveSlot(slot.data.slice()).additionalData, data);
});

Deno.test("additional progress validates all values before changing the slot", () => {
  const slot = SaveSlot.createBlank();
  const before = slot.data.slice();
  assertThrows(
    () => {
      slot.additionalData = { ...slot.additionalData, horseX: -32769 };
    },
    Error,
    "Epona X",
  );
  assertThrows(
    () => {
      slot.additionalData = { ...slot.additionalData, childButtonItems: [1] };
    },
    Error,
    "4 values",
  );
  assertThrows(() => {
    slot.additionalData = {
      ...slot.additionalData,
      highScores: [NaN, 0, 0, 0, 0, 0, 0],
    };
  });
  assertEquals(slot.data, before);
});

Deno.test("quest item editing preserves collected Pieces of Heart", () => {
  const slot = SaveSlot.createBlank();
  slot.additionalData = { ...slot.additionalData, heartPieces: 3 };
  slot.questStatusItems = [Songs.SariasSong];
  assertEquals(slot.additionalData.heartPieces, 3);
  assertEquals(slot.questStatusItems, [Songs.SariasSong]);
});
