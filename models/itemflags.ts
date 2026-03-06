import { Flags } from "./flags.ts";

export class ItemFlags extends Flags<Uint8Array> {
  static readonly obtainedGerudoQuiverUpgrade = { byte: 0, bit: 7 };
  static readonly obtainedKakarikoQuiverUpgrade = { byte: 0, bit: 6 };
  static readonly obtainedBottleFromCuccoLady = { byte: 0, bit: 4 };
  static readonly obtainedHeartPieceFromGrottoScrub = { byte: 0, bit: 3 };
  static readonly boughtUpperLeftBombchuRightShelf = { byte: 0, bit: 2 };
  static readonly boughtLowerLeftBombchuLeftShelf = { byte: 0, bit: 1 };
  static readonly boughtUpperRightBombchuLeftShelf = { byte: 0, bit: 0 };

  static readonly boughtLowerRightBombchuRightShelf = { byte: 1, bit: 7 };
  static readonly boughtLowerLeftBombchuRightShelf = { byte: 1, bit: 6 };
  static readonly boughtUpperLeftBombchuLeftShelf = { byte: 1, bit: 5 };
  static readonly boughtLowerRightBombchuLeftShelf = { byte: 1, bit: 4 };
  static readonly boughtUpperRightBombchuRightShelf = { byte: 1, bit: 3 };
  static readonly obtainedSuperCuccoMilkBottle = { byte: 1, bit: 2 };

  static readonly obtainedStageDekuNutUpgrade = { byte: 2, bit: 7 };
  static readonly obtainedStageDekuStickUpgrade = { byte: 2, bit: 6 };
  static readonly obtainedDekuSeedBagUpgrade = { byte: 2, bit: 5 };
  static readonly obtainedNayrusLove = { byte: 2, bit: 2 };
  static readonly obtainedDinsFire = { byte: 2, bit: 1 };
  static readonly obtainedFaroresWind = { byte: 2, bit: 0 };

  static readonly obtainedHeartPieceFromSkullkids = { byte: 3, bit: 7 };
  static readonly obtainedHeartPieceFromSkullkid = { byte: 3, bit: 6 };
  static readonly obtainedHeartPieceFromManOnRoof = { byte: 3, bit: 5 };
  static readonly obtainedDekuSeedsItem = { byte: 3, bit: 3 };
  static readonly obtainedHeartPieceFromLakeResearcher = { byte: 3, bit: 0 };

  static readonly obtainedCojiroFromCuccoLady = { byte: 4, bit: 6 };
  static readonly obtainedPocketEggFromCuccoLady = { byte: 4, bit: 4 };
  static readonly obtainedMaskOfTruthFromMaskShop = { byte: 4, bit: 2 };

  static readonly obtainedBunnyHood = { byte: 5, bit: 6 };
  static readonly obtainedSpookyMask = { byte: 5, bit: 5 };
  static readonly obtainedSkullMask = { byte: 5, bit: 4 };
  static readonly obtainedKeatonMask = { byte: 5, bit: 3 };

  static readonly obtainedMaskOfTruthTradeFlag = { byte: 6, bit: 7 };
  static readonly soldBunnyHoodUnlockedExtraMasks = { byte: 6, bit: 3 };
  static readonly soldSpookyMaskUnlockedBunnyHood = { byte: 6, bit: 2 };
  static readonly soldSkullMaskUnlockedSpookyMask = { byte: 6, bit: 1 };
  static readonly soldKeatonMaskUnlockedSkullMask = { byte: 6, bit: 0 };

  static readonly obtainedPoachersSawFromFado = { byte: 7, bit: 1 };
  static readonly obtainedOddPotionFromGranny = { byte: 7, bit: 0 };

  protected override get minElements(): number {
    return 8;
  }

  protected createArray(length: number): Uint8Array {
    return new Uint8Array(length);
  }

