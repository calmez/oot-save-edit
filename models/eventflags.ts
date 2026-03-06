import { Flags } from "./flags.ts";

export class EventFlags extends Flags<Uint16Array> {
  static readonly metDekuTree = { byte: 0, bit: 12 };
  static readonly playedSariasSongForMidoAsAdult = { byte: 0, bit: 10 };
  static readonly usedBlueWarpInGohmasLair = { byte: 0, bit: 9 };
  static readonly obtainedKokiriEmeraldAndDekuTreeDead = { byte: 0, bit: 7 };
  static readonly spokeToSariaAfterDekuTreeDeath = { byte: 0, bit: 6 };
  static readonly dekuTreeOpenedMouth = { byte: 0, bit: 5 };
  static readonly showedMidoSwordAndShield = { byte: 0, bit: 4 };
  static readonly complainedAboutMidoToSaria = { byte: 0, bit: 3 };
  static readonly firstSpokeToMido = { byte: 0, bit: 2 };

  static readonly wonCowInMalonRace = { byte: 1, bit: 14 };
  static readonly destroyedRoyalFamilyTomb = { byte: 1, bit: 13 };
  static readonly spokeToMidoAfterDekuTreeDeath = { byte: 1, bit: 12 };
  static readonly rentedHorseFromIngo = { byte: 1, bit: 11 };
  static readonly obtainedKokiriEmerald = { byte: 1, bit: 9 };
  static readonly obtainedEpona = { byte: 1, bit: 8 };
  static readonly dekuTreeIsDead = { byte: 1, bit: 7 };
  static readonly invitedToSingWithChildMalon = { byte: 1, bit: 6 };
  static readonly spokeToChildMalonAtRanch = { byte: 1, bit: 5 };
  static readonly talonFledHyruleCastle = { byte: 1, bit: 4 };
  static readonly wokeTalon = { byte: 1, bit: 3 };
  static readonly obtainedPocketEgg = { byte: 1, bit: 2 };
  static readonly spokeToIngoAtRanchBeforeTalonReturns = { byte: 1, bit: 1 };
  static readonly spokeToChildMalonAtCastleOrMarket = { byte: 1, bit: 0 };

  static readonly deathMountainErupted = { byte: 2, bit: 15 };
  static readonly completedDodongosCavern = { byte: 2, bit: 5 };
  static readonly bombedDodongosCavernEntrance = { byte: 2, bit: 3 };

  static readonly finishedNabooruBattle = { byte: 3, bit: 12 };
  static readonly beganNabooruBattle = { byte: 3, bit: 11 };
  static readonly offeredFishToJabuJabu = { byte: 3, bit: 10 };
  static readonly openedEntranceToZorasDomain = { byte: 3, bit: 9 };
  static readonly obtainedSilverScale = { byte: 3, bit: 8 };
  static readonly obtainedZorasSapphire = { byte: 3, bit: 7 };
  static readonly kingZoraMovedAside = { byte: 3, bit: 3 };
  static readonly obtainedRutosLetter = { byte: 3, bit: 1 };
  static readonly spokeToAZora = { byte: 3, bit: 0 };

  static readonly enteredMasterSwordChamber = { byte: 4, bit: 15 };
  static readonly caughtByHyruleCastleGuards = { byte: 4, bit: 14 };
  static readonly rainbowBridgeBuiltBySages = { byte: 4, bit: 13 };
  static readonly openedDoorOfTime = { byte: 4, bit: 11 };
  static readonly obtainedWaterMedallion = { byte: 4, bit: 10 };
  static readonly obtainedFireMedallion = { byte: 4, bit: 9 };
  static readonly obtainedForestMedallion = { byte: 4, bit: 8 };
  static readonly pulledMasterSwordFromPedestal = { byte: 4, bit: 5 };
  static readonly obtainedOcarinaOfTime = { byte: 4, bit: 3 };
  static readonly obtainedZeldasLetter = { byte: 4, bit: 0 };

  static readonly learnedSongOfStorms = { byte: 5, bit: 11 };
  static readonly learnedSunsSong = { byte: 5, bit: 10 };
  static readonly learnedZeldasLullaby = { byte: 5, bit: 9 };
  static readonly sheikMovedFromSwordPedestal = { byte: 5, bit: 5 };
  static readonly learnedNocturneOfShadow = { byte: 5, bit: 4 };
  static readonly learnedSerenadeOfWater = { byte: 5, bit: 2 };
  static readonly learnedBoleroOfFire = { byte: 5, bit: 1 };
  static readonly learnedMinuetOfForest = { byte: 5, bit: 0 };

  static readonly spokeToKaeporaGaeboraByLostWoods = { byte: 6, bit: 15 };
  static readonly spokeToTalonAfterSavingRanch = { byte: 6, bit: 11 };
  static readonly wokeTalonInKakariko = { byte: 6, bit: 10 };
  static readonly restoredLakeHyliaWater = { byte: 6, bit: 9 };
  static readonly playedGerudoArcheryMinigame = { byte: 6, bit: 8 };
  static readonly drainedWellInKakariko = { byte: 6, bit: 7 };
  static readonly playedSongOfStormsInWindmill = { byte: 6, bit: 5 };

  static readonly beganGanondorfBattle = { byte: 7, bit: 8 };
  static readonly beganBongoBongoBattle = { byte: 7, bit: 7 };
  static readonly beganBarinadeBattle = { byte: 7, bit: 6 };
  static readonly beganTwinrovaBattle = { byte: 7, bit: 5 };
  static readonly beganMorphaBattle = { byte: 7, bit: 4 };
  static readonly beganVolvagiaBattle = { byte: 7, bit: 3 };
  static readonly beganPhantomGanonBattle = { byte: 7, bit: 2 };
  static readonly beganKingDodongoBattle = { byte: 7, bit: 1 };
  static readonly beganGhmaBattle = { byte: 7, bit: 0 };

