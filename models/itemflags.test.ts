import { assertEquals, assertThrows } from "@std/assert";
import { ItemFlags } from "./itemflags.ts";

interface FlagSpec {
  name: string;
  coord: { byte: number; bit: number };
}

function readFlag(flags: ItemFlags, name: string): boolean {
  const dynamicFlags = flags as unknown as Record<string, boolean>;
  return dynamicFlags[name];
}

function writeFlag(flags: ItemFlags, name: string, value: boolean): void {
  const dynamicFlags = flags as unknown as Record<string, boolean>;
  dynamicFlags[name] = value;
}

function makeFlagsWithBits(byte: number, bits: number[]): ItemFlags {
  const bytes = new Uint8Array(8);
  for (const bit of bits) {
    bytes[byte] |= 1 << bit;
  }
  return new ItemFlags(bytes);
}

const flagSpecs: FlagSpec[] = Object.entries(ItemFlags)
  .filter(([, value]) => {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    if (!("byte" in value) || !("bit" in value)) {
      return false;
    }
    return typeof value.byte === "number" && typeof value.bit === "number";
  })
  .map(([name, value]) => ({
    name,
    coord: value as { byte: number; bit: number },
  }));

for (const flagSpec of flagSpecs) {
  Deno.test(`${flagSpec.name}: reads true when bit ${flagSpec.coord.bit} of byte ${flagSpec.coord.byte} is set`, () => {
    const flags = makeFlagsWithBits(flagSpec.coord.byte, [flagSpec.coord.bit]);
    assertEquals(readFlag(flags, flagSpec.name), true);
  });

  Deno.test(`${flagSpec.name}: reads false when no bits set`, () => {
    const flags = new ItemFlags();
    assertEquals(readFlag(flags, flagSpec.name), false);
  });

  Deno.test(`${flagSpec.name}: setter toggles correctly`, () => {
    const flags = new ItemFlags();
    writeFlag(flags, flagSpec.name, true);
    assertEquals(readFlag(flags, flagSpec.name), true);
    writeFlag(flags, flagSpec.name, false);
    assertEquals(readFlag(flags, flagSpec.name), false);
  });
}

Deno.test("default constructor initializes all known flags to false", () => {
  const flags = new ItemFlags();
  for (const flagSpec of flagSpecs) {
    assertEquals(readFlag(flags, flagSpec.name), false);
  }
});

Deno.test("Uint8Array constructor rejects arrays smaller than 8 bytes", () => {
  assertThrows(() => new ItemFlags(new Uint8Array(6)));
});

Deno.test("Uint8Array constructor roundtrip preserves all bits", () => {
  const flags = new ItemFlags();
  for (let i = 0; i < flagSpecs.length; i += 3) {
    const name = flagSpecs[i].name;
    writeFlag(flags, name, true);
  }

  const roundtrip = new ItemFlags(flags.data);

  for (let i = 0; i < flagSpecs.length; i++) {
    const name = flagSpecs[i].name;
    const expected = i % 3 === 0;
    assertEquals(readFlag(roundtrip, name), expected);
  }
});

Deno.test("data getter preserves byte layout", () => {
  const bytes = new Uint8Array(8);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = (i * 17) & 0xFF;
  }

  const flags = new ItemFlags(bytes);
  assertEquals(flags.data, bytes);
});

Deno.test("data getter returns a copy", () => {
  const flags = new ItemFlags();
  flags.obtainedGerudoQuiverUpgrade = true;

  const snapshot = flags.data;
  snapshot[0] = 0;

  assertEquals(flags.obtainedGerudoQuiverUpgrade, true);
});
