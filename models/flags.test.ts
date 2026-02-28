import { assert, assertInstanceOf, assertThrows } from "@std/assert";
import { Flags } from "./flags.ts";

class TestFlags extends Flags<Uint8Array> {
  protected override get minBytes(): number {
    return 2;
  }

  protected createArray(length: number): Uint8Array {
    return new Uint8Array(length);
  }

  get flagA(): boolean {
    return this.getBit({ byte: 0, bit: 0 });
  }

  set flagA(value: boolean) {
    this.setBit({ byte: 0, bit: 0 }, value);
  }

  get flagB(): boolean {
    return this.getBit({ byte: 1, bit: 7 });
  }

  set flagB(value: boolean) {
    this.setBit({ byte: 1, bit: 7 }, value);
  }
}

Deno.test({
  name: "should create",
  fn() {
    const flags = new TestFlags();
    assertInstanceOf(flags, TestFlags);
  },
});

Deno.test({
  name: "should initialize with default data",
  fn() {
    const flags = new TestFlags();
    assert(flags.data instanceof Uint8Array);
    assert(flags.data.length === 2);
    for (const byte of flags.data) {
      assert(byte === 0);
    }
  },
});

Deno.test({
  name: "should initialize with provided data",
  fn() {
    const initialData = new Uint8Array([0b00000001, 0b10000000]);
    const flags = new TestFlags(initialData);
    assert(flags.flagA);
    assert(flags.flagB);
  },
});

Deno.test({
  name: "should throw an error if provided data is too short",
  fn() {
    const shortData = new Uint8Array(1);
    assertThrows(() => new TestFlags(shortData), Error);
  },
});

Deno.test({
  name: "should set and get flags correctly",
  fn() {
    const flags = new TestFlags();
    flags.flagA = true;
    flags.flagB = true;

    assert(flags.flagA);
    assert(flags.flagB);

    flags.flagA = false;
    flags.flagB = false;

    assert(!flags.flagA);
    assert(!flags.flagB);
  },
});

Deno.test({
  name: "should return a copy of the data",
  fn() {
    const flags = new TestFlags();
    const data1 = flags.data;
    const data2 = flags.data;

    assert(data1 instanceof Uint8Array);
    assert(data2 instanceof Uint8Array);
    assert(data1.length === 2);
    assert(data2.length === 2);
    assert(data1 !== data2);
  },
});

Deno.test({
  name: "should get a certain flag from the data",
  fn() {
    const flags = new TestFlags(new Uint8Array([0b00000001, 0b10000000]));
    assert(flags.flagA);
    assert(flags.flagB);
  },
});

Deno.test({
  name: "should set a certain flag in the data",
  fn() {
    const flags = new TestFlags();
    flags.flagA = true;
    flags.flagB = true;

    assert(flags.flagA);
    assert(flags.flagB);

    const data = flags.data;
    assert(data[0] === 0b00000001);
    assert(data[1] === 0b10000000);
  },
});
