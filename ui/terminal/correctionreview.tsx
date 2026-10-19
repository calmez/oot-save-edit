import { Box, Text, useInput, useStdout } from "ink";
import React, { useState } from "react";
import type { CorrectionResult } from "../../utils/corrections.ts";
import { DiagnosticCategory } from "../../utils/diagnostics.ts";
import { changeBytes, correctionLabel } from "../correctionreview.ts";

import type { CorrectionReview } from "../correctionreview.ts";

interface CorrectionReviewProps {
  review: CorrectionReview;
  onConfirm: () => void;
  onCancel: () => void;
}

function integrityStatus(value: boolean | null): string {
  return value === null ? "not applicable" : value ? "valid" : "invalid";
}

export default function ReviewCorrections(
  { review, onConfirm, onCancel }: CorrectionReviewProps,
) {
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [, update] = useState(0);
  const { stdout } = useStdout();
  let preview: CorrectionResult | undefined;
  let error = "";
  try {
    preview = review.preview();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
  }
  const suggestions = review.suggestions;
  const recoverySuggestions = review.recoverySuggestions;
  const itemCount = suggestions.length + recoverySuggestions.length;
  const current = index < suggestions.length ? suggestions[index] : undefined;
  const recoveryCurrent = index >= suggestions.length
    ? recoverySuggestions[index - suggestions.length]
    : undefined;
  const findings = review.findings;
  const lines: string[] = [
    ...(review.requestedEdit ? [review.requestedEdit] : []),
    ...suggestions.map((item, position) =>
      `${position === index ? ">" : " "} [${
        review.selected.includes(item.id) ? "x" : " "
      }] ${correctionLabel(item.scope)}`
    ),
    ...recoverySuggestions.map((item, position) =>
      `${index === suggestions.length + position ? ">" : " "} [${
        review.selected.includes(item.id) ? "x" : " "
      }] ${item.action} ${item.source} ${
        item.index + 1
      } → ${item.destination} ${item.index + 1}`
    ),
    ...(current
      ? [
        `Inspecting ${correctionLabel(current.scope)}: ${current.rationale}`,
        `Confidence: ${current.confidence}`,
        ...current.changes.map((change) =>
          `Proposed: ${changeBytes(change.before)} → ${
            changeBytes(change.after)
          }`
        ),
        ...current.evidence.flatMap((
          evidence,
        ) => [
          evidence.reference,
          evidence.source,
          evidence.applicability,
          evidence.limitations,
        ]),
        ...current.alternatives.map((alternative) =>
          `Alternative: ${alternative}`
        ),
        ...(current.dependsOn.length
          ? [
            `Preview depends on: ${
              current.dependsOn.join(", ")
            }. Independently selectable.`,
          ]
          : []),
      ]
      : recoveryCurrent
      ? []
      : ["No supported corrections in this scope."]),
    ...(recoveryCurrent
      ? [
        `Inspecting ${recoveryCurrent.action} ${recoveryCurrent.source} ${
          recoveryCurrent.index + 1
        } to ${recoveryCurrent.destination} ${recoveryCurrent.index + 1}.`,
        "The destination record will be replaced, the destination file index retained, and the replacement action leaves the source unchanged. Selecting this replacement clears the pair's default-selected repairs so marker repair remains independent. Select any repair separately afterward if desired.",
        `Source marker/checksum: ${
          integrityStatus(recoveryCurrent.sourceIntegrity.markerValid)
        }/${
          integrityStatus(recoveryCurrent.sourceIntegrity.checksumValid)
        }. Destination marker/checksum: ${
          integrityStatus(recoveryCurrent.destinationIntegrity.markerValid)
        }/${
          integrityStatus(recoveryCurrent.destinationIntegrity.checksumValid)
        }.`,
        `Checksum recalculation from final destination contents: ${
          review.replacementChecksums[recoveryCurrent.id] ?? true
            ? "selected"
            : "declined"
        }. Press c to toggle independently.`,
        `Copied destination marker repair: ${
          review.replacementMarkers[recoveryCurrent.id]
            ? "selected"
            : "declined"
        }. Press m to toggle independently; this cannot reconstruct missing progress.`,
      ]
      : []),
    ...review.plan.outcome.map((outcome) =>
      `Desired outcome: keep stored ${correctionLabel(outcome.scope)}.`
    ),
    ...review.plan.conflicts.map((conflict) =>
      `Outcome conflict: ${conflict.explanation}`
    ),
    "Complete selection preview:",
    ...(preview?.changes.map((change) =>
      `${correctionLabel(change.scope)}: ${changeBytes(change.before)} → ${
        changeBytes(change.after)
      }`
    ) ?? []),
    ...(preview && preview.changes.length === 0 &&
        preview.replacements.length === 0
      ? ["No byte changes selected."]
      : []),
    ...(preview?.requiredCorrections.length
      ? [
        "Checksum corrections omitted: preserve stored checksums after marker changes.",
      ]
      : []),
    "Declined checksum corrections set export to preserve stored checksums.",
    ...Object.values(DiagnosticCategory).flatMap((category) => [
      `${category} findings:`,
      ...findings.filter((finding) => finding.category === category).map((
        finding,
      ) =>
        `${correctionLabel(finding.scope)}: ${finding.explanation}${
          review.plan.unresolved.some((item) => item.id === finding.id)
            ? " No supported correction."
            : ""
        }`
      ),
    ]),
    "Paired primary and backup records:",
    "Record position and passing checks do not establish freshness or preferred progress.",
    "Marker and checksum repair changes structural fields only; it cannot reconstruct missing progress. Unavailable readings and remaining byte differences have no assigned gameplay meaning.",
    ...review.recoveryPairs.flatMap((pair) => [
      `Slot ${pair.index + 1} / Backup ${pair.index + 1}: primary ${
        pair.primaryIntegrity.occupied ? "occupied" : "empty"
      }, marker ${
        integrityStatus(pair.primaryIntegrity.markerValid)
      }, checksum ${
        integrityStatus(pair.primaryIntegrity.checksumValid)
      }, file index ${pair.primaryIntegrity.fileIndex}; backup ${
        pair.backupIntegrity.occupied ? "occupied" : "empty"
      }, marker ${
        integrityStatus(pair.backupIntegrity.markerValid)
      }, checksum ${
        integrityStatus(pair.backupIntegrity.checksumValid)
      }, file index ${pair.backupIntegrity.fileIndex}.`,
      ...(pair.primaryIntegrity.occupied || pair.backupIntegrity.occupied
        ? pair.comparisons.map((comparison) =>
          `${comparison.label} (${
            comparison.equal === null
              ? "comparison unavailable"
              : comparison.equal
              ? "same"
              : "different"
          }): primary ${
            comparison.primary.available
              ? comparison.primary.value
              : `unavailable (${comparison.primary.explanation})`
          }; backup ${
            comparison.backup.available
              ? comparison.backup.value
              : `unavailable (${comparison.backup.explanation})`
          }.`
        )
        : ["No initialized progress in either record."]),
      `${pair.byteDifferences} differing bytes; ${pair.uninterpretedByteDifferences} differ outside the displayed interpretations.`,
    ]),
    "Explicit recovery and synchronization choices:",
    ...(review.recoverySuggestions.length
      ? review.recoverySuggestions.map((item) =>
        `${
          review.selected.includes(item.id) ? "[x]" : "[ ]"
        } ${item.action} ${item.source} ${
          item.index + 1
        } to ${item.destination} ${item.index + 1}; source marker/checksum ${
          integrityStatus(item.sourceIntegrity.markerValid)
        }/${
          integrityStatus(item.sourceIntegrity.checksumValid)
        }; destination marker/checksum ${
          integrityStatus(item.destinationIntegrity.markerValid)
        }/${
          integrityStatus(item.destinationIntegrity.checksumValid)
        }; replacing destination state, preserving its file index and leaving source unchanged. Press Space with this choice selected to toggle it. Checksum recalculation: ${
          review.replacementChecksums[item.id] ?? true ? "selected" : "declined"
        } (toggle with c while focused).`
      )
      : [
        "No supported recovery replacement is available for the paired records.",
      ]),
    ...preview?.replacements.map((replacement) => {
      const proposal = review.plan.recovery.find((item) =>
        item.id === replacement.id
      )!;
      return `Preview: replace ${replacement.destination} ${
        replacement.index + 1
      } with ${replacement.source} ${replacement.index + 1}; ${
        replacement.before.filter((value, index) =>
          value !== replacement.after[index]
        ).length
      } bytes change; destination file index ${
        changeBytes(replacement.before.slice(0x1354, 0x1358))
      } → ${changeBytes(replacement.after.slice(0x1354, 0x1358))}; marker ${
        changeBytes(replacement.before.slice(0x1c, 0x22))
      } → ${
        changeBytes(replacement.after.slice(0x1c, 0x22))
      }; source checksum ${
        changeBytes(proposal.sourceBytes.slice(0x1352, 0x1354))
      }; final checksum ${
        changeBytes(replacement.after.slice(0x1352, 0x1354))
      }, ${
        replacement.checksumRecalculated
          ? "recalculated from final contents"
          : "copied from source and retained"
      }; replacement leaves source unchanged.`;
    }) ?? [],
    "Original source evidence (historical):",
    ...review.sourceFindings.map((finding) =>
      `${finding.category}: ${finding.explanation}`
    ),
    "Accepted correction history:",
    ...review.history.flatMap((
      result,
      position,
    ) => [
      `Review ${
        position + 1
      }: ${result.changes.length} correction changes, ${result.replacements.length} replacement actions`,
      ...result.changes.map((change) =>
        `${correctionLabel(change.scope)}: ${changeBytes(change.before)} → ${
          changeBytes(change.after)
        }`
      ),
      ...result.replacements.map((replacement) =>
        `${replacement.destination} ${
          replacement.index + 1
        } replaced from ${replacement.source} ${
          replacement.index + 1
        }; destination index retained; checksum ${
          replacement.checksumRecalculated
            ? "recalculated"
            : "copied from source"
        }.`
      ),
    ]),
  ];
  // Wrap long evidence and findings so all review content is reachable by paging.
  const width = Math.max(20, (stdout.columns || 80) - 4);
  const wrapped = lines.flatMap((line) =>
    line.match(new RegExp(`.{1,${width}}`, "g")) ?? [""]
  );
  const pageSize = Math.max(1, (stdout.rows || 24) - 12);
  const pages = Math.max(1, Math.ceil(wrapped.length / pageSize));
  const visiblePage = Math.min(page, pages - 1);
  function perform(action: () => void) {
    try {
      action();
      setMessage("");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    }
    update((version: number) => version + 1);
  }
  useInput((input, key) => {
    if (key.escape) {
      review.cancel();
      onCancel();
    } else if (key.upArrow) {
      setIndex(Math.max(0, index - 1));
      setPage(0);
    } else if (key.downArrow) {
      setIndex(Math.max(0, Math.min(itemCount - 1, index + 1)));
      setPage(0);
    } else if (input === " " && current) {
      perform(() => review.toggle(current.id));
    } else if (input === " " && recoveryCurrent) {
      perform(() => review.toggle(recoveryCurrent.id));
    } else if (input === "c" && recoveryCurrent) {
      perform(() =>
        review.setReplacementChecksum(
          recoveryCurrent.id,
          !(review.replacementChecksums[recoveryCurrent.id] ?? true),
        )
      );
    } else if (
      input === "m" && recoveryCurrent &&
      recoveryCurrent.sourceIntegrity.markerValid === false
    ) {
      perform(() =>
        review.setReplacementMarker(
          recoveryCurrent.id,
          !review.replacementMarkers[recoveryCurrent.id],
        )
      );
    } else if (input === "k" && current) {
      perform(() => review.retain(current.id));
    } else if (input === "o" && current) {
      perform(() => review.allowCorrection(current.id));
    } else if (input === "d") perform(() => review.declineAll());
    else if (input === "r") {
      perform(() => {
        review.refresh();
        setPage(0);
      });
    } else if (input === "a" && !error) {
      perform(() => {
        review.confirm();
        onConfirm();
      });
    } else if (input === "]") setPage(Math.min(pages - 1, visiblePage + 1));
    else if (input === "[") setPage(Math.max(0, visiblePage - 1));
  });
  return (
    <Box flexDirection="column">
      <Text bold>Review suggested corrections</Text>
      <Text>
        Nothing is applied until confirmation. Page {visiblePage + 1}/{pages}
      </Text>
      <Text>
        {wrapped.slice(visiblePage * pageSize, (visiblePage + 1) * pageSize)
          .join("\n")}
      </Text>
      {(error || message) && (
        <Text color="red">
          {error || message} Refresh and review again before confirming.
        </Text>
      )}
      <Text>
        ↑/↓ inspect · Space toggle · c checksum · m marker · [/] page · d
        decline all
      </Text>
      <Text>k keep stored value · o explicitly allow correction instead</Text>
      <Text>a confirm selection · r refresh review · Escape cancel</Text>
    </Box>
  );
}
