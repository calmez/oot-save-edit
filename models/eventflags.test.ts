import { assertEquals } from "@std/assert";
import { EventFlags } from "./eventflags.ts";

// Helper: create EventFlags with specific bits set in a given word
function makeFlagsWithBits(word: number, bits: number[]): EventFlags {
  const arr = new Uint16Array(14);
  for (const bit of bits) {
    arr[word] |= 1 << bit;
  }
  return new EventFlags(arr);
}

// Helper: test that a getter/setter pair works correctly at the expected bit
function testFlag(
  name: string,
  word: number,
  bit: number,
  getter: (f: EventFlags) => boolean,
  setter: (f: EventFlags, v: boolean) => void,
) {
  Deno.test(`${name}: reads true when bit ${bit} of word ${word} is set`, () => {
    const flags = makeFlagsWithBits(word, [bit]);
    assertEquals(getter(flags), true);
  });

  Deno.test(`${name}: reads false when no bits set`, () => {
    const flags = new EventFlags();
    assertEquals(getter(flags), false);
  });

  Deno.test(`${name}: setter toggles correctly`, () => {
    const flags = new EventFlags();
    setter(flags, true);
    assertEquals(getter(flags), true);
    setter(flags, false);
    assertEquals(getter(flags), false);
  });
}

// ============================================================
// Word 0 (0x0): event_chk_inf[0]
// ============================================================

testFlag(
  "metDekuTree",
  0,
  12,
  (f) => f.metDekuTree,
  (f, v) => f.metDekuTree = v,
);

testFlag(
  "playedSariasSongForMidoAsAdult",
  0,
  10,
  (f) => f.playedSariasSongForMidoAsAdult,
  (f, v) => f.playedSariasSongForMidoAsAdult = v,
);

testFlag(
  "usedBlueWarpInGohmasLair",
  0,
  9,
  (f) => f.usedBlueWarpInGohmasLair,
  (f, v) => f.usedBlueWarpInGohmasLair = v,
);

testFlag(
  "obtainedKokiriEmeraldAndDekuTreeDead",
  0,
  7,
  (f) => f.obtainedKokiriEmeraldAndDekuTreeDead,
  (f, v) => f.obtainedKokiriEmeraldAndDekuTreeDead = v,
);

testFlag(
  "spokeToSariaAfterDekuTreeDeath",
  0,
  6,
  (f) => f.spokeToSariaAfterDekuTreeDeath,
  (f, v) => f.spokeToSariaAfterDekuTreeDeath = v,
);

testFlag(
  "dekuTreeOpenedMouth",
  0,
  5,
  (f) => f.dekuTreeOpenedMouth,
  (f, v) => f.dekuTreeOpenedMouth = v,
);

testFlag(
  "showedMidoSwordAndShield",
  0,
  4,
  (f) => f.showedMidoSwordAndShield,
  (f, v) => f.showedMidoSwordAndShield = v,
);

testFlag(
  "complainedAboutMidoToSaria",
  0,
  3,
  (f) => f.complainedAboutMidoToSaria,
  (f, v) => f.complainedAboutMidoToSaria = v,
);

testFlag(
  "firstSpokeToMido",
  0,
  2,
  (f) => f.firstSpokeToMido,
  (f, v) => f.firstSpokeToMido = v,
);

// ============================================================
// Word 1 (0x1): event_chk_inf[1]
// ============================================================

testFlag(
  "wonCowInMalonRace",
  1,
  14,
  (f) => f.wonCowInMalonRace,
  (f, v) => f.wonCowInMalonRace = v,
);

testFlag(
  "destroyedRoyalFamilyTomb",
  1,
  13,
  (f) => f.destroyedRoyalFamilyTomb,
  (f, v) => f.destroyedRoyalFamilyTomb = v,
);

testFlag(
  "spokeToMidoAfterDekuTreeDeath",
  1,
  12,
  (f) => f.spokeToMidoAfterDekuTreeDeath,
  (f, v) => f.spokeToMidoAfterDekuTreeDeath = v,
);

testFlag(
  "rentedHorseFromIngo",
  1,
  11,
  (f) => f.rentedHorseFromIngo,
  (f, v) => f.rentedHorseFromIngo = v,
);

testFlag(
  "obtainedKokiriEmerald",
  1,
  9,
  (f) => f.obtainedKokiriEmerald,
  (f, v) => f.obtainedKokiriEmerald = v,
);

testFlag(
  "obtainedEpona",
  1,
  8,
  (f) => f.obtainedEpona,
  (f, v) => f.obtainedEpona = v,
);

testFlag(
  "dekuTreeIsDead",
  1,
  7,
  (f) => f.dekuTreeIsDead,
  (f, v) => f.dekuTreeIsDead = v,
);

testFlag(
  "invitedToSingWithChildMalon",
  1,
  6,
  (f) => f.invitedToSingWithChildMalon,
  (f, v) => f.invitedToSingWithChildMalon = v,
);

