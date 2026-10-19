import { ExportByteOrder } from "../models/savefile.ts";
import { SaveHeader } from "../models/saveheader.ts";
import { SaveSlot } from "../models/saveslot.ts";
import { DiagnosticCategory, DiagnosticConfidence } from "./diagnostics.ts";
import type { DiagnosticFinding } from "./diagnostics.ts";
import { FileUtil } from "./fileutil.ts";
import type { SourceFileInfo } from "./fileutil.ts";

export type InputByteOrder =
  | ExportByteOrder.BigEndian
  | ExportByteOrder.WordSwapped;

export interface ByteOrderSlotEvidence {
  record: "primary" | "backup";
  index: number;
  empty: boolean;
  markerValid: boolean;
  checksumValid: boolean;
}

export interface ByteOrderCandidate {
  order: InputByteOrder;
  headerSignatureValid: boolean;
  headerMatches: number;
  slots: ByteOrderSlotEvidence[];
  supported: boolean;
}

interface ByteOrderEvidence {
  candidates: [ByteOrderCandidate, ByteOrderCandidate];
  findings: DiagnosticFinding[];
}

export type InputInterpretation =
  & ByteOrderEvidence
  & (
    | {
      state: "unresolved";
      selectedOrder: null;
      confidence: DiagnosticConfidence.Unknown;
    }
    | {
      state: "detected";
      selectedOrder: InputByteOrder;
      confidence: DiagnosticConfidence.Evidenced;
    }
    | {
      state: "overridden";
      selectedOrder: InputByteOrder;
      confidence: DiagnosticConfidence.Unknown;
    }
  );

export class UnresolvedByteOrderError extends Error {
  sourceFile?: SourceFileInfo;
  constructor(
    readonly inspection: InputInterpretation,
    readonly sourceData: Uint8Array,
  ) {
    super("Unresolved input byte order; choose big-endian or word-swapped.");
    this.name = "UnresolvedByteOrderError";
  }
}

/** Inspect SRAM only; callers identify its enclosing container separately. */
export function inspectInputByteOrder(
  bytes: Uint8Array,
  order = ExportByteOrder.Automatic,
  container: "sra" | "srm" = "sra",
): InputInterpretation {
  const requiredSize = SaveHeader.requiredSize + 6 * SaveSlot.requiredSize;
  if (bytes.length < requiredSize || bytes.length > 0x8000) {
    throw new Error(
      `Cannot inspect SRAM byte order: expected ${requiredSize} to 32768 bytes, got ${bytes.length}.`,
    );
  }
  if (
    order !== ExportByteOrder.Automatic &&
    order !== ExportByteOrder.BigEndian && order !== ExportByteOrder.WordSwapped
  ) {
    throw new Error(`Unsupported SRAM input byte order: ${order}.`);
  }
  const candidate = (
    data: Uint8Array,
    order: InputByteOrder,
  ): ByteOrderCandidate => {
    const header = new SaveHeader(data.slice(0, SaveHeader.requiredSize));
    const slots: ByteOrderSlotEvidence[] = [];
    for (let position = 0; position < 6; position++) {
      const offset = SaveHeader.requiredSize + position * SaveSlot.requiredSize;
      const slot = new SaveSlot(
        data.slice(offset, offset + SaveSlot.requiredSize),
      );
      slots.push({
        record: position < 3 ? "primary" : "backup",
        index: position % 3,
        empty: slot.isEmpty,
        markerValid: slot.isPatternValid,
        checksumValid: slot.isChecksumValid(),
      });
    }
    return {
      order,
      headerSignatureValid: header.isPatternValid,
      headerMatches: SaveHeader.validCheckPattern.reduce(
        (total, value, index) => total + Number(data[index + 3] === value),
        0,
      ),
      slots,
      supported: header.isPatternValid ||
        slots.some((slot) => slot.markerValid),
    };
  };
  const candidates: [ByteOrderCandidate, ByteOrderCandidate] = [
    candidate(bytes, ExportByteOrder.BigEndian),
    candidate(FileUtil.byteSwap(bytes), ExportByteOrder.WordSwapped),
  ];
  const supported = candidates.filter((candidate) => candidate.supported);
  const findings: DiagnosticFinding[] = [];
  const unresolved = supported.length !== 1;
  if (unresolved || order !== ExportByteOrder.Automatic) {
    const conflict = supported.length === 2;
    const ruleId = conflict
      ? "input.byte-order.conflict"
      : unresolved
      ? "input.byte-order.unresolved"
      : "input.byte-order.override";
    findings.push({
      id: `${ruleId}:file.byteOrder`,
      ruleId,
      category: DiagnosticCategory.Uncertainty,
      scope: { kind: "file", field: "byteOrder" },
      confidence: DiagnosticConfidence.Unknown,
      explanation: `${
        conflict
          ? "Complete header or occupied-slot markers support conflicting byte orders."
          : unresolved
          ? "No complete header or occupied-slot marker establishes byte order."
          : "An explicit input choice overrides automatic detection."
      }${
        order === ExportByteOrder.Automatic
          ? " Choose an input byte order before editing."
          : ` Explicitly selected ${order}; selection does not repair or verify the data.`
      }`,
      evidence: [{
        source:
          "docs/adr/0009-ground-interpretation-in-version-specific-evidence.md",
        reference:
          "Input interpretation; complete SRAM header and occupied-slot markers",
        applicability:
          "Recognized original N64 SRAM layout in SRA or supported SRM container",
        limitations:
          "Checksums can pass under both orders. Explicit choice does not establish game version or platform compatibility.",
      }],
      context: {
        layout: "sra",
        container,
        gameVersion: null,
        platformCompatibility: "unverified",
      },
    });
  }
  if (order !== ExportByteOrder.Automatic) {
    return {
      state: "overridden",
      selectedOrder: order,
      confidence: DiagnosticConfidence.Unknown,
      candidates,
      findings,
    };
  }
  return supported.length === 1
    ? {
      state: "detected",
      selectedOrder: supported[0].order,
      confidence: DiagnosticConfidence.Evidenced,
      candidates,
      findings,
    }
    : {
      state: "unresolved",
      selectedOrder: null,
      confidence: DiagnosticConfidence.Unknown,
      candidates,
      findings,
    };
}

export function requireInputByteOrder(
  bytes: Uint8Array,
  order = ExportByteOrder.Automatic,
): InputByteOrder {
  const inspection = inspectInputByteOrder(bytes, order);
  if (inspection.state === "unresolved") {
    throw new UnresolvedByteOrderError(inspection, bytes.slice());
  }
  return inspection.selectedOrder;
}
