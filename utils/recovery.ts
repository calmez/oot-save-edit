import type { SraSaveFile } from "../models/savefile.ts";
import {
  Age,
  EquippableItems,
  InventoryItems,
  ObtainableUpgrades,
  QuestItems,
  SaveSlot,
} from "../models/saveslot.ts";
import { Entrance, Scene } from "../models/scene.ts";
import { inspectSlotFields } from "./fieldinterpretation.ts";

export interface RecoveryValue {
  available: boolean;
  value?: string;
  explanation?: string;
}

export interface RecoveryComparison {
  field: string;
  label: string;
  primary: RecoveryValue;
  backup: RecoveryValue;
  equal: boolean | null;
}

export interface RecoveryPairDiagnosis {
  index: number;
  primaryIntegrity: {
    occupied: boolean;
    markerValid: boolean | null;
    checksumValid: boolean | null;
    fileIndex: number;
  };
  backupIntegrity: {
    occupied: boolean;
    markerValid: boolean | null;
    checksumValid: boolean | null;
    fileIndex: number;
  };
  comparisons: RecoveryComparison[];
  byteDifferences: number;
  uninterpretedByteDifferences: number;
  identical: boolean;
}

type InterpretedField = {
  key: string;
  label: string;
  read: (slot: SaveSlot) => unknown;
  format?: (value: unknown) => string;
  start: number;
  end: number;
  interpretationKeys?: string[];
  unavailable?: (slot: SaveSlot) => string | undefined;
};

function numericMask(values: object): number {
  return Object.values(values as Record<string, unknown>).reduce<number>(
    (mask, value) => typeof value === "number" ? mask | value : mask,
    0,
  );
}

function readInteger(slot: SaveSlot, offset: number, size: number): number {
  return slot.data.subarray(offset, offset + size).reduce(
    (value, byte) => value * 256 + byte,
    0,
  );
}

function unknownBits(value: number, mask: number): boolean {
  return (value & ~mask) !== 0;
}

const interpretedFields: InterpretedField[] = [
  {
    key: "entrance",
    label: "Entrance-table entry",
    read: (slot) => slot.entrance,
    format: (value) => enumName(Entrance, value as number),
    start: 0,
    end: 4,
  },
  {
    key: "playerName",
    label: "Player name",
    read: (slot) => slot.playerName,
    start: 0x24,
    end: 0x2c,
  },
  {
    key: "age",
    label: "Age",
    read: (slot) => slot.age,
    format: (value) => Age[value as Age] ?? "Unavailable",
    start: 4,
    end: 8,
    interpretationKeys: ["age"],
  },
  {
    key: "location",
    label: "Location",
    read: (slot) => slot.savedSceneIndex,
    format: (value) => Scene[value as Scene] ?? `Unknown (${value})`,
    start: 0x66,
    end: 0x68,
    interpretationKeys: ["savedSceneIndex"],
  },
  {
    key: "healthCapacity",
    label: "Health capacity",
    read: (slot) => slot.maxHealth,
    format: (value) => `${Number(value) / 16} hearts`,
    start: 0x2e,
    end: 0x30,
  },
  {
    key: "rupees",
    label: "Rupees",
    read: (slot) => slot.rupees,
    start: 0x34,
    end: 0x36,
  },
  {
    key: "inventory",
    label: "Inventory",
    read: (slot) =>
      slot.inventory.map((value) => enumName(InventoryItems, value)),
    start: 0x74,
    end: 0x8c,
    interpretationKeys: Array.from(
      { length: 24 },
      (_, index) => `inventory.${index}`,
    ),
  },
  {
    key: "ownedEquipment",
    label: "Owned equipment",
    read: (slot) =>
      slot.obtainedEquipment.map((value) => enumName(EquippableItems, value)),
    start: 0x9c,
    end: 0x9e,
    unavailable: (slot) =>
      unknownBits(readInteger(slot, 0x9c, 2), numericMask(EquippableItems))
        ? "Owned equipment contains unnamed bits and cannot be compared completely."
        : undefined,
  },
  {
    key: "upgrades",
    label: "Upgrades",
    read: (slot) =>
      slot.obtainedUpgrades.map((value) => enumName(ObtainableUpgrades, value)),
    start: 0xa0,
    end: 0xa4,
    interpretationKeys: Array.from(
      { length: 8 },
      (_, index) => `obtainedUpgrades.${index}`,
    ),
  },
  {
    key: "questStatus",
    label: "Quest status",
    read: (slot) =>
      slot.questStatusItems.map((value) => enumName(QuestItems, value)),
    start: 0xa4,
    end: 0xa8,
    unavailable: (slot) =>
      unknownBits(readInteger(slot, 0xa4, 4), numericMask(QuestItems))
        ? "Quest status contains unnamed bits and cannot be compared completely."
        : undefined,
  },
  {
    key: "skulltulaTokens",
    label: "Gold Skulltula tokens",
    read: (slot) => slot.goldSkulltulaTokens,
    start: 0xd0,
    end: 0xd2,
  },
];

