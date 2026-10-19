import { Box, Text, useInput } from "ink";
import type {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import TextInput from "ink-text-input";
import React, { useState } from "react";

import type { SaveSlot } from "../../../models/saveslot.ts";
import {
  fieldReplacementInput,
  parseFieldReplacement,
  prepareFieldReplacement,
  reviewSlotFields,
} from "../../../utils/fieldinterpretation.ts";
import type { FieldReplacement } from "../../../utils/fieldinterpretation.ts";

export interface AcceptedFieldReplacement {
  field: string;
  value: unknown;
}
type InterpretationField =
  & AbstractFormField<"interpretations", AcceptedFieldReplacement | null>
  & { saveSlot: SaveSlot };

function Interpretations(
  props: SpecificFormFieldRendererProps<InterpretationField>,
): React.JSX.Element {
  const fields = reviewSlotFields(props.field.saveSlot);
  const [cursor, setCursor] = useState(0);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<FieldReplacement | null>(null);
  const field = fields[Math.min(cursor, fields.length - 1)];
  useInput((_input, key) => {
    if (key.escape) {
      setPreview(null);
      setEditing(false);
      setError("");
      return;
    }
    if (preview) {
      if (key.return) {
        props.onSave({ field: preview.field, value: preview.value });
        setPreview(null);
        setEditing(false);
        setText("");
      }
      return;
    }
    if (editing || !field) return;
    if (key.upArrow) setCursor(Math.max(0, cursor - 1));
    if (key.downArrow) setCursor(Math.min(fields.length - 1, cursor + 1));
    if (key.return && !key.ctrl) {
      try {
        fieldReplacementInput(field.field);
        setText("");
        setEditing(true);
        setError("");
      } catch {
        setError(
          "Unnamed bits are preserved. No supported correction is available.",
        );
      }
    }
  });
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      {!field ? <Text>No unavailable field interpretations.</Text> : preview
        ? (
          <>
            <Text>{preview.explanation}</Text>
            <Text>Enter accepts replacement · Escape declines</Text>
          </>
        )
        : editing
        ? (
          <>
            <Text>{field.explanation}</Text>
            <Text>
              Enter an explicit {fieldReplacementInput(field.field).kind}{" "}
              replacement.
            </Text>
            {fieldReplacementInput(field.field).options && (
              <Text>
                {Object.entries(
                  fieldReplacementInput(field.field).options ?? {},
                ).slice(0, 8).map(([value, label]) => `${value}: ${label}`)
                  .join("; ")}
              </Text>
            )}
            <TextInput
              value={text}
              onChange={setText}
              onSubmit={() => {
                try {
                  setPreview(
                    prepareFieldReplacement(
                      props.field.saveSlot,
                      field.field,
                      parseFieldReplacement(field.field, text),
                    ),
                  );
                  setError("");
                } catch (error) {
                  setError(
                    error instanceof Error ? error.message : String(error),
                  );
                }
              }}
            />
            <Text>Enter previews · Escape cancels</Text>
          </>
        )
        : (
          <>
            {fields.slice(
              Math.floor(cursor / 6) * 6,
              Math.floor(cursor / 6) * 6 + 6,
            ).map((entry) => (
              <Box key={entry.field}>
                <Text inverse={entry.field === field.field}>
                  {entry.explanation}
                </Text>
              </Box>
            ))}
            <Text>
              ↑↓ select · Enter proposes replacement · Ctrl+Enter returns to
              form
            </Text>
          </>
        )}
      {error && <Text color="red">{error}</Text>}
    </Box>
  );
}

export const InterpretationsFormFieldManager = {
  type: "interpretations",
  needCtrlToReturnSave: true,
  renderValue: () => (
    <Text>Unavailable / uncertain values; review explicit replacements</Text>
  ),
  renderField: Interpretations,
} as FormFieldManager<InterpretationField>;
