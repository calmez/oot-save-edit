import { toNumber, toUint8Array } from "../utils/conversions.ts";
import { OotText } from "../utils/text.ts";
import {
  Entrance,
  EntranceFromRoomWithEntrance,
  EntranceFromScene,
  Room,
  RoomFromRoomWithEntrance,
  RoomFromScene,
  RoomWithEntrance,
  Scene,
  SceneFrom,
  Time,
} from "./scene.ts";

export enum Age {
  Child = 0x00,
  Adult = 0x01,
  Invalid,
}

export enum MagicAmount {
  Empty = 0x00,
  Half = 0x30,
  Full = 0x60,
}

export enum InventoryItems {
  DekuStick = 0x01,
  DekuNut = 0x02,
  Bomb = 0x03,
  RegularArrow = 0x03,
  FireArrowUpgrade = 0x04,
  DinsFire = 0x05,
  Slingshot = 0x06,
  FairyOcarina = 0x07,
  OcarinaofTime = 0x08,
  Bombchu = 0x09,
  Hookshot = 0x0A,
  Longshot = 0x0B,
  IceArrow = 0x0C,
  FaroresWind = 0x0D,
  Boomerang = 0x0E,
  LensofTruth = 0x0F,
  MagicBeans = 0x10,
  MegatonHammer = 0x11,
  LightArrow = 0x12,
  NayrusLove = 0x13,
  EmptyBottle = 0x14,
  RedPotion = 0x15,
  GreenPotion = 0x16,
  BluePotion = 0x17,
  Fairy = 0x18,
  Fish = 0x19,
  Milk = 0x1A,
  LetterinaBottle = 0x1B,
  BlueFire = 0x1C,
  Bug = 0x1D,
  BigPoe = 0x1E,
  LonLonMilkHalf = 0x1F,
  Poe = 0x20,
  WeirdEgg = 0x21,
  Chicken = 0x22,
  ZeldasLetter = 0x23,
  KeatonMask = 0x24,
  SkullMask = 0x25,
  SpokyMask = 0x26,
  BunnyHood = 0x27,
  GoronMask = 0x28,
  ZoraMask = 0x29,
  GerudoMask = 0x2A,
  MaskofTruth = 0x2B,
  SoldOutSign = 0x2C,
  PocketEgg = 0x2D,
  PocketCucco = 0x2E,
  Cojiro = 0x2F,
  OldMushroom = 0x30,
  OddPotion = 0x31,
  PoachersSaw = 0x32,
  GoronsSwordBroken = 0x33,
  Prescription = 0x34,
  EyeballFrog = 0x35,
  EyeDrops = 0x36,
  ClaimCheck = 0x37,
  FireArrowPoweredUp = 0x38,
  IceArrowPoweredUp = 0x39,
  LightArrowPoweredUp = 0x3A,
}

export enum Sword {
  //Kokiri = 0x3B,
  //Master = 0x3C,
  //GiantKnife = 0x3D,
  KokiriSword = 0x0001,
  MasterSword = 0x0002,
  GiantKnife = 0x0004,
}

export enum Shield {
  //Kokiri = 0x3E,
  //Hylian = 0x3F,
  //Mirror = 0x40,
  KokiriShield = 0x0010,
  HylianShield = 0x0020,
  MirrorShield = 0x0040,
}

export enum Tunic {
  //Kokiri = 0x41,
  //Goron = 0x42,
  //Zora = 0x43,
  KokiriTunic = 0x0100,
  GoronTunic = 0x0200,
  ZoraTunic = 0x0400,
}

export enum Boots {
  //Kokiri = 0x44,
  //Iron = 0x45,
  //Hover = 0x46,
  KokiriBoots = 0x1000,
  IronBoots = 0x2000,
  HoverBoots = 0x4000,
}

export type EquippableItems =
  | Sword
  | Shield
  | Tunic
  | Boots;
export const EquippableItems = {
  ...Sword,
  ...Shield,
  ...Tunic,
  ...Boots,
};

