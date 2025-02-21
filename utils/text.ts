export class OotText {
  constructor() {}

  // TODO poor man's decoder, find better way
  private get lookups() {
    return [
      { character: "A", numeric: 10 },
      { character: "B", numeric: 11 },
      { character: "C", numeric: 12 },
      { character: "D", numeric: 13 },
      { character: "E", numeric: 14 },
      { character: "F", numeric: 15 },
      { character: "G", numeric: 16 },
      { character: "H", numeric: 17 },
      { character: "I", numeric: 18 },
      { character: "J", numeric: 19 },
      { character: "K", numeric: 20 },
      { character: "L", numeric: 21 },
      { character: "M", numeric: 22 },
      { character: "N", numeric: 23 },
      { character: "O", numeric: 24 },
      { character: "P", numeric: 25 },
      { character: "Q", numeric: 26 },
      { character: "R", numeric: 27 },
      { character: "S", numeric: 28 },
      { character: "T", numeric: 29 },
      { character: "U", numeric: 30 },
      { character: "V", numeric: 31 },
      { character: "W", numeric: 32 },
      { character: "X", numeric: 33 },
      { character: "Y", numeric: 34 },
      { character: "Z", numeric: 35 },
      { character: "a", numeric: 36 },
      { character: "b", numeric: 37 },
      { character: "c", numeric: 38 },
      { character: "d", numeric: 39 },
      { character: "e", numeric: 40 },
      { character: "f", numeric: 41 },
      { character: "g", numeric: 42 },
      { character: "h", numeric: 43 },
      { character: "i", numeric: 44 },
      { character: "j", numeric: 45 },
      { character: "k", numeric: 46 },
      { character: "l", numeric: 47 },
      { character: "m", numeric: 48 },
      { character: "n", numeric: 49 },
      { character: "o", numeric: 50 },
      { character: "p", numeric: 51 },
      { character: "q", numeric: 52 },
      { character: "r", numeric: 53 },
      { character: "s", numeric: 54 },
      { character: "t", numeric: 55 },
      { character: "u", numeric: 56 },
      { character: "v", numeric: 57 },
      { character: "w", numeric: 58 },
      { character: "x", numeric: 59 },
      { character: "y", numeric: 60 },
      { character: "z", numeric: 61 },
      // 62 is EOL
    ];
  }
  private get EOL() {
    return 62;
  }

  private lookupCharacter(value: string): number {
    for (const lookup of this.lookups) {
      const { character, numeric } = lookup;
      if (character === value) {
        return numeric;
      }
    }
    throw new Error(`Could not find character ${value} in lookup table`);
  }

  private lookupCodepoint(value: number): string {
    for (const lookup of this.lookups) {
      const { character, numeric } = lookup;
      if (numeric == value) {
        return character;
      }
    }
    throw new Error(`Could not find code point ${value} in lookup table`);
  }

  encode(value: string): Uint8Array {
    if (value.length > 8) {
      throw Error(`Only strings up to 8 characters are supported`);
    }
    const data = new Uint8Array(8);
    data.fill(this.EOL);
    [...value].forEach((character, index) => {
      data.set([this.lookupCharacter(character)], index);
    });
    return data;
  }

  decode(value: Uint8Array): string {
    if (value.length > 8) {
      throw Error(`Only data with up to 8 characters are supported`);
    }

    let decoded = "";
    value.forEach((codepoint) => {
      if (codepoint == this.EOL) {
        return;
      }
      decoded += this.lookupCodepoint(codepoint);
    });

    return decoded.trim();
  }
}