function enumName(values: object, value: number): string {
  return Object.entries(values).find(([key, candidate]) =>
    Number.isNaN(Number(key)) && candidate === value
  )?.[0] ?? `Unknown (${value})`;
}

function readValue(
  slot: SaveSlot,
  field: InterpretedField,
  interpretations: ReturnType<typeof inspectSlotFields>,
): RecoveryValue {
  if (slot.isEmpty) {
    return {
      available: false,
      explanation: "The record is empty and has no initialized progress.",
    };
  }
  const unavailable = field.unavailable?.(slot);
  if (unavailable) return { available: false, explanation: unavailable };
  const interpretation = (field.interpretationKeys ?? [field.key]).map((key) =>
    interpretations.find((item) => item.field === key)
  ).filter((item) => item !== undefined);
  const unsupported = interpretation.find((item) =>
    item.status !== "available"
  );
  if (unsupported) {
    return { available: false, explanation: unsupported.explanation };
  }
  try {
    const value = field.read(slot);
    return {
      available: true,
      value: field.format
        ? field.format(value)
        : Array.isArray(value)
        ? value.join(", ")
        : String(value),
    };
  } catch (error) {
    return {
      available: false,
      explanation: error instanceof Error
        ? error.message
        : "Stored value cannot be interpreted.",
    };
  }
}

function integrity(slot: SaveSlot) {
  const occupied = !slot.isEmpty;
  return {
    occupied,
    markerValid: occupied ? slot.isPatternValid : null,
    checksumValid: occupied ? slot.isChecksumValid() : null,
    fileIndex: slot.fileIndex,
  };
}

/** Compare paired records without inferring which record is newer or preferable. */
export function compareRecoveryPair(
  save: SraSaveFile,
  index: number,
): RecoveryPairDiagnosis {
  if (!Number.isInteger(index) || index < 0 || index > 2) {
    throw new Error(
      `Recovery pair index must be between 0 and 2, got ${index}.`,
    );
  }
  const primary = save.slots[index];
  const backup = save.backups[index];
  const primaryFields = inspectSlotFields(primary);
  const backupFields = inspectSlotFields(backup);
  const comparisons = interpretedFields.map((field): RecoveryComparison => {
    const primaryValue = readValue(primary, field, primaryFields);
    const backupValue = readValue(backup, field, backupFields);
    return {
      field: field.key,
      label: field.label,
      primary: primaryValue,
      backup: backupValue,
      equal: primaryValue.available && backupValue.available
        ? primaryValue.value === backupValue.value
        : null,
    };
  });
  let byteDifferences = 0;
  let uninterpretedByteDifferences = 0;
  const interpreted = new Uint8Array(SaveSlot.requiredSize);
  for (const [index, field] of interpretedFields.entries()) {
    if (
      comparisons[index].primary.available &&
      comparisons[index].backup.available
    ) interpreted.fill(1, field.start, field.end);
  }
  interpreted.fill(1, 0x1c, 0x22);
  interpreted.fill(1, 0x1352, 0x1358);
  for (let offset = 0; offset < SaveSlot.requiredSize; offset++) {
    if (primary.data[offset] === backup.data[offset]) continue;
    byteDifferences++;
    if (!interpreted[offset]) uninterpretedByteDifferences++;
  }
  const primaryIntegrity = integrity(primary);
  const backupIntegrity = integrity(backup);
  return {
    index,
    primaryIntegrity,
    backupIntegrity,
    comparisons,
    byteDifferences,
    uninterpretedByteDifferences,
    identical: byteDifferences === 0,
  };
}
