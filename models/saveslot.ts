import { toNumber, toUint8Array } from "../utils/conversions.ts";
import { OotText } from "../utils/text.ts";
import { Scene, Time } from "./scene.ts";

export enum Age {
  Child = 0x00,
  Adult = 0x01,
  Invalid,
}

export enum Sword {
  Kokiri = 0x3B,
  Master = 0x3C,
  GiantKnife = 0x3D,
}

export enum Shield {
  Kokiri = 0x3E,
  Hylian = 0x3F,
  Mirror = 0x40,
}

export enum Tunic {
  Kokiri = 0x41,
  Goron = 0x42,
  Zora = 0x43,
}

export enum Boots {
  Kokiri = 0x44,
  Iron = 0x45,
  Hover = 0x46,
}

// TODO consider breaking this up further
export enum Items {
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
  BulletBagHolds30 = 0x47,
  BulletBagHolds40 = 0x48,
  BulletBagHolds50 = 0x49,
  QuiverHolds30 = 0x4A,
  QuiverHolds40 = 0x4B,
  QuiverHolds50 = 0x4C,
  BombBagHolds20 = 0x4D,
  BombBagHolds30 = 0x4E,
  BombBagHolds40 = 0x4F,
  GoronsBracelet = 0x50,
  SilverGauntlets = 0x51,
  GoldenGauntlets = 0x52,
  SilverScale = 0x53,
  GoldenScale = 0x54,
  GiantsKnifeBroken = 0x55,
  BombBagJapaneseName = 0x56,
  BombBag2JapaneseName = 0x57,
  SlingShotBulletsJapaneseName = 0x58,
  FishingRodJapaneseName = 0x59,
  MinuetofForest = 0x5A,
  BoleroofFire = 0x5B,
  SerenadeofWater = 0x5C,
  RequiemofSpirit = 0x5D,
  NocturneofShadow = 0x5E,
  PreludeofLight = 0x5F,
  ZeldasLullaby = 0x60,
  EponasSong = 0x61,
  SariasSong = 0x62,
  SunsSong = 0x63,
  SongofTime = 0x64,
  SongofStorms = 0x65,
  ForestMedallion = 0x66,
  FireMedallion = 0x67,
  WaterMedallion = 0x68,
  SpiritMedallion = 0x69,
  ShadowMedallion = 0x6A,
  LightMedallion = 0x6B,
  KokirisEmerald = 0x6C,
  GoronsRuby = 0x6D,
  ZorasSapphire = 0x6E,
  StoneofAgony = 0x6F,
  GerudosCard = 0x70,
  GoldSkulltula = 0x71,
  PieceofHeart = 0x72,
  JapaneseName = 0x73,
  BigKey = 0x74,
  Compass = 0x75,
  DungeonMap = 0x76,
  JapaneseName2 = 0x77,
  JapaneseName3 = 0x78,
  JapaneseName4 = 0x79,
  BiggoronsSwordGlitchedupGraphic = 0x7A,
  DekuRodGlitchedUpGraphics = 0x7B,
  DekuNutGlitchedUpGraphics = 0x7C,
  JapaneseName5 = 0x7D,
  JapaneseName6 = 0x7E,
  JapaneseName7 = 0x7F,
  JapaneseName8 = 0x80,
  JapaneseName9 = 0x81,
  JapaneseName10 = 0x82,
  LetterinaBottlewBlueShadeJapaneseName = 0x83,
  QuiverHolds20wRedHueJapaneseName = 0x84,
  JapaneseName11 = 0x85,
  JapaneseName12 = 0x86,
  JapaneseName13 = 0x87,
  JapaneseName14 = 0x88,
  HauntedWastelandFPSDropto17fromhere = 0x89,
  GerudosFortress = 0x8A,
  GerudoValley = 0x8B,
  LakeHylia = 0x8C,
  LonLonRanch = 0x8D,
  MarketToHere = 0x8E,
  HyruleField = 0x8F,
  DeathMountain = 0x90,
  KakarikoVillage = 0x91,
  LostWoods = 0x92,
  KokiriForest = 0x93,
  ZorasDomain = 0x94,
  MilkGlitchedUpGraphics = 0x95,
  LetterGlitchedUpGraphics = 0x96,
  BlueFireGlitchedUpGraphics = 0x97,
  BugGlitchedUpGraphics = 0x98,
  NightSwarmGlitchedUpGraphics = 0x99,
  Milk12GlitchedUpGraphics = 0x9A,
  LightGlitchedUpGraphic = 0x9B,
  StrangeEggGlitchedUpGraphics = 0x9C,
  ChickenGlitchedUpGraphic = 0x9D,
  ZeldasLetterGlitchedUpGraphic = 0x9E,
  FoxMaskGlitchedUpGraphic = 0x9F,
  SkullMaskGlitchedUpGraphic = 0xA0,
  RabbitHonorGlitchedUpGraphic = 0xA1,
  GoronMaskGlitchedUpGraphic = 0xA2,
  GoronMaskAgainGlitchedUpGraphic = 0xA3,
  ZoraMaskGlitchedUpGraphic = 0xA4,
  GerudoMaskGlitchedUpGraphic = 0xA5,
  MaskoftheKnowledgeGlitchedUpGraphic = 0xA6,
  SellsGlitchedUpGraphic = 0xA7,
  EggGlitchedUpGraphic = 0xA8,
  KikiGlitchedUpGraphic = 0xA9,
  WhinniedGlitchedUpGraphic = 0xAA,
  MoldGlitchedUpGraphic = 0xAB,
  MoldDrankGlitchedUpFlashingGraphic = 0xAC,
  WouldSawGlitchedUpFlashingGraphic = 0xAD,
  GoronSwordBrokenGlitchedUpFlashingGraphic = 0xAE,
  PrescriptionGlitchedUpGraphic = 0xAF,
  GlotzFrogGlitchedUpGraphic = 0xB0,
  EyedropGlitchedUpGraphic = 0xB1,
  CertificateGlitchedUpGraphic = 0xB2,
  JapTextGlitchedUpGraphic = 0xB3,
  JapTextGlitchedUpGraphic2 = 0xB4,
  KokiriswordGlitchedUpGraphicName = 0xB5,
  KokiriSwordAgainGlitchedUpGraphic = 0xB6,
  MasterSwordGlitchedUpGraphic = 0xB7,
  LongSwordGlitchedUpGraphic = 0xB8,
  DekusignGlitchedUpGraphic = 0xB9,
  HyliasignGlitchedUpGraphic = 0xBA,
  Unknown = 0xBB,
  KokiriarmamentGlitchedUpGraphic = 0xBC,
  GoronarmamentGlitchedUpGraphic = 0xBD,
  ZoraarmamentGlitchedUpGraphic = 0xBE,
  LeatherbootGlitchedUpGraphic = 0xBF,
  IronbootGlitchedUpGraphic = 0xC0,
  HoverbootGlitchedUpGraphic = 0xC1,
  Ammunitionpocket30GlitchedUpFlashingGraphic = 0xC2,
  Ammunitionpocket40GlitchedUpGraphic = 0xC3,
  Ammunitionpocket50GlitchedUpGraphic = 0xC4,
  Cooks30GlitchedUpFlashingGraphic = 0xC5,
  Cooks40GlitchedUpFlashingGraphic = 0xC6,
  Cooks50ItLookslikeanTVwithnoreception = 0xC7,
  Bombspocket20GlitchedUpGraphic = 0xC8,
  Bombspocket30GlitchedUpGraphic = 0xC9,
  Bombspocket40GlitchedUpGraphic = 0xCA,
  GoronbraceletGlitchedUpGraphic = 0xCB,
  PowergloveGlitchedUpGraphic = 0xCC,
  TitaniumgloveGlitchedUpGraphic = 0xCD,
  SilverScaleGlitchedUpGraphic = 0xCE,
  GoldScaleGlitchedUpGraphic = 0xCF,
  Empty = 0xFF,
}