testFlag(
  "spokeToChildMalonAtRanch",
  1,
  5,
  (f) => f.spokeToChildMalonAtRanch,
  (f, v) => f.spokeToChildMalonAtRanch = v,
);

testFlag(
  "talonFledHyruleCastle",
  1,
  4,
  (f) => f.talonFledHyruleCastle,
  (f, v) => f.talonFledHyruleCastle = v,
);

testFlag("wokeTalon", 1, 3, (f) => f.wokeTalon, (f, v) => f.wokeTalon = v);

testFlag(
  "obtainedPocketEgg",
  1,
  2,
  (f) => f.obtainedPocketEgg,
  (f, v) => f.obtainedPocketEgg = v,
);

testFlag(
  "spokeToIngoAtRanchBeforeTalonReturns",
  1,
  1,
  (f) => f.spokeToIngoAtRanchBeforeTalonReturns,
  (f, v) => f.spokeToIngoAtRanchBeforeTalonReturns = v,
);

testFlag(
  "spokeToChildMalonAtCastleOrMarket",
  1,
  0,
  (f) => f.spokeToChildMalonAtCastleOrMarket,
  (f, v) => f.spokeToChildMalonAtCastleOrMarket = v,
);

// ============================================================
// Word 2 (0x2): event_chk_inf[2] — corrected bits
// ============================================================

testFlag(
  "deathMountainErupted",
  2,
  15,
  (f) => f.deathMountainErupted,
  (f, v) => f.deathMountainErupted = v,
);

testFlag(
  "completedDodongosCavern",
  2,
  5,
  (f) => f.completedDodongosCavern,
  (f, v) => f.completedDodongosCavern = v,
);

testFlag(
  "bombedDodongosCavernEntrance",
  2,
  3,
  (f) => f.bombedDodongosCavernEntrance,
  (f, v) => f.bombedDodongosCavernEntrance = v,
);

// ============================================================
// Word 3 (0x3): event_chk_inf[3] — corrected bits
// ============================================================

testFlag(
  "finishedNabooruBattle",
  3,
  12,
  (f) => f.finishedNabooruBattle,
  (f, v) => f.finishedNabooruBattle = v,
);

testFlag(
  "beganNabooruBattle",
  3,
  11,
  (f) => f.beganNabooruBattle,
  (f, v) => f.beganNabooruBattle = v,
);

testFlag(
  "offeredFishToJabuJabu",
  3,
  10,
  (f) => f.offeredFishToJabuJabu,
  (f, v) => f.offeredFishToJabuJabu = v,
);

testFlag(
  "openedEntranceToZorasDomain",
  3,
  9,
  (f) => f.openedEntranceToZorasDomain,
  (f, v) => f.openedEntranceToZorasDomain = v,
);

testFlag(
  "obtainedSilverScale",
  3,
  8,
  (f) => f.obtainedSilverScale,
  (f, v) => f.obtainedSilverScale = v,
);

testFlag(
  "obtainedZorasSapphire",
  3,
  7,
  (f) => f.obtainedZorasSapphire,
  (f, v) => f.obtainedZorasSapphire = v,
);

testFlag(
  "kingZoraMovedAside",
  3,
  3,
  (f) => f.kingZoraMovedAside,
  (f, v) => f.kingZoraMovedAside = v,
);

testFlag(
  "obtainedRutosLetter",
  3,
  1,
  (f) => f.obtainedRutosLetter,
  (f, v) => f.obtainedRutosLetter = v,
);

testFlag(
  "spokeToAZora",
  3,
  0,
  (f) => f.spokeToAZora,
  (f, v) => f.spokeToAZora = v,
);

// ============================================================
// Word 4 (0x4): event_chk_inf[4]
// ============================================================

testFlag(
  "enteredMasterSwordChamber",
  4,
  15,
  (f) => f.enteredMasterSwordChamber,
  (f, v) => f.enteredMasterSwordChamber = v,
);

testFlag(
  "caughtByHyruleCastleGuards",
  4,
  14,
  (f) => f.caughtByHyruleCastleGuards,
  (f, v) => f.caughtByHyruleCastleGuards = v,
);

testFlag(
  "rainbowBridgeBuiltBySages",
  4,
  13,
  (f) => f.rainbowBridgeBuiltBySages,
  (f, v) => f.rainbowBridgeBuiltBySages = v,
);

testFlag(
  "openedDoorOfTime",
  4,
  11,
  (f) => f.openedDoorOfTime,
  (f, v) => f.openedDoorOfTime = v,
);

testFlag(
  "obtainedWaterMedallion",
  4,
  10,
  (f) => f.obtainedWaterMedallion,
  (f, v) => f.obtainedWaterMedallion = v,
);

testFlag(
  "obtainedFireMedallion",
  4,
  9,
  (f) => f.obtainedFireMedallion,
  (f, v) => f.obtainedFireMedallion = v,
);