  static readonly paidBackBunnyHoodFee = { byte: 8, bit: 15 };
  static readonly paidBackSpookyMaskFee = { byte: 8, bit: 14 };
  static readonly paidBackSkullMaskFee = { byte: 8, bit: 13 };
  static readonly paidBackKeatonMaskFee = { byte: 8, bit: 12 };
  static readonly bridgeUnlockedAfterZeldaEscape = { byte: 8, bit: 2 };
  static readonly zeldaFledHyruleCastle = { byte: 8, bit: 0 };

  static readonly playedSongForScarecrowAsAdult = { byte: 9, bit: 12 };
  static readonly spokeToCursedManInSkulltulaHouse = { byte: 9, bit: 6 };
  static readonly nabooruCapturedByTwinrova = { byte: 9, bit: 5 };
  static readonly spokeToNabooruInSpiritTemple = { byte: 9, bit: 4 };
  static readonly rescuedGreenCarpenter = { byte: 9, bit: 3 };
  static readonly rescuedBlueCarpenter = { byte: 9, bit: 2 };
  static readonly rescuedYellowCarpenter = { byte: 9, bit: 1 };
  static readonly rescuedRedCarpenter = { byte: 9, bit: 0 };

  static readonly completedSpiritTrial = { byte: 10, bit: 13 };
  static readonly learnedRequiemOfSpirit = { byte: 10, bit: 12 };
  static readonly bongoBongoEscapedWell = { byte: 10, bit: 10 };
  static readonly learnedSongOfTime = { byte: 10, bit: 9 };
  static readonly enteredDekuTree = { byte: 10, bit: 8 };
  static readonly enteredTempleOfTime = { byte: 10, bit: 7 };
  static readonly enteredGoronCity = { byte: 10, bit: 6 };
  static readonly enteredHyruleCastle = { byte: 10, bit: 5 };
  static readonly enteredZorasDomain = { byte: 10, bit: 4 };
  static readonly enteredKakarikoVillage = { byte: 10, bit: 3 };
  static readonly enteredDeathMountainTrail = { byte: 10, bit: 1 };
  static readonly enteredHyruleField = { byte: 10, bit: 0 };

  static readonly completedLightTrial = { byte: 11, bit: 15 };
  static readonly completedFireTrial = { byte: 11, bit: 14 };
  static readonly completedShadowTrial = { byte: 11, bit: 13 };
  static readonly completedWaterTrial = { byte: 11, bit: 12 };
  static readonly completedForestTrial = { byte: 11, bit: 11 };
  static readonly enteredGanonsCastleExterior = { byte: 11, bit: 10 };
  static readonly enteredDeathMountainCrater = { byte: 11, bit: 9 };
  static readonly enteredDesertColossus = { byte: 11, bit: 8 };
  static readonly enteredZorasFountain = { byte: 11, bit: 7 };
  static readonly enteredGraveyard = { byte: 11, bit: 6 };
  static readonly enteredJabuJabusBelly = { byte: 11, bit: 5 };
  static readonly enteredLonLonRanch = { byte: 11, bit: 4 };
  static readonly enteredGerudoFortress = { byte: 11, bit: 3 };
  static readonly enteredGerudoValley = { byte: 11, bit: 2 };
  static readonly enteredLakeHylia = { byte: 11, bit: 1 };
  static readonly enteredDodongosCavern = { byte: 11, bit: 0 };

  static readonly demoEffectTempleOfTimeWarp = { byte: 12, bit: 9 };
  static readonly obtainedSpiritMedallion = { byte: 12, bit: 8 };
  static readonly watchedGanonsTowerCollapseOrCaughtByGerudo = {
    byte: 12,
    bit: 7,
  };
  static readonly spokeToDekuTreeSprout = { byte: 12, bit: 6 };
  static readonly sheikSpawnedAtMasterSwordPedestalAsAdult = {
    byte: 12,
    bit: 5,
  };
  static readonly returnedToTempleOfTimeWithAllMedallions = {
    byte: 12,
    bit: 4,
  };
  static readonly dispelledGanonsTowerBarrier = { byte: 12, bit: 3 };
  static readonly spokeToSariaOnLostWoodsBridge = { byte: 12, bit: 1 };
  static readonly nabooruOrderedToFightByTwinrova = { byte: 12, bit: 0 };

  static readonly obtainedSkulltulaHousePieceOfHeart = { byte: 13, bit: 14 };
  static readonly obtainedSkulltulaHouseBombchu = { byte: 13, bit: 13 };
  static readonly obtainedGiantsWallet = { byte: 13, bit: 12 };
  static readonly obtainedStoneOfAgony = { byte: 13, bit: 11 };
  static readonly obtainedAdultsWallet = { byte: 13, bit: 10 };
  static readonly playedSongOfStormsForFrogs = { byte: 13, bit: 6 };
  static readonly playedSongOfTimeForFrogs = { byte: 13, bit: 5 };
  static readonly playedSariasSongForFrogs = { byte: 13, bit: 4 };
  static readonly playedSunsSongForFrogs = { byte: 13, bit: 3 };
  static readonly playedEponasSongForFrogs = { byte: 13, bit: 2 };
  static readonly playedZeldasLullabyForFrogs = { byte: 13, bit: 1 };
  static readonly obtainedFrogsPieceOfHeart = { byte: 13, bit: 0 };

  protected override get minElements(): number {
    return 14;
  }

  protected override createArray(length: number): Uint16Array {
    return new Uint16Array(length);
  }

  get metDekuTree(): boolean {
    return this.getBit(EventFlags.metDekuTree);
  }
  set metDekuTree(v: boolean) {
    this.setBit(EventFlags.metDekuTree, v);
  }

  get playedSariasSongForMidoAsAdult(): boolean {
    return this.getBit(EventFlags.playedSariasSongForMidoAsAdult);
  }
  set playedSariasSongForMidoAsAdult(v: boolean) {
    this.setBit(EventFlags.playedSariasSongForMidoAsAdult, v);
  }

