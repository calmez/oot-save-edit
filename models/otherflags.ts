import { Flags } from "./flags.ts";

export class OtherFlags extends Flags<Uint8Array> {
  static readonly metMido = { byte: 0, bit: 4 };

  static readonly spokeToSariaInSariasHouse = { byte: 1, bit: 5 };
  static readonly complainedAboutMidoToSaria = { byte: 1, bit: 3 };
  static readonly spokeToSariaAboutObtainingAFairy = { byte: 1, bit: 1 };
  static readonly greetedBySaria = { byte: 1, bit: 0 };

  static readonly spokeToKokiriGirlByJumpingStones = { byte: 2, bit: 6 };
  static readonly toldMidoSariaWontReturn = { byte: 2, bit: 1 };

  static readonly metMidoInLostWoodsAsAdult = { byte: 3, bit: 5 };

  static readonly spokeToGirlAboutTrainingCenter = { byte: 4, bit: 0 };

  static readonly spokeToKokiriGirlOnShopAwning = { byte: 5, bit: 6 };
  static readonly spokeToKokiriBoyPullingGrass = { byte: 5, bit: 4 };
  static readonly spokeToKokiriBoyGuardingForestExit = { byte: 5, bit: 2 };

  static readonly spokeToBoyOnBedInMidosHouse = { byte: 7, bit: 1 };

  static readonly spokeToKnowItAllBroAboutTemple = { byte: 10, bit: 1 };
  static readonly spokeToGirlInSariasHouse = { byte: 11, bit: 1 };

  static readonly spokeToDyingKnight = { byte: 12, bit: 4 };

  static readonly spokeToDekuTreeSproutOnceAfterCutscene = { byte: 13, bit: 6 };
  static readonly spokeToKnowItAllBroAboutSaria = { byte: 13, bit: 1 };

  static readonly spokeToTalonInLonLonRanchHouse = { byte: 14, bit: 6 };

  static readonly soldierWearsKeatonMask = { byte: 15, bit: 7 };
  static readonly spokeToGateGuardAboutMaskShop = { byte: 15, bit: 6 };

  static readonly enteredHyruleCastle = { byte: 16, bit: 3 };

  static readonly childMalonSaidEponaWasScaredOfYou = { byte: 17, bit: 5 };
  static readonly metChildMalonAtCastleOrMarket = { byte: 17, bit: 4 };

  static readonly spokeToIngoOnceAsAdult = { byte: 18, bit: 2 };

  static readonly metIngoAtRanch = { byte: 19, bit: 7 };
  static readonly metIngoAtRanchBeforeTalonReturns = { byte: 19, bit: 4 };

  static readonly rodeAnyHorseAtIngosRanch = { byte: 20, bit: 3 };

  static readonly spokeToCarpenterBossByTent = { byte: 22, bit: 4 };
  static readonly spokeToFadoInKokiriForestAsChild = { byte: 22, bit: 3 };
  static readonly spokeToMalonAfterSavingRanch = { byte: 22, bit: 0 };

  static readonly spokeToFadoAtStartOfGame = { byte: 23, bit: 7 };
  static readonly metPoeCollectorInRuinedMarket = { byte: 23, bit: 6 };
  static readonly metMedigoronAsAdult = { byte: 23, bit: 1 };
  static readonly metMedigoronAsChild = { byte: 23, bit: 0 };

  static readonly spokeToBlueJokesterInMarketDebug = { byte: 24, bit: 6 };
  static readonly spokeToItchyLadyAfterMalonLeavesTown = { byte: 24, bit: 5 };
  static readonly spokeToBlueJokesterInMarketOrDogLadyAsAdultDebug = {
    byte: 24,
    bit: 4,
  };
  static readonly spokeToRedJokesterInMarket = { byte: 24, bit: 3 };
  static readonly spokeToThinLadyAfterZeldaEscape = { byte: 24, bit: 2 };
  static readonly spokeToThinLadyByBombchuBowling = { byte: 24, bit: 0 };

  static readonly spokeToOldManByBombchuBowling = { byte: 25, bit: 7 };
  static readonly spokeToOldWomanByMarketFountain = { byte: 25, bit: 6 };
  static readonly spokeToThinManByMarketTargetShop = { byte: 25, bit: 5 };
  static readonly spokeToThiefAfterZeldaEscape = { byte: 25, bit: 4 };
  static readonly spokeToBurlyManAfterZeldaEscape = { byte: 25, bit: 3 };
  static readonly spokeToBurlyManAboutTalonSearch = { byte: 25, bit: 2 };
  static readonly spokeToFatWomanAfterZeldaEscape = { byte: 25, bit: 1 };
  static readonly spokeToFatWomanByMarketPotionShop = { byte: 25, bit: 0 };

  static readonly spokeToGoronByBombFlowers = { byte: 28, bit: 3 };

  static readonly spokeToGoronByWoodsExit = { byte: 29, bit: 6 };
  static readonly spokeToGoronHidingStick = { byte: 29, bit: 3 };
  static readonly spokeToGoronAtCavern = { byte: 29, bit: 0 };

  static readonly spokeToRubyCrazyGoron = { byte: 31, bit: 4 };
  static readonly spokeToGoronAtEntrance = { byte: 31, bit: 0 };

  static readonly spokeToGoronLink = { byte: 32, bit: 6 };
  static readonly stoppedGoronLinksRolling = { byte: 32, bit: 4 };
  static readonly spokeToGoronLinkAboutVolvagia = { byte: 32, bit: 3 };
  static readonly obtainedFireTunicFromGoronLink = { byte: 32, bit: 1 };

