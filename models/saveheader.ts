export enum SoundOption {
  Stereo = 0x00,
  Mono,
  Headphones,
  Surround,
}

export class SaveHeader {
  static get requiredSize(): number {
    return 0x20;
  }

  constructor(private bytes: Uint8Array = new Uint8Array(SaveHeader.requiredSize)) {
    if (bytes.length != SaveHeader.requiredSize) {
      throw Error(
        `Save header needs to be of length ${SaveHeader.requiredSize}, got ${bytes.length}`,
      );
    }
  }

  get soundOption(): SoundOption {
    return this.bytes[0x00];
  }
}