  get usedBlueWarpInGohmasLair(): boolean {
    return this.getBit(EventFlags.usedBlueWarpInGohmasLair);
  }
  set usedBlueWarpInGohmasLair(v: boolean) {
    this.setBit(EventFlags.usedBlueWarpInGohmasLair, v);
  }

  get obtainedKokiriEmeraldAndDekuTreeDead(): boolean {
    return this.getBit(EventFlags.obtainedKokiriEmeraldAndDekuTreeDead);
  }
  set obtainedKokiriEmeraldAndDekuTreeDead(v: boolean) {
    this.setBit(EventFlags.obtainedKokiriEmeraldAndDekuTreeDead, v);
  }

  get spokeToSariaAfterDekuTreeDeath(): boolean {
    return this.getBit(EventFlags.spokeToSariaAfterDekuTreeDeath);
  }
  set spokeToSariaAfterDekuTreeDeath(v: boolean) {
    this.setBit(EventFlags.spokeToSariaAfterDekuTreeDeath, v);
  }

  get dekuTreeOpenedMouth(): boolean {
    return this.getBit(EventFlags.dekuTreeOpenedMouth);
  }
  set dekuTreeOpenedMouth(v: boolean) {
    this.setBit(EventFlags.dekuTreeOpenedMouth, v);
  }

  get showedMidoSwordAndShield(): boolean {
    return this.getBit(EventFlags.showedMidoSwordAndShield);
  }
  set showedMidoSwordAndShield(v: boolean) {
    this.setBit(EventFlags.showedMidoSwordAndShield, v);
  }

  get complainedAboutMidoToSaria(): boolean {
    return this.getBit(EventFlags.complainedAboutMidoToSaria);
  }
  set complainedAboutMidoToSaria(v: boolean) {
    this.setBit(EventFlags.complainedAboutMidoToSaria, v);
  }

  get firstSpokeToMido(): boolean {
    return this.getBit(EventFlags.firstSpokeToMido);
  }
  set firstSpokeToMido(v: boolean) {
    this.setBit(EventFlags.firstSpokeToMido, v);
  }

  get wonCowInMalonRace(): boolean {
    return this.getBit(EventFlags.wonCowInMalonRace);
  }
  set wonCowInMalonRace(v: boolean) {
    this.setBit(EventFlags.wonCowInMalonRace, v);
  }

  get destroyedRoyalFamilyTomb(): boolean {
    return this.getBit(EventFlags.destroyedRoyalFamilyTomb);
  }
  set destroyedRoyalFamilyTomb(v: boolean) {
    this.setBit(EventFlags.destroyedRoyalFamilyTomb, v);
  }

  get spokeToMidoAfterDekuTreeDeath(): boolean {
    return this.getBit(EventFlags.spokeToMidoAfterDekuTreeDeath);
  }
  set spokeToMidoAfterDekuTreeDeath(v: boolean) {
    this.setBit(EventFlags.spokeToMidoAfterDekuTreeDeath, v);
  }

  get rentedHorseFromIngo(): boolean {
    return this.getBit(EventFlags.rentedHorseFromIngo);
  }
  set rentedHorseFromIngo(v: boolean) {
    this.setBit(EventFlags.rentedHorseFromIngo, v);
  }

  get obtainedKokiriEmerald(): boolean {
    return this.getBit(EventFlags.obtainedKokiriEmerald);
  }
  set obtainedKokiriEmerald(v: boolean) {
    this.setBit(EventFlags.obtainedKokiriEmerald, v);
  }

  get obtainedEpona(): boolean {
    return this.getBit(EventFlags.obtainedEpona);
  }
  set obtainedEpona(v: boolean) {
    this.setBit(EventFlags.obtainedEpona, v);
  }

  get dekuTreeIsDead(): boolean {
    return this.getBit(EventFlags.dekuTreeIsDead);
  }
  set dekuTreeIsDead(v: boolean) {
    this.setBit(EventFlags.dekuTreeIsDead, v);
  }

  get invitedToSingWithChildMalon(): boolean {
    return this.getBit(EventFlags.invitedToSingWithChildMalon);
  }
  set invitedToSingWithChildMalon(v: boolean) {
    this.setBit(EventFlags.invitedToSingWithChildMalon, v);
  }

  get spokeToChildMalonAtRanch(): boolean {
    return this.getBit(EventFlags.spokeToChildMalonAtRanch);
  }
  set spokeToChildMalonAtRanch(v: boolean) {
    this.setBit(EventFlags.spokeToChildMalonAtRanch, v);
  }

  get talonFledHyruleCastle(): boolean {
    return this.getBit(EventFlags.talonFledHyruleCastle);
  }
  set talonFledHyruleCastle(v: boolean) {
    this.setBit(EventFlags.talonFledHyruleCastle, v);
  }

  get wokeTalon(): boolean {
    return this.getBit(EventFlags.wokeTalon);
  }
  set wokeTalon(v: boolean) {
    this.setBit(EventFlags.wokeTalon, v);
  }

  get obtainedPocketEgg(): boolean {
    return this.getBit(EventFlags.obtainedPocketEgg);
  }
  set obtainedPocketEgg(v: boolean) {
    this.setBit(EventFlags.obtainedPocketEgg, v);
  }

  get spokeToIngoAtRanchBeforeTalonReturns(): boolean {
    return this.getBit(EventFlags.spokeToIngoAtRanchBeforeTalonReturns);
  }
  set spokeToIngoAtRanchBeforeTalonReturns(v: boolean) {
    this.setBit(EventFlags.spokeToIngoAtRanchBeforeTalonReturns, v);
  }