testFlag(
  "obtainedForestMedallion",
  4,
  8,
  (f) => f.obtainedForestMedallion,
  (f, v) => f.obtainedForestMedallion = v,
);

testFlag(
  "pulledMasterSwordFromPedestal",
  4,
  5,
  (f) => f.pulledMasterSwordFromPedestal,
  (f, v) => f.pulledMasterSwordFromPedestal = v,
);

testFlag(
  "obtainedOcarinaOfTime",
  4,
  3,
  (f) => f.obtainedOcarinaOfTime,
  (f, v) => f.obtainedOcarinaOfTime = v,
);

testFlag(
  "obtainedZeldasLetter",
  4,
  0,
  (f) => f.obtainedZeldasLetter,
  (f, v) => f.obtainedZeldasLetter = v,
);

// ============================================================
// Word 5 (0x5): event_chk_inf[5] — corrected bits
// ============================================================

testFlag(
  "learnedSongOfStorms",
  5,
  11,
  (f) => f.learnedSongOfStorms,
  (f, v) => f.learnedSongOfStorms = v,
);

testFlag(
  "learnedSunsSong",
  5,
  10,
  (f) => f.learnedSunsSong,
  (f, v) => f.learnedSunsSong = v,
);

testFlag(
  "learnedZeldasLullaby",
  5,
  9,
  (f) => f.learnedZeldasLullaby,
  (f, v) => f.learnedZeldasLullaby = v,
);

testFlag(
  "sheikMovedFromSwordPedestal",
  5,
  5,
  (f) => f.sheikMovedFromSwordPedestal,
  (f, v) => f.sheikMovedFromSwordPedestal = v,
);

testFlag(
  "learnedNocturneOfShadow",
  5,
  4,
  (f) => f.learnedNocturneOfShadow,
  (f, v) => f.learnedNocturneOfShadow = v,
);

testFlag(
  "learnedSerenadeOfWater",
  5,
  2,
  (f) => f.learnedSerenadeOfWater,
  (f, v) => f.learnedSerenadeOfWater = v,
);

testFlag(
  "learnedBoleroOfFire",
  5,
  1,
  (f) => f.learnedBoleroOfFire,
  (f, v) => f.learnedBoleroOfFire = v,
);

testFlag(
  "learnedMinuetOfForest",
  5,
  0,
  (f) => f.learnedMinuetOfForest,
  (f, v) => f.learnedMinuetOfForest = v,
);

// ============================================================
// Word 6 (0x6): event_chk_inf[6]
// ============================================================

testFlag(
  "spokeToKaeporaGaeboraByLostWoods",
  6,
  15,
  (f) => f.spokeToKaeporaGaeboraByLostWoods,
  (f, v) => f.spokeToKaeporaGaeboraByLostWoods = v,
);

testFlag(
  "spokeToTalonAfterSavingRanch",
  6,
  11,
  (f) => f.spokeToTalonAfterSavingRanch,
  (f, v) => f.spokeToTalonAfterSavingRanch = v,
);

testFlag(
  "wokeTalonInKakariko",
  6,
  10,
  (f) => f.wokeTalonInKakariko,
  (f, v) => f.wokeTalonInKakariko = v,
);

testFlag(
  "restoredLakeHyliaWater",
  6,
  9,
  (f) => f.restoredLakeHyliaWater,
  (f, v) => f.restoredLakeHyliaWater = v,
);

testFlag(
  "playedGerudoArcheryMinigame",
  6,
  8,
  (f) => f.playedGerudoArcheryMinigame,
  (f, v) => f.playedGerudoArcheryMinigame = v,
);

testFlag(
  "drainedWellInKakariko",
  6,
  7,
  (f) => f.drainedWellInKakariko,
  (f, v) => f.drainedWellInKakariko = v,
);

testFlag(
  "playedSongOfStormsInWindmill",
  6,
  5,
  (f) => f.playedSongOfStormsInWindmill,
  (f, v) => f.playedSongOfStormsInWindmill = v,
);

// ============================================================
// Word 7 (0x7): event_chk_inf[7] — corrected bits, new flag
// ============================================================

testFlag(
  "beganGanondorfBattle",
  7,
  8,
  (f) => f.beganGanondorfBattle,
  (f, v) => f.beganGanondorfBattle = v,
);

testFlag(
  "beganBongoBongoBattle",
  7,
  7,
  (f) => f.beganBongoBongoBattle,
  (f, v) => f.beganBongoBongoBattle = v,
);

testFlag(
  "beganBarinadeBattle",
  7,
  6,
  (f) => f.beganBarinadeBattle,
  (f, v) => f.beganBarinadeBattle = v,
);

testFlag(
  "beganTwinrovaBattle",
  7,
  5,
  (f) => f.beganTwinrovaBattle,
  (f, v) => f.beganTwinrovaBattle = v,
);

testFlag(
  "beganMorphaBattle",
  7,
  4,
  (f) => f.beganMorphaBattle,
  (f, v) => f.beganMorphaBattle = v,
);