  static readonly receivedGoronCityBombBagUpgrade = { byte: 34, bit: 6 };
  static readonly metDaruniaInFireTemple = { byte: 34, bit: 2 };

  static readonly metDaruniaInGoronCity = { byte: 35, bit: 3 };

  static readonly spokeToZoraSwimmingBehindZoraShop = { byte: 36, bit: 1 };
  static readonly spokeToZoraBesideZoraShop = { byte: 36, bit: 0 };

  static readonly spokeToZoraNearZoraShop = { byte: 37, bit: 4 };

  static readonly obtainedZoraTunic = { byte: 38, bit: 1 };
  static readonly thawedKingZora = { byte: 38, bit: 0 };

  static readonly rutoInJabuJabuSpawnsOnF1InsteadOfB1 = { byte: 41, bit: 7 };
  static readonly rutoInJabuJabuKidnapped = { byte: 41, bit: 6 };
  static readonly rutoInJabuJabuOnSapphirePlatform = { byte: 41, bit: 5 };
  static readonly rutoInJabuJabuWantsToBeThrownToSapphire = {
    byte: 41,
    bit: 4,
  };
  static readonly rutoInJabuJabuCanBeEscorted = { byte: 41, bit: 3 };
  static readonly rutoInJabuJabuTalkFirstTime = { byte: 41, bit: 2 };
  static readonly metRutoInJabuJabu = { byte: 41, bit: 1 };
  static readonly rutoInJabuJabuOnBlueSwitch = { byte: 41, bit: 0 };

  static readonly refusedNabooru = { byte: 44, bit: 4 };

  static readonly spokeToCarpenterBossWifeAsAdult = { byte: 45, bit: 4 };
  static readonly spokeToCarpenterBossWifeAsChild = { byte: 45, bit: 3 };
  static readonly spokeToManInImpasHouseAsAdult = { byte: 45, bit: 2 };
  static readonly spokeToManInImpasHouseAtNight = { byte: 45, bit: 1 };
  static readonly spokeToManInImpasHouseInDay = { byte: 45, bit: 0 };

  static readonly runningManSuggestedARace = { byte: 46, bit: 7 };
  static readonly spokeToGreenCarpenterInTent = { byte: 46, bit: 0 };

  static readonly spokeToBlueCarpenterInTent = { byte: 47, bit: 6 };
  static readonly spokeToCarpenterBossInKakariko = { byte: 47, bit: 2 };
  static readonly spokeToCarpenterBossInValley = { byte: 47, bit: 0 };

  static readonly caughtCuccoBehindPotionShop = { byte: 50, bit: 7 };
  static readonly caughtCuccoNearSkulltulaHouse = { byte: 50, bit: 6 };
  static readonly caughtCuccoInCrate = { byte: 50, bit: 5 };
  static readonly caughtCuccoBehindWindmill = { byte: 50, bit: 4 };
  static readonly caughtCuccoNearCuccoPen = { byte: 50, bit: 3 };
  static readonly caughtCuccoNearBazaar = { byte: 50, bit: 2 };
  static readonly caughtCuccoNearHyruleFieldEntrance = { byte: 50, bit: 1 };
  static readonly obtainedMagicContainer = { byte: 50, bit: 0 };

  static readonly spokeToCursedManWith10Tokens = { byte: 51, bit: 7 };
  static readonly metCursedManInSkulltulaHouse = { byte: 51, bit: 6 };
  static readonly obtainedGrottoDekuNutUpgrade = { byte: 51, bit: 3 };
  static readonly obtainedLostWoodsDekuStickUpgrade = { byte: 51, bit: 2 };
  static readonly obtainedHeartPieceForFindingRichard = { byte: 51, bit: 1 };
  static readonly obtainedGerudoArcheryHeartPiece = { byte: 51, bit: 0 };

  static readonly enteredGanonsCastleCollapsing = { byte: 52, bit: 7 };
  static readonly enteredGanonsTowerCollapsing = { byte: 52, bit: 6 };
  static readonly enteredGanonsCastle = { byte: 52, bit: 5 };
  static readonly enteredThievesHideout = { byte: 52, bit: 4 };
  static readonly enteredGerudoTrainingGround = { byte: 52, bit: 3 };
  static readonly enteredGanonsTower = { byte: 52, bit: 2 };
  static readonly enteredIceCavern = { byte: 52, bit: 1 };
  static readonly enteredBottomOfTheWell = { byte: 52, bit: 0 };

  static readonly enteredShadowTemple = { byte: 53, bit: 7 };
  static readonly enteredSpiritTemple = { byte: 53, bit: 6 };
  static readonly enteredWaterTemple = { byte: 53, bit: 5 };
  static readonly enteredFireTemple = { byte: 53, bit: 4 };
  static readonly enteredForestTemple = { byte: 53, bit: 3 };
  static readonly enteredJabuJabusBelly = { byte: 53, bit: 2 };
  static readonly enteredDodongosCavern = { byte: 53, bit: 1 };
  static readonly enteredDekuTree = { byte: 53, bit: 0 };
  static readonly swordlessMasterSwordKnockedAway = { byte: 59, bit: 0 };

  protected override get minBytes(): number {
    return 60;
  }

  protected override createArray(length: number): Uint8Array<ArrayBufferLike> {
    return new Uint8Array(length);
  }

  get metMido(): boolean {
    return this.getBit(OtherFlags.metMido);
  }
  set metMido(value: boolean) {
    this.setBit(OtherFlags.metMido, value);
  }

