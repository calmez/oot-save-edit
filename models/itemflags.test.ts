import { assertEquals, assertThrows } from "@std/assert";
import { ItemFlags } from "./itemflags.ts";

interface FlagSpec {
  name: string;
  coord: { byte: number; bit: number };
  read: (flags: ItemFlags) => boolean;
  write: (flags: ItemFlags, value: boolean) => void;
}

function makeFlagsWithBits(byte: number, bits: number[]): ItemFlags {
  const words = new Uint8Array(8);
  for (const bit of bits) {
    words[byte] |= 1 << bit;
  }
  return new ItemFlags(words);
}

const flagSpecs: FlagSpec[] = [
  {
    name: "obtainedGerudoQuiverUpgrade",
    coord: ItemFlags.obtainedGerudoQuiverUpgrade,
    read: (flags) => flags.obtainedGerudoQuiverUpgrade,
    write: (flags, value) => flags.obtainedGerudoQuiverUpgrade = value,
  },
  {
    name: "obtainedKakarikoQuiverUpgrade",
    coord: ItemFlags.obtainedKakarikoQuiverUpgrade,
    read: (flags) => flags.obtainedKakarikoQuiverUpgrade,
    write: (flags, value) => flags.obtainedKakarikoQuiverUpgrade = value,
  },
  {
    name: "obtainedBottleFromCuccoLady",
    coord: ItemFlags.obtainedBottleFromCuccoLady,
    read: (flags) => flags.obtainedBottleFromCuccoLady,
    write: (flags, value) => flags.obtainedBottleFromCuccoLady = value,
  },
  {
    name: "obtainedHeartPieceFromGrottoScrub",
    coord: ItemFlags.obtainedHeartPieceFromGrottoScrub,
    read: (flags) => flags.obtainedHeartPieceFromGrottoScrub,
    write: (flags, value) => flags.obtainedHeartPieceFromGrottoScrub = value,
  },
  {
    name: "boughtUpperLeftBombchuRightShelf",
    coord: ItemFlags.boughtUpperLeftBombchuRightShelf,
    read: (flags) => flags.boughtUpperLeftBombchuRightShelf,
    write: (flags, value) => flags.boughtUpperLeftBombchuRightShelf = value,
  },
  {
    name: "boughtLowerLeftBombchuLeftShelf",
    coord: ItemFlags.boughtLowerLeftBombchuLeftShelf,
    read: (flags) => flags.boughtLowerLeftBombchuLeftShelf,
    write: (flags, value) => flags.boughtLowerLeftBombchuLeftShelf = value,
  },
  {
    name: "boughtUpperRightBombchuLeftShelf",
    coord: ItemFlags.boughtUpperRightBombchuLeftShelf,
    read: (flags) => flags.boughtUpperRightBombchuLeftShelf,
    write: (flags, value) => flags.boughtUpperRightBombchuLeftShelf = value,
  },
  {
    name: "boughtLowerRightBombchuRightShelf",
    coord: ItemFlags.boughtLowerRightBombchuRightShelf,
    read: (flags) => flags.boughtLowerRightBombchuRightShelf,
    write: (flags, value) => flags.boughtLowerRightBombchuRightShelf = value,
  },
  {
    name: "boughtLowerLeftBombchuRightShelf",
    coord: ItemFlags.boughtLowerLeftBombchuRightShelf,
    read: (flags) => flags.boughtLowerLeftBombchuRightShelf,
    write: (flags, value) => flags.boughtLowerLeftBombchuRightShelf = value,
  },
  {
    name: "boughtUpperLeftBombchuLeftShelf",
    coord: ItemFlags.boughtUpperLeftBombchuLeftShelf,
    read: (flags) => flags.boughtUpperLeftBombchuLeftShelf,
    write: (flags, value) => flags.boughtUpperLeftBombchuLeftShelf = value,
  },
  {
    name: "boughtLowerRightBombchuLeftShelf",
    coord: ItemFlags.boughtLowerRightBombchuLeftShelf,
    read: (flags) => flags.boughtLowerRightBombchuLeftShelf,
    write: (flags, value) => flags.boughtLowerRightBombchuLeftShelf = value,
  },
  {
    name: "boughtUpperRightBombchuRightShelf",
    coord: ItemFlags.boughtUpperRightBombchuRightShelf,
    read: (flags) => flags.boughtUpperRightBombchuRightShelf,
    write: (flags, value) => flags.boughtUpperRightBombchuRightShelf = value,
  },
  {
    name: "obtainedSuperCuccoMilkBottle",
    coord: ItemFlags.obtainedSuperCuccoMilkBottle,
    read: (flags) => flags.obtainedSuperCuccoMilkBottle,
    write: (flags, value) => flags.obtainedSuperCuccoMilkBottle = value,
  },
  {
    name: "obtainedStageDekuNutUpgrade",
    coord: ItemFlags.obtainedStageDekuNutUpgrade,
    read: (flags) => flags.obtainedStageDekuNutUpgrade,
    write: (flags, value) => flags.obtainedStageDekuNutUpgrade = value,
  },
  {
    name: "obtainedStageDekuStickUpgrade",
    coord: ItemFlags.obtainedStageDekuStickUpgrade,
    read: (flags) => flags.obtainedStageDekuStickUpgrade,
    write: (flags, value) => flags.obtainedStageDekuStickUpgrade = value,
  },
  {
    name: "obtainedDekuSeedBagUpgrade",
    coord: ItemFlags.obtainedDekuSeedBagUpgrade,
    read: (flags) => flags.obtainedDekuSeedBagUpgrade,
    write: (flags, value) => flags.obtainedDekuSeedBagUpgrade = value,
  },
  {
    name: "obtainedNayrusLove",
    coord: ItemFlags.obtainedNayrusLove,
    read: (flags) => flags.obtainedNayrusLove,
    write: (flags, value) => flags.obtainedNayrusLove = value,
  },
  {
    name: "obtainedDinsFire",
    coord: ItemFlags.obtainedDinsFire,
    read: (flags) => flags.obtainedDinsFire,
    write: (flags, value) => flags.obtainedDinsFire = value,
  },
  {
    name: "obtainedFaroresWind",
    coord: ItemFlags.obtainedFaroresWind,
    read: (flags) => flags.obtainedFaroresWind,
    write: (flags, value) => flags.obtainedFaroresWind = value,
  },
  {
    name: "obtainedHeartPieceFromSkullkids",
    coord: ItemFlags.obtainedHeartPieceFromSkullkids,
    read: (flags) => flags.obtainedHeartPieceFromSkullkids,
    write: (flags, value) => flags.obtainedHeartPieceFromSkullkids = value,
  },
  {
    name: "obtainedHeartPieceFromSkullkid",
    coord: ItemFlags.obtainedHeartPieceFromSkullkid,
    read: (flags) => flags.obtainedHeartPieceFromSkullkid,
    write: (flags, value) => flags.obtainedHeartPieceFromSkullkid = value,
  },
  {
    name: "obtainedHeartPieceFromManOnRoof",
    coord: ItemFlags.obtainedHeartPieceFromManOnRoof,
    read: (flags) => flags.obtainedHeartPieceFromManOnRoof,
    write: (flags, value) => flags.obtainedHeartPieceFromManOnRoof = value,
  },
  {
    name: "obtainedDekuSeedsItem",
    coord: ItemFlags.obtainedDekuSeedsItem,
    read: (flags) => flags.obtainedDekuSeedsItem,
    write: (flags, value) => flags.obtainedDekuSeedsItem = value,
  },
  {
    name: "obtainedHeartPieceFromLakeResearcher",
    coord: ItemFlags.obtainedHeartPieceFromLakeResearcher,
    read: (flags) => flags.obtainedHeartPieceFromLakeResearcher,
    write: (flags, value) => flags.obtainedHeartPieceFromLakeResearcher = value,
  },
  {
    name: "obtainedCojiroFromCuccoLady",
    coord: ItemFlags.obtainedCojiroFromCuccoLady,
    read: (flags) => flags.obtainedCojiroFromCuccoLady,
    write: (flags, value) => flags.obtainedCojiroFromCuccoLady = value,
  },
  {
    name: "obtainedPocketEggFromCuccoLady",
    coord: ItemFlags.obtainedPocketEggFromCuccoLady,
    read: (flags) => flags.obtainedPocketEggFromCuccoLady,
    write: (flags, value) => flags.obtainedPocketEggFromCuccoLady = value,
  },
  {
    name: "obtainedMaskOfTruthFromMaskShop",
    coord: ItemFlags.obtainedMaskOfTruthFromMaskShop,
    read: (flags) => flags.obtainedMaskOfTruthFromMaskShop,
    write: (flags, value) => flags.obtainedMaskOfTruthFromMaskShop = value,
  },
  {
    name: "obtainedBunnyHood",
    coord: ItemFlags.obtainedBunnyHood,
    read: (flags) => flags.obtainedBunnyHood,
    write: (flags, value) => flags.obtainedBunnyHood = value,
  },
  {
    name: "obtainedSpookyMask",
    coord: ItemFlags.obtainedSpookyMask,
    read: (flags) => flags.obtainedSpookyMask,
    write: (flags, value) => flags.obtainedSpookyMask = value,
  },
  {
    name: "obtainedSkullMask",
    coord: ItemFlags.obtainedSkullMask,
    read: (flags) => flags.obtainedSkullMask,
    write: (flags, value) => flags.obtainedSkullMask = value,
  },
  {
    name: "obtainedKeatonMask",
    coord: ItemFlags.obtainedKeatonMask,
    read: (flags) => flags.obtainedKeatonMask,
    write: (flags, value) => flags.obtainedKeatonMask = value,
  },
  {
    name: "obtainedMaskOfTruthTradeFlag",
    coord: ItemFlags.obtainedMaskOfTruthTradeFlag,
    read: (flags) => flags.obtainedMaskOfTruthTradeFlag,
    write: (flags, value) => flags.obtainedMaskOfTruthTradeFlag = value,
  },
  {
    name: "soldBunnyHoodUnlockedExtraMasks",
    coord: ItemFlags.soldBunnyHoodUnlockedExtraMasks,
    read: (flags) => flags.soldBunnyHoodUnlockedExtraMasks,
    write: (flags, value) => flags.soldBunnyHoodUnlockedExtraMasks = value,
  },
  {
    name: "soldSpookyMaskUnlockedBunnyHood",
    coord: ItemFlags.soldSpookyMaskUnlockedBunnyHood,
    read: (flags) => flags.soldSpookyMaskUnlockedBunnyHood,
    write: (flags, value) => flags.soldSpookyMaskUnlockedBunnyHood = value,
  },
  {
    name: "soldSkullMaskUnlockedSpookyMask",
    coord: ItemFlags.soldSkullMaskUnlockedSpookyMask,
    read: (flags) => flags.soldSkullMaskUnlockedSpookyMask,
    write: (flags, value) => flags.soldSkullMaskUnlockedSpookyMask = value,
  },
  {
    name: "soldKeatonMaskUnlockedSkullMask",
    coord: ItemFlags.soldKeatonMaskUnlockedSkullMask,
    read: (flags) => flags.soldKeatonMaskUnlockedSkullMask,
    write: (flags, value) => flags.soldKeatonMaskUnlockedSkullMask = value,
  },
  {
    name: "obtainedPoachersSawFromFado",
    coord: ItemFlags.obtainedPoachersSawFromFado,
    read: (flags) => flags.obtainedPoachersSawFromFado,
    write: (flags, value) => flags.obtainedPoachersSawFromFado = value,
  },
  {
    name: "obtainedOddPotionFromGranny",
    coord: ItemFlags.obtainedOddPotionFromGranny,
    read: (flags) => flags.obtainedOddPotionFromGranny,
    write: (flags, value) => flags.obtainedOddPotionFromGranny = value,
  },
];