  get obtainedGerudoQuiverUpgrade(): boolean {
    return this.getBit(ItemFlags.obtainedGerudoQuiverUpgrade);
  }
  set obtainedGerudoQuiverUpgrade(value: boolean) {
    this.setBit(ItemFlags.obtainedGerudoQuiverUpgrade, value);
  }

  get obtainedKakarikoQuiverUpgrade(): boolean {
    return this.getBit(ItemFlags.obtainedKakarikoQuiverUpgrade);
  }
  set obtainedKakarikoQuiverUpgrade(value: boolean) {
    this.setBit(ItemFlags.obtainedKakarikoQuiverUpgrade, value);
  }

  get obtainedBottleFromCuccoLady(): boolean {
    return this.getBit(ItemFlags.obtainedBottleFromCuccoLady);
  }
  set obtainedBottleFromCuccoLady(value: boolean) {
    this.setBit(ItemFlags.obtainedBottleFromCuccoLady, value);
  }

  get obtainedHeartPieceFromGrottoScrub(): boolean {
    return this.getBit(ItemFlags.obtainedHeartPieceFromGrottoScrub);
  }
  set obtainedHeartPieceFromGrottoScrub(value: boolean) {
    this.setBit(ItemFlags.obtainedHeartPieceFromGrottoScrub, value);
  }

  get boughtUpperLeftBombchuRightShelf(): boolean {
    return this.getBit(ItemFlags.boughtUpperLeftBombchuRightShelf);
  }
  set boughtUpperLeftBombchuRightShelf(value: boolean) {
    this.setBit(ItemFlags.boughtUpperLeftBombchuRightShelf, value);
  }

  get boughtLowerLeftBombchuLeftShelf(): boolean {
    return this.getBit(ItemFlags.boughtLowerLeftBombchuLeftShelf);
  }
  set boughtLowerLeftBombchuLeftShelf(value: boolean) {
    this.setBit(ItemFlags.boughtLowerLeftBombchuLeftShelf, value);
  }

  get boughtUpperRightBombchuLeftShelf(): boolean {
    return this.getBit(ItemFlags.boughtUpperRightBombchuLeftShelf);
  }
  set boughtUpperRightBombchuLeftShelf(value: boolean) {
    this.setBit(ItemFlags.boughtUpperRightBombchuLeftShelf, value);
  }

  get boughtLowerRightBombchuRightShelf(): boolean {
    return this.getBit(ItemFlags.boughtLowerRightBombchuRightShelf);
  }
  set boughtLowerRightBombchuRightShelf(value: boolean) {
    this.setBit(ItemFlags.boughtLowerRightBombchuRightShelf, value);
  }

  get boughtLowerLeftBombchuRightShelf(): boolean {
    return this.getBit(ItemFlags.boughtLowerLeftBombchuRightShelf);
  }
  set boughtLowerLeftBombchuRightShelf(value: boolean) {
    this.setBit(ItemFlags.boughtLowerLeftBombchuRightShelf, value);
  }

  get boughtUpperLeftBombchuLeftShelf(): boolean {
    return this.getBit(ItemFlags.boughtUpperLeftBombchuLeftShelf);
  }
  set boughtUpperLeftBombchuLeftShelf(value: boolean) {
    this.setBit(ItemFlags.boughtUpperLeftBombchuLeftShelf, value);
  }

  get boughtLowerRightBombchuLeftShelf(): boolean {
    return this.getBit(ItemFlags.boughtLowerRightBombchuLeftShelf);
  }
  set boughtLowerRightBombchuLeftShelf(value: boolean) {
    this.setBit(ItemFlags.boughtLowerRightBombchuLeftShelf, value);
  }

  get boughtUpperRightBombchuRightShelf(): boolean {
    return this.getBit(ItemFlags.boughtUpperRightBombchuRightShelf);
  }
  set boughtUpperRightBombchuRightShelf(value: boolean) {
    this.setBit(ItemFlags.boughtUpperRightBombchuRightShelf, value);
  }

