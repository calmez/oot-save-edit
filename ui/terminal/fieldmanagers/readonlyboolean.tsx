import React from "react";
import { Box, Text } from "ink";
import {
  AbstractFormField,
  FormFieldManager,
  FormFieldValueRendererProps,
  SpecificFormFieldRendererProps,
} from "ink-form";

type FormFieldReadonlyBoolean = AbstractFormField<"readonly.boolean", boolean>;

export const ReadonlyBooleanFormFieldManager = {
  type: "readonly.boolean",
  renderField: (
    props: SpecificFormFieldRendererProps<FormFieldReadonlyBoolean>,
  ) => (
    <Box borderStyle="round" width="100%">
      <Text>
        {props.value === undefined
          ? "[Not set]"
          : props.value
          ? "[True]"
          : "[False]"}
      </Text>
    </Box>
  ),
  renderValue: (
    props: FormFieldValueRendererProps<FormFieldReadonlyBoolean>,
  ) => (
    <Text color={props.value ? "green" : "gray"}>
      {props.value === undefined
        ? "[Not set]"
        : props.value
        ? "[True]"
        : "[False]"}
    </Text>
  ),
} as FormFieldManager<FormFieldReadonlyBoolean>;
