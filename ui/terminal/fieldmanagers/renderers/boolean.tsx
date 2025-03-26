import React from "react";
import { FormField, ValueOfField } from "ink-form";
import { SubfieldRendererProps } from "../subfield.tsx";
import { InputRendererProps, SubfieldRendererFactory } from "./subfield.tsx";
import { Text, useInput } from "ink";

export type BooleanRendererProps<F extends FormField, V> =
  SubfieldRendererProps<F, V>;

export function BooleanRendererChangeHandlerFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  return (
    props: BooleanRendererProps<F, V>,
    value: boolean,
  ) => {
    props.onChange({
      ...initialValue,
      ...props.value,
      [props.property]: value,
    });
  };
}

export function BooleanFieldRendererFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  const ChangeHandler = BooleanRendererChangeHandlerFactory<F, V>(initialValue);
  return SubfieldRendererFactory<F, V>(
    (props: InputRendererProps<F, V>) => {
      return (
        <Text color={props.value ? "green" : "gray"}>
          {props.value === undefined
            ? "[Not set]"
            : props.value
            ? "[True]"
            : "[False]"}
        </Text>
      );
    },
    (props: BooleanRendererProps<F, V>, isFocused: boolean) => {
      useInput((input, _) => {
        if (input === " ") {
          ChangeHandler(props, !props.value?.[props.property]);
        }
      }, { isActive: isFocused && !props.readonly });
    },
  );
}
