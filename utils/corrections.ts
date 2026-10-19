import type { SraSaveFile } from "../models/savefile.ts";
import { SaveHeader } from "../models/saveheader.ts";
import { SaveSlot } from "../models/saveslot.ts";
import { toUint8Array } from "./conversions.ts";
import { diagnoseSave, DiagnosticConfidence } from "./diagnostics.ts";
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
  suggestions: CorrectionSuggestion[];
  outcome: OutcomeConstraint[];
  conflicts: CorrectionConflict[];
  /** Findings without a supported correction, including uncertain interpretations. */
  unresolved: DiagnosticFinding[];
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
    outcome: structuredClone(outcome),
    conflicts: [],
    unresolved: diagnosis.findings.filter((finding) =>
      !suggestions.some((item) => item.findingIds.includes(finding.id))
    ),
  };
  return plan;
}

export interface CorrectionResult {
  selected: string[];
  changes: CorrectionChange[];
  /** Omitted checksum corrections needed after the selected marker changes. */
  requiredCorrections: string[];
  conflicts: CorrectionConflict[];
  excluded: string[];
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
): CorrectionSuggestion[] {
  const current = collectCorrections(save);
  const chosen: CorrectionSuggestion[] = [];
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
  return chosen;
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
): CorrectionResult {
  const chosen = validateSelection(save, plan, selected);
  const copies = new Map<string, Uint8Array>();
  const recordKey = (scope: DiagnosticScope): string =>
    scope.kind === "slot" ? `${scope.record}.${scope.index}` : scope.kind;
  const copyFor = (scope: DiagnosticScope): Uint8Array => {
    const key = recordKey(scope);
    if (!copies.has(key)) copies.set(key, recordData(save, scope).slice());
    return copies.get(key)!;
  };
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
  validateOutcome(plan.outcome, copyFor);
  const changes = chosen.flatMap((item) =>
    item.changes.map((change) => ({
      ...structuredClone(change),
      after: [
        ...copyFor(change.scope).slice(
          change.offset,
          change.offset + change.before.length,
        ),
      ],
    }))
  ).filter((change) => !equal(change.before, change.after));
  const requiredCorrections = chosen.filter((item) =>
    item.scope.field === "marker" &&
    !new SaveSlot(copyFor(item.scope)).isChecksumValid()
  ).map((item) =>
    `slot.checksum:${scopeKey({ ...item.scope, field: "checksum" })}`
  );
  return {
    selected: [...selected],
    changes,
    requiredCorrections,
    conflicts: [],
    excluded: [],
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
): CorrectionResult {
  const result = previewCorrections(save, plan, selected);
  for (const change of result.changes) {
    recordData(save, change.scope).set(change.after, change.offset);
  }
  return result;
}

/** Discover proposals and exclude recommendations that conflict with the requested outcome. */
export function discoverCorrections(
  save: SraSaveFile,
  outcome: OutcomeConstraint[] = [],
): CorrectionPlan {
  const plan = collectCorrections(save, outcome);
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