testFlag(
  "beganVolvagiaBattle",
  7,
  3,
  (f) => f.beganVolvagiaBattle,
  (f, v) => f.beganVolvagiaBattle = v,
);

testFlag(
  "beganPhantomGanonBattle",
  7,
  2,
  (f) => f.beganPhantomGanonBattle,
  (f, v) => f.beganPhantomGanonBattle = v,
);

testFlag(
  "beganKingDodongoBattle",
  7,
  1,
  (f) => f.beganKingDodongoBattle,
  (f, v) => f.beganKingDodongoBattle = v,
);

testFlag(
  "beganGhmaBattle",
  7,
  0,
  (f) => f.beganGhmaBattle,
  (f, v) => f.beganGhmaBattle = v,
);

// ============================================================
// Word 8 (0x8): event_chk_inf[8] — corrected bits
// ============================================================

testFlag(
  "paidBackBunnyHoodFee",
  8,
  15,
  (f) => f.paidBackBunnyHoodFee,
  (f, v) => f.paidBackBunnyHoodFee = v,
);

testFlag(
  "paidBackSpookyMaskFee",
  8,
  14,
  (f) => f.paidBackSpookyMaskFee,
  (f, v) => f.paidBackSpookyMaskFee = v,
);

testFlag(
  "paidBackSkullMaskFee",
  8,
  13,
  (f) => f.paidBackSkullMaskFee,
  (f, v) => f.paidBackSkullMaskFee = v,
);

testFlag(
  "paidBackKeatonMaskFee",
  8,
  12,
  (f) => f.paidBackKeatonMaskFee,
  (f, v) => f.paidBackKeatonMaskFee = v,
);

testFlag(
  "bridgeUnlockedAfterZeldaEscape",
  8,
  2,
  (f) => f.bridgeUnlockedAfterZeldaEscape,
  (f, v) => f.bridgeUnlockedAfterZeldaEscape = v,
);

testFlag(
  "zeldaFledHyruleCastle",
  8,
  0,
  (f) => f.zeldaFledHyruleCastle,
  (f, v) => f.zeldaFledHyruleCastle = v,
);

// ============================================================
// Word 9 (0x9): event_chk_inf[9] — corrected bit
// ============================================================

testFlag(
  "playedSongForScarecrowAsAdult",
  9,
  12,
  (f) => f.playedSongForScarecrowAsAdult,
  (f, v) => f.playedSongForScarecrowAsAdult = v,
);

testFlag(
  "spokeToCursedManInSkulltulaHouse",
  9,
  6,
  (f) => f.spokeToCursedManInSkulltulaHouse,
  (f, v) => f.spokeToCursedManInSkulltulaHouse = v,
);

testFlag(
  "nabooruCapturedByTwinrova",
  9,
  5,
  (f) => f.nabooruCapturedByTwinrova,
  (f, v) => f.nabooruCapturedByTwinrova = v,
);

testFlag(
  "spokeToNabooruInSpiritTemple",
  9,
  4,
  (f) => f.spokeToNabooruInSpiritTemple,
  (f, v) => f.spokeToNabooruInSpiritTemple = v,
);

testFlag(
  "rescuedGreenCarpenter",
  9,
  3,
  (f) => f.rescuedGreenCarpenter,
  (f, v) => f.rescuedGreenCarpenter = v,
);

testFlag(
  "rescuedBlueCarpenter",
  9,
  2,
  (f) => f.rescuedBlueCarpenter,
  (f, v) => f.rescuedBlueCarpenter = v,
);

testFlag(
  "rescuedYellowCarpenter",
  9,
  1,
  (f) => f.rescuedYellowCarpenter,
  (f, v) => f.rescuedYellowCarpenter = v,
);

testFlag(
  "rescuedRedCarpenter",
  9,
  0,
  (f) => f.rescuedRedCarpenter,
  (f, v) => f.rescuedRedCarpenter = v,
);

// ============================================================
// Word 10 (0xA): event_chk_inf[10] — corrected bits, new flag
// ============================================================

testFlag(
  "completedSpiritTrial",
  10,
  13,
  (f) => f.completedSpiritTrial,
  (f, v) => f.completedSpiritTrial = v,
);

testFlag(
  "learnedRequiemOfSpirit",
  10,
  12,
  (f) => f.learnedRequiemOfSpirit,
  (f, v) => f.learnedRequiemOfSpirit = v,
);

testFlag(
  "bongoBongoEscapedWell",
  10,
  10,
  (f) => f.bongoBongoEscapedWell,
  (f, v) => f.bongoBongoEscapedWell = v,
);

testFlag(
  "learnedSongOfTime",
  10,
  9,
  (f) => f.learnedSongOfTime,
  (f, v) => f.learnedSongOfTime = v,
);

testFlag(
  "enteredDekuTree",
  10,
  8,
  (f) => f.enteredDekuTree,
  (f, v) => f.enteredDekuTree = v,
);

