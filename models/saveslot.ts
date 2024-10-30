export enum Age {
  Child = 0x00,
  Adult = 0x01,
  Invalid,
}

export class SaveSlot {
  constructor(private bytes: Uint8Array = new Uint8Array(0x1450)) {
    if (bytes.length != 0x1450) {
      throw Error(
        `Save header needs to be of length ${0x1450}, got ${bytes.length}`,
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
    rupees << 8;
    rupees = this.bytes[0x35];
    rupees << 8;

    return rupees;
  }
}
