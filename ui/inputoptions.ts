import { ExportByteOrder } from "../models/savefile.ts";
import type { InputInterpretation } from "../utils/inputdiagnostics.ts";

export const inputByteOrderOptions = [
  { value: ExportByteOrder.BigEndian, label: "Big-endian" },
  { value: ExportByteOrder.WordSwapped, label: "Word-swapped (32-bit)" },
] as const;

export function inputEvidenceLines(inspection: InputInterpretation): string[] {
  return inspection.candidates.map((candidate) => {
    const label = inputByteOrderOptions.find((option) =>
      option.value === candidate.order
    )!.label;
    const markers = candidate.slots.filter((slot) => slot.markerValid)
      .map((slot) => `${slot.record} ${slot.index + 1}`).join(", ") || "none";
    const checksums = candidate.slots.filter((slot) =>
      slot.checksumValid
    ).length;
    return `${label}: header signature ${
      candidate.headerSignatureValid
        ? "complete"
        : `incomplete (${candidate.headerMatches}/9 matches)`
    }; occupied markers: ${markers}; checksums passing: ${checksums}/6 (corroboration only).`;
  });
}
