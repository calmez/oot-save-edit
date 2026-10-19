import { useState } from "preact/hooks";
import type { CorrectionResult } from "../../../utils/corrections.ts";
import { DiagnosticCategory } from "../../../utils/diagnostics.ts";
import { changeBytes, correctionLabel } from "../../correctionreview.ts";
import type { CorrectionReview } from "../../correctionreview.ts";
import { Button } from "../components/Button.tsx";

interface CorrectionReviewProps {
  review: CorrectionReview;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReviewCorrections(
  { review, onConfirm, onCancel }: CorrectionReviewProps,
) {
  const [, update] = useState(0);
  const [message, setMessage] = useState("");
  let preview: CorrectionResult | undefined;
  let error = "";
  try {
    preview = review.preview();
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
  }
  function perform(action: () => void) {
    try {
      action();
      setMessage("");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : String(cause));
    }
    update((version) => version + 1);
  }
  const findings = review.findings;
  return (
    <section
      aria-label="Correction review"
      class="my-4 space-y-4 rounded border p-4"
    >
      <h3 class="text-xl font-bold">Review suggested corrections</h3>
      <p>
        Nothing is applied until confirmation. Keep a stored field value to make
        it an explicit desired outcome.
      </p>
      {Object.values(DiagnosticCategory).map((category) => (
        <details open key={category}>
          <summary class="font-semibold">{category} findings</summary>
          <ul>
            {findings.filter((finding) =>
              finding.category === category
            )
              .map((finding) => (
                <li key={finding.id}>
                  {correctionLabel(finding.scope)}: {finding.explanation}
                  {review.plan.unresolved.some((item) =>
                    item.id === finding.id
                  ) && " No supported correction."}
                </li>
              ))}
          </ul>
        </details>
      ))}
      <details>
        <summary>Original source evidence</summary>
        {review.sourceFindings.map((finding) => (
          <p key={finding.id}>{finding.category}: {finding.explanation}</p>
        ))}
      </details>
      {review.suggestions.length === 0 && (
        <p>No supported corrections in this scope.</p>
      )}
      {review.suggestions.map((item) => (
        <div key={item.id} class="space-y-2 rounded border p-3">
          <label class="flex gap-2">
            <input
              type="checkbox"
              aria-label={`Apply ${correctionLabel(item.scope)}`}
              checked={review.selected.includes(item.id)}
              onChange={() =>
                perform(() =>
                  review.toggle(item.id)
                )}
            />
            {correctionLabel(item.scope)}
          </label>
          <p>{item.rationale} Confidence: {item.confidence}.</p>
          {item.changes.map((change) => (
            <p key={change.offset}>
              Proposed: {changeBytes(change.before)} →{" "}
              {changeBytes(change.after)}
            </p>
          ))}
          {item.evidence.map((evidence) => (
            <p key={evidence.reference}>
              <a class="underline" href={evidence.source}>
                {evidence.reference}
              </a>: {evidence.applicability} {evidence.limitations}
            </p>
          ))}
          {item.dependsOn.length > 0 && (
            <p>
              Preview depends on:{" "}
              {item.dependsOn.join(", ")}. Marker and checksum remain
              independently selectable.
            </p>
          )}
          {item.alternatives.map((alternative) => (
            <p key={alternative}>Alternative: {alternative}</p>
          ))}
          <Button
            type="button"
            onClick={() => perform(() => review.retain(item.id))}
          >
            Keep stored {correctionLabel(item.scope)}
          </Button>
          <Button
            type="button"
            onClick={() => perform(() => review.allowCorrection(item.id))}
          >
            Allow correction instead for {correctionLabel(item.scope)}
          </Button>
        </div>
      ))}
      {review.plan.outcome.map((outcome) => (
        <p key={correctionLabel(outcome.scope)}>
          Desired outcome: keep stored {correctionLabel(outcome.scope)}.
        </p>
      ))}
      {review.plan.conflicts.map((conflict, index) => (
        <p key={index}>
          Outcome conflict: {conflict.explanation}{" "}
          Retain the stored value or explicitly allow correction instead.
        </p>
      ))}
      <h4 class="font-semibold">Complete selection preview</h4>
      {preview?.changes.map((change) => (
        <p key={`${correctionLabel(change.scope)}.${change.offset}`}>
          {correctionLabel(change.scope)}: {changeBytes(change.before)} →{" "}
          {changeBytes(change.after)}
        </p>
      ))}
      {preview?.changes.length === 0 && <p>No byte changes selected.</p>}
      {!!preview?.requiredCorrections.length && (
        <p>
          Checksum corrections omitted: stored checksums will be preserved,
          including after marker changes.
        </p>
      )}
      {(error || message) && (
        <p role="alert">
          {error || message}{" "}
          Refresh the review after intervening edits; review again before
          confirming.
        </p>
      )}
      <p>
        Declined checksum corrections set export to preserve stored checksums.
        Other selections retain your export policy.
      </p>
      <div class="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => perform(() => review.declineAll())}
        >
          Decline all corrections
        </Button>
        <Button type="button" onClick={() => perform(() => review.refresh())}>
          Refresh review
        </Button>
        <Button
          type="button"
          disabled={!!error}
          onClick={() =>
            perform(() => {
              review.confirm();
              onConfirm();
            })}
        >
          Confirm selected corrections
        </Button>
        <Button
          type="button"
          onClick={() => {
            review.cancel();
            onCancel();
          }}
        >
          Cancel review
        </Button>
      </div>
    </section>
  );
}
