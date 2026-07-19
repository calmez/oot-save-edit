import React, { useState } from "react";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { Box, Text, useInput } from "ink";

interface FlagItem {
  name: string;
  value: boolean;
}

type FormFieldFlags =
  & AbstractFormField<
    "flagsgroup",
    Record<string, boolean>
  >
  & {
    flags: FlagItem[];
  };

const FlagsField: React.FC<
  SpecificFormFieldRendererProps<FormFieldFlags>
> = (props: SpecificFormFieldRendererProps<FormFieldFlags>) => {
  const items: FlagItem[] = props.field.flags;
  const values: Record<string, boolean> = props.value ?? {};
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(Math.max(0, cursor - 1));
    }
    if (key.downArrow) {
      setCursor(Math.min(items.length - 1, cursor + 1));
    }
    if (input === " ") {
      const flag = items[cursor];
      const newValue = !values[flag.name];
      props.onChange({ ...values, [flag.name]: newValue });
    }
  }, { isActive: true });

  const visibleItems = items.slice(cursor, cursor + 15);

  function formatFlagName(name: string): string {
    return name
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  }

  return (
    <Box flexDirection="column" width="100">
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        {visibleItems.map((flag: FlagItem, i: number) => {
          const actualIndex = cursor + i;
          const val = values[flag.name];
          return (
            <Box key={flag.name}>
              <Text inverse={cursor === actualIndex}>
                {cursor === actualIndex ? "▶" : " "} {val ? "[X]" : "[ ]"}{" "}
                {formatFlagName(flag.name)}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box>
        <Text dimColor>
          {items.length} flags (↑↓ navigate, space toggle)
        </Text>
      </Box>
    </Box>
  );
};

export const FlagsGroupFormFieldManager = {
  type: "flagsgroup",
  renderValue: (
    props: SpecificFormFieldRendererProps<FormFieldFlags>,
  ) => {
    const values = props.value ?? {};
    const set = Object.values(values).filter(Boolean).length;
    return <Text>{set} / {props.field.flags.length} flags set</Text>;
  },
  renderField: FlagsField,
} as FormFieldManager<FormFieldFlags>;
