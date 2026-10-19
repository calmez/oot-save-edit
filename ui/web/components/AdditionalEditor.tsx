import { useEffect, useState } from "preact/hooks";

import { additionalFields } from "../../../models/additionaldata.ts";
import type { SaveSlot } from "../../../models/saveslot.ts";
import {
  inspectSlotFields,
  interpretSlotField,
} from "../../../utils/fieldinterpretation.ts";
import {
  additionalFieldHelp,
  additionalFieldValue,
  setAdditionalField,
} from "../../additionalfields.ts";
import type { AdditionalFieldKey } from "../../additionalfields.ts";
import { Field } from "./Field.tsx";

interface AdditionalInputProps {
  slot: SaveSlot;
  fieldKey: AdditionalFieldKey;
  onChange: () => void;
  readOnly: boolean;
  unavailableMembers: boolean;
}

function AdditionalInput(
  { slot, fieldKey, onChange, readOnly, unavailableMembers }:
    AdditionalInputProps,
) {
  const spec = additionalFields[fieldKey];
  const current = additionalFieldValue(slot, fieldKey);
  const [text, setText] = useState(current);
  const [error, setError] = useState("");
  useEffect(() => {
    setText(current);
    setError("");
  }, [current]);

  function apply(value: string) {
    try {
      setAdditionalField(slot, fieldKey, value);
      setError("");
      onChange();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  if (
    interpretSlotField(slot, `additionalData.${fieldKey}`).status !==
      "available" ||
    unavailableMembers
  ) {
    return (
      <Field label={spec.label}>
        <p>Unavailable; review Field interpretations.</p>
      </Field>
    );
  }
  return (
    <Field label={spec.label} help={additionalFieldHelp(fieldKey)}>
      {"boolean" in spec
        ? (
          <input
            type="checkbox"
            checked={current === "true"}
            disabled={readOnly}
            onChange={(event) => apply(String(event.currentTarget.checked))}
          />
        )
        : (
          <div className="flex flex-col gap-2">
            <textarea
              value={text}
              disabled={readOnly}
              rows={"hex" in spec ? 4 : 1}
              aria-label={spec.label}
              className="w-full rounded border border-slate-300 px-2 py-1 font-mono text-sm"
              onInput={(event) => setText(event.currentTarget.value)}
            />
            <button
              type="button"
              disabled={readOnly || text === current}
              className="self-start rounded border px-2 py-1 text-sm disabled:opacity-40"
              onClick={() => apply(text)}
            >
              Apply
            </button>
          </div>
        )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </Field>
  );
}

export default function AdditionalEditor(
  props: { slot: SaveSlot; onChange: () => void; readOnly: boolean },
) {
  const unavailable = inspectSlotFields(props.slot).filter((field) =>
    field.status !== "available"
  );
  return (
    <details className="rounded border border-slate-200 p-3">
      <summary className="cursor-pointer font-semibold">
        Additional progress and advanced data
      </summary>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {(Object.keys(additionalFields) as AdditionalFieldKey[]).map((key) => (
          <AdditionalInput
            key={key}
            slot={props.slot}
            fieldKey={key}
            onChange={props.onChange}
            readOnly={props.readOnly}
            unavailableMembers={unavailable.some((field) =>
              field.field.startsWith(`additionalData.${key}.`)
            )}
          />
        ))}
      </div>
    </details>
  );
}