export type InventoryItems = Items | Sword | Shield | Tunic | Boots;
export const InventoryItems = {
  ...Items,
  ...Sword,
  ...Shield,
  ...Tunic,
  ...Boots,
};

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

  get currentMagic(): number {
    return toNumber(this.bytes.slice(0x0033, 0x0033 + 1));
  }

  set currentMagic(value: number) {
    this.bytes.set(toUint8Array(value, 1), 0x0033);
  }

  get rupees(): number {
    return toNumber(this.bytes.slice(0x0034, 0x0034 + 2));
  }

  set rupees(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0034);
  }

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

  get savedSceneIndex(): Scene {
    return toNumber(this.bytes.slice(0x0066, 0x0066 + 2));
  }

  set savedSceneIndex(value: Scene) {
    this.bytes.set(toUint8Array(value, 2), 0x0066);
  }

  private get currentButtonEquips(): Uint8Array {
    return this.bytes.slice(0x0068, 0x0068 + 7);
  }

  // TODO button equipments should return specific data structures
  private set currentButtonEquips(value: Uint8Array) {
    if (value.length != 7) {
      throw Error(
        `button equip data needs to be 7 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x0068);
  }

  get bButtonEquip(): number {
    return toNumber(this.currentButtonEquips.slice(0, 0 + 1));
  }

  set bButtonEquip(value: number) {
    const buttonEquips = this.currentButtonEquips;
    buttonEquips.set(toUint8Array(value, 1), 0);
    this.currentButtonEquips = buttonEquips;
  }

  get cLeftButtonEquip(): number {
    return toNumber(this.currentButtonEquips.slice(1, 1 + 1));
  }

  set cLeftButtonEquip(value: number) {
    const buttonEquips = this.currentButtonEquips;
    buttonEquips.set(toUint8Array(value, 1), 1);
    this.currentButtonEquips = buttonEquips;
  }

  get cDownButtonEquip(): number {
    return toNumber(this.currentButtonEquips.slice(2, 2 + 1));
  }

  set cDownButtonEquip(value: number) {
    const buttonEquips = this.currentButtonEquips;
    buttonEquips.set(toUint8Array(value, 1), 2);
    this.currentButtonEquips = buttonEquips;
  }

  get cRightButtonEquip(): number {
    return toNumber(this.currentButtonEquips.slice(3, 3 + 1));
  }

  set cRightButtonEquip(value: number) {
    const buttonEquips = this.currentButtonEquips;
    buttonEquips.set(toUint8Array(value, 1), 3);
    this.currentButtonEquips = buttonEquips;
  }

  // TODO should reference data structures for equipment
  // & 0x000F = Swords
  // & 0x00F0 = Shields
  // & 0x0F00 = Tunics
  // & 0xF000 = Boots
  private get currentlyEquippedEquipment(): Uint8Array {
    return this.bytes.slice(0x0070, 0x0070 + 2);
  }

  private set currentlyEquippedEquipment(value: Uint8Array) {
    if (value.length != 2) {
      throw Error(
        `current equipment data needs to be 2 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x0070);
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

  // TODO should reference data structures for equipment
  // & 0x000F = Swords
  // & 0x00F0 = Shields
  // & 0x0F00 = Tunics
  // & 0xF000 = Boots
  private get obtainedEquipment(): Uint8Array {
    return this.bytes.slice(0x009C, 0x009C + 2);
  }

  private set obtainedEquipment(value: Uint8Array) {
    if (value.length != 2) {
      throw Error(
        `obtained equipment data needs to be 2 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x009C);
  }

  // TODO should reference data structures for equipment
  // & 0x0070_0000 = Deku Nut capacity
  // & 0x000E_0000 = Deku Stick capacity
  // & 0x0001_C000 = Bullet Bag
  // & 0x0000_3000 = Wallet
  // & 0x0000_0E00 = Dive Meter
  // & 0x0000_01C0 = Strength Upgrades
  // & 0x0000_0038 = Bomb Bag
  // & 0x0000_0007 = Quiver
  private get obtainedUpgrades(): Uint8Array {
    return this.bytes.slice(0x00A0, 0x00A0 + 4);
  }

  private set obtainedUpgrades(value: Uint8Array) {
    if (value.length != 4) {
      throw Error(
        `obtained equipment data needs to be 4 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x00A0);
  }

  // TODO should reference data structures for equipment
  // & 0x0080_0000 = Gold Skulltula Token (Set the first time one is collected)
  // & 0x0040_0000 = Gerudo card
  // & 0x0020_0000 = Stone of Agony
  // & 0x0010_0000 = Zora Sapphire
  // & 0x0008_0000 = Goron Ruby
  // & 0x0004_0000 = Kokiri Emerald
  // & 0x0002_0000 = Song of Storms
  // & 0x0001_0000 = Song of Time
  // & 0x0000_8000 = Sun's Song
  // & 0x0000_4000 = Saria's Song
  // & 0x0000_2000 = Epona's Song
  // & 0x0000_1000 = Zelda's Lullaby
  // & 0x0000_0800 = Prelude of Light
  // & 0x0000_0400 = Nocturne of Shadow
  // & 0x0000_0200 = Requiem of Spirit
  // & 0x0000_0100 = Serenade of Water
  // & 0x0000_0080 = Bolero of Fire
  // & 0x0000_0040 = Minuet of Forest
  // & 0x0000_0020 = Light Medallion
  // & 0x0000_0010 = Shadow Medallion
  // & 0x0000_0008 = Spirit Medallion
  // & 0x0000_0004 = Water Medallion
  // & 0x0000_0002 = Fire Medallion
  // & 0x0000_0001 = Forest Medallion
  private get questStatusItems(): Uint8Array {
    return this.bytes.slice(0x00A4, 0x00A4 + 4);
  }

  private set questStatusItems(value: Uint8Array) {
    if (value.length != 4) {
      throw Error(
        `obtained equipment data needs to be 4 bytes, got ${value.length}.`,
      );
    }
    this.bytes.set(value, 0x00A4);
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
    return toNumber(this.bytes.slice(0x0E6B, 0x0E6B + 4));
  }

  private set faroresWindWarpZ(value: number) {
    this.bytes.set(toUint8Array(value, 4), 0x0E6B);
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
    this.bytes.set(toUint8Array(0x0EBC, 4), 0x0EBC);
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
