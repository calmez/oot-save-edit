import type { SaveSlot } from "./saveslot.ts";

/** Source-interpreted original N64 mapping; runtime compatibility remains unverified. */
export const skulltulaLocations = [
  {
    id: "kokiri-bean-patch",
    label: "Kokiri Forest: bean patch",
    offset: 0xEAB,
    mask: 1,
  },
  {
    id: "kokiri-know-it-all-house",
    label: "Kokiri Forest: Know-It-All House",
    offset: 0xEAB,
    mask: 2,
  },
  {
    id: "kokiri-house-of-twins",
    label: "Kokiri Forest: House of Twins",
    offset: 0xEAB,
    mask: 4,
  },
] as const;

export type SkulltulaLocationId = typeof skulltulaLocations[number]["id"];

export type SkulltulaIntent =
  & {
    record: "primary" | "backup";
    index: number;
  }
  & (
    | {
      kind: "locations";
      locations: Partial<Record<SkulltulaLocationId, boolean>>;
    }
    | { kind: "total"; total: number }
  );

export const skulltulaEvidence = {
  source:
    "https://github.com/calmez/oot-save-edit/blob/develop/docs/skulltula-reconciliation.md",
  reference:
    "Pinned N64 acquisition code, GS masks and Kokiri Forest location table",
  applicability:
    "Source-interpreted original N64 rules; three Kokiri Forest locations",
  limitations:
    "3 of 100 locations mapped; no exact ROM/platform identification or runtime compatibility claim. Pickup precedes flag storage; totals are not a universal source of truth. No evidenced indicator-clearing rule.",
};

export function readSkulltulaLocations(
  slot: SaveSlot,
): Record<SkulltulaLocationId, boolean> {
  return Object.fromEntries(skulltulaLocations.map((location) => [
    location.id,
    (slot.data[location.offset] & location.mask) !== 0,
  ])) as Record<SkulltulaLocationId, boolean>;
}

export function knownSkulltulaCount(slot: SaveSlot): number {
  return Object.values(readSkulltulaLocations(slot)).filter(Boolean).length;
}

/** Writes only explicit intent fields on the caller's copy. */
export function stageSkulltulaIntent(
  slot: SaveSlot,
  intent: SkulltulaIntent,
): void {
  if (intent.kind === "total") {
    if (
      !Number.isInteger(intent.total) || intent.total < 0 || intent.total > 100
    ) {
      throw new Error(
        "Requested Skulltula total must be an integer from 0 to 100.",
      );
    }
    slot.goldSkulltulaTokens = intent.total;
  } else if (intent.kind === "locations") {
    if (!intent.locations || Object.keys(intent.locations).length === 0) {
      throw new Error("Choose at least one known Skulltula location.");
    }
    const edits = Object.entries(intent.locations).map(([id, value]) => {
      const location = skulltulaLocations.find((item) => item.id === id);
      if (!location || typeof value !== "boolean") {
        throw new Error(`Unsupported Skulltula location edit: ${id}.`);
      }
      return { location, value };
    });
    for (const { location, value } of edits) {
      const before = slot.data[location.offset];
      slot.data[location.offset] = value
        ? before | location.mask
        : before & ~location.mask;
    }
  } else {
    throw new Error("Unsupported Skulltula editing intent.");
  }
}

export function inspectSkulltulaProgress(
  slot: SaveSlot,
): Array<{ ruleId: string; field: string; explanation: string }> {
  const known = knownSkulltulaCount(slot);
  const findings = [{
    ruleId: "skulltula.coverage",
    field: "skulltula.locations",
    explanation:
      `Partial coverage: 3 of 100 locations mapped; ${known} known collected. Other bits are uninterpreted and excluded. No absolute total is recommended. Source-interpreted original N64 mapping; exact ROM/platform unverified.`,
  }];
  if (slot.goldSkulltulaTokens < known) {
    findings.push({
      ruleId: "skulltula.disagreement",
      field: "goldSkulltulaTokens",
      explanation:
        `Stored total ${slot.goldSkulltulaTokens} is below ${known} known collected locations under the original N64 mapping. Retain the requested total and review locations separately, or explicitly request another total. Neither representation has universal precedence; pickup timing and modified games remain unresolved.`,
    });
  }
  if (
    (slot.data[0xA5] & 0x80) === 0 &&
    (known > 0 || slot.goldSkulltulaTokens > 0)
  ) {
    findings.push({
      ruleId: "skulltula.indicator",
      field: "skulltula.indicator",
      explanation:
        "The token indicator is absent despite a positive total or known collections. Original N64 acquisition sets it. Retain it, or select the acquisition-consistent alternative; manually edited totals alone do not prove acquisition.",
    });
  }
  if (slot.goldSkulltulaTokens === 0 && (slot.data[0xA5] & 0x80) !== 0) {
    findings.push({
      ruleId: "skulltula.zero-indicator",
      field: "skulltula.indicator",
      explanation:
        "Zero total with token indicator present: no evidenced zero/removal rule; the indicator is retained.",
    });
  }
  return findings;
}

export function describeSkulltulaIntent(intent: SkulltulaIntent): string {
  if (intent.kind === "total") {
    return `Requested token total: ${intent.total}. All collection locations stay unchanged.`;
  }
  return `Requested locations: ${
    skulltulaLocations.filter((location) => location.id in intent.locations)
      .map((location) =>
        `${location.label} = ${
          intent.locations[location.id] ? "collected" : "uncollected"
        }`
      ).join("; ")
  }. The stored total stays unchanged.`;
}
