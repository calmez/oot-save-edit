// Layout from zeldaret/oot include/save.h. Offsets are relative to a save slot.
interface NumberField {
  label: string;
  offset: number;
  size: 1 | 2 | 4;
  signed?: boolean;
  length?: number;
  boolean?: boolean;
  hex?: boolean;
  mask?: number;
  shift?: number;
}

export const additionalFields = {
  equipmentWord: {
    label: "Owned equipment word (including broken-knife flag)",
    offset: 0x9C,
    size: 2,
  },
  upgradesWord: { label: "Raw upgrade word", offset: 0xA0, size: 4 },
  heartPieces: {
    label: "Pieces of Heart toward next container",
    offset: 0xA4,
    size: 4,
    mask: 0xF0000000,
    shift: 28,
  },
  totalDays: { label: "Days elapsed", offset: 0x14, size: 4, signed: true },
  biggoronDays: {
    label: "Days since Biggoron order",
    offset: 0x18,
    size: 4,
    signed: true,
  },
  swordHealth: { label: "Giant's Knife durability", offset: 0x36, size: 2 },
  doubleDefenseAcquired: {
    label: "Double defense acquired",
    offset: 0x3D,
    size: 1,
    boolean: true,
  },
  ocarinaGameRound: {
    label: "Ocarina memory game round",
    offset: 0x3F,
    size: 1,
  },
  childButtonItems: {
    label: "Saved child button items (B, C-left, C-down, C-right)",
    offset: 0x40,
    size: 1,
    length: 4,
  },
  childButtonSlots: {
    label: "Saved child C-button inventory slots",
    offset: 0x44,
    size: 1,
    length: 3,
  },
  childEquipment: {
    label: "Saved child equipment word",
    offset: 0x48,
    size: 2,
  },
  adultButtonItems: {
    label: "Saved adult button items (B, C-left, C-down, C-right)",
    offset: 0x4A,
    size: 1,
    length: 4,
  },
  adultButtonSlots: {
    label: "Saved adult C-button inventory slots",
    offset: 0x4E,
    size: 1,
    length: 3,
  },
  adultEquipment: {
    label: "Saved adult equipment word",
    offset: 0x52,
    size: 2,
  },
  warpPlayerParams: {
    label: "Farore's Wind player parameters",
    offset: 0xE74,
    size: 4,
    signed: true,
  },
  warpSwitchFlags: {
    label: "Farore's Wind temporary switches",
    offset: 0xE84,
    size: 4,
  },
  warpCollectibleFlags: {
    label: "Farore's Wind temporary collectibles",
    offset: 0xE88,
    size: 4,
  },
  skulltulaFlags: {
    label: "Individual Gold Skulltula collection flags",
    offset: 0xE9C,
    size: 4,
    length: 6,
  },
  highScores: {
    label:
      "Records (archery, Poe points, fishing, horse race, marathon, unused, Dampe race)",
    offset: 0xEB8,
    size: 4,
    length: 7,
  },
  worldMapAreas: {
    label: "Discovered world map areas",
    offset: 0xF38,
    size: 4,
  },
  scarecrowLongSongSet: {
    label: "Long Scarecrow song recorded",
    offset: 0xF40,
    size: 1,
    boolean: true,
  },
  scarecrowLongSong: {
    label: "Long Scarecrow song data (864 bytes, hexadecimal)",
    offset: 0xF41,
    size: 1,
    length: 0x360,
    hex: true,
  },
  scarecrowSpawnSongSet: {
    label: "Scarecrow summon song recorded",
    offset: 0x12C5,
    size: 1,
    boolean: true,
  },
  scarecrowSpawnSong: {
    label: "Scarecrow summon song data (128 bytes, hexadecimal)",
    offset: 0x12C6,
    size: 1,
    length: 0x80,
    hex: true,
  },
  horseScene: {
    label: "Epona scene ID",
    offset: 0x1348,
    size: 2,
    signed: true,
  },
  horseX: { label: "Epona X", offset: 0x134A, size: 2, signed: true },
  horseY: { label: "Epona Y", offset: 0x134C, size: 2, signed: true },
  horseZ: { label: "Epona Z", offset: 0x134E, size: 2, signed: true },
  horseAngle: {
    label: "Epona facing angle",
    offset: 0x1350,
    size: 2,
    signed: true,
  },
  eventFlagWords: {
    label: "All event flag words (including unnamed bits)",
    offset: 0xED4,
    size: 2,
    length: 14,
  },
  itemFlagWords: {
    label: "All item flag words (including unnamed bits)",
    offset: 0xEF0,
    size: 2,
    length: 4,
  },
  otherFlagWords: {
    label: "All other flag words (including unnamed bits)",
    offset: 0xEF8,
    size: 2,
    length: 30,
  },
} as const satisfies Record<string, NumberField>;

