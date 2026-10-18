import { assertEquals, assertThrows } from "@std/assert";
import { SaveSlot } from "../models/saveslot.ts";
import {
  additionalFieldValue,
  setAdditionalField,
} from "./additionalfields.ts";

Deno.test("advanced editor accepts signed values, words and exact song data", () => {
  const slot = SaveSlot.createNewGame();
  setAdditionalField(slot, "horseX", "-2000");
  setAdditionalField(slot, "doubleDefenseAcquired", "true");
  setAdditionalField(slot, "scarecrowSpawnSong", "ab ".repeat(128));
  assertEquals(slot.additionalData.horseX, -2000);
  assertEquals(slot.additionalData.doubleDefenseAcquired, true);
  assertEquals(
    slot.additionalData.scarecrowSpawnSong,
    new Array(128).fill(0xAB),
  );
  assertEquals(
    additionalFieldValue(slot, "scarecrowSpawnSong"),
    new Array(128).fill("ab").join(" "),
  );
  const before = slot.data.slice();
  for (const text of ["zz".repeat(128), "ab", ""]) {
    assertThrows(() => setAdditionalField(slot, "scarecrowSpawnSong", text));
  }
  assertThrows(() => setAdditionalField(slot, "horseX", ""));
  assertThrows(() => setAdditionalField(slot, "highScores", "1,,2"));
  assertEquals(slot.data, before);
});