  get spokeToChildMalonAtCastleOrMarket(): boolean {
    return this.getBit(EventFlags.spokeToChildMalonAtCastleOrMarket);
  }
  set spokeToChildMalonAtCastleOrMarket(v: boolean) {
    this.setBit(EventFlags.spokeToChildMalonAtCastleOrMarket, v);
  }

  get deathMountainErupted(): boolean {
    return this.getBit(EventFlags.deathMountainErupted);
  }
  set deathMountainErupted(v: boolean) {
    this.setBit(EventFlags.deathMountainErupted, v);
  }

  get completedDodongosCavern(): boolean {
    return this.getBit(EventFlags.completedDodongosCavern);
  }
  set completedDodongosCavern(v: boolean) {
    this.setBit(EventFlags.completedDodongosCavern, v);
  }

  get bombedDodongosCavernEntrance(): boolean {
    return this.getBit(EventFlags.bombedDodongosCavernEntrance);
  }
  set bombedDodongosCavernEntrance(v: boolean) {
    this.setBit(EventFlags.bombedDodongosCavernEntrance, v);
  }

  get finishedNabooruBattle(): boolean {
    return this.getBit(EventFlags.finishedNabooruBattle);
  }
  set finishedNabooruBattle(v: boolean) {
    this.setBit(EventFlags.finishedNabooruBattle, v);
  }

  get beganNabooruBattle(): boolean {
    return this.getBit(EventFlags.beganNabooruBattle);
  }
  set beganNabooruBattle(v: boolean) {
    this.setBit(EventFlags.beganNabooruBattle, v);
  }

  get offeredFishToJabuJabu(): boolean {
    return this.getBit(EventFlags.offeredFishToJabuJabu);
  }
  set offeredFishToJabuJabu(v: boolean) {
    this.setBit(EventFlags.offeredFishToJabuJabu, v);
  }

  get openedEntranceToZorasDomain(): boolean {
    return this.getBit(EventFlags.openedEntranceToZorasDomain);
  }
  set openedEntranceToZorasDomain(v: boolean) {
    this.setBit(EventFlags.openedEntranceToZorasDomain, v);
  }

  get obtainedSilverScale(): boolean {
    return this.getBit(EventFlags.obtainedSilverScale);
  }
  set obtainedSilverScale(v: boolean) {
    this.setBit(EventFlags.obtainedSilverScale, v);
  }

  get obtainedZorasSapphire(): boolean {
    return this.getBit(EventFlags.obtainedZorasSapphire);
  }
  set obtainedZorasSapphire(v: boolean) {
    this.setBit(EventFlags.obtainedZorasSapphire, v);
  }

  get kingZoraMovedAside(): boolean {
    return this.getBit(EventFlags.kingZoraMovedAside);
  }
  set kingZoraMovedAside(v: boolean) {
    this.setBit(EventFlags.kingZoraMovedAside, v);
  }

  get obtainedRutosLetter(): boolean {
    return this.getBit(EventFlags.obtainedRutosLetter);
  }
  set obtainedRutosLetter(v: boolean) {
    this.setBit(EventFlags.obtainedRutosLetter, v);
  }

  get spokeToAZora(): boolean {
    return this.getBit(EventFlags.spokeToAZora);
  }
  set spokeToAZora(v: boolean) {
    this.setBit(EventFlags.spokeToAZora, v);
  }

  get enteredMasterSwordChamber(): boolean {
    return this.getBit(EventFlags.enteredMasterSwordChamber);
  }
  set enteredMasterSwordChamber(v: boolean) {
    this.setBit(EventFlags.enteredMasterSwordChamber, v);
  }

  get caughtByHyruleCastleGuards(): boolean {
    return this.getBit(EventFlags.caughtByHyruleCastleGuards);
  }
  set caughtByHyruleCastleGuards(v: boolean) {
    this.setBit(EventFlags.caughtByHyruleCastleGuards, v);
  }

  get rainbowBridgeBuiltBySages(): boolean {
    return this.getBit(EventFlags.rainbowBridgeBuiltBySages);
  }
  set rainbowBridgeBuiltBySages(v: boolean) {
    this.setBit(EventFlags.rainbowBridgeBuiltBySages, v);
  }

  get openedDoorOfTime(): boolean {
    return this.getBit(EventFlags.openedDoorOfTime);
  }
  set openedDoorOfTime(v: boolean) {
    this.setBit(EventFlags.openedDoorOfTime, v);
  }

  get obtainedWaterMedallion(): boolean {
    return this.getBit(EventFlags.obtainedWaterMedallion);
  }
  set obtainedWaterMedallion(v: boolean) {
    this.setBit(EventFlags.obtainedWaterMedallion, v);
  }

  get obtainedFireMedallion(): boolean {
    return this.getBit(EventFlags.obtainedFireMedallion);
  }
  set obtainedFireMedallion(v: boolean) {
    this.setBit(EventFlags.obtainedFireMedallion, v);
  }

  get obtainedForestMedallion(): boolean {
    return this.getBit(EventFlags.obtainedForestMedallion);
  }
  set obtainedForestMedallion(v: boolean) {
    this.setBit(EventFlags.obtainedForestMedallion, v);
  }

  get pulledMasterSwordFromPedestal(): boolean {
    return this.getBit(EventFlags.pulledMasterSwordFromPedestal);
  }
  set pulledMasterSwordFromPedestal(v: boolean) {
    this.setBit(EventFlags.pulledMasterSwordFromPedestal, v);
  }

  get obtainedOcarinaOfTime(): boolean {
    return this.getBit(EventFlags.obtainedOcarinaOfTime);
  }
  set obtainedOcarinaOfTime(v: boolean) {
    this.setBit(EventFlags.obtainedOcarinaOfTime, v);
  }

  get obtainedZeldasLetter(): boolean {
    return this.getBit(EventFlags.obtainedZeldasLetter);
  }
  set obtainedZeldasLetter(v: boolean) {
    this.setBit(EventFlags.obtainedZeldasLetter, v);
  }

