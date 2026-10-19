import type { JSX } from "preact";
import { useState } from "preact/hooks";

import type { SaveSlot } from "../../../models/saveslot.ts";
import {
  applyFieldReplacement,
  fieldReplacementInput,
  parseFieldReplacement,
  prepareFieldReplacement,
  reviewSlotFields,
} from "../../../utils/fieldinterpretation.ts";
import type {
  FieldInterpretation,
  FieldReplacement,
} from "../../../utils/fieldinterpretation.ts";

interface ReplacementProps {
  slot: SaveSlot;
  result: FieldInterpretation;
  readOnly: boolean;
  onChange: () => void;
}

function Replacement(
  { slot, result, readOnly, onChange }: ReplacementProps,
): JSX.Element {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<FieldReplacement | null>(null);
  const [error, setError] = useState("");
  let input;
  try {
    input = fieldReplacementInput(result.field);
  } catch { /* Informational findings have no supported replacement. */ }
  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-3">
      <p>{result.explanation}</p>
      <p>Stored value: {JSON.stringify(result.storedValue)}</p>
      {input && !readOnly && (
        <>
          <label>
            Replacement for {result.field}
            <input
              aria-label={`Replacement for ${result.field}`}
              value={text}
              className="ml-2 rounded border px-2 py-1"
              onInput={(event) => {
                setText(event.currentTarget.value);
                setPreview(null);
              }}
            />
          </label>
          <p className="text-sm">
            {input.kind === "boolean"
              ? "Enter true or false explicitly."
              : input.kind === "text"
              ? "Enter the complete replacement text."
              : "Enter a supported numeric value."}
          </p>
          {input.options && (
            <details>
              <summary>Supported values</summary>
              <p>
                {Object.entries(input.options).map(([value, label]) =>
                  `${value}: ${label}`
                ).join("; ")}
              </p>
            </details>
          )}
          <button
            type="button"
            className="m-1 rounded border px-2 py-1"
            onClick={() => {
              try {
                setPreview(
                  prepareFieldReplacement(
                    slot,
                    result.field,
                    parseFieldReplacement(result.field, text),
                  ),
                );
                setError("");
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : String(error),
                );
              }
            }}
          >
            Preview {result.field} replacement
          </button>
          {preview && (
            <div>
              <p>{preview.explanation}</p>
              <button
                type="button"
                className="m-1 rounded border px-2 py-1"
                onClick={() => {
                  try {
                    applyFieldReplacement(slot, preview);
                    setPreview(null);
                    setError("");
                    onChange();
                  } catch (error) {
                    setError(
                      error instanceof Error ? error.message : String(error),
                    );
                    setPreview(null);
                  }
                }}
              >
                Accept {result.field} replacement
              </button>
              <button
                type="button"
                className="m-1 rounded border px-2 py-1"
                onClick={() => setPreview(null)}
              >
                Decline {result.field} replacement
              </button>
            </div>
          )}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

interface FieldInterpretationsProps {
  slot: SaveSlot;
  readOnly: boolean;
  onChange: () => void;
}

export default function FieldInterpretations(
  props: FieldInterpretationsProps,
): JSX.Element | null {
  const results = reviewSlotFields(props.slot);
  if (!results.length) return null;
  return (
    <section aria-label="Field interpretations" className="my-3 space-y-2">
      <h4 className="font-semibold">
        Unavailable or uncertain field interpretations
      </h4>
      {results.map((result) => (
        <Replacement
          key={result.field}
          slot={props.slot}
          result={result}
          readOnly={props.readOnly}
          onChange={props.onChange}
        />
      ))}
    </section>
  );
}
