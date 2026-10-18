import { inventoryNames } from "../../labels.ts";
import React, { useState } from "react";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import { InventoryItems } from "../../../models/saveslot.ts";

export interface InventoryData {
  items: InventoryItems[];
  amounts: number[];
}

type FormFieldInventory = AbstractFormField<"inventory", InventoryData>;

interface ItemOption {
  label: string;
  value: number;
}

const invEnumName = (v: number): string =>
  (InventoryItems as unknown as Record<number, string>)[v];

const itemOptions: ItemOption[] = Object.values(InventoryItems)
  .filter((v): v is number => typeof v === "number")
  .map((v) => ({
    label: invEnumName(v) || `0x${v.toString(16)}`,
    value: v,
  }));

function InventoryField(
  props: SpecificFormFieldRendererProps<FormFieldInventory>,
) {
  const items = props.value?.items ?? new Array(24).fill(InventoryItems.Empty);
  const amounts = props.value?.amounts ?? new Array(15).fill(0);
  const [cursor, setCursor] = useState(0);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const isAmount = cursor >= 24;
  const start = Math.floor(cursor / 8) * 8;
  useInput((_input, key) => {
    if (editing) {
      if (key.escape) setEditing(false);
      return;
    }
    if (key.upArrow) setCursor(Math.max(0, cursor - 1));
    if (key.downArrow) setCursor(Math.min(38, cursor + 1));
    if (key.return && !key.ctrl) {
      setText(String(amounts[cursor - 24] ?? 0));
      setEditing(true);
    }
  });
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      {editing
        ? (
          <>
            <Text bold>
              {inventoryNames[isAmount ? cursor - 24 : cursor]}
              {isAmount ? " ammunition" : " item"}
            </Text>
            {isAmount
              ? (
                <TextInput
                  value={text}
                  onChange={setText}
                  onSubmit={() => {
                    const value = Number(text);
                    if (
                      text.trim() && Number.isInteger(value) && value >= 0 &&
                      value <= 255
                    ) {
                      const next = [...amounts];
                      next[cursor - 24] = value;
                      props.onChange({ items, amounts: next });
                      setEditing(false);
                    }
                  }}
                />
              )
              : (
                <SelectInput
                  items={itemOptions}
                  limit={8}
                  initialIndex={Math.max(
                    0,
                    itemOptions.findIndex((option) =>
                      option.value === items[cursor]
                    ),
                  )}
                  onSelect={({ value }) => {
                    const next = [...items];
                    next[cursor] = value as InventoryItems;
                    props.onChange({ items: next, amounts });
                    setEditing(false);
                  }}
                />
              )}
          </>
        )
        : (
          <>
            {Array.from({ length: Math.min(8, 39 - start) }, (_, i) => {
              const index = start + i;
              return (
                <Box key={index}>
                  <Text inverse={cursor === index}>
                    {index < 24
                      ? inventoryNames[index]
                      : `${inventoryNames[index - 24]} ammunition`}:{" "}
                    {index < 24
                      ? invEnumName(items[index])
                      : amounts[index - 24]}
                  </Text>
                </Box>
              );
            })}
            <Text dimColor>
              ↑↓ select · Enter edits · Ctrl+Enter completes inventory
            </Text>
          </>
        )}
    </Box>
  );
}

export const InventoryFormFieldManager = {
  type: "inventory",
  needCtrlToReturnSave: true,
  renderValue: (
    props: SpecificFormFieldRendererProps<FormFieldInventory>,
  ) => {
    const items = props.value?.items ?? [];
    const nonEmpty = items.filter(
      (i: number) => i !== InventoryItems.Empty,
    ).length;
    return <Text>{nonEmpty} items equipped</Text>;
  },
  renderField: InventoryField,
} as FormFieldManager<FormFieldInventory>;
