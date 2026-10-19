import { additionalFields } from "../models/additionaldata.ts";
import type { AdditionalSaveData } from "../models/additionaldata.ts";
import {
  Boots,
  ButtonItems,
  InventoryItems,
  SaveSlot,
  Shield,
  Sword,
  Tunic,
  upgradeGroups,
} from "../models/saveslot.ts";
import { Scene, Time } from "../models/scene.ts";

export interface FieldInterpretation {
  field: string;
  status: "available" | "unavailable" | "uncertain";
  value: unknown;
  storedValue: unknown;
  explanation: string;
}

const booleanFields: Record<string, { offset: number; size: number }> = {
  ddOnly: { offset: 0x2C, size: 2 },
  magicFlag1: { offset: 0x3A, size: 1 },
  magicFlag2: { offset: 0x3C, size: 1 },
  biggoronsSwordFlag2: { offset: 0x3E, size: 1 },
  warpPointSet: { offset: 0xE80, size: 4 },
};

type FieldValue = string | number | boolean | number[];

interface FieldDefinition {
  read: (slot: SaveSlot) => unknown;
  write: (slot: SaveSlot, value: FieldValue) => void;
  kind: "boolean" | "number" | "text" | "array";
  options?: Record<number, string>;
}

function numberAt(slot: SaveSlot, offset: number, size: number): number {
  return slot.data.subarray(offset, offset + size).reduce(
    (value, byte) => value * 256 + byte,
    0,
  );
}

function numericOptions(
  values: Record<string, string | number>,
  zero = false,
): Record<number, string> {
  const result = Object.fromEntries(
    Object.entries(values).filter(([, value]) => typeof value === "number").map(
      ([name, value]) => [value, name],
    ),
  );
  if (zero) result[0] = "None";
  return result;
}

const definitions: Record<string, FieldDefinition> = Object.create(null);
for (
  const [field, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(SaveSlot.prototype),
  )
) {
  if (!descriptor.get || !descriptor.set || field === "data") continue;
  definitions[field] = {
    read: (slot) => (slot as unknown as Record<string, unknown>)[field],
    write: (slot, value) => {
      (slot as unknown as Record<string, unknown>)[field] = value;
    },
    kind: field === "playerName"
      ? "text"
      : field in booleanFields || field === "biggoronsSwordFlag1"
      ? "boolean"
      : "number",
  };
}
for (const [field, spec] of Object.entries(booleanFields)) {
  definitions[field].read = (slot) => numberAt(slot, spec.offset, spec.size);
}
definitions.age.read = (slot) => numberAt(slot, 4, 4);
definitions.age.options = { 0: "Adult", 1: "Child" };
definitions.nightFlag.options = numericOptions(Time);
definitions.entranceIndexTransport.options = numericOptions(Scene);
definitions.entranceIndex.options = numericOptions(Scene);
// Saved scene identifiers are a separate namespace from the entrance table.
definitions.savedSceneIndex.options = Object.fromEntries(
  Array.from(
    { length: SaveSlot.permanentSceneCount },
    (_, index) => [index, `Scene ${index}`],
  ),
);