  get spokeToSariaInSariasHouse(): boolean {
    return this.getBit(OtherFlags.spokeToSariaInSariasHouse);
  }
  set spokeToSariaInSariasHouse(value: boolean) {
    this.setBit(OtherFlags.spokeToSariaInSariasHouse, value);
  }

  get complainedAboutMidoToSaria(): boolean {
    return this.getBit(OtherFlags.complainedAboutMidoToSaria);
  }
  set complainedAboutMidoToSaria(value: boolean) {
    this.setBit(OtherFlags.complainedAboutMidoToSaria, value);
  }

  get spokeToSariaAboutObtainingAFairy(): boolean {
    return this.getBit(OtherFlags.spokeToSariaAboutObtainingAFairy);
  }
  set spokeToSariaAboutObtainingAFairy(value: boolean) {
    this.setBit(OtherFlags.spokeToSariaAboutObtainingAFairy, value);
  }

  get greetedBySaria(): boolean {
    return this.getBit(OtherFlags.greetedBySaria);
  }
  set greetedBySaria(value: boolean) {
    this.setBit(OtherFlags.greetedBySaria, value);
  }

  get spokeToKokiriGirlByJumpingStones(): boolean {
    return this.getBit(OtherFlags.spokeToKokiriGirlByJumpingStones);
  }
  set spokeToKokiriGirlByJumpingStones(value: boolean) {
    this.setBit(OtherFlags.spokeToKokiriGirlByJumpingStones, value);
  }

  get toldMidoSariaWontReturn(): boolean {
    return this.getBit(OtherFlags.toldMidoSariaWontReturn);
  }
  set toldMidoSariaWontReturn(value: boolean) {
    this.setBit(OtherFlags.toldMidoSariaWontReturn, value);
  }

  get metMidoInLostWoodsAsAdult(): boolean {
    return this.getBit(OtherFlags.metMidoInLostWoodsAsAdult);
  }
  set metMidoInLostWoodsAsAdult(value: boolean) {
    this.setBit(OtherFlags.metMidoInLostWoodsAsAdult, value);
  }

  get spokeToGirlAboutTrainingCenter(): boolean {
    return this.getBit(OtherFlags.spokeToGirlAboutTrainingCenter);
  }
  set spokeToGirlAboutTrainingCenter(value: boolean) {
    this.setBit(OtherFlags.spokeToGirlAboutTrainingCenter, value);
  }

  get spokeToKokiriGirlOnShopAwning(): boolean {
    return this.getBit(OtherFlags.spokeToKokiriGirlOnShopAwning);
  }
  set spokeToKokiriGirlOnShopAwning(value: boolean) {
    this.setBit(OtherFlags.spokeToKokiriGirlOnShopAwning, value);
  }

  get spokeToKokiriBoyPullingGrass(): boolean {
    return this.getBit(OtherFlags.spokeToKokiriBoyPullingGrass);
  }
  set spokeToKokiriBoyPullingGrass(value: boolean) {
    this.setBit(OtherFlags.spokeToKokiriBoyPullingGrass, value);
  }

  get spokeToKokiriBoyGuardingForestExit(): boolean {
    return this.getBit(OtherFlags.spokeToKokiriBoyGuardingForestExit);
  }
  set spokeToKokiriBoyGuardingForestExit(value: boolean) {
    this.setBit(OtherFlags.spokeToKokiriBoyGuardingForestExit, value);
  }

  get spokeToBoyOnBedInMidosHouse(): boolean {
    return this.getBit(OtherFlags.spokeToBoyOnBedInMidosHouse);
  }
  set spokeToBoyOnBedInMidosHouse(value: boolean) {
    this.setBit(OtherFlags.spokeToBoyOnBedInMidosHouse, value);
  }

  get spokeToKnowItAllBroAboutTemple(): boolean {
    return this.getBit(OtherFlags.spokeToKnowItAllBroAboutTemple);
  }
  set spokeToKnowItAllBroAboutTemple(value: boolean) {
    this.setBit(OtherFlags.spokeToKnowItAllBroAboutTemple, value);
  }

  get spokeToGirlInSariasHouse(): boolean {
    return this.getBit(OtherFlags.spokeToGirlInSariasHouse);
  }
  set spokeToGirlInSariasHouse(value: boolean) {
    this.setBit(OtherFlags.spokeToGirlInSariasHouse, value);
  }

  get spokeToDyingKnight(): boolean {
    return this.getBit(OtherFlags.spokeToDyingKnight);
  }
  set spokeToDyingKnight(value: boolean) {
    this.setBit(OtherFlags.spokeToDyingKnight, value);
  }

  get spokeToDekuTreeSproutOnceAfterCutscene(): boolean {
    return this.getBit(OtherFlags.spokeToDekuTreeSproutOnceAfterCutscene);
  }
  set spokeToDekuTreeSproutOnceAfterCutscene(value: boolean) {
    this.setBit(OtherFlags.spokeToDekuTreeSproutOnceAfterCutscene, value);
  }

  get spokeToKnowItAllBroAboutSaria(): boolean {
    return this.getBit(OtherFlags.spokeToKnowItAllBroAboutSaria);
  }
  set spokeToKnowItAllBroAboutSaria(value: boolean) {
    this.setBit(OtherFlags.spokeToKnowItAllBroAboutSaria, value);
  }

  get spokeToTalonInLonLonRanchHouse(): boolean {
    return this.getBit(OtherFlags.spokeToTalonInLonLonRanchHouse);
  }
  set spokeToTalonInLonLonRanchHouse(value: boolean) {
    this.setBit(OtherFlags.spokeToTalonInLonLonRanchHouse, value);
  }