for (const flagSpec of flagSpecs) {
  Deno.test(`${flagSpec.name}: reads true when bit ${flagSpec.coord.bit} of byte ${flagSpec.coord.byte} is set`, () => {
    const flags = makeFlagsWithBits(flagSpec.coord.byte, [flagSpec.coord.bit]);
    assertEquals(flagSpec.read(flags), true);
  });

  Deno.test(`${flagSpec.name}: reads false when no bits set`, () => {
    const flags = new ItemFlags();
    assertEquals(flagSpec.read(flags), false);
  });

  Deno.test(`${flagSpec.name}: setter toggles correctly`, () => {
    const flags = new ItemFlags();
    flagSpec.write(flags, true);
    assertEquals(flagSpec.read(flags), true);
    flagSpec.write(flags, false);
    assertEquals(flagSpec.read(flags), false);
  });
}

Deno.test("default constructor initializes all known flags to false", () => {
  const flags = new ItemFlags();
  for (const flagSpec of flagSpecs) {
    assertEquals(flagSpec.read(flags), false);
  }
});

Deno.test("Uint8Array constructor rejects arrays smaller than 8 bytes", () => {
  assertThrows(() => new ItemFlags(new Uint8Array(7)));
});

Deno.test("Uint8Array constructor roundtrip preserves all bits", () => {
  const flags = new ItemFlags();
  flags.obtainedGerudoQuiverUpgrade = true;
  flags.obtainedSuperCuccoMilkBottle = true;
  flags.obtainedFaroresWind = true;
  flags.obtainedHeartPieceFromLakeResearcher = true;
  flags.obtainedMaskOfTruthFromMaskShop = true;
  flags.obtainedBunnyHood = true;
  flags.soldKeatonMaskUnlockedSkullMask = true;
  flags.obtainedOddPotionFromGranny = true;

  const roundtrip = new ItemFlags(flags.data);

  assertEquals(roundtrip.obtainedGerudoQuiverUpgrade, true);
  assertEquals(roundtrip.obtainedSuperCuccoMilkBottle, true);
  assertEquals(roundtrip.obtainedFaroresWind, true);
  assertEquals(roundtrip.obtainedHeartPieceFromLakeResearcher, true);
  assertEquals(roundtrip.obtainedMaskOfTruthFromMaskShop, true);
  assertEquals(roundtrip.obtainedBunnyHood, true);
  assertEquals(roundtrip.soldKeatonMaskUnlockedSkullMask, true);
  assertEquals(roundtrip.obtainedOddPotionFromGranny, true);
});

Deno.test("data getter preserves byte layout", () => {
  const bytes = new Uint8Array([
    0x12,
    0x34,
    0xAB,
    0xCD,
    0x55,
    0xAA,
    0x0F,
    0x0F,
  ]);
  const flags = new ItemFlags(bytes);
  assertEquals(flags.data, bytes);
});

Deno.test("data getter returns a copy", () => {
  const flags = new ItemFlags();
  const bytes = flags.data;
  bytes[0] = 0xFF;
  assertEquals(flags.data[0], 0x00);
});