for (const [field, spec] of Object.entries(additionalFields)) {
  const path = `additionalData.${field}`;
  definitions[path] = {
    kind: "boolean" in spec ? "boolean" : "length" in spec ? "array" : "number",
    read: (slot) =>
      "boolean" in spec
        ? numberAt(slot, spec.offset, spec.size)
        : slot.additionalData[field as keyof AdditionalSaveData],
    write: (slot, value) => {
      if ("boolean" in spec) slot.data[spec.offset] = value === true ? 1 : 0;
      else slot.additionalData = { ...slot.additionalData, [field]: value };
    },
  };
}
for (let index = 0; index < 24; index++) {
  definitions[`inventory.${index}`] = {
    kind: "number",
    options: numericOptions(InventoryItems),
    read: (slot) => slot.inventory[index],
    write: (slot, value) => {
      const items = slot.inventory;
      items[index] = value as number;
      slot.inventory = items;
    },
  };
}
for (
  const key of [
    "bButton",
    "cLeftButton",
    "cDownButton",
    "cRightButton",
  ] as const
) {
  definitions[`currentButtonEquips.${key}`] = {
    kind: "number",
    options: numericOptions(ButtonItems),
    read: (slot) => slot.currentButtonEquips[key],
    write: (slot, value) => {
      slot.currentButtonEquips = { ...slot.currentButtonEquips, [key]: value };
    },
  };
}
for (
  const [index, [key, values]]
    of ([["sword", Sword], ["shield", Shield], ["tunic", Tunic], [
      "boots",
      Boots,
    ]] as const).entries()
) {
  definitions[`currentlyEquippedEquipment.${key}`] = {
    kind: "number",
    options: numericOptions(values, true),
    read: (slot) => slot.currentlyEquippedEquipment[key],
    write: (slot, value) => {
      slot.currentlyEquippedEquipment = {
        ...slot.currentlyEquippedEquipment,
        [key]: value,
      };
    },
  };
  for (const age of ["child", "adult"] as const) {
    const field = `${age}Equipment` as const;
    definitions[`additionalData.${field}.${key}`] = {
      kind: "number",
      options: { 0: "None", 1: "Tier 1", 2: "Tier 2", 3: "Tier 3" },
      read: (slot) => (slot.additionalData[field] >>> (index * 4)) & 15,
      write: (slot, value) => {
        slot.additionalData = {
          ...slot.additionalData,
          [field]: (slot.additionalData[field] & ~(15 << (index * 4))) |
            ((value as number) << (index * 4)),
        };
      },
    };
  }
}
for (const age of ["child", "adult"] as const) {
  const key = `${age}ButtonItems` as const;
  for (let index = 0; index < 4; index++) {
    definitions[`additionalData.${key}.${index}`] = {
      kind: "number",
      options: numericOptions(ButtonItems),
      read: (slot) => slot.additionalData[key][index],
      write: (slot, value) => {
        const items = slot.additionalData[key];
        items[index] = value as number;
        slot.additionalData = { ...slot.additionalData, [key]: items };
      },
    };
  }
}
for (const [index, group] of upgradeGroups.entries()) {
  definitions[`obtainedUpgrades.${index}`] = {
    kind: "number",
    options: numericOptions(group.values, true),
    read: (slot) => numberAt(slot, 0xA0, 4) & group.mask,
    write: (slot, value) => {
      const view = new DataView(
        slot.data.buffer,
        slot.data.byteOffset,
        slot.data.byteLength,
      );
      view.setUint32(
        0xA0,
        (view.getUint32(0xA0) & ~group.mask) | (value as number),
      );
    },
  };
}

for (const key of ["x", "y", "z", "yRotation"] as const) {
  definitions[`faroresWindWarp.${key}`] = {
    kind: "number",
    read: (slot) => slot.faroresWindWarp[key],
    write: (slot, value) => {
      slot.faroresWindWarp = { ...slot.faroresWindWarp, [key]: value };
    },
  };
}

