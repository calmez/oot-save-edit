import type { SaveSlot } from "../models/saveslot.ts";

/** These getters reject stored values that have no supported interpretation. */
export function slotDisplayError(slot: SaveSlot): string | null {
  if (slot.isEmpty) return null;
  const errors: string[] = [];
  for (
    const field of [
      "playerName",
      "ddOnly",
      "magicFlag1",
      "magicFlag2",
      "biggoronsSwordFlag2",
    ] as const
  ) {
    try {
      void slot[field];
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      errors.push(`${field}: ${error.message}`);
    }
  }
  return errors.length
    ? `Cannot display this record with the selected input interpretation. ${
      errors.join(" ")
    } Original bytes are preserved. Choose another input byte order to reconsider the interpretation; other records and export remain available.`
    : null;
}
