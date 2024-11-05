import { toNumber, toUint8Array } from "../utils/conversions.ts";

export enum Age {
  Child = 0x00,
  Adult = 0x01,
  Invalid,
}

export enum Sword {
  Kokiri = 0x3B,
  Master = 0x3C,
  Third = 0x3D,
}

export enum Shield {
  Deku = 0x3E,
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

  get nightFlag(): number {
    return toNumber(this.bytes.slice(0x0010, 0x0010 + 4));
  }

  set nightFlag(value: number) {
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
    const decoder = new TextDecoder();
    return decoder.decode(data);
  }

  set playerName(value: string) {
    if (value.length > 8) {
      new Error(
        `Player name only supports up to 8 characters, ${value.length} given`,
      );
    }
    const data = new Uint8Array(8);
    data.fill(0xDF);
    // TODO this is not the correct encoding
    const encoder = new TextEncoder();
    data.set(encoder.encode(value));
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

  get savedSceneIndex(): number {
    return toNumber(this.bytes.slice(0x0066, 0x0066 + 2));
  }

  set savedSceneIndex(value: number) {
    this.bytes.set(toUint8Array(value, 2), 0x0066);
  }

  private get currentButtonEquips(): Uint8Array {
    return this.bytes.slice(0x0068, 0x0068 + 7);
  }

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
