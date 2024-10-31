import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { SaveHeader } from "./saveheader.ts";
import { SoundOption } from "./SaveHeader.ts";

Deno.test({
  name: 'should create',
  fn() {
    const instance = new SaveHeader();
    assertInstanceOf(instance, SaveHeader);
  }
});

Deno.test({
  name: 'should raise an error when incorrect size of data is given',
  fn() {
    const wrongInput = new Uint8Array(42);
    assertThrows(() => new SaveHeader(wrongInput));
  }
});

Deno.test({
  name: 'should provide the stored SoundOption',
  fn() {
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const expectedSoundOption = SoundOption.Headphones;
    testData[0x00] = expectedSoundOption;
    const instance = new SaveHeader(testData);
    assertEquals(instance.soundOption, expectedSoundOption);
  }
});
