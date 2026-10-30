import type { SraSaveFile } from "../models/savefile.ts";
import type { SkulltulaLocationId } from "../models/skulltulas.ts";
import { discoverCorrections } from "./corrections.ts";
import type { CorrectionPlan } from "./corrections.ts";

/** Stage a deliberate location edit for review; the save remains unchanged until apply. */
export function prepareSkulltulaLocations(
  save: SraSaveFile,
  record: "primary" | "backup",
  index: number,
  locations: Partial<Record<SkulltulaLocationId, boolean>>,
): CorrectionPlan {
  return discoverCorrections(save, [], {
    kind: "locations",
    record,
    index,
    locations,
  });
}

/** Request a total without selecting, clearing or fabricating any collection locations. */
export function prepareSkulltulaTotal(
  save: SraSaveFile,
  record: "primary" | "backup",
  index: number,
  total: number,
): CorrectionPlan {
  return discoverCorrections(save, [], { kind: "total", record, index, total });
}