  get soldierWearsKeatonMask(): boolean {
    return this.getBit(OtherFlags.soldierWearsKeatonMask);
  }
  set soldierWearsKeatonMask(value: boolean) {
    this.setBit(OtherFlags.soldierWearsKeatonMask, value);
  }

  get spokeToGateGuardAboutMaskShop(): boolean {
    return this.getBit(OtherFlags.spokeToGateGuardAboutMaskShop);
  }
  set spokeToGateGuardAboutMaskShop(value: boolean) {
    this.setBit(OtherFlags.spokeToGateGuardAboutMaskShop, value);
  }

  get enteredHyruleCastle(): boolean {
    return this.getBit(OtherFlags.enteredHyruleCastle);
  }
  set enteredHyruleCastle(value: boolean) {
    this.setBit(OtherFlags.enteredHyruleCastle, value);
  }

  get childMalonSaidEponaWasScaredOfYou(): boolean {
    return this.getBit(OtherFlags.childMalonSaidEponaWasScaredOfYou);
  }
  set childMalonSaidEponaWasScaredOfYou(value: boolean) {
    this.setBit(OtherFlags.childMalonSaidEponaWasScaredOfYou, value);
  }

  get metChildMalonAtCastleOrMarket(): boolean {
    return this.getBit(OtherFlags.metChildMalonAtCastleOrMarket);
  }
  set metChildMalonAtCastleOrMarket(value: boolean) {
    this.setBit(OtherFlags.metChildMalonAtCastleOrMarket, value);
  }

  get spokeToIngoOnceAsAdult(): boolean {
    return this.getBit(OtherFlags.spokeToIngoOnceAsAdult);
  }
  set spokeToIngoOnceAsAdult(value: boolean) {
    this.setBit(OtherFlags.spokeToIngoOnceAsAdult, value);
  }

  get metIngoAtRanch(): boolean {
    return this.getBit(OtherFlags.metIngoAtRanch);
  }
  set metIngoAtRanch(value: boolean) {
    this.setBit(OtherFlags.metIngoAtRanch, value);
  }

  get metIngoAtRanchBeforeTalonReturns(): boolean {
    return this.getBit(OtherFlags.metIngoAtRanchBeforeTalonReturns);
  }
  set metIngoAtRanchBeforeTalonReturns(value: boolean) {
    this.setBit(OtherFlags.metIngoAtRanchBeforeTalonReturns, value);
  }

  get rodeAnyHorseAtIngosRanch(): boolean {
    return this.getBit(OtherFlags.rodeAnyHorseAtIngosRanch);
  }
  set rodeAnyHorseAtIngosRanch(value: boolean) {
    this.setBit(OtherFlags.rodeAnyHorseAtIngosRanch, value);
  }

  get spokeToCarpenterBossByTent(): boolean {
    return this.getBit(OtherFlags.spokeToCarpenterBossByTent);
  }
  set spokeToCarpenterBossByTent(value: boolean) {
    this.setBit(OtherFlags.spokeToCarpenterBossByTent, value);
  }

  get spokeToFadoInKokiriForestAsChild(): boolean {
    return this.getBit(OtherFlags.spokeToFadoInKokiriForestAsChild);
  }
  set spokeToFadoInKokiriForestAsChild(value: boolean) {
    this.setBit(OtherFlags.spokeToFadoInKokiriForestAsChild, value);
  }

  get spokeToMalonAfterSavingRanch(): boolean {
    return this.getBit(OtherFlags.spokeToMalonAfterSavingRanch);
  }
  set spokeToMalonAfterSavingRanch(value: boolean) {
    this.setBit(OtherFlags.spokeToMalonAfterSavingRanch, value);
  }

  get spokeToFadoAtStartOfGame(): boolean {
    return this.getBit(OtherFlags.spokeToFadoAtStartOfGame);
  }
  set spokeToFadoAtStartOfGame(value: boolean) {
    this.setBit(OtherFlags.spokeToFadoAtStartOfGame, value);
  }

  get metPoeCollectorInRuinedMarket(): boolean {
    return this.getBit(OtherFlags.metPoeCollectorInRuinedMarket);
  }
  set metPoeCollectorInRuinedMarket(value: boolean) {
    this.setBit(OtherFlags.metPoeCollectorInRuinedMarket, value);
  }

  get metMedigoronAsAdult(): boolean {
    return this.getBit(OtherFlags.metMedigoronAsAdult);
  }
  set metMedigoronAsAdult(value: boolean) {
    this.setBit(OtherFlags.metMedigoronAsAdult, value);
  }

  get metMedigoronAsChild(): boolean {
    return this.getBit(OtherFlags.metMedigoronAsChild);
  }
  set metMedigoronAsChild(value: boolean) {
    this.setBit(OtherFlags.metMedigoronAsChild, value);
  }

  get spokeToBlueJokesterInMarketDebug(): boolean {
    return this.getBit(OtherFlags.spokeToBlueJokesterInMarketDebug);
  }
  set spokeToBlueJokesterInMarketDebug(value: boolean) {
    this.setBit(OtherFlags.spokeToBlueJokesterInMarketDebug, value);
  }

  get spokeToItchyLadyAfterMalonLeavesTown(): boolean {
    return this.getBit(OtherFlags.spokeToItchyLadyAfterMalonLeavesTown);
  }
  set spokeToItchyLadyAfterMalonLeavesTown(value: boolean) {
    this.setBit(OtherFlags.spokeToItchyLadyAfterMalonLeavesTown, value);
  }

