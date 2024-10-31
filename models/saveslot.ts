export enum Age {
  Child = 0x00,
  Adult = 0x01,
  Invalid,
}

export class SaveSlot {
  public static get requiredSize(): number {
    return 0x1450;
  }

  constructor(private bytes: Uint8Array = new Uint8Array(0x1450)) {
    if (bytes.length != SaveSlot.requiredSize) {
      throw Error(
        `Save header needs to be of length ${SaveSlot.requiredSize}, got ${bytes.length}`,
      );
    }
  }

  get age(): Age {
    var age: number = 0;
    age = this.bytes[0x04];
    age << 8;
    age = this.bytes[0x05];
    age << 8;
    age = this.bytes[0x06];
    age << 8;
    age = this.bytes[0x07];
    age << 8;

    switch (age) {
      case 0:
        return Age.Child;
      case 1:
        return Age.Adult;
      default:
        return Age.Invalid;
    }
  }

  get rupees(): number {
    var rupees: number = 0;
    rupees = this.bytes[0x34];
    rupees <<= 8;
    rupees += this.bytes[0x35];

    return rupees;
  }
}