//export enum BulletBag {
//  BulletBagHolds30 = 0x47,
//  BulletBagHolds40 = 0x48,
//  BulletBagHolds50 = 0x49,
//}
//
//export enum Quiver {
//  QuiverHolds30 = 0x4A,
//  QuiverHolds40 = 0x4B,
//  QuiverHolds50 = 0x4C,
//}
//
//export enum BombBag {
//  BombBagHolds20 = 0x4D,
//  BombBagHolds30 = 0x4E,
//  BombBagHolds40 = 0x4F,
//}
//
//export enum OtherEquipment {
//  GoronsBracelet = 0x50,
//  SilverGauntlets = 0x51,
//  GoldenGauntlets = 0x52,
//  SilverScale = 0x53,
//  GoldenScale = 0x54,
//  GiantsKnifeBroken = 0x55,
//  BombBagJapaneseName = 0x56,
//  BombBag2JapaneseName = 0x57,
//  SlingShotBulletsJapaneseName = 0x58,
//  FishingRodJapaneseName = 0x59,
//}

export enum DekuNutUpgrades {
  DekuNutUpgradeHolds30Nuts = 0x0010_0000,
  DekuNutUpgradeHolds40Nuts = 0x0020_0000,
}

export enum DekuStickUpgrades {
  DekuStickUpgradeHolds20Sticks = 0x0002_0000,
  DekuStickUpgradeHolds30Sticks = 0x0004_0000,
}

export enum BulletBag {
  BulletBagHolds30 = 0x0000_4000,
  BulletBagHolds40 = 0x0000_8000,
  BulletBagHolds50 = 0x0001_0000,
}

export enum Wallet {
  WalletHolds200 = 0x0000_1000,
  WalletHolds500 = 0x0000_2000,
}

export enum DiveMeter {
  SilverScale = 0x0000_0200,
  GoldenScale = 0x0000_0400,
}

export enum StrengthUpgrades {
  SilverGauntlets = 0x0000_0040,
  GoldenGauntlets = 0x0000_0080,
}

export enum BombBag {
  BombBagHolds20 = 0x0000_0008,
  BombBagHolds30 = 0x0000_0010,
  BombBagHolds40 = 0x0000_0020,
}

export enum Quiver {
  QuiverHolds30 = 0x0000_0001,
  QuiverHolds40 = 0x0000_0002,
  QuiverHolds50 = 0x0000_0004,
}

export type ObtainableUpgrades =
  | DekuNutUpgrades
  | DekuStickUpgrades
  | BulletBag
  | Wallet
  | DiveMeter
  | StrengthUpgrades
  | BombBag
  | Quiver;

export const ObtainableUpgrades = {
  ...DekuNutUpgrades,
  ...DekuStickUpgrades,
  ...BulletBag,
  ...Wallet,
  ...DiveMeter,
  ...StrengthUpgrades,
  ...BombBag,
  ...Quiver,
};

//export enum QuestItems {
//  MinuetofForest = 0x5A,
//  BoleroofFire = 0x5B,
//  SerenadeofWater = 0x5C,
//  RequiemofSpirit = 0x5D,
//  NocturneofShadow = 0x5E,
//  PreludeofLight = 0x5F,
//  ZeldasLullaby = 0x60,
//  EponasSong = 0x61,
//  SariasSong = 0x62,
//  SunsSong = 0x63,
//  SongofTime = 0x64,
//  SongofStorms = 0x65,
//  ForestMedallion = 0x66,
//  FireMedallion = 0x67,
//  WaterMedallion = 0x68,
//  SpiritMedallion = 0x69,
//  ShadowMedallion = 0x6A,
//  LightMedallion = 0x6B,
//  KokirisEmerald = 0x6C,
//  GoronsRuby = 0x6D,
//  ZorasSapphire = 0x6E,
//  StoneofAgony = 0x6F,
//  GerudosCard = 0x70,
//  GoldSkulltula = 0x71,
//  HeartContainer = 0x72,
//  PieceofHeart = 0x73,
//}

export enum Medallions {
  ForestMedallion = 0x0000_0001,
  FireMedallion = 0x0000_0002,
  WaterMedallion = 0x0000_0004,
  SpiritMedallion = 0x0000_0008,
  ShadowMedallion = 0x0000_0010,
  LightMedallion = 0x0000_0020,
}

export enum Songs {
  MinuetofForest = 0x0000_0040,
  BoleroofFire = 0x0000_0080,
  SerenadeofWater = 0x0000_0100,
  RequiemofSpirit = 0x0000_0200,
  NocturneofShadow = 0x0000_0400,
  PreludeofLight = 0x0000_0800,
  ZeldasLullaby = 0x0000_1000,
  EponasSong = 0x0000_2000,
  SariasSong = 0x0000_4000,
  SunsSong = 0x0000_8000,
  SongofTime = 0x0001_0000,
  SongofStorms = 0x0002_0000,
}

