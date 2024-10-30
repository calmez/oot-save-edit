import { assertInstanceOf } from "@std/assert";
import { SaveFile } from "./savefile.ts";
import { SaveHeader } from "./saveheader.ts";
import { SaveSlot } from "./saveslot.ts";

Deno.test(function shouldCreate() {
  const instance = new SaveFile();
  assertInstanceOf(instance, SaveFile);
});

Deno.test(function shouldInitializeEmpty() {
  const instance = new SaveFile();
  assertInstanceOf(instance.header, SaveHeader);
  instance.slots.forEach((slot) => {
    assertInstanceOf(slot, SaveSlot);
  });
  instance.backups.forEach((slot) => {
    assertInstanceOf(slot, SaveSlot);
  });
});
