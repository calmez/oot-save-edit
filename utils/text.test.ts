import { assertInstanceOf } from "@std/assert/instance-of";
import { OotText } from "./text.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test({
  name: "should create",
  fn() {
    const instance = new OotText();
    assertInstanceOf(instance, OotText);
  }
});

Deno.test({
  name: "should encode",
  fn() {
    const instance = new OotText();
    const expectedEncoding = new Uint8Array([
      55, 40, 54, 55,
      62, 62, 62, 62,
    ]);
    assertEquals(instance.encode("test"), expectedEncoding);
  }
});

Deno.test({
  name: "should decode",
  fn() {
    const testData = new Uint8Array([
      29, 40, 28, 55,
      62, 62, 62, 62,
    ]);
    const expectedDecoding = "TeSt";
    const instance = new OotText();
    assertEquals(instance.decode(testData), expectedDecoding);
  }
});
