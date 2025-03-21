import React from "react";
import { Box, Text } from "ink";
import {
  AbstractFormField,
  FormFieldManager,
  FormFieldValueRendererProps,
  SpecificFormFieldRendererProps,
} from "ink-form";

type FormFieldReadonlyString = AbstractFormField<"readonly.string", string>;

export const ReadonlyStringFormFieldManager = {
  type: "readonly.string",
  renderField: (
    props: SpecificFormFieldRendererProps<FormFieldReadonlyString>,
  ) => (
    <Box borderStyle="round" width="100%">
      <Text>
        {props.value ?? ""}
      </Text>
    </Box>
  ),
  renderValue: (
    props: FormFieldValueRendererProps<FormFieldReadonlyString>,
  ) => (
    <Text>
      {props.value ?? ""}
    </Text>
  ),
} as FormFieldManager<FormFieldReadonlyString>;
