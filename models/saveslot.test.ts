import { assertInstanceOf } from "@std/assert/instance-of";
import { Age, SaveSlot } from "./saveslot.ts";
import { assertEquals, assertThrows } from "@std/assert";

Deno.test({
  name: 'should create',
  fn() {
    const instance = new SaveSlot();
    assertInstanceOf(instance, SaveSlot);
  }
});

Deno.test({
  name: 'should raise an error when incorrect size of data is given',
  fn() {
    const wrongInput = new Uint8Array(42);
    assertThrows(() => new SaveSlot(wrongInput));
  }
});

Deno.test({
  name: 'should provide the Age',
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedAge = Age.Adult;
    testData[0x07] = expectedAge;
    const instance = new SaveSlot(testData);
    assertEquals(instance.age, expectedAge);
  }
});

Deno.test({
  name: 'should provide the rupees',
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedRupees = 9001;
    testData[0x34] = Math.floor(expectedRupees / 0xFF);
    testData[0x35] = (expectedRupees % 0xFF) - Math.floor(expectedRupees / 0xFF);
    const instance = new SaveSlot(testData);
    assertEquals(instance.rupees, expectedRupees);
  }
})
