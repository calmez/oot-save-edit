import type { SraSaveFile } from "../models/savefile.ts";
import { SaveHeader } from "../models/saveheader.ts";
import { SaveSlot } from "../models/saveslot.ts";
import {
  inspectSkulltulaProgress,
  skulltulaEvidence,
  stageSkulltulaIntent,
} from "../models/skulltulas.ts";
import type { SkulltulaIntent } from "../models/skulltulas.ts";
import { toUint8Array } from "./conversions.ts";
import {
  diagnoseSave,
  DiagnosticCategory,
  DiagnosticConfidence,
} from "./diagnostics.ts";
import type {
  DiagnosticEvidence,
  DiagnosticFinding,
  DiagnosticScope,
} from "./diagnostics.ts";

/** Values are canonical big-endian bytes for the complete named structural field. */
export interface OutcomeConstraint {
  scope: DiagnosticScope;
  value: number[];
}

export interface CorrectionChange {
  scope: DiagnosticScope;
  offset: number;
  before: number[];
  after: number[];
}

export interface CorrectionSuggestion {
  id: string;
  findingIds: string[];
  scope: DiagnosticScope;
  changes: CorrectionChange[];
  rationale: string;
  confidence: DiagnosticConfidence;
  evidence: DiagnosticEvidence[];
  recommended: boolean;
  /** Full affected record snapshot; any intervening edit requires rediscovery. */
  precondition: number[];
  alternatives: string[];
  /** Selection that can change this proposal's calculated checksum. */
  dependsOn: string[];
}

export interface CorrectionConflict {
  code: "outcome" | "stale" | "unsupported" | "selection";
  correctionId?: string;
  scope?: DiagnosticScope;
  explanation: string;
}

export interface CorrectionPlan {
  skulltula?: { intent: SkulltulaIntent; precondition: number[] };
  suggestions: CorrectionSuggestion[];
  recovery: RecoverySuggestion[];
  outcome: OutcomeConstraint[];
  conflicts: CorrectionConflict[];
  /** Findings without a supported correction, including uncertain interpretations. */
  unresolved: DiagnosticFinding[];
}

export interface RecoverySuggestion {
  id: string;
  index: number;
  source: "primary" | "backup";
  destination: "primary" | "backup";
  action: "restore" | "synchronize";
  sourceBytes: number[];
  destinationBytes: number[];
  sourceIntegrity: {
    markerValid: boolean | null;
    checksumValid: boolean | null;
  };
  destinationIntegrity: {
    markerValid: boolean | null;
    checksumValid: boolean | null;
  };
}

export interface RecoveryReplacement {
  id: string;
  index: number;
  source: "primary" | "backup";
  destination: "primary" | "backup";
  before: number[];
  after: number[];
  checksumRecalculated: boolean;
  markerRepaired: boolean;
}

function validSlotScope(scope: DiagnosticScope): boolean {
  return scope.kind === "slot" &&
    (scope.record === "primary" || scope.record === "backup") &&
    Number.isInteger(scope.index) && scope.index >= 0 && scope.index < 3;
}

function recordData(save: SraSaveFile, scope: DiagnosticScope): Uint8Array {
  if (scope.kind === "header") return save.header.data;
  if (scope.kind === "slot" && validSlotScope(scope)) {
    return (scope.record === "primary" ? save.slots : save.backups)[scope.index]
      .data;
  }
  throw new Error(`Unsupported correction scope: ${JSON.stringify(scope)}.`);
}

function scopeKey(scope: DiagnosticScope): string {
  return scope.kind === "slot"
    ? `${scope.record}.${scope.index}.${scope.field}`
    : `${scope.kind}.${scope.field}`;
}

function fieldLayout(
  scope: DiagnosticScope,
): { offset: number; size: number } | undefined {
  if (scope.kind === "header") {
    if (scope.field === "signature") return { offset: 3, size: 9 };
    if (scope.field === "padding") return { offset: 12, size: 5 };
  }
  if (scope.kind === "slot") {
    if (scope.field === "skulltula.indicator") return { offset: 0xA5, size: 1 };
    if (scope.field === "goldSkulltulaTokens") return { offset: 0xD0, size: 2 };
    if (scope.field === "marker") return { offset: 0x1C, size: 6 };
    if (scope.field === "checksum") return { offset: 0x1352, size: 2 };
  }
}