export type AdditionalSaveData = {
  -readonly [K in keyof typeof additionalFields]:
    typeof additionalFields[K] extends { boolean: true } ? boolean
      : typeof additionalFields[K] extends { length: number } ? number[]
      : number;
};

export function fieldRange(field: NumberField): { min: number; max: number } {
  if (field.mask !== undefined) {
    return { min: 0, max: field.mask >>> (field.shift ?? 0) };
  }
  const bits = field.size * 8;
  return field.signed
    ? { min: -(2 ** (bits - 1)), max: 2 ** (bits - 1) - 1 }
    : { min: 0, max: 2 ** bits - 1 };
}

export function readAdditionalData(bytes: Uint8Array): AdditionalSaveData {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const result: Record<string, number | boolean | number[]> = {};
  for (
    const [key, field] of Object.entries(additionalFields) as [
      string,
      NumberField,
    ][]
  ) {
    const read = (offset: number): number => {
      if (field.size === 1) return view.getUint8(offset);
      if (field.size === 2) {
        return field.signed ? view.getInt16(offset) : view.getUint16(offset);
      }
      return field.signed ? view.getInt32(offset) : view.getUint32(offset);
    };
    result[key] = field.mask !== undefined
      ? (read(field.offset) & field.mask) >>> (field.shift ?? 0)
      : field.length
      ? Array.from(
        { length: field.length },
        (_, i) => read(field.offset + i * field.size),
      )
      : field.boolean
      ? read(field.offset) !== 0
      : read(field.offset);
  }
  return result as AdditionalSaveData;
}

export function writeAdditionalData(
  bytes: Uint8Array,
  data: AdditionalSaveData,
): void {
  const next = bytes.slice();
  const view = new DataView(next.buffer);
  const current = readAdditionalData(bytes);
  for (
    const [key, field] of Object.entries(additionalFields) as [
      keyof AdditionalSaveData,
      NumberField,
    ][]
  ) {
    const value = data[key];
    if (JSON.stringify(value) === JSON.stringify(current[key])) continue;
    if (field.boolean && typeof value !== "boolean") {
      throw new Error(`${field.label} must be a boolean.`);
    }
    if (
      field.length && (!Array.isArray(value) || value.length !== field.length)
    ) {
      throw new Error(`${field.label} needs ${field.length} values.`);
    }
    const values = Array.isArray(value)
      ? value
      : [typeof value === "boolean" ? Number(value) : value];
    const { min, max } = fieldRange(field);
    values.forEach((number, i) => {
      if (!Number.isInteger(number) || number < min || number > max) {
        throw new Error(
          `${field.label} must contain integers between ${min} and ${max}.`,
        );
      }
      const offset = field.offset + i * field.size;
      if (field.size === 1) view.setUint8(offset, number);
      else if (field.size === 2) view.setUint16(offset, number);
      else {view.setUint32(
          offset,
          field.mask === undefined
            ? number
            : (view.getUint32(offset) & ~field.mask) |
              ((number << (field.shift ?? 0)) & field.mask),
        );}
    });
  }
  bytes.set(next);
}
