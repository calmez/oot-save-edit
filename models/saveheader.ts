export enum SoundOption {
  Stereo = 0x00,
  Mono,
  Headphones,
  Surround,
}

export class SaveHeader {
  constructor(private bytes: Uint8Array = new Uint8Array(0x20)) {
    if (bytes.length != 0x20) {
      throw Error(
        `Save header needs to be of length ${0x20}, got ${bytes.length}`,
      );
    }
  }

  get soundOption(): SoundOption {
    return this.bytes[0x00];
  }
}