  get learnedSongOfStorms(): boolean {
    return this.getBit(EventFlags.learnedSongOfStorms);
  }
  set learnedSongOfStorms(v: boolean) {
    this.setBit(EventFlags.learnedSongOfStorms, v);
  }

  get learnedSunsSong(): boolean {
    return this.getBit(EventFlags.learnedSunsSong);
  }
  set learnedSunsSong(v: boolean) {
    this.setBit(EventFlags.learnedSunsSong, v);
  }

  get learnedZeldasLullaby(): boolean {
    return this.getBit(EventFlags.learnedZeldasLullaby);
  }
  set learnedZeldasLullaby(v: boolean) {
    this.setBit(EventFlags.learnedZeldasLullaby, v);
  }

  get sheikMovedFromSwordPedestal(): boolean {
    return this.getBit(EventFlags.sheikMovedFromSwordPedestal);
  }
  set sheikMovedFromSwordPedestal(v: boolean) {
    this.setBit(EventFlags.sheikMovedFromSwordPedestal, v);
  }

  get learnedNocturneOfShadow(): boolean {
    return this.getBit(EventFlags.learnedNocturneOfShadow);
  }
  set learnedNocturneOfShadow(v: boolean) {
    this.setBit(EventFlags.learnedNocturneOfShadow, v);
  }

  get learnedSerenadeOfWater(): boolean {
    return this.getBit(EventFlags.learnedSerenadeOfWater);
  }
  set learnedSerenadeOfWater(v: boolean) {
    this.setBit(EventFlags.learnedSerenadeOfWater, v);
  }

  get learnedBoleroOfFire(): boolean {
    return this.getBit(EventFlags.learnedBoleroOfFire);
  }
  set learnedBoleroOfFire(v: boolean) {
    this.setBit(EventFlags.learnedBoleroOfFire, v);
  }

  get learnedMinuetOfForest(): boolean {
    return this.getBit(EventFlags.learnedMinuetOfForest);
  }
  set learnedMinuetOfForest(v: boolean) {
    this.setBit(EventFlags.learnedMinuetOfForest, v);
  }

  get spokeToKaeporaGaeboraByLostWoods(): boolean {
    return this.getBit(EventFlags.spokeToKaeporaGaeboraByLostWoods);
  }
  set spokeToKaeporaGaeboraByLostWoods(v: boolean) {
    this.setBit(EventFlags.spokeToKaeporaGaeboraByLostWoods, v);
  }

  get spokeToTalonAfterSavingRanch(): boolean {
    return this.getBit(EventFlags.spokeToTalonAfterSavingRanch);
  }
  set spokeToTalonAfterSavingRanch(v: boolean) {
    this.setBit(EventFlags.spokeToTalonAfterSavingRanch, v);
  }

  get wokeTalonInKakariko(): boolean {
    return this.getBit(EventFlags.wokeTalonInKakariko);
  }
  set wokeTalonInKakariko(v: boolean) {
    this.setBit(EventFlags.wokeTalonInKakariko, v);
  }

  get restoredLakeHyliaWater(): boolean {
    return this.getBit(EventFlags.restoredLakeHyliaWater);
  }
  set restoredLakeHyliaWater(v: boolean) {
    this.setBit(EventFlags.restoredLakeHyliaWater, v);
  }

  get playedGerudoArcheryMinigame(): boolean {
    return this.getBit(EventFlags.playedGerudoArcheryMinigame);
  }
  set playedGerudoArcheryMinigame(v: boolean) {
    this.setBit(EventFlags.playedGerudoArcheryMinigame, v);
  }

  get drainedWellInKakariko(): boolean {
    return this.getBit(EventFlags.drainedWellInKakariko);
  }
  set drainedWellInKakariko(v: boolean) {
    this.setBit(EventFlags.drainedWellInKakariko, v);
  }

  get playedSongOfStormsInWindmill(): boolean {
    return this.getBit(EventFlags.playedSongOfStormsInWindmill);
  }
  set playedSongOfStormsInWindmill(v: boolean) {
    this.setBit(EventFlags.playedSongOfStormsInWindmill, v);
  }

  get beganGanondorfBattle(): boolean {
    return this.getBit(EventFlags.beganGanondorfBattle);
  }
  set beganGanondorfBattle(v: boolean) {
    this.setBit(EventFlags.beganGanondorfBattle, v);
  }

  get beganBongoBongoBattle(): boolean {
    return this.getBit(EventFlags.beganBongoBongoBattle);
  }
  set beganBongoBongoBattle(v: boolean) {
    this.setBit(EventFlags.beganBongoBongoBattle, v);
  }

  get beganBarinadeBattle(): boolean {
    return this.getBit(EventFlags.beganBarinadeBattle);
  }
  set beganBarinadeBattle(v: boolean) {
    this.setBit(EventFlags.beganBarinadeBattle, v);
  }

  get beganTwinrovaBattle(): boolean {
    return this.getBit(EventFlags.beganTwinrovaBattle);
  }
  set beganTwinrovaBattle(v: boolean) {
    this.setBit(EventFlags.beganTwinrovaBattle, v);
  }

  get beganMorphaBattle(): boolean {
    return this.getBit(EventFlags.beganMorphaBattle);
  }
  set beganMorphaBattle(v: boolean) {
    this.setBit(EventFlags.beganMorphaBattle, v);
  }

  get beganVolvagiaBattle(): boolean {
    return this.getBit(EventFlags.beganVolvagiaBattle);
  }
  set beganVolvagiaBattle(v: boolean) {
    this.setBit(EventFlags.beganVolvagiaBattle, v);
  }

  get beganPhantomGanonBattle(): boolean {
    return this.getBit(EventFlags.beganPhantomGanonBattle);
  }
  set beganPhantomGanonBattle(v: boolean) {
    this.setBit(EventFlags.beganPhantomGanonBattle, v);
  }

