export async function readSaveFile(filename: string) {
  var bytes = await Deno.readFile(filename);
  return bytes;
}

class SaveFile {
  header: SaveHeader;
  slots: [SaveSlot, SaveSlot, SaveSlot];
  backups: [SaveSlot, SaveSlot, SaveSlot];

  constructor() {
    this.header = new SaveHeader();
    this.slots = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
    this.backups = [new SaveSlot(), new SaveSlot(), new SaveSlot()];
  }

  async read(filename: string): Promise<SaveFile> {
    const bytes = await Deno.readFile(filename);
    this.header = new SaveHeader(bytes.slice(0x00, 0x20));
    this.slots[0] = new SaveSlot(bytes.slice(0x20, 0x20 + 0x1450))
    // TODO init other slots
    // TODO init backups
    return this;
  }
}

enum SoundOption {
  Stereo = 0x00,
  Mono,
  Headphones,
  Surround,
}

class SaveHeader {
  constructor(private bytes: Uint8Array = new Uint8Array(0x20)) {
    if (bytes.length != 0x20) {
      throw Error(`Save header needs to be of length ${0x20}, got ${bytes.length}`);
    }
  }

  get soundOption(): SoundOption {
    return this.bytes[0x00];
  }
}

enum Age {
  Child = 0x00,
  Adult = 0x01,
  Invalid,
}

class SaveSlot {
  constructor(private bytes: Uint8Array = new Uint8Array(0x1450)) {
    if (bytes.length != 0x1450) {
      throw Error(`Save header needs to be of length ${0x1450}, got ${bytes.length}`);
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
    rupees = this.bytes[0x34]
    rupees << 8;
    rupees = this.bytes[0x35]
    rupees << 8;
    
    return rupees;
  }
}

if (import.meta.main) {
  console.log(`>>> OoT Save Edit <<<`);

  new SaveFile().read('./test-data/new-game.srm').then(save => {
    console.debug(`Successfully read the file`);
    console.debug(`Save has sound option '${SoundOption[save.header.soundOption]}'`);
    console.debug(`Link has age '${Age[save.slots[0].age]}'`);
    console.debug(`Link has ${save.slots[0].rupees} rupees`);
  });
}
