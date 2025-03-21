import React from "react";
import { Box } from "ink";
import SelectInput from "ink-select-input";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";

type FormFieldSelection = AbstractFormField<"selection", string> & {
  options: Array<{ label?: string; value: string }>;
};

export const SelectionFormFieldManager = {
  type: "selection",
  renderField: (props: SpecificFormFieldRendererProps<FormFieldSelection>) => (
    <Box borderStyle="round" width="100%">
      <SelectInput
        items={props.field.options.map((option) => ({
          value: option.value,
          label: option.label ?? option.value,
        }))}
        onHighlight={(option) => props.onChange(option.value)}
        initialIndex={props.field.options.findIndex((option) =>
          option.value === props.value
        ) ?? 0}
      />
    </Box>
  ),
  renderValue: (props: SpecificFormFieldRendererProps<FormFieldSelection>) => (
    <>
      {props.field.options.find((option) => option.value === props.value)
        ?.label ?? props.value ?? "No value"}
    </>
  ),
};