function equal(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

/** Enumerate supported repairs without changing bytes, source evidence, or export state. */
function collectCorrections(
  save: SraSaveFile,
  outcome: OutcomeConstraint[] = [],
  intent?: SkulltulaIntent,
): CorrectionPlan {
  const diagnosis = diagnoseSave(save);
  const suggestions: CorrectionSuggestion[] = [];
  const add = (
    finding: DiagnosticFinding,
    after: Uint8Array,
    dependsOn: string[] = [],
  ): void => {
    const scope = finding.scope;
    const { offset, size } = fieldLayout(scope)!;
    const data = recordData(save, scope);
    suggestions.push({
      id: finding.id,
      findingIds: diagnosis.findings.some((item) => item.id === finding.id)
        ? [finding.id]
        : [],
      scope: { ...scope },
      changes: [{
        scope: { ...scope },
        offset,
        before: [...data.slice(offset, offset + size)],
        after: [...after],
      }],
      rationale: dependsOn.length
        ? "Calculate the checksum from the final selected record changes; marker repair may require this separately selected correction."
        : finding.explanation,
      confidence: finding.confidence,
      evidence: structuredClone(finding.evidence),
      recommended: finding.confidence === DiagnosticConfidence.Evidenced,
      precondition: [...data],
      alternatives: scope.field === "padding"
        ? ["Retain the original padding by omitting this correction."]
        : [],
      dependsOn,
    });
  };
  for (const finding of diagnosis.findings) {
    if (finding.ruleId === "header.signature") {
      add(finding, SaveHeader.validCheckPattern);
    }
    if (finding.ruleId === "header.padding") {
      add(finding, SaveHeader.defaultPadding);
    }
    if (finding.ruleId === "slot.marker") {
      add(finding, SaveSlot.validCheckPattern);
    }
    if (finding.ruleId === "slot.checksum" && finding.scope.kind === "slot") {
      add(
        finding,
        toUint8Array(
          new SaveSlot(recordData(save, finding.scope).slice())
            .calculateChecksum(),
          2,
        ),
      );
    }
  }
  for (
    const marker of suggestions.filter((item) => item.scope.field === "marker")
  ) {
    const scope = { ...marker.scope, field: "checksum" };
    const id = `slot.checksum:${scopeKey(scope)}`;
    const checksum = suggestions.find((item) => item.id === id);
    if (checksum) checksum.dependsOn.push(marker.id);
    else {
      const finding = diagnosis.findings.find((item) => item.id === marker.id)!;
      add(
        { ...finding, id, scope },
        toUint8Array(
          new SaveSlot(recordData(save, scope).slice()).calculateChecksum(),
          2,
        ),
        [marker.id],
      );
    }
  }
  const plan: CorrectionPlan = {
    suggestions,
    recovery: collectRecovery(save),
    outcome: structuredClone(outcome),
    conflicts: [],
    unresolved: diagnosis.findings.filter((finding) =>
      !suggestions.some((item) => item.findingIds.includes(finding.id))
    ),
  };
  if (intent) {
    const scope: DiagnosticScope = {
      kind: "slot",
      record: intent.record,
      index: intent.index,
      field: "skulltula",
    };
    if (!validSlotScope(scope)) {
      throw new Error("Invalid Skulltula record selection.");
    }
    const data = recordData(save, scope);
    const slot = new SaveSlot(data.slice());
    if (slot.isEmpty) {
      throw new Error("Initialize a game before editing Skulltula progress.");
    }
    stageSkulltulaIntent(slot, intent);
    plan.skulltula = {
      intent: structuredClone(intent),
      precondition: [...data],
    };
    const stagedFindings: DiagnosticFinding[] = inspectSkulltulaProgress(slot)
      .map((finding) => ({
        ...finding,
        id:
          `${finding.ruleId}:${intent.record}.${intent.index}.${finding.field}`,
        scope: { ...scope, field: finding.field },
        category: DiagnosticCategory.Uncertainty,
        confidence: DiagnosticConfidence.Unknown,
        evidence: [skulltulaEvidence],
        context: diagnosis.context,
      }));
    plan.unresolved = plan.unresolved.filter((finding) =>
      !(finding.ruleId.startsWith("skulltula.") &&
        finding.scope.kind === "slot" &&
        finding.scope.record === intent.record &&
        finding.scope.index === intent.index)
    );
    plan.unresolved.push(...stagedFindings);
    const indicator = stagedFindings.find((finding) =>
      finding.ruleId === "skulltula.indicator"
    );
    if (indicator) {
      const collectedIntent = intent.kind === "locations" &&
        Object.values(intent.locations).some((value) => value === true);
      add({
        ...indicator,
        confidence: collectedIntent
          ? DiagnosticConfidence.Evidenced
          : DiagnosticConfidence.Unknown,
      }, new Uint8Array([slot.data[0xA5] | 0x80]));
      const suggestion = suggestions[suggestions.length - 1];
      suggestion.rationale =
        "Set the token indicator, as the original N64 acquisition path does. This is independently declinable; a requested total alone does not establish acquisition.";
      suggestion.alternatives = [
        "Keep the indicator unchanged by declining this adjustment.",
        "Choose a different total or location intent explicitly; locations are never invented to match a total.",
      ];
    }

    const checksumScope = { ...scope, field: "checksum" };
    if (
      !suggestions.some((item) =>
        scopeKey(item.scope) === scopeKey(checksumScope)
      )
    ) {
      add({
        id: `slot.checksum:${scopeKey(checksumScope)}`,
        ruleId: "slot.checksum",
        scope: checksumScope,
        explanation:
          "Recalculate checksum from the final requested edits and selected adjustments.",
        category: DiagnosticCategory.Structural,
        confidence: DiagnosticConfidence.Evidenced,
        evidence: [skulltulaEvidence],
        context: diagnosis.context,
      }, toUint8Array(slot.calculateChecksum(), 2));
    }
  }
  return plan;
}

export interface CorrectionResult {
  selected: string[];
  changes: CorrectionChange[];
  /** Omitted checksum corrections needed after the selected marker changes. */
  requiredCorrections: string[];
  conflicts: CorrectionConflict[];
  excluded: string[];
  replacements: RecoveryReplacement[];
}

function recoveryIntegrity(
  slot: SaveSlot,
): RecoverySuggestion["sourceIntegrity"] {
  const occupied = !slot.isEmpty;
  return {
    markerValid: occupied ? slot.isPatternValid : null,
    checksumValid: occupied ? slot.isChecksumValid() : null,
  };
}

function collectRecovery(save: SraSaveFile): RecoverySuggestion[] {
  const recovery: RecoverySuggestion[] = [];
  for (let index = 0; index < 3; index++) {
    const primary = save.slots[index];
    const backup = save.backups[index];
    if (primary.data.every((value, offset) => value === backup.data[offset])) {
      continue;
    }
    if (!primary.isEmpty) {
      recovery.push({
        id: `recovery.synchronize:primary.${index}.to.backup`,
        index,
        source: "primary",
        destination: "backup",
        action: "synchronize",
        sourceBytes: [...primary.data],
        destinationBytes: [...backup.data],
        sourceIntegrity: recoveryIntegrity(primary),
        destinationIntegrity: recoveryIntegrity(backup),
      });
    }
    if (!primary.isEmpty && !backup.isEmpty) {
      recovery.push({
        id: `recovery.restore:backup.${index}.to.primary`,
        index,
        source: "backup",
        destination: "primary",
        action: "restore",
        sourceBytes: [...backup.data],
        destinationBytes: [...primary.data],
        sourceIntegrity: recoveryIntegrity(backup),
        destinationIntegrity: recoveryIntegrity(primary),
      });
    } else if (!backup.isEmpty) {
      recovery.push({
        id: `recovery.restore:backup.${index}.to.primary`,
        index,
        source: "backup",
        destination: "primary",
        action: "restore",
        sourceBytes: [...backup.data],
        destinationBytes: [...primary.data],
        sourceIntegrity: recoveryIntegrity(backup),
        destinationIntegrity: recoveryIntegrity(primary),
      });
    }
  }
  return recovery;
}

function sameRecovery(a: RecoverySuggestion, b: RecoverySuggestion): boolean {
  return a.id === b.id && a.index === b.index && a.source === b.source &&
    a.destination === b.destination && a.action === b.action &&
    equal(a.sourceBytes, b.sourceBytes) &&
    equal(a.destinationBytes, b.destinationBytes) &&
    a.sourceIntegrity.markerValid === b.sourceIntegrity.markerValid &&
    a.sourceIntegrity.checksumValid === b.sourceIntegrity.checksumValid &&
    a.destinationIntegrity.markerValid === b.destinationIntegrity.markerValid &&
    a.destinationIntegrity.checksumValid ===
      b.destinationIntegrity.checksumValid;
}

export class CorrectionError extends Error {
  constructor(public readonly conflicts: CorrectionConflict[]) {
    super(conflicts.map((conflict) => conflict.explanation).join(" "));
    this.name = "CorrectionError";
  }
}

function fail(conflict: CorrectionConflict): never {
  throw new CorrectionError([conflict]);
}

function validateSelection(
  save: SraSaveFile,
  plan: CorrectionPlan,
  selected: string[],
): { chosen: CorrectionSuggestion[]; recoveries: RecoverySuggestion[] } {
  const current = collectCorrections(save, [], plan.skulltula?.intent);
  const chosen: CorrectionSuggestion[] = [];
  const recoveries: RecoverySuggestion[] = [];
  const currentRecovery = collectRecovery(save);
  const seen = new Set<string>();
  for (const id of selected) {
    if (seen.has(id)) {
      fail({
        code: "selection",
        correctionId: id,
        explanation: `Correction ${id} was selected more than once.`,
      });
    }
    seen.add(id);
    const recovery = plan.recovery.find((item) => item.id === id);
    if (recovery) {
      const supported = currentRecovery.find((item) => item.id === id);
      if (
        !supported || !sameRecovery(recovery, supported)
      ) {
        fail({
          code: "stale",
          correctionId: id,
          explanation:
            `Recovery choice ${id} is stale; refresh the review before confirming.`,
        });
      }
      recoveries.push(supported);
      continue;
    }
    const proposal = plan.suggestions.find((item) => item.id === id);
    const supported = current.suggestions.find((item) => item.id === id);
    if (!proposal) {
      fail({
        code: "unsupported",
        correctionId: id,
        explanation: `Unknown correction ${id}.`,
      });
    }
    let data: Uint8Array;
    try {
      data = recordData(save, proposal.scope);
    } catch {
      fail({
        code: "unsupported",
        correctionId: id,
        explanation: `Unsupported scope for correction ${id}.`,
      });
    }
    if (!equal(proposal.precondition, [...data])) {
      fail({
        code: "stale",
        correctionId: id,
        scope: proposal.scope,
        explanation:
          `Correction ${id} is stale; rediscover after editing its record.`,
      });
    }
    if (
      !supported ||
      !sameProposal(proposal, supported)
    ) {
      fail({
        code: "unsupported",
        correctionId: id,
        explanation:
          `Correction ${id} is unsupported or its proposal has been modified.`,
      });
    }
    chosen.push(supported);
  }
  const replacedPairs = new Set<number>();
  for (const recovery of recoveries) {
    if (replacedPairs.has(recovery.index)) {
      fail({
        code: "selection",
        correctionId: recovery.id,
        explanation: `Choose only one recovery replacement for pair ${
          recovery.index + 1
        }.`,
      });
    }
    replacedPairs.add(recovery.index);
  }
  return { chosen, recoveries };
}

function sameProposal(
  a: CorrectionSuggestion,
  b: CorrectionSuggestion,
): boolean {
  return scopeKey(a.scope) === scopeKey(b.scope) &&
    a.confidence === b.confidence &&
    a.dependsOn.length === b.dependsOn.length &&
    a.dependsOn.every((id, i) => id === b.dependsOn[i]) &&
    a.changes.length === b.changes.length &&
    a.changes.every((change, i) => {
      const expected = b.changes[i];
      return scopeKey(change.scope) === scopeKey(expected.scope) &&
        change.offset === expected.offset &&
        equal(change.before, expected.before) &&
        equal(change.after, expected.after);
    });
}

/** Validate and calculate a selection on copies; never serializes or repairs the working save. */
export function previewCorrections(
  save: SraSaveFile,
  plan: CorrectionPlan,
  selected: string[],
  replacementChecksums: Record<string, boolean> = {},
  replacementMarkers: Record<string, boolean> = {},
): CorrectionResult {
  const { chosen, recoveries } = validateSelection(save, plan, selected);
  const requestedChanges: CorrectionChange[] = [];
  if (plan.skulltula) {
    const { intent, precondition } = plan.skulltula;
    const scope: DiagnosticScope = {
      kind: "slot",
      record: intent.record,
      index: intent.index,
      field: "skulltula",
    };
    const data = recordData(save, scope);
    if (!equal(precondition, [...data])) {
      fail({
        code: "stale",
        scope,
        explanation: "Skulltula review is stale; refresh before confirming.",
      });
    }
    if (
      recoveries.some((item) =>
        item.index === intent.index && item.destination === intent.record
      )
    ) {
      fail({
        code: "selection",
        scope,
        explanation:
          "Review Skulltula edits separately from replacement of the same record.",
      });
    }
    const staged = new SaveSlot(data.slice());
    stageSkulltulaIntent(staged, intent);
    for (let offset = 0; offset < data.length; offset++) {
      if (data[offset] !== staged.data[offset]) {
        requestedChanges.push({
          scope: {
            ...scope,
            field: intent.kind === "total"
              ? "goldSkulltulaTokens"
              : "skulltula.locations",
          },
          offset,
          before: [data[offset]],
          after: [staged.data[offset]],
        });
      }
    }
  }
  const copies = new Map<string, Uint8Array>();
  const recordKey = (scope: DiagnosticScope): string =>
    scope.kind === "slot" ? `${scope.record}.${scope.index}` : scope.kind;
  const copyFor = (scope: DiagnosticScope): Uint8Array => {
    const key = recordKey(scope);
    if (!copies.has(key)) copies.set(key, recordData(save, scope).slice());
    return copies.get(key)!;
  };
  const replacements = recoveries.map((recovery): RecoveryReplacement => {
    const source = (recovery.source === "primary" ? save.slots : save.backups)[
      recovery.index
    ];
    const destination =
      (recovery.destination === "primary" ? save.slots : save.backups)[
        recovery.index
      ];
    const before = destination.data.slice();
    const after = source.data.slice();
    after.set(before.subarray(0x1354, 0x1358), 0x1354);
    const markerRepaired = replacementMarkers[recovery.id] ?? false;
    if (markerRepaired) after.set(SaveSlot.validCheckPattern, 0x1C);
    const checksumRecalculated = replacementChecksums[recovery.id] ?? true;
    const scope: DiagnosticScope = {
      kind: "slot",
      record: recovery.destination,
      index: recovery.index,
      field: "replacement",
    };
    copyFor(scope).set(after);
    return {
      id: recovery.id,
      index: recovery.index,
      source: recovery.source,
      destination: recovery.destination,
      before: [...before],
      after: [...copyFor(scope)],
      checksumRecalculated,
      markerRepaired,
    };
  });
  for (const change of requestedChanges) {
    copyFor(change.scope).set(change.after, change.offset);
  }
  for (const item of chosen) {
    if (item.scope.field === "checksum") continue;
    for (const change of item.changes) {
      copyFor(change.scope).set(change.after, change.offset);
    }
  }
  for (const item of chosen) {
    if (item.scope.field === "checksum") {
      new SaveSlot(copyFor(item.scope)).updateChecksum();
    }
  }
  for (const replacement of replacements) {
    if (replacement.checksumRecalculated) {
      new SaveSlot(copyFor({
        kind: "slot",
        record: replacement.destination,
        index: replacement.index,
        field: "checksum",
      })).updateChecksum();
    }
  }
  validateOutcome(plan.outcome, copyFor);
  const changes = [
    ...requestedChanges,
    ...chosen.flatMap((item) =>
      item.changes.map((change) => ({
        ...structuredClone(change),
        after: [
          ...copyFor(change.scope).slice(
            change.offset,
            change.offset + change.before.length,
          ),
        ],
      }))
    ),
  ].filter((change) => !equal(change.before, change.after));
  const requiredCorrections = chosen.filter((item) =>
    item.scope.field === "marker" &&
    !new SaveSlot(copyFor(item.scope)).isChecksumValid()
  ).map((item) =>
    `slot.checksum:${scopeKey({ ...item.scope, field: "checksum" })}`
  );
  for (const replacement of replacements) {
    const destinationScope: DiagnosticScope = {
      kind: "slot",
      record: replacement.destination,
      index: replacement.index,
      field: "replacement",
    };
    replacement.after = [...copyFor(destinationScope)];
  }
  return {
    selected: [...selected],
    changes,
    requiredCorrections,
    conflicts: [],
    excluded: [],
    replacements,
  };
}

function validateOutcome(
  outcome: OutcomeConstraint[],
  copyFor: (scope: DiagnosticScope) => Uint8Array,
): void {
  const conflicts: CorrectionConflict[] = [];
  for (const constraint of outcome) {
    const layout = fieldLayout(constraint.scope);
    if (
      !layout || constraint.value.length !== layout.size ||
      constraint.value.some((value) =>
        !Number.isInteger(value) || value < 0 || value > 255
      ) ||
      (constraint.scope.kind === "slot" && !validSlotScope(constraint.scope))
    ) {
      fail({
        code: "unsupported",
        scope: constraint.scope,
        explanation: `Unsupported outcome constraint for ${
          scopeKey(constraint.scope)
        }; use complete structural field bytes.`,
      });
    }
    const after = copyFor(constraint.scope).slice(
      layout.offset,
      layout.offset + layout.size,
    );
    if (!equal([...after], constraint.value)) {
      conflicts.push({
        code: "outcome",
        scope: constraint.scope,
        explanation:
          `Selected corrections do not satisfy the requested value for ${
            scopeKey(constraint.scope)
          }.`,
      });
    }
  }
  if (conflicts.length) throw new CorrectionError(conflicts);
}

/** Apply only after the complete selection and outcome have passed preview validation. */
export function applyCorrections(
  save: SraSaveFile,
  plan: CorrectionPlan,
  selected: string[],
  replacementChecksums: Record<string, boolean> = {},
  replacementMarkers: Record<string, boolean> = {},
): CorrectionResult {
  const result = previewCorrections(
    save,
    plan,
    selected,
    replacementChecksums,
    replacementMarkers,
  );
  for (const replacement of result.replacements) {
    const destination =
      (replacement.destination === "primary" ? save.slots : save.backups)[
        replacement.index
      ];
    destination.data.set(replacement.after);
  }
  for (const change of result.changes) {
    recordData(save, change.scope).set(change.after, change.offset);
  }
  return result;
}

/** Discover proposals and exclude recommendations that conflict with the requested outcome. */
export function discoverCorrections(
  save: SraSaveFile,
  outcome: OutcomeConstraint[] = [],
  intent?: SkulltulaIntent,
): CorrectionPlan {
  const plan = collectCorrections(save, outcome, intent);
  const recommendation = recommendedSelection(save, plan);
  plan.conflicts = recommendation.conflicts;
  for (const suggestion of plan.suggestions) {
    suggestion.recommended = recommendation.selected.includes(suggestion.id);
  }
  return plan;
}

function recommendedSelection(
  save: SraSaveFile,
  plan: CorrectionPlan,
): CorrectionResult {
  let selected = plan.suggestions.filter((item) =>
    item.confidence === DiagnosticConfidence.Evidenced
  ).map((item) => item.id);
  const conflicts: CorrectionConflict[] = [];
  let constraints = plan.outcome;
  while (true) {
    try {
      const result = previewCorrections(
        save,
        { ...plan, outcome: constraints },
        selected,
      );
      return {
        ...result,
        conflicts,
        excluded: plan.suggestions.filter((item) => !selected.includes(item.id))
          .map((item) => item.id),
      };
    } catch (error) {
      if (
        !(error instanceof CorrectionError) ||
        error.conflicts.some((item) => item.code !== "outcome")
      ) throw error;
      conflicts.push(...error.conflicts);
      const keys = new Set(
        error.conflicts.map((item) => scopeKey(item.scope!)),
      );
      selected = selected.filter((id) =>
        !keys.has(
          scopeKey(plan.suggestions.find((item) => item.id === id)!.scope),
        )
      );
      constraints = constraints.filter((item) =>
        !keys.has(scopeKey(item.scope))
      );
    }
  }
}

/** Apply compatible evidenced corrections; report excluded or unresolved outcome conflicts. */
export function applyRecommendedCorrections(
  save: SraSaveFile,
  plan: CorrectionPlan,
): CorrectionResult {
  const result = recommendedSelection(save, plan);
  // The same validated change set is committed without replacing any model objects.
  for (const change of result.changes) {
    recordData(save, change.scope).set(change.after, change.offset);
  }
  return result;
}
