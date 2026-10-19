import { useState } from "preact/hooks";

import type { ChecksumPolicy, SraSaveFile } from "../../../models/savefile.ts";
import {
  readSkulltulaLocations,
  skulltulaLocations,
} from "../../../models/skulltulas.ts";
import type { SkulltulaIntent } from "../../../models/skulltulas.ts";
import { getSlot, slotLabel } from "../../../utils/saveeditor.ts";
import { CorrectionReview } from "../../correctionreview.ts";
import ReviewCorrections from "./correctionreview.tsx";

interface SkulltulaEditorProps {
  save: SraSaveFile;
  onChange: (policy?: ChecksumPolicy) => void;
}

export default function SkulltulaEditor(
  { save, onChange }: SkulltulaEditorProps,
) {
  const [review] = useState(() => new CorrectionReview(save));
  const [target, setTarget] = useState(0);
  const [total, setTotal] = useState("0");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const slot = getSlot(save, target);
  const locations = readSkulltulaLocations(slot);
  function stage(intent: SkulltulaIntent) {
    try {
      review.stageSkulltula(intent);
      setOpen(true);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }
  const record = target < 3 ? "primary" : "backup";
  const index = target % 3;
  return (
    <details class="my-4 rounded border p-3">
      <summary>Skulltula reconciliation</summary>
      <p>
        Original N64 mapping; exact ROM/platform unverified. Partial coverage: 3
        of 100 locations. Other bits are preserved. No absolute total is
        recommended. Choose locations and totals as separate intents.
      </p>
      <label>
        Record
        <select
          aria-label="Skulltula record"
          value={target}
          disabled={open}
          onChange={(event) => setTarget(Number(event.currentTarget.value))}
        >
          {Array.from(
            { length: 6 },
            (_, value) => (
              <option key={value} value={value}>{slotLabel(value)}</option>
            ),
          )}
        </select>
      </label>
      <p>
        Stored total:{" "}
        {slot.goldSkulltulaTokens}. Location changes wait for confirmation.
      </p>
      {skulltulaLocations.map((location) => (
        <label key={location.id} class="block">
          <input
            type="checkbox"
            aria-label={location.label}
            checked={locations[location.id]}
            disabled={slot.isEmpty || open}
            onChange={(event) =>
              stage({
                kind: "locations",
                record,
                index,
                locations: { [location.id]: event.currentTarget.checked },
              })}
          />
          {location.label}
        </label>
      ))}
      <label>
        Requested token total
        <input
          aria-label="Requested Skulltula total"
          type="number"
          min="0"
          max="100"
          step="1"
          value={total}
          disabled={open}
          onInput={(event) => setTotal(event.currentTarget.value)}
          class="mx-2 rounded border px-2"
        />
      </label>
      <button
        type="button"
        disabled={slot.isEmpty || open}
        class="rounded border px-2"
        onClick={() => {
          if (total.trim() === "") {
            setError("Enter a requested total from 0 to 100.");
            return;
          }
          stage({ kind: "total", record, index, total: Number(total) });
        }}
      >
        Review requested total
      </button>
      <p>
        Requesting a total never chooses locations. Decline adjustments to keep
        dependent fields; cancel to discard the entire request. No rule clears
        the indicator at zero.
      </p>
      {error && <p role="alert">{error}</p>}
      {open && (
        <ReviewCorrections
          review={review}
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            onChange(review.checksumPolicy);
            setOpen(false);
          }}
        />
      )}
    </details>
  );
}
