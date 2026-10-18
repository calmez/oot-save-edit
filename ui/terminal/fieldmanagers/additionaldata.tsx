import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { additionalFields } from "../../../models/additionaldata.ts";
import type { AdditionalSaveData } from "../../../models/additionaldata.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import {
  additionalFieldHelp,
  additionalFieldValue,
  setAdditionalField,
} from "../../additionalfields.ts";
import type { AdditionalFieldKey } from "../../additionalfields.ts";

type AdditionalDataField =
  & AbstractFormField<"additionaldata", AdditionalSaveData>
  & { saveSlot: SaveSlot };

function AdditionalData(
  props: SpecificFormFieldRendererProps<AdditionalDataField>,
) {
  const [draft] = useState<SaveSlot>(() => {
    const slot = new SaveSlot(props.field.saveSlot.data.slice());
    return slot;
  });
  const keys = Object.keys(additionalFields) as AdditionalFieldKey[];
  const [cursor, setCursor] = useState(0);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const key = keys[cursor];
  const start = Math.floor(cursor / 8) * 8;
  useInput((_input, key) => {
    if (editing) {
      if (key.escape) {
        setEditing(false);
        setError("");
      }
      return;
    }
    if (key.upArrow) setCursor(Math.max(0, cursor - 1));
    if (key.downArrow) setCursor(Math.min(keys.length - 1, cursor + 1));
    if (key.return && !key.ctrl) {
      setText(additionalFieldValue(draft, keys[cursor]));
      setEditing(true);
    }
  });
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      {editing
        ? (
          <>
            <Text bold>{additionalFields[key].label}</Text>
            <Text dimColor>{additionalFieldHelp(key)}</Text>
            <TextInput
              value={text}
              onChange={setText}
              onSubmit={() => {
                try {
                  setAdditionalField(draft, key, text);
                  props.onChange(draft.additionalData);
                  setEditing(false);
                  setError("");
                } catch (error) {
                  setError(
                    error instanceof Error ? error.message : String(error),
                  );
                }
              }}
            />
            {error && <Text color="red">{error}</Text>}
            <Text dimColor>Enter applies · Escape cancels</Text>
          </>
        )
        : (
          <>
            {keys.slice(start, start + 8).map((fieldKey, i) => (
              <Box key={fieldKey}>
                <Text inverse={start + i === cursor}>
                  {additionalFields[fieldKey].label}:{" "}
                  {additionalFieldValue(draft, fieldKey).slice(
                    0,
                    48,
                  )}
                </Text>
              </Box>
            ))}
            <Text dimColor>
              ↑↓ select · Enter edits · Ctrl+Enter returns to the form
            </Text>
          </>
        )}
    </Box>
  );
}

export const AdditionalDataFormFieldManager = {
  type: "additionaldata",
  needCtrlToReturnSave: true,
  renderValue: () => (
    <Text>Records, songs, Epona, saved equips and raw flags</Text>
  ),
  renderField: AdditionalData,
} as FormFieldManager<AdditionalDataField>;