  get beganKingDodongoBattle(): boolean {
    return this.getBit(EventFlags.beganKingDodongoBattle);
  }
  set beganKingDodongoBattle(v: boolean) {
    this.setBit(EventFlags.beganKingDodongoBattle, v);
  }

  get beganGhmaBattle(): boolean {
    return this.getBit(EventFlags.beganGhmaBattle);
  }
  set beganGhmaBattle(v: boolean) {
    this.setBit(EventFlags.beganGhmaBattle, v);
  }

  get paidBackBunnyHoodFee(): boolean {
    return this.getBit(EventFlags.paidBackBunnyHoodFee);
  }
  set paidBackBunnyHoodFee(v: boolean) {
    this.setBit(EventFlags.paidBackBunnyHoodFee, v);
  }

  get paidBackSpookyMaskFee(): boolean {
    return this.getBit(EventFlags.paidBackSpookyMaskFee);
  }
  set paidBackSpookyMaskFee(v: boolean) {
    this.setBit(EventFlags.paidBackSpookyMaskFee, v);
  }

  get paidBackSkullMaskFee(): boolean {
    return this.getBit(EventFlags.paidBackSkullMaskFee);
  }
  set paidBackSkullMaskFee(v: boolean) {
    this.setBit(EventFlags.paidBackSkullMaskFee, v);
  }

  get paidBackKeatonMaskFee(): boolean {
    return this.getBit(EventFlags.paidBackKeatonMaskFee);
  }
  set paidBackKeatonMaskFee(v: boolean) {
    this.setBit(EventFlags.paidBackKeatonMaskFee, v);
  }

  get bridgeUnlockedAfterZeldaEscape(): boolean {
    return this.getBit(EventFlags.bridgeUnlockedAfterZeldaEscape);
  }
  set bridgeUnlockedAfterZeldaEscape(v: boolean) {
    this.setBit(EventFlags.bridgeUnlockedAfterZeldaEscape, v);
  }

  get zeldaFledHyruleCastle(): boolean {
    return this.getBit(EventFlags.zeldaFledHyruleCastle);
  }
  set zeldaFledHyruleCastle(v: boolean) {
    this.setBit(EventFlags.zeldaFledHyruleCastle, v);
  }

  get playedSongForScarecrowAsAdult(): boolean {
    return this.getBit(EventFlags.playedSongForScarecrowAsAdult);
  }
  set playedSongForScarecrowAsAdult(v: boolean) {
    this.setBit(EventFlags.playedSongForScarecrowAsAdult, v);
  }

  get spokeToCursedManInSkulltulaHouse(): boolean {
    return this.getBit(EventFlags.spokeToCursedManInSkulltulaHouse);
  }
  set spokeToCursedManInSkulltulaHouse(v: boolean) {
    this.setBit(EventFlags.spokeToCursedManInSkulltulaHouse, v);
  }

  get nabooruCapturedByTwinrova(): boolean {
    return this.getBit(EventFlags.nabooruCapturedByTwinrova);
  }
  set nabooruCapturedByTwinrova(v: boolean) {
    this.setBit(EventFlags.nabooruCapturedByTwinrova, v);
  }

  get spokeToNabooruInSpiritTemple(): boolean {
    return this.getBit(EventFlags.spokeToNabooruInSpiritTemple);
  }
  set spokeToNabooruInSpiritTemple(v: boolean) {
    this.setBit(EventFlags.spokeToNabooruInSpiritTemple, v);
  }

  get rescuedGreenCarpenter(): boolean {
    return this.getBit(EventFlags.rescuedGreenCarpenter);
  }
  set rescuedGreenCarpenter(v: boolean) {
    this.setBit(EventFlags.rescuedGreenCarpenter, v);
  }

  get rescuedBlueCarpenter(): boolean {
    return this.getBit(EventFlags.rescuedBlueCarpenter);
  }
  set rescuedBlueCarpenter(v: boolean) {
    this.setBit(EventFlags.rescuedBlueCarpenter, v);
  }

  get rescuedYellowCarpenter(): boolean {
    return this.getBit(EventFlags.rescuedYellowCarpenter);
  }
  set rescuedYellowCarpenter(v: boolean) {
    this.setBit(EventFlags.rescuedYellowCarpenter, v);
  }

  get rescuedRedCarpenter(): boolean {
    return this.getBit(EventFlags.rescuedRedCarpenter);
  }
  set rescuedRedCarpenter(v: boolean) {
    this.setBit(EventFlags.rescuedRedCarpenter, v);
  }

  get completedSpiritTrial(): boolean {
    return this.getBit(EventFlags.completedSpiritTrial);
  }
  set completedSpiritTrial(v: boolean) {
    this.setBit(EventFlags.completedSpiritTrial, v);
  }

  get learnedRequiemOfSpirit(): boolean {
    return this.getBit(EventFlags.learnedRequiemOfSpirit);
  }
  set learnedRequiemOfSpirit(v: boolean) {
    this.setBit(EventFlags.learnedRequiemOfSpirit, v);
  }

  get bongoBongoEscapedWell(): boolean {
    return this.getBit(EventFlags.bongoBongoEscapedWell);
  }
  set bongoBongoEscapedWell(v: boolean) {
    this.setBit(EventFlags.bongoBongoEscapedWell, v);
  }

  get learnedSongOfTime(): boolean {
    return this.getBit(EventFlags.learnedSongOfTime);
  }
  set learnedSongOfTime(v: boolean) {
    this.setBit(EventFlags.learnedSongOfTime, v);
  }

  get enteredDekuTree(): boolean {
    return this.getBit(EventFlags.enteredDekuTree);
  }
  set enteredDekuTree(v: boolean) {
    this.setBit(EventFlags.enteredDekuTree, v);
  }

  get enteredTempleOfTime(): boolean {
    return this.getBit(EventFlags.enteredTempleOfTime);
  }
  set enteredTempleOfTime(v: boolean) {
    this.setBit(EventFlags.enteredTempleOfTime, v);
  }

