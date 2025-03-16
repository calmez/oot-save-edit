import React from "react";
import { Box } from "ink";
import SelectInput from "ink-select-input";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";

type FormFieldEnum = AbstractFormField<"enum", number> & {
  enum: Record<number, string>;
};

export const EnumFieldManager = {
  type: "enum",
  renderValue: ({
    value,
    field,
  }: SpecificFormFieldRendererProps<FormFieldEnum>) => {
    const options = Object.values(field.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: field.enum[key], value: key };
      });

    return (
      <>
        {options.find((option) => option.value === value)?.label ??
          value ??
          "No value"}
      </>
    );
  },
  renderField: (props: SpecificFormFieldRendererProps<FormFieldEnum>) => {
    const options = Object.values(props.field.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: props.field.enum[key], value: key };
      });

    return (
      <Box borderStyle="round" width="100%">
        <SelectInput
          items={options}
          onHighlight={(option) => props.onChange(option.value)}
          initialIndex={options.findIndex(
            (option) => option.value === props.value,
          )}
        />
      </Box>
    );
  },
} as FormFieldManager<FormFieldEnum>;
