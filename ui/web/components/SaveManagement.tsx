import { useState } from "preact/hooks";
import type { ChecksumPolicy, SraSaveFile } from "../../../models/savefile.ts";
import {
  copySlot,
  resetSlotToNewGame,
  slotCount,
  slotLabel,
} from "../../../utils/saveeditor.ts";
import { changeBytes, correctionLabel } from "../../correctionreview.ts";
import ReviewCorrections from "../islands/correctionreview.tsx";
import type { CorrectionReview } from "../../correctionreview.ts";
import { Button } from "./Button.tsx";
import { Field } from "./Field.tsx";
import { Section } from "./Section.tsx";

interface SaveManagementProps {
  save: SraSaveFile;
  review: CorrectionReview;
  onChange: () => void;
  onChecksumPolicy: (policy: ChecksumPolicy) => void;
}

export default function SaveManagement(props: SaveManagementProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  function openReview(filter?: Parameters<CorrectionReview["open"]>[0]) {
    props.review.open(filter);
    setReviewOpen(true);
  }
  const [source, setSource] = useState(0);
  const [target, setTarget] = useState(3);
  const [message, setMessage] = useState("");
  const options = Array.from(
    { length: slotCount },
    (_, index) => <option key={index} value={index}>{slotLabel(index)}</option>,
  );
  function perform(action: () => void, message: string) {
    action();
    props.onChange();
    setMessage(message);
  }
  return (
    <Section title="Save management">
      <div class="md:col-span-2">
        <Button type="button" onClick={() => openReview()}>
          Review suggested corrections
        </Button>
        {reviewOpen && (
          <ReviewCorrections
            review={props.review}
            onCancel={() => setReviewOpen(false)}
            onConfirm={() => {
              if (props.review.checksumPolicy) {
                props.onChecksumPolicy(props.review.checksumPolicy);
              }
              props.onChange();
              setReviewOpen(false);
              setMessage("Reviewed corrections confirmed.");
            }}
          />
        )}
        {props.review.history.length > 0 && (
          <details>
            <summary>Accepted correction history</summary>
            {props.review.history.map((result, index) => (
              <div key={index}>
                Review {index + 1}: {result.changes.length === 0
                  ? "No byte changes."
                  : result.changes.map((change) => (
                    <p key={correctionLabel(change.scope)}>
                      {correctionLabel(change.scope)}:{" "}
                      {changeBytes(change.before)} → {changeBytes(change.after)}
                    </p>
                  ))}
              </div>
            ))}
          </details>
        )}
      </div>
      <Field label="Copy from">
        <select
          aria-label="Copy from"
          value={source}
          onChange={(event) => setSource(Number(event.currentTarget.value))}
        >
          {options}
        </select>
      </Field>
      <Field label="Destination / slot to repair or reset">
        <select
          aria-label="Destination slot"
          value={target}
          onChange={(event) => setTarget(Number(event.currentTarget.value))}
        >
          {options}
        </select>
      </Field>
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button
          type="button"
          disabled={source === target}
          onClick={() =>
            perform(
              () => copySlot(props.save, source, target),
              `Copied ${slotLabel(source)} to ${slotLabel(target)}.`,
            )}
        >
          Copy / restore slot
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(() => {
              for (let i = 0; i < 3; i++) copySlot(props.save, i, i + 3);
            }, "Backups synchronized.")}
        >
          Synchronize backups
        </Button>
        <Button
          type="button"
          onClick={() => openReview((item) => item.scope.kind === "header")}
        >
          Repair header
        </Button>
        <Button
          type="button"
          onClick={() =>
            openReview((item) =>
              item.scope.kind === "slot" && item.scope.index === target % 3 &&
              item.scope.record === (target < 3 ? "primary" : "backup")
            )}
        >
          Repair selected slot
        </Button>
        <Button
          type="button"
          onClick={() => openReview()}
        >
          Repair all
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(
              () => resetSlotToNewGame(props.save, target),
              `${slotLabel(target)} reset to a new game.`,
            )}
        >
          Reset selected slot to a new game
        </Button>
      </div>
      <p className="text-sm text-slate-600 md:col-span-2">
        Resetting creates a new-game slot in the selected record only. Its
        paired primary or backup is unchanged.
      </p>
      {message && (
        <p role="status">{message} Download the save to keep your changes.</p>
      )}
    </Section>
  );
}
