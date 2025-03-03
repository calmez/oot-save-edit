import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { SaveHeader } from "./saveheader.ts";
import { LanguageOption, SoundOption, ZTargetOption } from "./saveheader.ts";

Deno.test({
  name: "should create",
  fn() {
    const instance = new SaveHeader();
    assertInstanceOf(instance, SaveHeader);
  },
});

Deno.test({
  name: "should raise an error when incorrect size of data is given",
  fn() {
    const wrongInput = new Uint8Array(42);
    assertThrows(() => new SaveHeader(wrongInput));
  },
});

Deno.test({
  name: "should provide its data",
  fn() {
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const instance = new SaveHeader(testData);
    assertEquals(instance.data, testData);
  },
});

Deno.test({
  name: "should provide the stored SoundOption",
  fn() {
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const expectedSoundOption = SoundOption.Headphones;
    testData[0x00] = expectedSoundOption;
    const instance = new SaveHeader(testData);
    assertEquals(instance.soundOption, expectedSoundOption);
  },
});

Deno.test({
  name: "should set the SoundOption",
  fn() {
    const expectedSoundOption = SoundOption.Mono;
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const instance = new SaveHeader(testData);
    instance.soundOption = expectedSoundOption;
    assertEquals(instance.soundOption, expectedSoundOption);
  },
});

Deno.test({
  name: "should provide the stored ZTargetOption",
  fn() {
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const expectedZTargetOption = ZTargetOption.Hold;
    testData[0x01] = expectedZTargetOption;
    const instance = new SaveHeader(testData);
    assertEquals(instance.zTargetOption, expectedZTargetOption);
  },
});

Deno.test({
  name: "should set the ZTargetOption",
  fn() {
    const expectedZTargetOption = ZTargetOption.Hold;
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const instance = new SaveHeader(testData);
    instance.zTargetOption = expectedZTargetOption;
    assertEquals(instance.zTargetOption, expectedZTargetOption);
  },
});

Deno.test({
  name: "should provide the stored LanguageOption",
  fn() {
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const expectedLanguageOption = LanguageOption.German;
    testData[0x02] = expectedLanguageOption;
    const instance = new SaveHeader(testData);
    assertEquals(instance.languageOption, expectedLanguageOption);
  },
});

Deno.test({
  name: "should set the LanguageOption",
  fn() {
    const expectedLanguageOption = LanguageOption.German;
    const testData = new Uint8Array(SaveHeader.requiredSize);
    const instance = new SaveHeader(testData);
    instance.languageOption = expectedLanguageOption;
    assertEquals(instance.languageOption, expectedLanguageOption);
  },
});

Deno.test({
  name: "should check when data is not valid",
  fn() {
    const invalidData = new Uint8Array(SaveHeader.requiredSize);
    const instance = new SaveHeader(invalidData);
    assertEquals(instance.isValid, false);
  },
});

Deno.test({
  name: "should check when data is valid",
  fn() {
    const validData = new Uint8Array(SaveHeader.requiredSize);
    validData.set(SaveHeader.validCheckPattern, 0x03);
    validData.set(SaveHeader.defaultPadding, 0x0C);
    const instance = new SaveHeader(validData);
    assertEquals(instance.isValid, true);
  },
});

Deno.test({
  name: "should correct validity",
  fn() {
    const invalidData = new Uint8Array(SaveHeader.requiredSize);
    const instance = new SaveHeader(invalidData);
    instance.makeValid();
    assertEquals(instance.isValid, true);
  },
});