  get obtainedSuperCuccoMilkBottle(): boolean {
    return this.getBit(ItemFlags.obtainedSuperCuccoMilkBottle);
  }
  set obtainedSuperCuccoMilkBottle(value: boolean) {
    this.setBit(ItemFlags.obtainedSuperCuccoMilkBottle, value);
  }

  get obtainedStageDekuNutUpgrade(): boolean {
    return this.getBit(ItemFlags.obtainedStageDekuNutUpgrade);
  }
  set obtainedStageDekuNutUpgrade(value: boolean) {
    this.setBit(ItemFlags.obtainedStageDekuNutUpgrade, value);
  }

  get obtainedStageDekuStickUpgrade(): boolean {
    return this.getBit(ItemFlags.obtainedStageDekuStickUpgrade);
  }
  set obtainedStageDekuStickUpgrade(value: boolean) {
    this.setBit(ItemFlags.obtainedStageDekuStickUpgrade, value);
  }

  get obtainedDekuSeedBagUpgrade(): boolean {
    return this.getBit(ItemFlags.obtainedDekuSeedBagUpgrade);
  }
  set obtainedDekuSeedBagUpgrade(value: boolean) {
    this.setBit(ItemFlags.obtainedDekuSeedBagUpgrade, value);
  }

  get obtainedNayrusLove(): boolean {
    return this.getBit(ItemFlags.obtainedNayrusLove);
  }
  set obtainedNayrusLove(value: boolean) {
    this.setBit(ItemFlags.obtainedNayrusLove, value);
  }

  get obtainedDinsFire(): boolean {
    return this.getBit(ItemFlags.obtainedDinsFire);
  }
  set obtainedDinsFire(value: boolean) {
    this.setBit(ItemFlags.obtainedDinsFire, value);
  }

  get obtainedFaroresWind(): boolean {
    return this.getBit(ItemFlags.obtainedFaroresWind);
  }
  set obtainedFaroresWind(value: boolean) {
    this.setBit(ItemFlags.obtainedFaroresWind, value);
  }

  get obtainedHeartPieceFromSkullkids(): boolean {
    return this.getBit(ItemFlags.obtainedHeartPieceFromSkullkids);
  }
  set obtainedHeartPieceFromSkullkids(value: boolean) {
    this.setBit(ItemFlags.obtainedHeartPieceFromSkullkids, value);
  }

  get obtainedHeartPieceFromSkullkid(): boolean {
    return this.getBit(ItemFlags.obtainedHeartPieceFromSkullkid);
  }
  set obtainedHeartPieceFromSkullkid(value: boolean) {
    this.setBit(ItemFlags.obtainedHeartPieceFromSkullkid, value);
  }

  get obtainedHeartPieceFromManOnRoof(): boolean {
    return this.getBit(ItemFlags.obtainedHeartPieceFromManOnRoof);
  }
  set obtainedHeartPieceFromManOnRoof(value: boolean) {
    this.setBit(ItemFlags.obtainedHeartPieceFromManOnRoof, value);
  }

  get obtainedDekuSeedsItem(): boolean {
    return this.getBit(ItemFlags.obtainedDekuSeedsItem);
  }
  set obtainedDekuSeedsItem(value: boolean) {
    this.setBit(ItemFlags.obtainedDekuSeedsItem, value);
  }

  get obtainedHeartPieceFromLakeResearcher(): boolean {
    return this.getBit(ItemFlags.obtainedHeartPieceFromLakeResearcher);
  }
  set obtainedHeartPieceFromLakeResearcher(value: boolean) {
    this.setBit(ItemFlags.obtainedHeartPieceFromLakeResearcher, value);
  }

  get obtainedCojiroFromCuccoLady(): boolean {
    return this.getBit(ItemFlags.obtainedCojiroFromCuccoLady);
  }
  set obtainedCojiroFromCuccoLady(value: boolean) {
    this.setBit(ItemFlags.obtainedCojiroFromCuccoLady, value);
  }

