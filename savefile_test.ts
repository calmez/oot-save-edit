import { assertInstanceOf } from "@std/assert";
import { SaveFile, SaveHeader, SaveSlot } from "./savefile.ts";

Deno.test(function shouldCreate() {
  const instance = new SaveFile();
  assertInstanceOf(instance, SaveFile);
});

Deno.test(function shouldInitializeEmpty() {
  const instance = new SaveFile();
  assertInstanceOf(instance.header, SaveHeader);
  instance.slots.forEach(slot => {
    assertInstanceOf(slot, SaveSlot);
  });
  instance.backups.forEach(slot => {
    assertInstanceOf(slot, SaveSlot);
  });
});