export function interpretSlotField(
  slot: SaveSlot,
  field: string,
): FieldInterpretation {
  const definition = definitions[field];
  if (!definition) throw new Error(`Unknown interpretable field: ${field}.`);
  let storedValue: unknown;
  try {
    storedValue = definition.read(slot);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return {
      field,
      status: "unavailable",
      value: undefined,
      storedValue: field === "playerName"
        ? Array.from(slot.data.subarray(0x24, 0x2C))
        : slot.entranceIndex,
      explanation:
        `${field}: unavailable in this editor (${error.message}). Original bytes are preserved.`,
    };
  }
  const isBoolean = definition.kind === "boolean" &&
    typeof storedValue === "number";
  const unsupported = isBoolean
    ? storedValue !== 0 && storedValue !== 1
    : definition.options !== undefined &&
      !(String(storedValue) in definition.options);
  const members = Object.keys(definitions).filter((name) =>
    name.startsWith(`${field}.`) &&
    name.slice(field.length + 1).indexOf(".") === -1
  ).map((name) => interpretSlotField(slot, name));
  const uncertainMembers = members.filter((member) =>
    member.status !== "available"
  );
  if (uncertainMembers.length) {
    const value = field === "additionalData"
      ? Object.fromEntries(
        members.map((
          member,
        ) => [member.field.slice(field.length + 1), member.value]),
      )
      : storedValue;
    return {
      field,
      status: "uncertain",
      value,
      storedValue: field === "additionalData"
        ? Object.fromEntries(
          members.map((
            member,
          ) => [member.field.slice(field.length + 1), member.storedValue]),
        )
        : storedValue,
      explanation:
        `${field}: some members have unavailable or uncertain interpretations. Inspect ${
          uncertainMembers.map((member) => member.field).join(", ")
        }; original bytes are preserved.`,
    };
  }
  const tentative =
    ["entranceIndexTransport", "mapNumber", "faroresWindWarp"].includes(
      field,
    ) &&
    (typeof storedValue === "number"
      ? storedValue !== 0
      : Object.values(storedValue as Record<string, number>).some((value) =>
        value !== 0
      ));
  return {
    field,
    status: tentative && !unsupported
      ? "uncertain"
      : unsupported
      ? isBoolean ? "unavailable" : "uncertain"
      : "available",
    value: unsupported && isBoolean
      ? undefined
      : isBoolean
      ? storedValue === 1
      : storedValue,
    storedValue,
    explanation: unsupported
      ? `${field}: stored value ${
        JSON.stringify(storedValue)
      } has no supported ${
        isBoolean ? "Boolean" : "named"
      } interpretation in this editor. Original bytes are preserved; this does not establish corruption.`
      : tentative
      ? `${field}: the stored numeric view is readable, but its Farore's Wind gameplay interpretation remains tentative. Original bytes are preserved.`
      : "",
  };
}

export function inspectSlotFields(slot: SaveSlot): FieldInterpretation[] {
  if (slot.isEmpty) return [];
  const values = new Map<PropertyKey, unknown>();
  const snapshot = new Proxy(slot, {
    get(target, property) {
      if (!values.has(property)) {
        values.set(property, Reflect.get(target, property, target));
      }
      return values.get(property);
    },
  });
  const fields = Object.keys(definitions).map((field) =>
    interpretSlotField(snapshot, field)
  );
  for (let index = 0; index < 20; index++) {
    const unknown = slot.data[0xA8 + index] & 0xF8;
    if (unknown) {
      fields.push({
        field: `dungeonItems.${index}`,
        status: "uncertain",
        value: slot.dungeonItems[index],
        storedValue: slot.data[0xA8 + index],
        explanation:
          `dungeonItems.${index}: unnamed bits ${unknown} are preserved; their meaning is unresolved.`,
      });
    }
  }
  return fields;
}

export function reviewSlotFields(slot: SaveSlot): FieldInterpretation[] {
  const fields = inspectSlotFields(slot);
  const groups = new Set(
    fields.filter((field) =>
      field.status !== "available" &&
      field.field.startsWith("additionalData.") &&
      field.field.split(".").length === 3
    ).map((field) => field.field.slice(0, field.field.lastIndexOf("."))),
  );
  if (
    fields.some((field) =>
      field.field === "faroresWindWarp" && field.status !== "available"
    )
  ) groups.add("faroresWindWarp");
  return fields.filter((field) =>
    field.status !== "available" ||
    groups.has(field.field.slice(0, field.field.lastIndexOf(".")))
  ).map((field) =>
    field.status === "available"
      ? {
        ...field,
        explanation:
          `${field.field}: supported member; it can be replaced independently of its unavailable neighbors.`,
      }
      : field
  );
}

export function fieldReplacementInput(
  field: string,
): { kind: FieldDefinition["kind"]; options?: Record<number, string> } {
  const definition = definitions[field];
  if (!definition) throw new Error(`No supported replacement for ${field}.`);
  if (["room", "entrance", "roomWithEntrance"].includes(field)) {
    throw new Error(
      `No supported replacement for ${field}; replace entranceIndex instead.`,
    );
  }
  if (Object.keys(definitions).some((name) => name.startsWith(`${field}.`))) {
    throw new Error(
      `Replace individual members of ${field}; a whole-field replacement could overwrite unsupported neighbors.`,
    );
  }
  return { kind: definition.kind, options: definition.options };
}

