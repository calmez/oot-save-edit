import { ChecksumPolicy } from "../models/savefile.ts";
import type { SraSaveFile } from "../models/savefile.ts";
import {
  applyCorrections,
  discoverCorrections,
  previewCorrections,
} from "../utils/corrections.ts";
import type {
  CorrectionPlan,
  CorrectionResult,
  CorrectionSuggestion,
  OutcomeConstraint,
} from "../utils/corrections.ts";
import { diagnoseSave } from "../utils/diagnostics.ts";
import type {
  DiagnosticFinding,
  DiagnosticScope,
} from "../utils/diagnostics.ts";

export function correctionLabel(scope: DiagnosticScope): string {
  return scope.kind === "slot"
    ? `${scope.record === "primary" ? "Slot" : "Backup"} ${
      scope.index + 1
    }: ${scope.field}`
    : `${scope.kind}: ${scope.field}`;
}

export function changeBytes(bytes: number[]): string {
  return bytes.map((value) => value.toString(16).padStart(2, "0")).join(" ");
}

function sameScope(a: DiagnosticScope, b: DiagnosticScope): boolean {
  return a.kind === b.kind && a.field === b.field &&
    (a.kind !== "slot" ||
      b.kind === "slot" && a.record === b.record && a.index === b.index);
}

export class CorrectionReview {
  plan: CorrectionPlan;
  selected: string[] = [];
  history: CorrectionResult[] = [];
  checksumPolicy?: ChecksumPolicy;
  private outcome: OutcomeConstraint[] = [];
  private filter: (suggestion: CorrectionSuggestion) => boolean = () => true;

  constructor(private readonly save: SraSaveFile) {
    this.plan = discoverCorrections(save);
  }

  get sourceFindings(): DiagnosticFinding[] {
    return structuredClone([
      ...(this.save.sourceFile?.findings ?? []),
      ...(this.save.inputInterpretation?.findings ?? []),
    ]);
  }

  get findings(): DiagnosticFinding[] {
    const sourceIds = new Set(this.sourceFindings.map((finding) => finding.id));
    return diagnoseSave(this.save).findings.filter((finding) =>
      !sourceIds.has(finding.id)
    );
  }

  open(
    filter: (suggestion: CorrectionSuggestion) => boolean = () => true,
  ): void {
    this.filter = filter;
    this.plan = discoverCorrections(this.save, this.outcome);
    this.selectRecommended();
  }

  refresh(): void {
    this.plan = discoverCorrections(this.save, this.plan.outcome);
    this.selectRecommended();
  }

  get suggestions(): CorrectionSuggestion[] {
    return this.plan.suggestions.filter(this.filter);
  }

  private selectRecommended(): void {
    this.selected = this.plan.suggestions.filter((item) =>
      item.recommended && this.filter(item)
    ).map((item) => item.id);
  }

  preview(): CorrectionResult {
    return previewCorrections(this.save, this.plan, this.selected);
  }

  toggle(id: string): void {
    this.selected = this.selected.includes(id)
      ? this.selected.filter((item) => item !== id)
      : [...this.selected, id];
  }

  cancel(): void {
    this.selected = [];
  }

  declineAll(): void {
    this.selected = [];
  }

  retain(id: string): void {
    const item = this.plan.suggestions.find((item) => item.id === id);
    if (!item) throw new Error(`Unknown correction ${id}.`);
    this.assertFresh();
    const outcome = this.plan.outcome.filter((entry) =>
      !sameScope(entry.scope, item.scope)
    );
    outcome.push({ scope: item.scope, value: [...item.changes[0].before] });
    this.plan = discoverCorrections(this.save, outcome);
    this.selected = this.selected.filter((selected) => selected !== id);
  }

  allowCorrection(id: string): void {
    const item = this.plan.suggestions.find((item) => item.id === id);
    if (!item) throw new Error(`Unknown correction ${id}.`);
    this.assertFresh();
    this.plan = discoverCorrections(
      this.save,
      this.plan.outcome.filter((entry) => !sameScope(entry.scope, item.scope)),
    );
    if (!this.selected.includes(id)) this.selected.push(id);
  }

  private assertFresh(): void {
    previewCorrections(
      this.save,
      { ...this.plan, outcome: [] },
      this.plan.suggestions.map((item) => item.id),
    );
  }

  confirm(): CorrectionResult {
    const result = applyCorrections(this.save, this.plan, this.selected);
    this.history.push(result);
    this.outcome = structuredClone(this.plan.outcome);
    this.checksumPolicy =
      this.plan.suggestions.some((item) =>
          this.filter(item) && item.scope.field === "checksum" &&
          !this.selected.includes(item.id)
        )
        ? ChecksumPolicy.Preserve
        : undefined;
    this.open(this.filter);
    return result;
  }
}
