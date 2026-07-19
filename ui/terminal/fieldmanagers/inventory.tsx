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

const InventoryField: React.FC<
  SpecificFormFieldRendererProps<FormFieldInventory>
> = (props: SpecificFormFieldRendererProps<FormFieldInventory>) => {
  const items = props.value?.items ?? new Array(24).fill(InventoryItems.Empty);
  const amounts = props.value?.amounts ?? new Array(15).fill(0);
  const [cursor, setCursor] = useState(0);
  const isAmount = cursor >= 24;
  const itemIndex = isAmount ? cursor - 24 : cursor;

  useInput((input, key) => {
    if (key.upArrow) {
      const next = Math.max(0, cursor - 1);
      if (next !== cursor) {
        setCursor(next);
      }
    }
    if (key.downArrow) {
      const next = Math.min(38, cursor + 1);
      if (next !== cursor) {
        setCursor(next);
      }
    }
  }, { isActive: true });

  function setItem(index: number, value: number) {
    const newItems = [...items];
    newItems[index] = value as InventoryItems;
    props.onChange({ items: newItems, amounts: amounts });
  }

  function setAmount(index: number, value: number) {
    const newAmounts = [...amounts];
    newAmounts[index] = value;
    props.onChange({ items: items, amounts: newAmounts });
  }

  function renderItem(item: number, i: number, offset: number) {
    const idx = offset + i;
    const isCursor = cursor === idx;
    return (
      <Box key={`inv-item-${idx}`}>
        <Box width={10}>
          <Text inverse={isCursor}>
            {`Slot ${(idx + 1).toString().padStart(2, " ")}:`}
          </Text>
        </Box>
        <Box>
          {isCursor
            ? (
              <SelectInput
                items={itemOptions}
                onHighlight={(option: { value: number }) =>
                  setItem(idx, option.value)}
                initialIndex={itemOptions.findIndex(
                  (o: ItemOption) => o.value === item,
                )}
                limit={5}
              />
            )
            : (
              <Text>
                {invEnumName(item) || "Empty"}
              </Text>
            )}
        </Box>
      </Box>
    );
  }

  function renderAmount(amount: number, i: number) {
    const idx = i + 24;
    const isCursor = cursor === idx;
    return (
      <Box key={`inv-amount-${i}`}>
        <Box width={10}>
          <Text inverse={isCursor}>
            {`Amt ${(i + 1).toString().padStart(2, " ")}:`}
          </Text>
        </Box>
        <Box>
          {isCursor
            ? (
              <TextInput
                value={String(amount)}
                onChange={(v: string) => {
                  const n = parseInt(v);
                  if (!isNaN(n)) setAmount(i, Math.max(0, Math.min(255, n)));
                }}
              />
            )
            : <Text>{amount}</Text>}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100">
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        {items.slice(0, 12).map((item: number, i: number) =>
          renderItem(item, i, 0)
        )}
      </Box>
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        {items.slice(12, 24).map((item: number, i: number) =>
          renderItem(item, i, 12)
        )}
      </Box>
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        {amounts.map((amount: number, i: number) => renderAmount(amount, i))}
      </Box>
    </Box>
  );
};

export const InventoryFormFieldManager = {
  type: "inventory",
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