  get enteredGoronCity(): boolean {
    return this.getBit(EventFlags.enteredGoronCity);
  }
  set enteredGoronCity(v: boolean) {
    this.setBit(EventFlags.enteredGoronCity, v);
  }

  get enteredHyruleCastle(): boolean {
    return this.getBit(EventFlags.enteredHyruleCastle);
  }
  set enteredHyruleCastle(v: boolean) {
    this.setBit(EventFlags.enteredHyruleCastle, v);
  }

  get enteredZorasDomain(): boolean {
    return this.getBit(EventFlags.enteredZorasDomain);
  }
  set enteredZorasDomain(v: boolean) {
    this.setBit(EventFlags.enteredZorasDomain, v);
  }

  get enteredKakarikoVillage(): boolean {
    return this.getBit(EventFlags.enteredKakarikoVillage);
  }
  set enteredKakarikoVillage(v: boolean) {
    this.setBit(EventFlags.enteredKakarikoVillage, v);
  }

  get enteredDeathMountainTrail(): boolean {
    return this.getBit(EventFlags.enteredDeathMountainTrail);
  }
  set enteredDeathMountainTrail(v: boolean) {
    this.setBit(EventFlags.enteredDeathMountainTrail, v);
  }

  get enteredHyruleField(): boolean {
    return this.getBit(EventFlags.enteredHyruleField);
  }
  set enteredHyruleField(v: boolean) {
    this.setBit(EventFlags.enteredHyruleField, v);
  }

  get completedLightTrial(): boolean {
    return this.getBit(EventFlags.completedLightTrial);
  }
  set completedLightTrial(v: boolean) {
    this.setBit(EventFlags.completedLightTrial, v);
  }

  get completedFireTrial(): boolean {
    return this.getBit(EventFlags.completedFireTrial);
  }
  set completedFireTrial(v: boolean) {
    this.setBit(EventFlags.completedFireTrial, v);
  }

  get completedShadowTrial(): boolean {
    return this.getBit(EventFlags.completedShadowTrial);
  }
  set completedShadowTrial(v: boolean) {
    this.setBit(EventFlags.completedShadowTrial, v);
  }

  get completedWaterTrial(): boolean {
    return this.getBit(EventFlags.completedWaterTrial);
  }
  set completedWaterTrial(v: boolean) {
    this.setBit(EventFlags.completedWaterTrial, v);
  }

  get completedForestTrial(): boolean {
    return this.getBit(EventFlags.completedForestTrial);
  }
  set completedForestTrial(v: boolean) {
    this.setBit(EventFlags.completedForestTrial, v);
  }

  get enteredGanonsCastleExterior(): boolean {
    return this.getBit(EventFlags.enteredGanonsCastleExterior);
  }
  set enteredGanonsCastleExterior(v: boolean) {
    this.setBit(EventFlags.enteredGanonsCastleExterior, v);
  }

  get enteredDeathMountainCrater(): boolean {
    return this.getBit(EventFlags.enteredDeathMountainCrater);
  }
  set enteredDeathMountainCrater(v: boolean) {
    this.setBit(EventFlags.enteredDeathMountainCrater, v);
  }

  get enteredDesertColossus(): boolean {
    return this.getBit(EventFlags.enteredDesertColossus);
  }
  set enteredDesertColossus(v: boolean) {
    this.setBit(EventFlags.enteredDesertColossus, v);
  }

  get enteredZorasFountain(): boolean {
    return this.getBit(EventFlags.enteredZorasFountain);
  }
  set enteredZorasFountain(v: boolean) {
    this.setBit(EventFlags.enteredZorasFountain, v);
  }

  get enteredGraveyard(): boolean {
    return this.getBit(EventFlags.enteredGraveyard);
  }
  set enteredGraveyard(v: boolean) {
    this.setBit(EventFlags.enteredGraveyard, v);
  }

  get enteredJabuJabusBelly(): boolean {
    return this.getBit(EventFlags.enteredJabuJabusBelly);
  }
  set enteredJabuJabusBelly(v: boolean) {
    this.setBit(EventFlags.enteredJabuJabusBelly, v);
  }

  get enteredLonLonRanch(): boolean {
    return this.getBit(EventFlags.enteredLonLonRanch);
  }
  set enteredLonLonRanch(v: boolean) {
    this.setBit(EventFlags.enteredLonLonRanch, v);
  }

  get enteredGerudoFortress(): boolean {
    return this.getBit(EventFlags.enteredGerudoFortress);
  }
  set enteredGerudoFortress(v: boolean) {
    this.setBit(EventFlags.enteredGerudoFortress, v);
  }

  get enteredGerudoValley(): boolean {
    return this.getBit(EventFlags.enteredGerudoValley);
  }
  set enteredGerudoValley(v: boolean) {
    this.setBit(EventFlags.enteredGerudoValley, v);
  }

  get enteredLakeHylia(): boolean {
    return this.getBit(EventFlags.enteredLakeHylia);
  }
  set enteredLakeHylia(v: boolean) {
    this.setBit(EventFlags.enteredLakeHylia, v);
  }

  get enteredDodongosCavern(): boolean {
    return this.getBit(EventFlags.enteredDodongosCavern);
  }
  set enteredDodongosCavern(v: boolean) {
    this.setBit(EventFlags.enteredDodongosCavern, v);
  }

  get demoEffectTempleOfTimeWarp(): boolean {
    return this.getBit(EventFlags.demoEffectTempleOfTimeWarp);
  }
  set demoEffectTempleOfTimeWarp(v: boolean) {
    this.setBit(EventFlags.demoEffectTempleOfTimeWarp, v);
  }

  get obtainedSpiritMedallion(): boolean {
    return this.getBit(EventFlags.obtainedSpiritMedallion);
  }
  set obtainedSpiritMedallion(v: boolean) {
    this.setBit(EventFlags.obtainedSpiritMedallion, v);
  }

