import React from "react";
import { FormField, ValueOfField } from "ink-form";
import { SubfieldRendererProps } from "../subfield.tsx";
import { InputRendererProps, SubfieldRendererFactory } from "./subfield.tsx";
import { Text, useInput } from "ink";
import TextInput from "ink-text-input";

export type IntegerRendererProps<F extends FormField, V> =
  & SubfieldRendererProps<F, V>
  & {
    step?: number;
    min?: number;
    max?: number;
  };

export function IntegerRendererChangeHandlerFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  return (
    props: IntegerRendererProps<F, V>,
    value: string,
  ) => {
    const regex = /^-?\d+$/;
    if (regex.test(value)) {
      props.onClearError();
      const newValue = parseInt(value);
      if (props.value === undefined) {
        props.value = initialValue;
      }
      if (props.min !== undefined && props.min > newValue) {
        props.onError(
          `"${value}" too small, must be above or equal to ${props.min}.`,
        );
        props.onChange({
          ...initialValue,
          ...props.value,
          [props.property]: newValue,
        });
        return;
      }
      if (props.max !== undefined && props.max < newValue) {
        props.onError(
          `"${value}" too big, must be below or equal to ${props.max}.`,
        );
        props.onChange({
          ...initialValue,
          ...props.value,
          [props.property]: newValue,
        });
        return;
      } else {
        props.onChange({
          ...initialValue,
          ...props.value,
          [props.property]: newValue,
        });
      }
    } else {
      props.onError(
        `"${value}" in field "${String(props.property)}" is not an integer.`,
      );
      props.onChange({
        ...initialValue,
        ...props.value,
        // deno-lint-ignore no-explicit-any
        [props.property]: value as any,
      });
    }
  };
}

export function IntegerFieldRendererFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  const ChangeHandler = IntegerRendererChangeHandlerFactory<F, V>(initialValue);
  return SubfieldRendererFactory<F, V>(
    (props: InputRendererProps<F, V>) => {
      if (props.readonly) {
        return <Text>{props.value}</Text>;
      }
      return (
        <TextInput
          placeholder={props.label}
          onChange={(input: string) =>
            ChangeHandler(
              props.rendererProps as IntegerRendererProps<F, V>,
              input,
            )}
          value={String(props.value)}
          focus={props.isFocused}
        />
      );
    },
    (props: IntegerRendererProps<F, V>, isFocused: boolean) => {
      useInput(
        (_, key) => {
          if (key.upArrow) {
            ChangeHandler(
              props,
              `${(props.value?.[props.property] ?? 0) + (props.step ?? 1)}`,
            );
          } else if (key.downArrow) {
            ChangeHandler(
              props,
              `${(props.value?.[props.property] ?? 0) - (props.step ?? 1)}`,
            );
          }
        },
        { isActive: isFocused && !props.readonly },
      );
    },
  );
}
