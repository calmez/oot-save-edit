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
  const current =
    suggestions[Math.min(index, Math.max(0, suggestions.length - 1))];
  const findings = review.findings;
  const lines: string[] = [
    ...suggestions.map((item, position) =>
      `${position === index ? ">" : " "} [${
        review.selected.includes(item.id) ? "x" : " "
      }] ${correctionLabel(item.scope)}`
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
      : ["No supported corrections in this scope."]),
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
    ...(preview?.changes.length === 0 ? ["No byte changes selected."] : []),
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
    "Original source evidence (historical):",
    ...review.sourceFindings.map((finding) =>
      `${finding.category}: ${finding.explanation}`
    ),
    "Accepted correction history:",
    ...review.history.flatMap((
      result,
      position,
    ) => [
      `Review ${position + 1}: ${result.changes.length} changes`,
      ...result.changes.map((change) =>
        `${correctionLabel(change.scope)}: ${changeBytes(change.before)} → ${
          changeBytes(change.after)
        }`
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
      setIndex(Math.min(suggestions.length - 1, index + 1));
      setPage(0);
    } else if (input === " " && current) {
      perform(() => review.toggle(current.id));
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
      <Text>↑/↓ inspect · Space toggle · [/] page · d decline all</Text>
      <Text>k keep stored value · o explicitly allow correction instead</Text>
      <Text>a confirm selection · r refresh review · Escape cancel</Text>
    </Box>
  );
}