testFlag(
  "enteredTempleOfTime",
  10,
  7,
  (f) => f.enteredTempleOfTime,
  (f, v) => f.enteredTempleOfTime = v,
);

testFlag(
  "enteredGoronCity",
  10,
  6,
  (f) => f.enteredGoronCity,
  (f, v) => f.enteredGoronCity = v,
);

testFlag(
  "enteredHyruleCastle",
  10,
  5,
  (f) => f.enteredHyruleCastle,
  (f, v) => f.enteredHyruleCastle = v,
);

testFlag(
  "enteredZorasDomain",
  10,
  4,
  (f) => f.enteredZorasDomain,
  (f, v) => f.enteredZorasDomain = v,
);

testFlag(
  "enteredKakarikoVillage",
  10,
  3,
  (f) => f.enteredKakarikoVillage,
  (f, v) => f.enteredKakarikoVillage = v,
);

testFlag(
  "enteredDeathMountainTrail",
  10,
  1,
  (f) => f.enteredDeathMountainTrail,
  (f, v) => f.enteredDeathMountainTrail = v,
);

testFlag(
  "enteredHyruleField",
  10,
  0,
  (f) => f.enteredHyruleField,
  (f, v) => f.enteredHyruleField = v,
);

// ============================================================
// Word 11 (0xB): event_chk_inf[11]
// ============================================================

testFlag(
  "completedLightTrial",
  11,
  15,
  (f) => f.completedLightTrial,
  (f, v) => f.completedLightTrial = v,
);

testFlag(
  "completedFireTrial",
  11,
  14,
  (f) => f.completedFireTrial,
  (f, v) => f.completedFireTrial = v,
);

testFlag(
  "completedShadowTrial",
  11,
  13,
  (f) => f.completedShadowTrial,
  (f, v) => f.completedShadowTrial = v,
);

testFlag(
  "completedWaterTrial",
  11,
  12,
  (f) => f.completedWaterTrial,
  (f, v) => f.completedWaterTrial = v,
);

testFlag(
  "completedForestTrial",
  11,
  11,
  (f) => f.completedForestTrial,
  (f, v) => f.completedForestTrial = v,
);

testFlag(
  "enteredGanonsCastleExterior",
  11,
  10,
  (f) => f.enteredGanonsCastleExterior,
  (f, v) => f.enteredGanonsCastleExterior = v,
);

testFlag(
  "enteredDeathMountainCrater",
  11,
  9,
  (f) => f.enteredDeathMountainCrater,
  (f, v) => f.enteredDeathMountainCrater = v,
);

testFlag(
  "enteredDesertColossus",
  11,
  8,
  (f) => f.enteredDesertColossus,
  (f, v) => f.enteredDesertColossus = v,
);

testFlag(
  "enteredZorasFountain",
  11,
  7,
  (f) => f.enteredZorasFountain,
  (f, v) => f.enteredZorasFountain = v,
);

testFlag(
  "enteredGraveyard",
  11,
  6,
  (f) => f.enteredGraveyard,
  (f, v) => f.enteredGraveyard = v,
);

testFlag(
  "enteredJabuJabusBelly",
  11,
  5,
  (f) => f.enteredJabuJabusBelly,
  (f, v) => f.enteredJabuJabusBelly = v,
);

testFlag(
  "enteredLonLonRanch",
  11,
  4,
  (f) => f.enteredLonLonRanch,
  (f, v) => f.enteredLonLonRanch = v,
);

testFlag(
  "enteredGerudoFortress",
  11,
  3,
  (f) => f.enteredGerudoFortress,
  (f, v) => f.enteredGerudoFortress = v,
);

testFlag(
  "enteredGerudoValley",
  11,
  2,
  (f) => f.enteredGerudoValley,
  (f, v) => f.enteredGerudoValley = v,
);

testFlag(
  "enteredLakeHylia",
  11,
  1,
  (f) => f.enteredLakeHylia,
  (f, v) => f.enteredLakeHylia = v,
);

testFlag(
  "enteredDodongosCavern",
  11,
  0,
  (f) => f.enteredDodongosCavern,
  (f, v) => f.enteredDodongosCavern = v,
);

// ============================================================
// Word 12 (0xC): event_chk_inf[12] — corrected bits, new flags
// ============================================================

testFlag(
  "demoEffectTempleOfTimeWarp",
  12,
  9,
  (f) => f.demoEffectTempleOfTimeWarp,
  (f, v) => f.demoEffectTempleOfTimeWarp = v,
);

testFlag(
  "obtainedSpiritMedallion",
  12,
  8,
  (f) => f.obtainedSpiritMedallion,
  (f, v) => f.obtainedSpiritMedallion = v,
);

testFlag(
  "watchedGanonsTowerCollapseOrCaughtByGerudo",
  12,
  7,
  (f) => f.watchedGanonsTowerCollapseOrCaughtByGerudo,
  (f, v) => f.watchedGanonsTowerCollapseOrCaughtByGerudo = v,
);