export function parseFieldReplacement(field: string, text: string): FieldValue {
  const { kind } = fieldReplacementInput(field);
  if (kind === "text") return text;
  if (kind === "boolean") {
    if (text !== "true" && text !== "false") {
      throw new Error("Enter true or false explicitly.");
    }
    return text === "true";
  }
  if (!text.trim()) throw new Error("Enter an explicit replacement value.");
  if (kind === "array") {
    return text.split(",").map((value) => Number(value.trim()));
  }
  return Number(text);
}

/** A rendering view; unavailable fields remain undefined rather than guessed. */
export function readableSlot(slot: SaveSlot): SaveSlot {
  return new Proxy(slot, {
    get(target, property) {
      if (property === "additionalData") {
        const data = { ...target.additionalData };
        for (const [key, spec] of Object.entries(additionalFields)) {
          if ("boolean" in spec) {
            (data as Record<string, unknown>)[key] =
              interpretSlotField(target, `additionalData.${key}`).value;
          }
        }
        return data;
      }
      if (typeof property === "string" && definitions[property]) {
        return interpretSlotField(target, property).value;
      }
      return Reflect.get(target, property, target);
    },
  });
}

export interface FieldReplacement {
  field: string;
  value: unknown;
  explanation: string;
  changes: readonly { offset: number; before: number; after: number }[];
}

const proposals = new WeakMap<
  FieldReplacement,
  { slot: SaveSlot; original: string }
>();

export function prepareFieldReplacement(
  slot: SaveSlot,
  field: string,
  value: unknown,
): FieldReplacement {
  fieldReplacementInput(field);
  const original = interpretSlotField(slot, field);
  const definition = definitions[field];
  if (
    definition.kind === "boolean" && typeof value !== "boolean" ||
    definition.kind === "text" && typeof value !== "string" ||
    definition.kind === "number" &&
      (typeof value !== "number" || !Number.isInteger(value)) ||
    definition.kind === "array" &&
      (!Array.isArray(value) || value.some((item) => !Number.isInteger(item)))
  ) throw new Error(`Unsupported replacement type for ${field}.`);
  if (definition.options && !(String(value) in definition.options)) {
    throw new Error(`Choose a supported value for ${field}.`);
  }
  const copy = new SaveSlot(slot.data.slice());
  definition.write(copy, value as FieldValue);
  const interpreted = interpretSlotField(copy, field);
  if (
    interpreted.status === "unavailable" ||
    JSON.stringify(interpreted.value) !== JSON.stringify(value)
  ) throw new Error(`Replacement cannot be represented by ${field}.`);
  const changes = Array.from(slot.data).flatMap((before, offset) =>
    before === copy.data[offset]
      ? []
      : [{ offset, before, after: copy.data[offset] }]
  );
  const replacement = Object.freeze({
    field,
    value,
    explanation: `Replace ${field} with ${
      JSON.stringify(value)
    }. Only this field is changed; checksums follow the export policy.`,
    changes: Object.freeze(changes.map((change) => Object.freeze(change))),
  });
  proposals.set(replacement, {
    slot,
    original: JSON.stringify(original.storedValue),
  });
  return replacement;
}

export function applyFieldReplacement(
  slot: SaveSlot,
  replacement: FieldReplacement,
): void {
  const proposal = proposals.get(replacement);
  if (!proposal || proposal.slot !== slot) {
    throw new Error(
      "Replacement must be prepared for this record before acceptance.",
    );
  }
  if (
    JSON.stringify(interpretSlotField(slot, replacement.field).storedValue) !==
      proposal.original
  ) {
    throw new Error(
      "Field changed since the replacement was prepared. Review it again.",
    );
  }
  if (
    replacement.changes.some(({ offset, before }) =>
      slot.data[offset] !== before
    )
  ) {
    throw new Error(
      "Field changed since the replacement was prepared. Review it again.",
    );
  }
  proposals.delete(replacement);
  for (const { offset, after } of replacement.changes) {
    slot.data[offset] = after;
  }
}