export enum SpiritualStones {
  KokirisEmerald = 0x0004_0000,
  GoronsRuby = 0x0008_0000,
  ZorasSapphire = 0x0010_0000,
  StoneofAgony = 0x0020_0000,
}

export enum Tokens {
  GerudosCard = 0x0040_0000,
  GoldSkulltulaToken = 0x0080_0000,
}

export type QuestItems = Medallions | Songs | SpiritualStones | Tokens;
export const QuestItems = {
  ...Medallions,
  ...Songs,
  ...SpiritualStones,
  ...Tokens,
};

export enum DungeonItems {
  BigKey = 0x74,
  Compass = 0x75,
  DungeonMap = 0x76,
  SmallKey = 0x77,
}

export enum Collecibles {
  SmallMagicJar = 0x78,
  LargeMagicJar = 0x79,
  PieceofHeart = 0x7A,
}

export enum RemovedItems {
  Item1 = 0x7B,
  Item2 = 0x7C,
  Item3 = 0x7D,
  Item4 = 0x7E,
  Item5 = 0x7F,
  Item6 = 0x80,
  Item7 = 0x81,
}

export enum OtherItems {
  LonLonMilk = 0x82,
  RecoveryHeart = 0x83,
  GreenRupee = 0x84,
  BlueRupee = 0x85,
  RedRupee = 0x86,
  PurpleRupee = 0x87,
  HugeRupee = 0x88,
  Removed = 0x89,
  DekuSticks5 = 0x8A,
  DekuSticks10 = 0x8B,
  DekuNuts5 = 0x8C,
  DekuNuts10 = 0x8D,
  Bombs5 = 0x8E,
  Bombs10 = 0x8F,
  Bombs20 = 0x90,
  Bombs30 = 0x91,
  Arrows5or10 = 0x92,
  Arrows10or30 = 0x93,
  Arrows30or50 = 0x94,
  DekuSeeds30 = 0x95,
  Bombchu5 = 0x96,
  Bombchu20 = 0x97,
  DekuStickUpgradeHolds20Sticks = 0x98,
  DekuStickUpgradeHolds30Sticks = 0x99,
  DekuNutUpgradeHolds30Nuts = 0x9A,
  DekuNutUpgradeHolds40Nuts = 0x9B,
  Empty = 0xFF,
}

export interface ButtonEquips {
  bButton: InventoryItems;
  cLeftButton: InventoryItems;
  cDownButton: InventoryItems;
  cRightButton: InventoryItems;
  cLeftOffset: number; // TODO what's the correct data type here?
  cDownOffset: number; // TODO what's the correct data type here?
  cRightOffset: number; // TODO what's the correct data type here?
}

export interface CurrentEquipment {
  sword: Sword;
  shield: Shield;
  tunic: Tunic;
  boots: Boots;
}

export interface FaroresWindWarp {
  x: number;
  y: number;
  z: number;
  yRotation: number;
}

export class SaveSlot {
  public static get requiredSize(): number {
    return 0x1450;
  }

  private static get validCheckPattern(): Uint8Array {
    const encoder = new TextEncoder();
    return new Uint8Array([...encoder.encode("ZELDAZ")]);
  }

  constructor(private bytes: Uint8Array = new Uint8Array(0x1450)) {
    if (bytes.length != SaveSlot.requiredSize) {
      throw Error(
        `Save header needs to be of length ${SaveSlot.requiredSize}, got ${bytes.length}`,
      );
    }
  }

  get data(): Uint8Array {
    return this.bytes;
  }

  get entranceIndex(): number {
    return toNumber(this.bytes.slice(0x0000, 0x0000 + 4));
  }