  get watchedGanonsTowerCollapseOrCaughtByGerudo(): boolean {
    return this.getBit(EventFlags.watchedGanonsTowerCollapseOrCaughtByGerudo);
  }
  set watchedGanonsTowerCollapseOrCaughtByGerudo(v: boolean) {
    this.setBit(EventFlags.watchedGanonsTowerCollapseOrCaughtByGerudo, v);
  }

  get spokeToDekuTreeSprout(): boolean {
    return this.getBit(EventFlags.spokeToDekuTreeSprout);
  }
  set spokeToDekuTreeSprout(v: boolean) {
    this.setBit(EventFlags.spokeToDekuTreeSprout, v);
  }

  get sheikSpawnedAtMasterSwordPedestalAsAdult(): boolean {
    return this.getBit(EventFlags.sheikSpawnedAtMasterSwordPedestalAsAdult);
  }
  set sheikSpawnedAtMasterSwordPedestalAsAdult(v: boolean) {
    this.setBit(EventFlags.sheikSpawnedAtMasterSwordPedestalAsAdult, v);
  }

  get returnedToTempleOfTimeWithAllMedallions(): boolean {
    return this.getBit(EventFlags.returnedToTempleOfTimeWithAllMedallions);
  }
  set returnedToTempleOfTimeWithAllMedallions(v: boolean) {
    this.setBit(EventFlags.returnedToTempleOfTimeWithAllMedallions, v);
  }

  get dispelledGanonsTowerBarrier(): boolean {
    return this.getBit(EventFlags.dispelledGanonsTowerBarrier);
  }
  set dispelledGanonsTowerBarrier(v: boolean) {
    this.setBit(EventFlags.dispelledGanonsTowerBarrier, v);
  }

  get spokeToSariaOnLostWoodsBridge(): boolean {
    return this.getBit(EventFlags.spokeToSariaOnLostWoodsBridge);
  }
  set spokeToSariaOnLostWoodsBridge(v: boolean) {
    this.setBit(EventFlags.spokeToSariaOnLostWoodsBridge, v);
  }

  get nabooruOrderedToFightByTwinrova(): boolean {
    return this.getBit(EventFlags.nabooruOrderedToFightByTwinrova);
  }
  set nabooruOrderedToFightByTwinrova(v: boolean) {
    this.setBit(EventFlags.nabooruOrderedToFightByTwinrova, v);
  }

  get obtainedSkulltulaHousePieceOfHeart(): boolean {
    return this.getBit(EventFlags.obtainedSkulltulaHousePieceOfHeart);
  }
  set obtainedSkulltulaHousePieceOfHeart(v: boolean) {
    this.setBit(EventFlags.obtainedSkulltulaHousePieceOfHeart, v);
  }

  get obtainedSkulltulaHouseBombchu(): boolean {
    return this.getBit(EventFlags.obtainedSkulltulaHouseBombchu);
  }
  set obtainedSkulltulaHouseBombchu(v: boolean) {
    this.setBit(EventFlags.obtainedSkulltulaHouseBombchu, v);
  }

  get obtainedGiantsWallet(): boolean {
    return this.getBit(EventFlags.obtainedGiantsWallet);
  }
  set obtainedGiantsWallet(v: boolean) {
    this.setBit(EventFlags.obtainedGiantsWallet, v);
  }

  get obtainedStoneOfAgony(): boolean {
    return this.getBit(EventFlags.obtainedStoneOfAgony);
  }
  set obtainedStoneOfAgony(v: boolean) {
    this.setBit(EventFlags.obtainedStoneOfAgony, v);
  }

  get obtainedAdultsWallet(): boolean {
    return this.getBit(EventFlags.obtainedAdultsWallet);
  }
  set obtainedAdultsWallet(v: boolean) {
    this.setBit(EventFlags.obtainedAdultsWallet, v);
  }

  get playedSongOfStormsForFrogs(): boolean {
    return this.getBit(EventFlags.playedSongOfStormsForFrogs);
  }
  set playedSongOfStormsForFrogs(v: boolean) {
    this.setBit(EventFlags.playedSongOfStormsForFrogs, v);
  }

  get playedSongOfTimeForFrogs(): boolean {
    return this.getBit(EventFlags.playedSongOfTimeForFrogs);
  }
  set playedSongOfTimeForFrogs(v: boolean) {
    this.setBit(EventFlags.playedSongOfTimeForFrogs, v);
  }

  get playedSariasSongForFrogs(): boolean {
    return this.getBit(EventFlags.playedSariasSongForFrogs);
  }
  set playedSariasSongForFrogs(v: boolean) {
    this.setBit(EventFlags.playedSariasSongForFrogs, v);
  }

  get playedSunsSongForFrogs(): boolean {
    return this.getBit(EventFlags.playedSunsSongForFrogs);
  }
  set playedSunsSongForFrogs(v: boolean) {
    this.setBit(EventFlags.playedSunsSongForFrogs, v);
  }

  get playedEponasSongForFrogs(): boolean {
    return this.getBit(EventFlags.playedEponasSongForFrogs);
  }
  set playedEponasSongForFrogs(v: boolean) {
    this.setBit(EventFlags.playedEponasSongForFrogs, v);
  }

  get playedZeldasLullabyForFrogs(): boolean {
    return this.getBit(EventFlags.playedZeldasLullabyForFrogs);
  }
  set playedZeldasLullabyForFrogs(v: boolean) {
    this.setBit(EventFlags.playedZeldasLullabyForFrogs, v);
  }

  get obtainedFrogsPieceOfHeart(): boolean {
    return this.getBit(EventFlags.obtainedFrogsPieceOfHeart);
  }
  set obtainedFrogsPieceOfHeart(v: boolean) {
    this.setBit(EventFlags.obtainedFrogsPieceOfHeart, v);
  }
}
