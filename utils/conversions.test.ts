import { assertEquals, assertThrows } from "@std/assert";
import { toUint8Array } from "./conversions.ts";

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
