import { additionalFields, fieldRange } from "../models/additionaldata.ts";
import type { AdditionalSaveData } from "../models/additionaldata.ts";
import type { SaveSlot } from "../models/saveslot.ts";
import { interpretSlotField } from "../utils/fieldinterpretation.ts";

export type AdditionalFieldKey = keyof AdditionalSaveData;

export function additionalFieldValue(
  slot: SaveSlot,
  key: AdditionalFieldKey,
): string {
  const interpretation = interpretSlotField(slot, `additionalData.${key}`);
  if (interpretation.status !== "available") {
    return `Unavailable (${
      JSON.stringify(interpretation.storedValue)
    }); use Field interpretations`;
  }
  const value = slot.additionalData[key];
  const spec = additionalFields[key];
  if (Array.isArray(value)) {
    return "hex" in spec && spec.hex
      ? value.map((byte) => byte.toString(16).padStart(2, "0")).join(" ")
      : value.join(", ");
  }
  return String(value);
}

export function setAdditionalField(
  slot: SaveSlot,
  key: AdditionalFieldKey,
  text: string,
): void {
  const spec = additionalFields[key];
  let value: number | boolean | number[];
  if ("boolean" in spec && spec.boolean) {
    if (text !== "true" && text !== "false") {
      throw new Error("Choose true or false.");
    }
    value = text === "true";
  } else if ("length" in spec) {
    if ("hex" in spec && spec.hex) {
      const hex = text.replace(/\s/g, "");
      if (!/^[0-9a-f]*$/i.test(hex) || hex.length !== spec.length * 2) {
        throw new Error(`Enter exactly ${spec.length} hexadecimal bytes.`);
      }
      value = Array.from(
        { length: spec.length },
        (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16),
      );
    } else {
      const parts = text.split(",").map((part) => part.trim());
      if (parts.some((part) => part === "")) {
        throw new Error("Enter comma-separated integers.");
      }
      value = parts.map(Number);
    }
  } else {
    if (!text.trim()) throw new Error("Enter an integer.");
    value = Number(text);
  }
  slot.additionalData = { ...slot.additionalData, [key]: value };
}

export function additionalFieldHelp(key: AdditionalFieldKey): string {
  const field = additionalFields[key];
  if ("boolean" in field) return "true or false";
  const { min, max } = fieldRange(field);
  return "hex" in field
    ? "Two hex digits per byte; spaces are optional."
    : `${
      "length" in field ? `${field.length} comma-separated values; ` : ""
    }${min} to ${max}`;
}