  get spokeToBlueJokesterInMarketOrDogLadyAsAdultDebug(): boolean {
    return this.getBit(
      OtherFlags.spokeToBlueJokesterInMarketOrDogLadyAsAdultDebug,
    );
  }
  set spokeToBlueJokesterInMarketOrDogLadyAsAdultDebug(value: boolean) {
    this.setBit(
      OtherFlags.spokeToBlueJokesterInMarketOrDogLadyAsAdultDebug,
      value,
    );
  }

  get spokeToRedJokesterInMarket(): boolean {
    return this.getBit(OtherFlags.spokeToRedJokesterInMarket);
  }
  set spokeToRedJokesterInMarket(value: boolean) {
    this.setBit(OtherFlags.spokeToRedJokesterInMarket, value);
  }

  get spokeToThinLadyAfterZeldaEscape(): boolean {
    return this.getBit(OtherFlags.spokeToThinLadyAfterZeldaEscape);
  }
  set spokeToThinLadyAfterZeldaEscape(value: boolean) {
    this.setBit(OtherFlags.spokeToThinLadyAfterZeldaEscape, value);
  }

  get spokeToThinLadyByBombchuBowling(): boolean {
    return this.getBit(OtherFlags.spokeToThinLadyByBombchuBowling);
  }
  set spokeToThinLadyByBombchuBowling(value: boolean) {
    this.setBit(OtherFlags.spokeToThinLadyByBombchuBowling, value);
  }

  get spokeToOldManByBombchuBowling(): boolean {
    return this.getBit(OtherFlags.spokeToOldManByBombchuBowling);
  }
  set spokeToOldManByBombchuBowling(value: boolean) {
    this.setBit(OtherFlags.spokeToOldManByBombchuBowling, value);
  }

  get spokeToOldWomanByMarketFountain(): boolean {
    return this.getBit(OtherFlags.spokeToOldWomanByMarketFountain);
  }
  set spokeToOldWomanByMarketFountain(value: boolean) {
    this.setBit(OtherFlags.spokeToOldWomanByMarketFountain, value);
  }

  get spokeToThinManByMarketTargetShop(): boolean {
    return this.getBit(OtherFlags.spokeToThinManByMarketTargetShop);
  }
  set spokeToThinManByMarketTargetShop(value: boolean) {
    this.setBit(OtherFlags.spokeToThinManByMarketTargetShop, value);
  }

  get spokeToThiefAfterZeldaEscape(): boolean {
    return this.getBit(OtherFlags.spokeToThiefAfterZeldaEscape);
  }
  set spokeToThiefAfterZeldaEscape(value: boolean) {
    this.setBit(OtherFlags.spokeToThiefAfterZeldaEscape, value);
  }

  get spokeToBurlyManAfterZeldaEscape(): boolean {
    return this.getBit(OtherFlags.spokeToBurlyManAfterZeldaEscape);
  }
  set spokeToBurlyManAfterZeldaEscape(value: boolean) {
    this.setBit(OtherFlags.spokeToBurlyManAfterZeldaEscape, value);
  }

  get spokeToBurlyManAboutTalonSearch(): boolean {
    return this.getBit(OtherFlags.spokeToBurlyManAboutTalonSearch);
  }
  set spokeToBurlyManAboutTalonSearch(value: boolean) {
    this.setBit(OtherFlags.spokeToBurlyManAboutTalonSearch, value);
  }

  get spokeToFatWomanAfterZeldaEscape(): boolean {
    return this.getBit(OtherFlags.spokeToFatWomanAfterZeldaEscape);
  }
  set spokeToFatWomanAfterZeldaEscape(value: boolean) {
    this.setBit(OtherFlags.spokeToFatWomanAfterZeldaEscape, value);
  }

  get spokeToFatWomanByMarketPotionShop(): boolean {
    return this.getBit(OtherFlags.spokeToFatWomanByMarketPotionShop);
  }
  set spokeToFatWomanByMarketPotionShop(value: boolean) {
    this.setBit(OtherFlags.spokeToFatWomanByMarketPotionShop, value);
  }