testFlag(
  "spokeToDekuTreeSprout",
  12,
  6,
  (f) => f.spokeToDekuTreeSprout,
  (f, v) => f.spokeToDekuTreeSprout = v,
);

testFlag(
  "sheikSpawnedAtMasterSwordPedestalAsAdult",
  12,
  5,
  (f) => f.sheikSpawnedAtMasterSwordPedestalAsAdult,
  (f, v) => f.sheikSpawnedAtMasterSwordPedestalAsAdult = v,
);

testFlag(
  "returnedToTempleOfTimeWithAllMedallions",
  12,
  4,
  (f) => f.returnedToTempleOfTimeWithAllMedallions,
  (f, v) => f.returnedToTempleOfTimeWithAllMedallions = v,
);

testFlag(
  "dispelledGanonsTowerBarrier",
  12,
  3,
  (f) => f.dispelledGanonsTowerBarrier,
  (f, v) => f.dispelledGanonsTowerBarrier = v,
);

testFlag(
  "spokeToSariaOnLostWoodsBridge",
  12,
  1,
  (f) => f.spokeToSariaOnLostWoodsBridge,
  (f, v) => f.spokeToSariaOnLostWoodsBridge = v,
);

testFlag(
  "nabooruOrderedToFightByTwinrova",
  12,
  0,
  (f) => f.nabooruOrderedToFightByTwinrova,
  (f, v) => f.nabooruOrderedToFightByTwinrova = v,
);

// ============================================================
// Word 13 (0xD): event_chk_inf[13] — corrected bits
// ============================================================

testFlag(
  "obtainedSkulltulaHousePieceOfHeart",
  13,
  14,
  (f) => f.obtainedSkulltulaHousePieceOfHeart,
  (f, v) => f.obtainedSkulltulaHousePieceOfHeart = v,
);

testFlag(
  "obtainedSkulltulaHouseBombchu",
  13,
  13,
  (f) => f.obtainedSkulltulaHouseBombchu,
  (f, v) => f.obtainedSkulltulaHouseBombchu = v,
);

testFlag(
  "obtainedGiantsWallet",
  13,
  12,
  (f) => f.obtainedGiantsWallet,
  (f, v) => f.obtainedGiantsWallet = v,
);

testFlag(
  "obtainedStoneOfAgony",
  13,
  11,
  (f) => f.obtainedStoneOfAgony,
  (f, v) => f.obtainedStoneOfAgony = v,
);

testFlag(
  "obtainedAdultsWallet",
  13,
  10,
  (f) => f.obtainedAdultsWallet,
  (f, v) => f.obtainedAdultsWallet = v,
);

testFlag(
  "playedSongOfStormsForFrogs",
  13,
  6,
  (f) => f.playedSongOfStormsForFrogs,
  (f, v) => f.playedSongOfStormsForFrogs = v,
);

testFlag(
  "playedSongOfTimeForFrogs",
  13,
  5,
  (f) => f.playedSongOfTimeForFrogs,
  (f, v) => f.playedSongOfTimeForFrogs = v,
);

testFlag(
  "playedSariasSongForFrogs",
  13,
  4,
  (f) => f.playedSariasSongForFrogs,
  (f, v) => f.playedSariasSongForFrogs = v,
);

testFlag(
  "playedSunsSongForFrogs",
  13,
  3,
  (f) => f.playedSunsSongForFrogs,
  (f, v) => f.playedSunsSongForFrogs = v,
);

testFlag(
  "playedEponasSongForFrogs",
  13,
  2,
  (f) => f.playedEponasSongForFrogs,
  (f, v) => f.playedEponasSongForFrogs = v,
);

testFlag(
  "playedZeldasLullabyForFrogs",
  13,
  1,
  (f) => f.playedZeldasLullabyForFrogs,
  (f, v) => f.playedZeldasLullabyForFrogs = v,
);

testFlag(
  "obtainedFrogsPieceOfHeart",
  13,
  0,
  (f) => f.obtainedFrogsPieceOfHeart,
  (f, v) => f.obtainedFrogsPieceOfHeart = v,
);

// ============================================================
// Bit isolation: setting one flag must not affect others in the same word
// ============================================================

Deno.test("Word 7: boss battle flags are isolated from each other", () => {
  const flags = new EventFlags();
  flags.beganGanondorfBattle = true;
  assertEquals(flags.beganBongoBongoBattle, false);
  assertEquals(flags.beganBarinadeBattle, false);
  assertEquals(flags.beganTwinrovaBattle, false);
  assertEquals(flags.beganMorphaBattle, false);
  assertEquals(flags.beganVolvagiaBattle, false);
  assertEquals(flags.beganPhantomGanonBattle, false);
  assertEquals(flags.beganKingDodongoBattle, false);
  assertEquals(flags.beganGhmaBattle, false);
});