  set entranceIndex(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x0000);
  }

  get age(): Age {
    const age: number = toNumber(this.bytes.slice(0x0004, 0x0004 + 4));

    switch (age) {
      case 0:
        return Age.Child;
      case 1:
        return Age.Adult;
      default:
        return Age.Invalid;
    }
  }

  set age(value: Age) {
    this.bytes.set(toUint8Array(value, 4), 0x0004);
  }

  get cutSceneNumber(): number {
    return toNumber(this.bytes.slice(0x000A, 0x000A + 2));
  }

  set cutSceneNumber(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x000A);
  }

  get worldTime(): number {
    return toNumber(this.bytes.slice(0x000C, 0x000C + 2));
  }

  set worldTime(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x000C);
  }

  get nightFlag(): Time {
    return toNumber(this.bytes.slice(0x0010, 0x0010 + 4));
  }

  set nightFlag(value: Time) {
    this.bytes.set(toUint8Array(value, 4), 0x0010);
  }

  private get checkPattern(): Uint8Array {
    return this.bytes.slice(0x001C, 0x001C + 6);
  }

  private set checkPattern(value: Uint8Array) {
    if (value.length != 6) {
      throw Error(
        `Padding data needs to be 6 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x001C);
  }

  get deathCounter(): number {
    return toNumber(this.bytes.slice(0x0022, 0x0022 + 2));
  }

  set deathCounter(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0022);
  }

  get playerName(): string {
    const data = this.bytes.slice(0x0024, 0x0024 + 8);
    return new OotText().decode(data);
  }

  set playerName(value: string) {
    if (value.length > 8) {
      new Error(
        `Player name only supports up to 8 characters, ${value.length} given`,
      );
    }
    const data = new OotText().encode(value);
    this.bytes.set(data, 0x0024);
  }

  get ddOnly(): boolean {
    const value = toNumber(this.bytes.slice(0x002C, 0x002C + 2));
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw Error(
          `ddOnly flag contains corrupt value ${value}. Can only be 0 or 1.`,
        );
    }
  }

  set ddOnly(value: boolean) {
    this.bytes.set(toUint8Array(value, 2), 0x002C);
  }

  get maxHealth(): number {
    return toNumber(this.bytes.slice(0x002E, 0x002E + 2));
  }

  set maxHealth(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x002E);
  }

  get currentHealth(): number {
    return toNumber(this.bytes.slice(0x0030, 0x0030 + 2));
  }

  set currentHealth(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0030);
  }

  get maxMagic(): number {
    return toNumber(this.bytes.slice(0x0032, 0x0032 + 1));
  }

  set maxMagic(value: number) {
    this.bytes.set(toUint8Array(value, 1), 0x0032);
  }

  get currentMagic(): MagicAmount {
    const amount = toNumber(this.bytes.slice(0x0033, 0x0033 + 1));
    switch (amount) {
      case 0x00:
        return MagicAmount.Empty;
      case 0x30:
        return MagicAmount.Half;
      case 0x60:
        return MagicAmount.Full;
      default:
        throw Error(
          `Magic amount contains corrupt value ${amount}. Can only be 0x00, 0x30, or 0x60.`,
        );
    }
  }

  set currentMagic(value: MagicAmount) {
    this.bytes.set(toUint8Array(value, 1), 0x0033);
  }

  get rupees(): number {
    return toNumber(this.bytes.slice(0x0034, 0x0034 + 2));
  }

  set rupees(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0034);
  }

  // TODO needs to be tested assuming previous rupees at 0x0034 with size
  // uint16_t is correct this should start here
  get biggoronsSwordFlag1(): boolean {
    const value = toNumber(this.bytes.slice(0x0036, 0x0036 + 1));
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw Error(
          `biggoronsSwordFlag1 flag contains corrupt value ${value}. Can only be 0 or 1.`,
        );
    }
  }

  set biggoronsSwordFlag1(value: boolean) {
    this.bytes.set(toUint8Array(value, 1), 0x0036);
  }

  get naviTimer(): number {
    return toNumber(this.bytes.slice(0x0038, 0x0038 + 2));
  }

  set naviTimer(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0038);
  }

  get magicFlag1(): boolean {
    const value = toNumber(this.bytes.slice(0x003A, 0x003A + 1));
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw Error(
          `biggoronsSwordFlag1 flag contains corrupt value ${value}. Can only be 0 or 1.`,
        );
    }
  }

  set magicFlag1(value: boolean) {
    this.bytes.set(toUint8Array(value, 1), 0x003A);
  }

  get magicFlag2(): boolean {
    const value = toNumber(this.bytes.slice(0x003C, 0x003C + 1));
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw Error(
          `biggoronsSwordFlag1 flag contains corrupt value ${value}. Can only be 0 or 1.`,
        );
    }
  }

  set magicFlag2(value: boolean) {
    this.bytes.set(toUint8Array(value, 1), 0x003C);
  }

  get biggoronsSwordFlag2(): boolean {
    const value = toNumber(this.bytes.slice(0x003E, 0x003E + 1));
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw Error(
          `biggoronsSwordFlag1 flag contains corrupt value ${value}. Can only be 0 or 1.`,
        );
    }
  }

  set biggoronsSwordFlag2(value: boolean) {
    this.bytes.set(toUint8Array(value, 1), 0x003E);
  }

  set room(value: Room) {
    const entrance = EntranceFromScene(this.savedSceneIndex);
    // TODO figure out cutscene number
    this.savedSceneIndex = SceneFrom(value, entrance, this.age, this.nightFlag);
  }

  get room(): Room {
    return RoomFromScene(this.savedSceneIndex);
  }

  set entrance(value: Entrance) {
    const room = RoomFromScene(this.savedSceneIndex);
    // TODO figure out cutscene number
    this.savedSceneIndex = SceneFrom(room, value, this.age, this.nightFlag);
  }

  get entrance(): Entrance {
    return EntranceFromScene(this.savedSceneIndex);
  }

  set roomWithEntrance(value: RoomWithEntrance) {
    const room = RoomFromRoomWithEntrance(value);
    const entrance = EntranceFromRoomWithEntrance(value);
    // TODO figure out cutscene number
    this.savedSceneIndex = SceneFrom(room, entrance, this.age, this.nightFlag);
  }

  get savedSceneIndex(): Scene {
    return toNumber(this.bytes.slice(0x0066, 0x0066 + 2));
  }

  set savedSceneIndex(value: Scene) {
    this.bytes.set(toUint8Array(value, 2), 0x0066);
  }

  get currentButtonEquips(): ButtonEquips {
    const data = this.bytes.slice(0x0068, 0x0068 + 7);
    return {
      bButton: toNumber(data.slice(0, 1)) as InventoryItems,
      cLeftButton: toNumber(data.slice(1, 2)) as InventoryItems,
      cDownButton: toNumber(data.slice(2, 3)) as InventoryItems,
      cRightButton: toNumber(data.slice(3, 4)) as InventoryItems,
      cLeftOffset: toNumber(data.slice(4, 5)),
      cDownOffset: toNumber(data.slice(5, 6)),
      cRightOffset: toNumber(data.slice(6, 7)),
    };
  }

  set currentButtonEquips(value: ButtonEquips) {
    this.bytes.set(
      new Uint8Array([
        ...toUint8Array(value.bButton, 1),
        ...toUint8Array(value.cLeftButton, 1),
        ...toUint8Array(value.cDownButton, 1),
        ...toUint8Array(value.cRightButton, 1),
        ...toUint8Array(value.cLeftOffset, 1),
        ...toUint8Array(value.cDownOffset, 1),
        ...toUint8Array(value.cRightOffset, 1),
      ]),
      0x0068,
    );
  }

  get bButtonEquip(): InventoryItems {
    return this.currentButtonEquips.bButton;
  }

  set bButtonEquip(value: InventoryItems) {
    this.currentButtonEquips = {
      ...this.currentButtonEquips,
      bButton: value,
    };
  }

  get cLeftButtonEquip(): InventoryItems {
    return this.currentButtonEquips.cLeftButton;
  }

  set cLeftButtonEquip(value: InventoryItems) {
    this.currentButtonEquips = {
      ...this.currentButtonEquips,
      cLeftButton: value,
    };
  }

  get cDownButtonEquip(): InventoryItems {
    return this.currentButtonEquips.cDownButton;
  }

  set cDownButtonEquip(value: InventoryItems) {
    this.currentButtonEquips = {
      ...this.currentButtonEquips,
      cDownButton: value,
    };
  }

  get cRightButtonEquip(): InventoryItems {
    return this.currentButtonEquips.cRightButton;
  }

  set cRightButtonEquip(value: InventoryItems) {
    this.currentButtonEquips = {
      ...this.currentButtonEquips,
      cRightButton: value,
    };
  }

  // TODO do we need helpers for the offsets?

  get currentlyEquippedEquipment(): CurrentEquipment {
    const equipData = toNumber(this.bytes.slice(0x0070, 0x0070 + 2));
    return {
      sword: equipData & 0x000F,
      shield: equipData & 0x00F0,
      tunic: equipData & 0x0F00,
      boots: equipData & 0xF000,
    };
  }

  set currentlyEquippedEquipment(value: CurrentEquipment) {
    const data = value.sword | value.shield | value.tunic | value.boots;
    this.bytes.set(toUint8Array(data, 2), 0x0070);
  }

  get inventory(): Array<InventoryItems> {
    const items: Array<InventoryItems> = Array.from(
      this.bytes.slice(0x0074, 0x0074 + 24),
    );
    return items;
  }

  set inventory(value: Array<InventoryItems>) {
    if (value.length != 24) {
      throw Error(
        `Inventory data needs to be 24 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x0074);
  }

  get inventoryAmounts(): Array<number> {
    const amounts: Array<number> = Array.from(
      this.bytes.slice(0x008C, 0x008C + 0xF),
    );
    return amounts;
  }

  set inventoryAmounts(value: Array<number>) {
    if (value.length != 0xF) {
      throw Error(
        `Inventory amounts data needs to be ${0xF} bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x008C);
  }

  get magicBeans(): number {
    return toNumber(this.bytes.slice(0x009B, 0x009B + 1));
  }

  set magicBeans(value: number) {
    this.bytes.set(toUint8Array(value, 1), 0x009B);
  }

  get obtainedEquipment(): Array<EquippableItems> {
    const obtainedEquipment: Array<EquippableItems> = [];
    const equipmentData = toNumber(this.bytes.slice(0x009C, 0x009C + 2));

    function addIfInData(equipment: EquippableItems) {
      if ((equipmentData & equipment) === equipment) {
        obtainedEquipment.push(equipment);
      }
    }


    Object.values(EquippableItems).map((v) => Number(v)).filter((v) =>
      !Number.isNaN(v)
    ).forEach((equipment) => addIfInData(equipment as EquippableItems));

    return obtainedEquipment;
  }

  set obtainedEquipment(value: Array<EquippableItems>) {
    const data = value.reduce((l, r) => l | r);
    this.bytes.set(toUint8Array(data, 2), 0x009C);
  }

  get obtainedUpgrades(): Array<ObtainableUpgrades> {
    const obtainedUpgrades: Array<ObtainableUpgrades> = [];
    const upgradeData = toNumber(this.bytes.slice(0x00A0, 0x00A0 + 4));

    function addIfInData(upgrade: ObtainableUpgrades) {
      if ((upgradeData & upgrade) === upgrade) {
        obtainedUpgrades.push(upgrade);
      }
    }

    Object.values(ObtainableUpgrades).map((v) => Number(v)).filter((v) =>
      !Number.isNaN(v)
    ).forEach((upgrade) => addIfInData(upgrade as ObtainableUpgrades));

    return obtainedUpgrades;
  }

  set obtainedUpgrades(value: Array<ObtainableUpgrades>) {
    const data = value.reduce((l, r) => l | r);
    this.bytes.set(toUint8Array(data, 4), 0x00A0);
  }

  get questStatusItems(): Array<QuestItems> {
    const obtainedItems: Array<QuestItems> = [];
    const itemData = toNumber(this.bytes.slice(0x00A4, 0x00A4 + 4));

    function addIfInData(item: QuestItems) {
      if ((itemData & item) === item) {
        obtainedItems.push(item);
      }
    }

    Object.values(QuestItems).map((v) => Number(v)).filter((v) =>
      !Number.isNaN(v)
    ).forEach((item) => addIfInData(item as QuestItems));

    return obtainedItems;
  }

  set questStatusItems(value: Array<QuestItems>) {
    const data = value.reduce((l, r) => l | r);
    this.bytes.set(toUint8Array(data, 4), 0x00A4);
  }

  // Indexed by the Scene Index. Each byte contains the following:
  // & 0x01 = Boss Key
  // & 0x02 = Compass
  // & 0x04 = Dungeon Map
  get dungeonItems(): Uint8Array {
    return this.bytes.slice(0x00A8, 0x00A8 + 0x14);
  }

  set dungeonItems(value: Uint8Array) {
    if (value.length != 0x14) {
      throw Error(
        `dungeon items data needs to be ${0x14} bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x00A8);
  }

  get smallKeyAmount(): Uint8Array {
    return this.bytes.slice(0x00BC, 0x00BC + 0x14);
  }

  set smallKeyAmount(value: Uint8Array) {
    if (value.length != 0x14) {
      throw Error(
        `small key amount data needs to be ${0x14} bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x00BC);
  }

  get doubleDefenseHearts(): number {
    return toNumber(this.bytes.slice(0x00CF, 0x00CF + 1));
  }

  set doubleDefenseHearts(value: number) {
    this.bytes.set(toUint8Array(value, 1), 0x00CF);
  }

  get goldSkulltulaTokens(): number {
    return toNumber(this.bytes.slice(0x00D0, 0x00D0 + 2));
  }

  set goldSkulltulaTokens(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x00D0);
  }

  // TODO permanent scene flags at 0x00D4

  private get faroresWindWarpX(): number {
    return toNumber(this.bytes.slice(0x0E64, 0x0E64 + 4));
  }

  private set faroresWindWarpX(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x0E64);
  }

  private get faroresWindWarpY(): number {
    return toNumber(this.bytes.slice(0x0E68, 0x0E68 + 4));
  }

  private set faroresWindWarpY(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x0E68);
  }

  private get faroresWindWarpZ(): number {
    return toNumber(this.bytes.slice(0x0E6C, 0x0E6C + 4));
  }

  private set faroresWindWarpZ(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x0E6C);
  }

  private get faroresWindWarpYRotation(): number {
    return toNumber(this.bytes.slice(0x0E72, 0x0E72 + 2));
  }

  private set faroresWindWarpYRotation(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0E72);
  }

  get faroresWindWarp(): FaroresWindWarp {
    return {
      x: this.faroresWindWarpX,
      y: this.faroresWindWarpY,
      z: this.faroresWindWarpZ,
      yRotation: this.faroresWindWarpYRotation,
    };
  }

  set faroresWindWarp(value: FaroresWindWarp) {
    this.faroresWindWarpX = value.x;
    this.faroresWindWarpY = value.y;
    this.faroresWindWarpZ = value.z;
    this.faroresWindWarpYRotation = value.yRotation;
  }

  // TODO finish proper parsing
  get entranceIndexTransport(): number {
    return toNumber(this.bytes.slice(0x0E7A, 0x0E7A + 2));
  }

  set entranceIndexTransport(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0E7A);
  }

  // TODO check size of data structure
  get mapNumber(): number {
    return toNumber(this.bytes.slice(0x0E7F, 0x0E7F + 1));
  }

  set mapNumber(value: number) {
    this.bytes.set(toUint8Array(value, 1), 0x0E7F);
  }

  // TODO check size of data structure
  // TODO tie into setting the warp point
  get warpPointSet(): boolean {
    const value = toNumber(this.bytes.slice(0x0E83, 0x0E83 + 2));
    switch (value) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        throw Error(
          `warpPointSet flag contains corrupt value ${value}. Can only be 0 or 1.`,
        );
    }
  }

  set warpPointSet(value: boolean) {
    this.bytes.set(toUint8Array(value, 1), 0x0E83);
  }

  get bigPoePoints(): number {
    return toNumber(this.bytes.slice(0x0EBC, 0x0EBC + 4));
  }

  set bigPoePoints(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x0EBC);
  }

  // TODO set eventFlags at 0x0ED4, uint16_t[14]
  // TODO item get flags at 0x0EF0, uint16_t[4]
  // TODO unknown flags at 0x0EF8, uint16_t[30]

  get checksum(): number {
    return toNumber(this.bytes.slice(0x1352, 0x1352 + 2));
  }

  set checksum(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x1352);
  }

  get fileIndex(): number {
    return toNumber(this.bytes.slice(0x1354, 0x1354 + 4));
  }

  set fileIndex(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x1354);
  }

  calculateChecksum(): number {
    let sum = 0;
    for (let i = 0; i < 0x09A9; i++) {
      const index = i * 2;
      sum += toNumber(this.bytes.slice(index, index + 2));
      sum %= 0xFFFF;
    }
    return sum;
  }

  updateChecksum() {
    const calculated = this.calculateChecksum();
    if (calculated !== this.checksum) {
      this.checksum = calculated;
    }
  }

  private get isPatternValid(): boolean {
    const validPattern = SaveSlot.validCheckPattern;
    return this.checkPattern.every((value, index) =>
      value === validPattern[index]
    );
  }

  get isValid(): boolean {
    // TODO include checksum in here
    return this.isPatternValid;
  }
}