  get spokeToGoronByBombFlowers(): boolean {
    return this.getBit(OtherFlags.spokeToGoronByBombFlowers);
  }
  set spokeToGoronByBombFlowers(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronByBombFlowers, value);
  }

  get spokeToGoronByWoodsExit(): boolean {
    return this.getBit(OtherFlags.spokeToGoronByWoodsExit);
  }
  set spokeToGoronByWoodsExit(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronByWoodsExit, value);
  }

  get spokeToGoronHidingStick(): boolean {
    return this.getBit(OtherFlags.spokeToGoronHidingStick);
  }
  set spokeToGoronHidingStick(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronHidingStick, value);
  }

  get spokeToGoronAtCavern(): boolean {
    return this.getBit(OtherFlags.spokeToGoronAtCavern);
  }
  set spokeToGoronAtCavern(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronAtCavern, value);
  }

  get spokeToRubyCrazyGoron(): boolean {
    return this.getBit(OtherFlags.spokeToRubyCrazyGoron);
  }
  set spokeToRubyCrazyGoron(value: boolean) {
    this.setBit(OtherFlags.spokeToRubyCrazyGoron, value);
  }

  get spokeToGoronAtEntrance(): boolean {
    return this.getBit(OtherFlags.spokeToGoronAtEntrance);
  }
  set spokeToGoronAtEntrance(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronAtEntrance, value);
  }

  get spokeToGoronLink(): boolean {
    return this.getBit(OtherFlags.spokeToGoronLink);
  }
  set spokeToGoronLink(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronLink, value);
  }

  get stoppedGoronLinksRolling(): boolean {
    return this.getBit(OtherFlags.stoppedGoronLinksRolling);
  }
  set stoppedGoronLinksRolling(value: boolean) {
    this.setBit(OtherFlags.stoppedGoronLinksRolling, value);
  }

  get spokeToGoronLinkAboutVolvagia(): boolean {
    return this.getBit(OtherFlags.spokeToGoronLinkAboutVolvagia);
  }
  set spokeToGoronLinkAboutVolvagia(value: boolean) {
    this.setBit(OtherFlags.spokeToGoronLinkAboutVolvagia, value);
  }

  get obtainedFireTunicFromGoronLink(): boolean {
    return this.getBit(OtherFlags.obtainedFireTunicFromGoronLink);
  }
  set obtainedFireTunicFromGoronLink(value: boolean) {
    this.setBit(OtherFlags.obtainedFireTunicFromGoronLink, value);
  }

  get receivedGoronCityBombBagUpgrade(): boolean {
    return this.getBit(OtherFlags.receivedGoronCityBombBagUpgrade);
  }
  set receivedGoronCityBombBagUpgrade(value: boolean) {
    this.setBit(OtherFlags.receivedGoronCityBombBagUpgrade, value);
  }

  get metDaruniaInFireTemple(): boolean {
    return this.getBit(OtherFlags.metDaruniaInFireTemple);
  }
  set metDaruniaInFireTemple(value: boolean) {
    this.setBit(OtherFlags.metDaruniaInFireTemple, value);
  }

  get metDaruniaInGoronCity(): boolean {
    return this.getBit(OtherFlags.metDaruniaInGoronCity);
  }
  set metDaruniaInGoronCity(value: boolean) {
    this.setBit(OtherFlags.metDaruniaInGoronCity, value);
  }

  get spokeToZoraSwimmingBehindZoraShop(): boolean {
    return this.getBit(OtherFlags.spokeToZoraSwimmingBehindZoraShop);
  }
  set spokeToZoraSwimmingBehindZoraShop(value: boolean) {
    this.setBit(OtherFlags.spokeToZoraSwimmingBehindZoraShop, value);
  }

  get spokeToZoraBesideZoraShop(): boolean {
    return this.getBit(OtherFlags.spokeToZoraBesideZoraShop);
  }
  set spokeToZoraBesideZoraShop(value: boolean) {
    this.setBit(OtherFlags.spokeToZoraBesideZoraShop, value);
  }

  get spokeToZoraNearZoraShop(): boolean {
    return this.getBit(OtherFlags.spokeToZoraNearZoraShop);
  }
  set spokeToZoraNearZoraShop(value: boolean) {
    this.setBit(OtherFlags.spokeToZoraNearZoraShop, value);
  }

  get obtainedZoraTunic(): boolean {
    return this.getBit(OtherFlags.obtainedZoraTunic);
  }
  set obtainedZoraTunic(value: boolean) {
    this.setBit(OtherFlags.obtainedZoraTunic, value);
  }

  get thawedKingZora(): boolean {
    return this.getBit(OtherFlags.thawedKingZora);
  }
  set thawedKingZora(value: boolean) {
    this.setBit(OtherFlags.thawedKingZora, value);
  }

  get rutoInJabuJabuSpawnsOnF1InsteadOfB1(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuSpawnsOnF1InsteadOfB1);
  }
  set rutoInJabuJabuSpawnsOnF1InsteadOfB1(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuSpawnsOnF1InsteadOfB1, value);
  }

  get rutoInJabuJabuKidnapped(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuKidnapped);
  }
  set rutoInJabuJabuKidnapped(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuKidnapped, value);
  }

  get rutoInJabuJabuOnSapphirePlatform(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuOnSapphirePlatform);
  }
  set rutoInJabuJabuOnSapphirePlatform(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuOnSapphirePlatform, value);
  }

  get rutoInJabuJabuWantsToBeThrownToSapphire(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuWantsToBeThrownToSapphire);
  }
  set rutoInJabuJabuWantsToBeThrownToSapphire(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuWantsToBeThrownToSapphire, value);
  }

  get rutoInJabuJabuCanBeEscorted(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuCanBeEscorted);
  }
  set rutoInJabuJabuCanBeEscorted(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuCanBeEscorted, value);
  }

  get rutoInJabuJabuTalkFirstTime(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuTalkFirstTime);
  }
  set rutoInJabuJabuTalkFirstTime(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuTalkFirstTime, value);
  }

  get metRutoInJabuJabu(): boolean {
    return this.getBit(OtherFlags.metRutoInJabuJabu);
  }
  set metRutoInJabuJabu(value: boolean) {
    this.setBit(OtherFlags.metRutoInJabuJabu, value);
  }

  get rutoInJabuJabuOnBlueSwitch(): boolean {
    return this.getBit(OtherFlags.rutoInJabuJabuOnBlueSwitch);
  }
  set rutoInJabuJabuOnBlueSwitch(value: boolean) {
    this.setBit(OtherFlags.rutoInJabuJabuOnBlueSwitch, value);
  }

  get refusedNabooru(): boolean {
    return this.getBit(OtherFlags.refusedNabooru);
  }
  set refusedNabooru(value: boolean) {
    this.setBit(OtherFlags.refusedNabooru, value);
  }

  get spokeToCarpenterBossWifeAsAdult(): boolean {
    return this.getBit(OtherFlags.spokeToCarpenterBossWifeAsAdult);
  }
  set spokeToCarpenterBossWifeAsAdult(value: boolean) {
    this.setBit(OtherFlags.spokeToCarpenterBossWifeAsAdult, value);
  }

  get spokeToCarpenterBossWifeAsChild(): boolean {
    return this.getBit(OtherFlags.spokeToCarpenterBossWifeAsChild);
  }
  set spokeToCarpenterBossWifeAsChild(value: boolean) {
    this.setBit(OtherFlags.spokeToCarpenterBossWifeAsChild, value);
  }

  get spokeToManInImpasHouseAsAdult(): boolean {
    return this.getBit(OtherFlags.spokeToManInImpasHouseAsAdult);
  }
  set spokeToManInImpasHouseAsAdult(value: boolean) {
    this.setBit(OtherFlags.spokeToManInImpasHouseAsAdult, value);
  }

  get spokeToManInImpasHouseAtNight(): boolean {
    return this.getBit(OtherFlags.spokeToManInImpasHouseAtNight);
  }
  set spokeToManInImpasHouseAtNight(value: boolean) {
    this.setBit(OtherFlags.spokeToManInImpasHouseAtNight, value);
  }

  get spokeToManInImpasHouseInDay(): boolean {
    return this.getBit(OtherFlags.spokeToManInImpasHouseInDay);
  }
  set spokeToManInImpasHouseInDay(value: boolean) {
    this.setBit(OtherFlags.spokeToManInImpasHouseInDay, value);
  }

  get runningManSuggestedARace(): boolean {
    return this.getBit(OtherFlags.runningManSuggestedARace);
  }
  set runningManSuggestedARace(value: boolean) {
    this.setBit(OtherFlags.runningManSuggestedARace, value);
  }

  get spokeToGreenCarpenterInTent(): boolean {
    return this.getBit(OtherFlags.spokeToGreenCarpenterInTent);
  }
  set spokeToGreenCarpenterInTent(value: boolean) {
    this.setBit(OtherFlags.spokeToGreenCarpenterInTent, value);
  }

  get spokeToBlueCarpenterInTent(): boolean {
    return this.getBit(OtherFlags.spokeToBlueCarpenterInTent);
  }
  set spokeToBlueCarpenterInTent(value: boolean) {
    this.setBit(OtherFlags.spokeToBlueCarpenterInTent, value);
  }

  get spokeToCarpenterBossInKakariko(): boolean {
    return this.getBit(OtherFlags.spokeToCarpenterBossInKakariko);
  }
  set spokeToCarpenterBossInKakariko(value: boolean) {
    this.setBit(OtherFlags.spokeToCarpenterBossInKakariko, value);
  }

  get spokeToCarpenterBossInValley(): boolean {
    return this.getBit(OtherFlags.spokeToCarpenterBossInValley);
  }
  set spokeToCarpenterBossInValley(value: boolean) {
    this.setBit(OtherFlags.spokeToCarpenterBossInValley, value);
  }

  get caughtCuccoBehindPotionShop(): boolean {
    return this.getBit(OtherFlags.caughtCuccoBehindPotionShop);
  }
  set caughtCuccoBehindPotionShop(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoBehindPotionShop, value);
  }

  get caughtCuccoNearSkulltulaHouse(): boolean {
    return this.getBit(OtherFlags.caughtCuccoNearSkulltulaHouse);
  }
  set caughtCuccoNearSkulltulaHouse(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoNearSkulltulaHouse, value);
  }

  get caughtCuccoInCrate(): boolean {
    return this.getBit(OtherFlags.caughtCuccoInCrate);
  }
  set caughtCuccoInCrate(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoInCrate, value);
  }

  get caughtCuccoBehindWindmill(): boolean {
    return this.getBit(OtherFlags.caughtCuccoBehindWindmill);
  }
  set caughtCuccoBehindWindmill(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoBehindWindmill, value);
  }

  get caughtCuccoNearCuccoPen(): boolean {
    return this.getBit(OtherFlags.caughtCuccoNearCuccoPen);
  }
  set caughtCuccoNearCuccoPen(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoNearCuccoPen, value);
  }

  get caughtCuccoNearBazaar(): boolean {
    return this.getBit(OtherFlags.caughtCuccoNearBazaar);
  }
  set caughtCuccoNearBazaar(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoNearBazaar, value);
  }

  get caughtCuccoNearHyruleFieldEntrance(): boolean {
    return this.getBit(OtherFlags.caughtCuccoNearHyruleFieldEntrance);
  }
  set caughtCuccoNearHyruleFieldEntrance(value: boolean) {
    this.setBit(OtherFlags.caughtCuccoNearHyruleFieldEntrance, value);
  }

  get obtainedMagicContainer(): boolean {
    return this.getBit(OtherFlags.obtainedMagicContainer);
  }
  set obtainedMagicContainer(value: boolean) {
    this.setBit(OtherFlags.obtainedMagicContainer, value);
  }

  get spokeToCursedManWith10Tokens(): boolean {
    return this.getBit(OtherFlags.spokeToCursedManWith10Tokens);
  }
  set spokeToCursedManWith10Tokens(value: boolean) {
    this.setBit(OtherFlags.spokeToCursedManWith10Tokens, value);
  }

  get metCursedManInSkulltulaHouse(): boolean {
    return this.getBit(OtherFlags.metCursedManInSkulltulaHouse);
  }
  set metCursedManInSkulltulaHouse(value: boolean) {
    this.setBit(OtherFlags.metCursedManInSkulltulaHouse, value);
  }

  get obtainedGrottoDekuNutUpgrade(): boolean {
    return this.getBit(OtherFlags.obtainedGrottoDekuNutUpgrade);
  }
  set obtainedGrottoDekuNutUpgrade(value: boolean) {
    this.setBit(OtherFlags.obtainedGrottoDekuNutUpgrade, value);
  }

  get obtainedLostWoodsDekuStickUpgrade(): boolean {
    return this.getBit(OtherFlags.obtainedLostWoodsDekuStickUpgrade);
  }
  set obtainedLostWoodsDekuStickUpgrade(value: boolean) {
    this.setBit(OtherFlags.obtainedLostWoodsDekuStickUpgrade, value);
  }

  get obtainedHeartPieceForFindingRichard(): boolean {
    return this.getBit(OtherFlags.obtainedHeartPieceForFindingRichard);
  }
  set obtainedHeartPieceForFindingRichard(value: boolean) {
    this.setBit(OtherFlags.obtainedHeartPieceForFindingRichard, value);
  }

  get obtainedGerudoArcheryHeartPiece(): boolean {
    return this.getBit(OtherFlags.obtainedGerudoArcheryHeartPiece);
  }
  set obtainedGerudoArcheryHeartPiece(value: boolean) {
    this.setBit(OtherFlags.obtainedGerudoArcheryHeartPiece, value);
  }

  get enteredGanonsCastleCollapsing(): boolean {
    return this.getBit(OtherFlags.enteredGanonsCastleCollapsing);
  }
  set enteredGanonsCastleCollapsing(value: boolean) {
    this.setBit(OtherFlags.enteredGanonsCastleCollapsing, value);
  }

  get enteredGanonsTowerCollapsing(): boolean {
    return this.getBit(OtherFlags.enteredGanonsTowerCollapsing);
  }
  set enteredGanonsTowerCollapsing(value: boolean) {
    this.setBit(OtherFlags.enteredGanonsTowerCollapsing, value);
  }

  get enteredGanonsCastle(): boolean {
    return this.getBit(OtherFlags.enteredGanonsCastle);
  }
  set enteredGanonsCastle(value: boolean) {
    this.setBit(OtherFlags.enteredGanonsCastle, value);
  }

  get enteredThievesHideout(): boolean {
    return this.getBit(OtherFlags.enteredThievesHideout);
  }
  set enteredThievesHideout(value: boolean) {
    this.setBit(OtherFlags.enteredThievesHideout, value);
  }

  get enteredGerudoTrainingGround(): boolean {
    return this.getBit(OtherFlags.enteredGerudoTrainingGround);
  }
  set enteredGerudoTrainingGround(value: boolean) {
    this.setBit(OtherFlags.enteredGerudoTrainingGround, value);
  }

  get enteredGanonsTower(): boolean {
    return this.getBit(OtherFlags.enteredGanonsTower);
  }
  set enteredGanonsTower(value: boolean) {
    this.setBit(OtherFlags.enteredGanonsTower, value);
  }

  get enteredIceCavern(): boolean {
    return this.getBit(OtherFlags.enteredIceCavern);
  }
  set enteredIceCavern(value: boolean) {
    this.setBit(OtherFlags.enteredIceCavern, value);
  }

  get enteredBottomOfTheWell(): boolean {
    return this.getBit(OtherFlags.enteredBottomOfTheWell);
  }
  set enteredBottomOfTheWell(value: boolean) {
    this.setBit(OtherFlags.enteredBottomOfTheWell, value);
  }

  get enteredShadowTemple(): boolean {
    return this.getBit(OtherFlags.enteredShadowTemple);
  }
  set enteredShadowTemple(value: boolean) {
    this.setBit(OtherFlags.enteredShadowTemple, value);
  }

  get enteredSpiritTemple(): boolean {
    return this.getBit(OtherFlags.enteredSpiritTemple);
  }
  set enteredSpiritTemple(value: boolean) {
    this.setBit(OtherFlags.enteredSpiritTemple, value);
  }

  get enteredWaterTemple(): boolean {
    return this.getBit(OtherFlags.enteredWaterTemple);
  }
  set enteredWaterTemple(value: boolean) {
    this.setBit(OtherFlags.enteredWaterTemple, value);
  }

  get enteredFireTemple(): boolean {
    return this.getBit(OtherFlags.enteredFireTemple);
  }
  set enteredFireTemple(value: boolean) {
    this.setBit(OtherFlags.enteredFireTemple, value);
  }

  get enteredForestTemple(): boolean {
    return this.getBit(OtherFlags.enteredForestTemple);
  }
  set enteredForestTemple(value: boolean) {
    this.setBit(OtherFlags.enteredForestTemple, value);
  }

  get enteredJabuJabusBelly(): boolean {
    return this.getBit(OtherFlags.enteredJabuJabusBelly);
  }
  set enteredJabuJabusBelly(value: boolean) {
    this.setBit(OtherFlags.enteredJabuJabusBelly, value);
  }

  get enteredDodongosCavern(): boolean {
    return this.getBit(OtherFlags.enteredDodongosCavern);
  }
  set enteredDodongosCavern(value: boolean) {
    this.setBit(OtherFlags.enteredDodongosCavern, value);
  }

  get enteredDekuTree(): boolean {
    return this.getBit(OtherFlags.enteredDekuTree);
  }
  set enteredDekuTree(value: boolean) {
    this.setBit(OtherFlags.enteredDekuTree, value);
  }

  get swordlessMasterSwordKnockedAway(): boolean {
    return this.getBit(OtherFlags.swordlessMasterSwordKnockedAway);
  }
  set swordlessMasterSwordKnockedAway(value: boolean) {
    this.setBit(OtherFlags.swordlessMasterSwordKnockedAway, value);
  }
}
