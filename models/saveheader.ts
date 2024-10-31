export enum SoundOption {
  Stereo = 0x00,
  Mono,
  Headphones,
  Surround,
}

export enum ZTargetOption {
  Switch = 0x00,
  Hold = 0x01,
  Invalid,
}

export enum LanguageOption {
  English = 0x00,
  German = 0x01,
  French = 0x02,
}

export class SaveHeader {
  static get requiredSize(): number {
    return 0x20;
  }

  static get validCheckPattern(): Uint8Array {
    const encoder = new TextEncoder();
    return new Uint8Array([0x98, 0x09, 0x10, 0x21, ...encoder.encode("ZELDA")]);
  }

  static get defaultPadding(): Uint8Array {
    return new Uint8Array(5);
  }

  static get debugPadding(): Uint8Array {
    let data = new Uint8Array(5);
    data.fill(0xAB);
    return data;
  }

  constructor(
    private bytes: Uint8Array = new Uint8Array(SaveHeader.requiredSize),
  ) {
    if (bytes.length != SaveHeader.requiredSize) {
      throw Error(
        `Save header needs to be of length ${SaveHeader.requiredSize}, got ${bytes.length}`,
      );
    }
  }

  get soundOption(): SoundOption {
    return this.bytes[0x00];
  }

  get zTargetOption(): ZTargetOption {
    return this.bytes[0x01];
  }

  get languageOption(): LanguageOption {
    return this.bytes[0x02];
  }

  private get checkPattern(): Uint8Array {
    return this.bytes.slice(0x03, 0x03 + 9);
  }

  private get padding(): Uint8Array {
    return this.bytes.slice(0x0C, 0x0C + 5);
  }

  private get isPatternValid(): boolean {
    const validPattern = SaveHeader.validCheckPattern;
    return this.checkPattern.every((value, index) =>
      value === validPattern[index]
    );
  }

  private get isPaddingValid(): boolean {
    const defaultPadding = SaveHeader.defaultPadding;
    const debugPadding = SaveHeader.debugPadding;
    return (
      this.padding.every((value, index) => value === defaultPadding[index]) ||
      this.padding.every((value, index) => value === debugPadding[index])
    );
  }

  get isValid(): boolean {
    return this.isPatternValid && this.isPaddingValid;
  }
}
