import React from "react";
import { Box, Text } from "ink";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";

type FormFieldReadonlyEnum = AbstractFormField<"readonly.enum", number> & {
  enum: Record<number, string>;
};

export const ReadonlyEnumFormFieldManager = {
  type: "readonly.enum",
  renderValue: ({
    value,
    field,
  }: SpecificFormFieldRendererProps<FormFieldReadonlyEnum>) => {
    const options = Object.values(field.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: field.enum[key], value: key };
      });

    return (
      <Text>
        {options.find((option) => option.value === value)?.label ??
          value ??
          "No value"}
      </Text>
    );
  },
  renderField: (props: SpecificFormFieldRendererProps<FormFieldReadonlyEnum>) => {
    const options = Object.values(props.field.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: props.field.enum[key], value: key };
      });

    return (
      <Box borderStyle="round" width="100%">
        <Text>
          {options.find((option) => option.value === props.value)?.label ??
            props.value ??
            "No value"}
        </Text>
      </Box>
    );
  },
} as FormFieldManager<FormFieldReadonlyEnum>;
