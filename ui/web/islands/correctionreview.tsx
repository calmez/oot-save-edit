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

function integrityStatus(value: boolean | null): string {
  return value === null ? "not applicable" : value ? "valid" : "invalid";
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
      {review.requestedEdit && <p>{review.requestedEdit}</p>}
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
      <section aria-label="Primary and backup comparison" class="space-y-4">
        <h4 class="font-semibold">Paired primary and backup records</h4>
        <p>
          Integrity and readable values are shown side by side. Record position
          and passing checks do not establish freshness or which progress you
          want to keep.
        </p>
        <p>
          Marker and checksum repair changes structural fields only; it cannot
          reconstruct missing progress. Unavailable readings and remaining byte
          differences are shown without assigning them gameplay meaning.
        </p>
        {review.recoveryPairs.map((pair) => (
          <details key={pair.index} class="rounded border p-3">
            <summary>Slot {pair.index + 1} and Backup {pair.index + 1}</summary>
            <p>
              Primary:{" "}
              {pair.primaryIntegrity.occupied ? "occupied" : "empty"}; marker
              {" "}
              {integrityStatus(pair.primaryIntegrity.markerValid)}; checksum
              {" "}
              {integrityStatus(pair.primaryIntegrity.checksumValid)}; file index
              {" "}
              {pair.primaryIntegrity.fileIndex}.
            </p>
            <p>
              Backup:{" "}
              {pair.backupIntegrity.occupied ? "occupied" : "empty"}; marker
              {" "}
              {integrityStatus(pair.backupIntegrity.markerValid)}; checksum{" "}
              {integrityStatus(pair.backupIntegrity.checksumValid)}; file index
              {" "}
              {pair.backupIntegrity.fileIndex}.
            </p>
            {pair.primaryIntegrity.occupied || pair.backupIntegrity.occupied
              ? (
                <dl>
                  {pair.comparisons.map((comparison) => (
                    <div key={comparison.field}>
                      <dt class="font-medium">
                        {comparison.label}: {comparison.equal === null
                          ? "comparison unavailable"
                          : comparison.equal
                          ? "same"
                          : "different"}
                      </dt>
                      <dd>
                        Primary: {comparison.primary.available
                          ? comparison.primary.value
                          : `Unavailable: ${comparison.primary.explanation}`}
                        {" · "}
                        Backup: {comparison.backup.available
                          ? comparison.backup.value
                          : `Unavailable: ${comparison.backup.explanation}`}
                      </dd>
                    </div>
                  ))}
                </dl>
              )
              : <p>No initialized progress in either record.</p>}
            <p>
              {pair.byteDifferences} differing bytes in the records;{" "}
              {pair.uninterpretedByteDifferences}{" "}
              differences remain outside the displayed interpretations. These
              bytes are preserved unless you explicitly replace a record.
            </p>
          </details>
        ))}
        <h4 class="font-semibold">Recovery and synchronization choices</h4>
        {review.recoverySuggestions.length === 0 && (
          <p>No supported replacement is available for the paired records.</p>
        )}
        {review.recoverySuggestions.map((item) => (
          <div key={item.id} class="space-y-2 rounded border p-3">
            <label class="flex gap-2">
              <input
                type="checkbox"
                aria-label={`${
                  item.action === "synchronize" ? "Synchronize" : "Restore"
                } ${item.source} ${item.index + 1} to ${item.destination} ${
                  item.index + 1
                }`}
                checked={review.selected.includes(item.id)}
                onChange={() =>
                  perform(() =>
                    review.toggle(item.id)
                  )}
              />
              {item.action === "synchronize" ? "Synchronize" : "Restore"}{" "}
              {item.source === "primary" ? "primary" : "backup"}{" "}
              {item.index + 1} to{" "}
              {item.destination === "primary" ? "primary" : "backup"}{" "}
              {item.index + 1}
            </label>
            <p>
              Source marker{" "}
              {integrityStatus(item.sourceIntegrity.markerValid)}, checksum{" "}
              {integrityStatus(item.sourceIntegrity.checksumValid)}. Destination
              marker{" "}
              {integrityStatus(item.destinationIntegrity.markerValid)}, checksum
              {" "}
              {integrityStatus(item.destinationIntegrity.checksumValid)}. The
              destination state will be replaced, its file index retained, and
              the replacement action leaves the source unchanged. Selecting this
              replacement clears the pair's default-selected repairs so marker
              repair remains independent. Select any repair separately afterward
              if desired.
            </p>
            <label class="flex gap-2">
              <input
                type="checkbox"
                aria-label={`Recalculate checksum for ${item.destination} ${
                  item.index + 1
                }`}
                checked={review.replacementChecksums[item.id] ?? true}
                onChange={(event) =>
                  perform(() =>
                    review.setReplacementChecksum(
                      item.id,
                      event.currentTarget.checked,
                    )
                  )}
              />
              Recalculate the copied checksum from the final destination
              contents (selected by default; marker repair remains independent).
            </label>
            {item.sourceIntegrity.markerValid === false && (
              <label class="flex gap-2">
                <input
                  type="checkbox"
                  aria-label={`Repair copied marker for ${item.destination} ${
                    item.index + 1
                  }`}
                  checked={review.replacementMarkers[item.id] ?? false}
                  onChange={(event) =>
                    perform(() =>
                      review.setReplacementMarker(
                        item.id,
                        event.currentTarget.checked,
                      )
                    )}
                />
                Repair the copied destination marker. This changes only the
                marker and cannot reconstruct missing progress.
              </label>
            )}
          </div>
        ))}
      </section>
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
      {preview?.replacements.map((replacement) => {
        const proposal = review.plan.recovery.find((item) =>
          item.id === replacement.id
        )!;
        return (
          <p key={replacement.id}>
            Replace {replacement.destination} {replacement.index + 1} with{" "}
            {replacement.source} {replacement.index + 1}:{"  "}
            {replacement.before.filter((value, index) =>
              value !== replacement.after[index]
            ).length} bytes changed; destination file index{" "}
            {changeBytes(replacement.before.slice(0x1354, 0x1358))} →{" "}
            {changeBytes(replacement.after.slice(0x1354, 0x1358))}; marker bytes
            {" "}
            {changeBytes(replacement.before.slice(0x1c, 0x22))} →{" "}
            {changeBytes(replacement.after.slice(0x1c, 0x22))}; source checksum
            {" "}
            {changeBytes(proposal.sourceBytes.slice(0x1352, 0x1354))}; final
            stored checksum{" "}
            {changeBytes(replacement.after.slice(0x1352, 0x1354))},{" "}
            {replacement.checksumRecalculated
              ? "recalculated from final contents"
              : "copied from source and retained"}. The replacement action
            leaves the source unchanged.
          </p>
        );
      })}
      {preview && preview.changes.length === 0 &&
        preview.replacements.length === 0 && <p>No byte changes selected.</p>}
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
          onClick={() => perform(() => {
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