Deno.test("Word 5: song flags are isolated from each other", () => {
  const flags = new EventFlags();
  flags.learnedMinuetOfForest = true;
  assertEquals(flags.learnedBoleroOfFire, false);
  assertEquals(flags.learnedSerenadeOfWater, false);
  assertEquals(flags.learnedNocturneOfShadow, false);
  assertEquals(flags.learnedSongOfStorms, false);
  assertEquals(flags.learnedSunsSong, false);
  assertEquals(flags.learnedZeldasLullaby, false);
  assertEquals(flags.sheikMovedFromSwordPedestal, false);
});

Deno.test("Word 10: area entry flags are isolated from each other", () => {
  const flags = new EventFlags();
  flags.enteredHyruleField = true;
  assertEquals(flags.enteredDeathMountainTrail, false);
  assertEquals(flags.enteredKakarikoVillage, false);
  assertEquals(flags.enteredZorasDomain, false);
  assertEquals(flags.enteredHyruleCastle, false);
  assertEquals(flags.enteredGoronCity, false);
  assertEquals(flags.enteredTempleOfTime, false);
  assertEquals(flags.enteredDekuTree, false);
  assertEquals(flags.learnedSongOfTime, false);
  assertEquals(flags.bongoBongoEscapedWell, false);
  assertEquals(flags.learnedRequiemOfSpirit, false);
  assertEquals(flags.completedSpiritTrial, false);
});

Deno.test("Word 13: skulltula house rewards are isolated from frog flags", () => {
  const flags = new EventFlags();
  flags.obtainedSkulltulaHousePieceOfHeart = true;
  flags.obtainedAdultsWallet = true;
  assertEquals(flags.obtainedSkulltulaHouseBombchu, false);
  assertEquals(flags.obtainedGiantsWallet, false);
  assertEquals(flags.obtainedStoneOfAgony, false);
  assertEquals(flags.playedSongOfStormsForFrogs, false);
  assertEquals(flags.obtainedFrogsPieceOfHeart, false);
});

// ============================================================
// Cross-word isolation: flags in different words don't interfere
// ============================================================

Deno.test("flags in different words do not interfere", () => {
  const flags = new EventFlags();
  flags.metDekuTree = true; // word 0
  flags.obtainedEpona = true; // word 1
  flags.deathMountainErupted = true; // word 2
  flags.beganGanondorfBattle = true; // word 7
  flags.enteredHyruleField = true; // word 10

  assertEquals(flags.metDekuTree, true);
  assertEquals(flags.obtainedEpona, true);
  assertEquals(flags.deathMountainErupted, true);
  assertEquals(flags.beganGanondorfBattle, true);
  assertEquals(flags.enteredHyruleField, true);

  // unrelated flags should be false
  assertEquals(flags.firstSpokeToMido, false);
  assertEquals(flags.completedDodongosCavern, false);
  assertEquals(flags.obtainedFrogsPieceOfHeart, false);
});

// ============================================================
// Uint16Array roundtrip
// ============================================================

Deno.test("Uint16Array constructor roundtrip preserves all bits", () => {
  const flags = new EventFlags();
  // Set a flag in every word
  flags.metDekuTree = true; // word 0, bit 12
  flags.wonCowInMalonRace = true; // word 1, bit 14
  flags.completedDodongosCavern = true; // word 2, bit 5
  flags.kingZoraMovedAside = true; // word 3, bit 3
  flags.obtainedZeldasLetter = true; // word 4, bit 0
  flags.learnedMinuetOfForest = true; // word 5, bit 0
  flags.drainedWellInKakariko = true; // word 6, bit 7
  flags.beganGhmaBattle = true; // word 7, bit 0
  flags.zeldaFledHyruleCastle = true; // word 8, bit 0
  flags.rescuedRedCarpenter = true; // word 9, bit 0
  flags.enteredHyruleField = true; // word 10, bit 0
  flags.enteredDodongosCavern = true; // word 11, bit 0
  flags.nabooruOrderedToFightByTwinrova = true; // word 12, bit 0
  flags.obtainedFrogsPieceOfHeart = true; // word 13, bit 0

  // Roundtrip through data (Uint8Array) and back
  const bytes = flags.data;
  const roundtrip = new EventFlags(bytes);

  assertEquals(roundtrip.metDekuTree, true);
  assertEquals(roundtrip.wonCowInMalonRace, true);
  assertEquals(roundtrip.completedDodongosCavern, true);
  assertEquals(roundtrip.kingZoraMovedAside, true);
  assertEquals(roundtrip.obtainedZeldasLetter, true);
  assertEquals(roundtrip.learnedMinuetOfForest, true);
  assertEquals(roundtrip.drainedWellInKakariko, true);
  assertEquals(roundtrip.beganGhmaBattle, true);
  assertEquals(roundtrip.zeldaFledHyruleCastle, true);
  assertEquals(roundtrip.rescuedRedCarpenter, true);
  assertEquals(roundtrip.enteredHyruleField, true);
  assertEquals(roundtrip.enteredDodongosCavern, true);
  assertEquals(roundtrip.nabooruOrderedToFightByTwinrova, true);
  assertEquals(roundtrip.obtainedFrogsPieceOfHeart, true);
});