  get obtainedPocketEggFromCuccoLady(): boolean {
    return this.getBit(ItemFlags.obtainedPocketEggFromCuccoLady);
  }
  set obtainedPocketEggFromCuccoLady(value: boolean) {
    this.setBit(ItemFlags.obtainedPocketEggFromCuccoLady, value);
  }

  get obtainedMaskOfTruthFromMaskShop(): boolean {
    return this.getBit(ItemFlags.obtainedMaskOfTruthFromMaskShop);
  }
  set obtainedMaskOfTruthFromMaskShop(value: boolean) {
    this.setBit(ItemFlags.obtainedMaskOfTruthFromMaskShop, value);
  }

  get obtainedBunnyHood(): boolean {
    return this.getBit(ItemFlags.obtainedBunnyHood);
  }
  set obtainedBunnyHood(value: boolean) {
    this.setBit(ItemFlags.obtainedBunnyHood, value);
  }

  get obtainedSpookyMask(): boolean {
    return this.getBit(ItemFlags.obtainedSpookyMask);
  }
  set obtainedSpookyMask(value: boolean) {
    this.setBit(ItemFlags.obtainedSpookyMask, value);
  }

  get obtainedSkullMask(): boolean {
    return this.getBit(ItemFlags.obtainedSkullMask);
  }
  set obtainedSkullMask(value: boolean) {
    this.setBit(ItemFlags.obtainedSkullMask, value);
  }

  get obtainedKeatonMask(): boolean {
    return this.getBit(ItemFlags.obtainedKeatonMask);
  }
  set obtainedKeatonMask(value: boolean) {
    this.setBit(ItemFlags.obtainedKeatonMask, value);
  }

  get obtainedMaskOfTruthTradeFlag(): boolean {
    return this.getBit(ItemFlags.obtainedMaskOfTruthTradeFlag);
  }
  set obtainedMaskOfTruthTradeFlag(value: boolean) {
    this.setBit(ItemFlags.obtainedMaskOfTruthTradeFlag, value);
  }

  get soldBunnyHoodUnlockedExtraMasks(): boolean {
    return this.getBit(ItemFlags.soldBunnyHoodUnlockedExtraMasks);
  }
  set soldBunnyHoodUnlockedExtraMasks(value: boolean) {
    this.setBit(ItemFlags.soldBunnyHoodUnlockedExtraMasks, value);
  }

  get soldSpookyMaskUnlockedBunnyHood(): boolean {
    return this.getBit(ItemFlags.soldSpookyMaskUnlockedBunnyHood);
  }
  set soldSpookyMaskUnlockedBunnyHood(value: boolean) {
    this.setBit(ItemFlags.soldSpookyMaskUnlockedBunnyHood, value);
  }

  get soldSkullMaskUnlockedSpookyMask(): boolean {
    return this.getBit(ItemFlags.soldSkullMaskUnlockedSpookyMask);
  }
  set soldSkullMaskUnlockedSpookyMask(value: boolean) {
    this.setBit(ItemFlags.soldSkullMaskUnlockedSpookyMask, value);
  }

  get soldKeatonMaskUnlockedSkullMask(): boolean {
    return this.getBit(ItemFlags.soldKeatonMaskUnlockedSkullMask);
  }
  set soldKeatonMaskUnlockedSkullMask(value: boolean) {
    this.setBit(ItemFlags.soldKeatonMaskUnlockedSkullMask, value);
  }

  get obtainedPoachersSawFromFado(): boolean {
    return this.getBit(ItemFlags.obtainedPoachersSawFromFado);
  }
  set obtainedPoachersSawFromFado(value: boolean) {
    this.setBit(ItemFlags.obtainedPoachersSawFromFado, value);
  }

  get obtainedOddPotionFromGranny(): boolean {
    return this.getBit(ItemFlags.obtainedOddPotionFromGranny);
  }
  set obtainedOddPotionFromGranny(value: boolean) {
    this.setBit(ItemFlags.obtainedOddPotionFromGranny, value);
  }
}
