import { assertEquals, assertThrows } from "@std/assert";
import { toNumber, toUint8Array } from "./conversions.ts";

Deno.test({
  name: "should convert a 1 byte number",
  fn() {
    const testNumber = 42;
    const result = toUint8Array(testNumber);
    assertEquals(result, new Uint8Array([testNumber]))
  }
});

Deno.test({
  name: "should convert a 2 byte number",
  fn() {
    const testNumber = 0x0FFF;
    const result = toUint8Array(testNumber);
    assertEquals(result, new Uint8Array([0x0F, 0xFF]));
  }
});

Deno.test({
  name: "should convert a 3 byte number",
  fn() {
    const testNumber = 0x0FF0FF;
    const result = toUint8Array(testNumber);
    assertEquals(result, new Uint8Array([0x0F, 0xF0, 0xFF]));
  }
});

Deno.test({
  name: "should convert a 4 byte number",
  fn() {
    const testNumber = 0xDEADBEEF;
    const result = toUint8Array(testNumber);
    assertEquals(result, new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]));
  }
});

Deno.test({
  name: "should error for too big numbers",
  fn() {
    const testNumber = 0xFFFFFFFF0;
    assertThrows(() => toUint8Array(testNumber));
  }
});

Deno.test({
  name: "should fill with leading zeroed bytes when fixed length is given",
  fn() {
    const testNumber = 0xDEAD;
    assertEquals(toUint8Array(testNumber, 3), new Uint8Array([0x00, 0xDE, 0xAD]));
  }
});

Deno.test({
  name: "should error when number is too big for fixed length in bytes",
  fn() {
    const testNumber = 0xBEEF0;
    assertThrows(() => toUint8Array(testNumber, 2));
  }
});

Deno.test({
  name: "should convert a 1 byte array",
  fn() {
    const expectedNumber = 42;
    const testArray = new Uint8Array([expectedNumber]);
    assertEquals(toNumber(testArray), expectedNumber);
  }
})

Deno.test({
  name: "should convert a 2 byte array",
  fn() {
    const expectedNumber = 0xDEAD;
    const testArray = new Uint8Array([0xDE, 0xAD]);
    assertEquals(toNumber(testArray), expectedNumber);
  }
})

Deno.test({
  name: "should convert a 3 byte array",
  fn() {
    const expectedNumber = 0xDEAD01;
    const testArray = new Uint8Array([0xDE, 0xAD, 0x01]);
    assertEquals(toNumber(testArray), expectedNumber);
  }
})

Deno.test({
  name: "should convert a 4 byte array",
  fn() {
    const expectedNumber = 0xDEADBEEF;
    const testArray = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]);
    assertEquals(toNumber(testArray), expectedNumber);
  }
})