Deno.test("data getter serializes words as big-endian bytes", () => {
  const words = new Uint16Array(14);
  words[0] = 0x1234;
  words[1] = 0xABCD;
  const flags = new EventFlags(words);
  const bytes = flags.data;

  assertEquals(bytes[0], 0x12);
  assertEquals(bytes[1], 0x34);
  assertEquals(bytes[2], 0xAB);
  assertEquals(bytes[3], 0xCD);
});

Deno.test("Uint8Array constructor reads words as big-endian bytes", () => {
  const bytes = new Uint8Array(28);
  bytes[0] = 0x12;
  bytes[1] = 0x34;
  bytes[2] = 0xAB;
  bytes[3] = 0xCD;

  const flags = new EventFlags(bytes);
  const roundtrip = flags.data;

  assertEquals(roundtrip[0], 0x12);
  assertEquals(roundtrip[1], 0x34);
  assertEquals(roundtrip[2], 0xAB);
  assertEquals(roundtrip[3], 0xCD);
});

// ============================================================
// Static readonly coordinates match getter/setter behavior
// ============================================================

Deno.test("static readonly coordinates are consistent with getters", () => {
  // Spot-check a few flags from corrected words
  const check = (
    coord: { word: number; bit: number },
    getter: (f: EventFlags) => boolean,
  ) => {
    const flags = makeFlagsWithBits(coord.word, [coord.bit]);
    assertEquals(getter(flags), true, `word ${coord.word}, bit ${coord.bit}`);
  };

  check(EventFlags.completedDodongosCavern, (f) => f.completedDodongosCavern);
  check(
    EventFlags.bombedDodongosCavernEntrance,
    (f) => f.bombedDodongosCavernEntrance,
  );
  check(EventFlags.kingZoraMovedAside, (f) => f.kingZoraMovedAside);
  check(EventFlags.obtainedRutosLetter, (f) => f.obtainedRutosLetter);
  check(EventFlags.spokeToAZora, (f) => f.spokeToAZora);
  check(
    EventFlags.sheikMovedFromSwordPedestal,
    (f) => f.sheikMovedFromSwordPedestal,
  );
  check(EventFlags.learnedNocturneOfShadow, (f) => f.learnedNocturneOfShadow);
  check(EventFlags.learnedSerenadeOfWater, (f) => f.learnedSerenadeOfWater);
  check(EventFlags.learnedBoleroOfFire, (f) => f.learnedBoleroOfFire);
  check(EventFlags.learnedMinuetOfForest, (f) => f.learnedMinuetOfForest);
  check(EventFlags.beganGanondorfBattle, (f) => f.beganGanondorfBattle);
  check(EventFlags.beganGhmaBattle, (f) => f.beganGhmaBattle);
  check(
    EventFlags.bridgeUnlockedAfterZeldaEscape,
    (f) => f.bridgeUnlockedAfterZeldaEscape,
  );
  check(EventFlags.zeldaFledHyruleCastle, (f) => f.zeldaFledHyruleCastle);
  check(
    EventFlags.playedSongForScarecrowAsAdult,
    (f) => f.playedSongForScarecrowAsAdult,
  );
  check(EventFlags.enteredHyruleField, (f) => f.enteredHyruleField);
  check(
    EventFlags.spokeToSariaOnLostWoodsBridge,
    (f) => f.spokeToSariaOnLostWoodsBridge,
  );
  check(
    EventFlags.nabooruOrderedToFightByTwinrova,
    (f) => f.nabooruOrderedToFightByTwinrova,
  );
  check(
    EventFlags.obtainedSkulltulaHousePieceOfHeart,
    (f) => f.obtainedSkulltulaHousePieceOfHeart,
  );
  check(EventFlags.obtainedAdultsWallet, (f) => f.obtainedAdultsWallet);
});

// ============================================================
// Default constructor: all flags false
// ============================================================

Deno.test("default constructor initializes all flags to false", () => {
  const flags = new EventFlags();
  // Spot-check across all words
  assertEquals(flags.metDekuTree, false);
  assertEquals(flags.wonCowInMalonRace, false);
  assertEquals(flags.deathMountainErupted, false);
  assertEquals(flags.finishedNabooruBattle, false);
  assertEquals(flags.enteredMasterSwordChamber, false);
  assertEquals(flags.learnedSongOfStorms, false);
  assertEquals(flags.spokeToKaeporaGaeboraByLostWoods, false);
  assertEquals(flags.beganGanondorfBattle, false);
  assertEquals(flags.paidBackBunnyHoodFee, false);
  assertEquals(flags.playedSongForScarecrowAsAdult, false);
  assertEquals(flags.completedSpiritTrial, false);
  assertEquals(flags.completedLightTrial, false);
  assertEquals(flags.demoEffectTempleOfTimeWarp, false);
  assertEquals(flags.obtainedSkulltulaHousePieceOfHeart, false);
});
