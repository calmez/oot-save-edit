import React from "react";
import { FormField, ValueOfField } from "ink-form";
import { SubfieldRendererProps } from "../subfield.tsx";
import { InputRendererProps, SubfieldRendererFactory } from "./subfield.tsx";
import { Text, useInput } from "ink";
import TextInput from "ink-text-input";

export type NumberRendererProps<F extends FormField, V> =
  & SubfieldRendererProps<F, V>
  & {
    min?: number | ((value?: ValueOfField<F>) => number);
    max?: number | ((value?: ValueOfField<F>) => number);
    step?: number | ((value?: ValueOfField<F>) => number);
    isFloat?: boolean;
  };

export function NumberRendererChangeHandlerFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  return (
    props: NumberRendererProps<F, V>,
    value: string,
  ) => {
    const resolvedMin = typeof props.min === "function"
      ? props.min(props.value)
      : props.min;
    const resolvedMax = typeof props.max === "function"
      ? props.max(props.value)
      : props.max;

    const regex = props.isFloat ?? false ? /^-?((\d+)|(\d*\.\d+))$/ : /^-?\d+$/;
    if (regex.test(value)) {
      props.onClearError();
      const newValue = props.isFloat ?? false
        ? parseFloat(value)
        : parseInt(value);
      if (props.value === undefined) {
        props.value = initialValue;
      }
      if (resolvedMin !== undefined && resolvedMin > newValue) {
        props.onError(
          `"${value}" too small, must be above or equal to ${resolvedMin}.`,
        );
        props.onChange({
          ...initialValue,
          ...props.value,
          [props.property]: newValue,
        });
        return;
      }
      if (resolvedMax !== undefined && resolvedMax < newValue) {
        props.onError(
          `"${value}" too big, must be below or equal to ${resolvedMax}.`,
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
        `"${value}" in field "${
          String(props.property)
        }" is not a valid number.`,
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

export function NumberFieldRendererFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  const ChangeHandler = NumberRendererChangeHandlerFactory<F, V>(initialValue);
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
              props.rendererProps as NumberRendererProps<F, V>,
              input,
            )}
          value={String(props.value)}
          focus={props.isFocused}
        />
      );
    },
    (props: NumberRendererProps<F, V>, isFocused: boolean) => {
      const resolvedStep = typeof props.step === "function"
        ? props.step(props.value)
        : props.step ?? 1;

      useInput(
        (_, key) => {
          if (key.upArrow) {
            ChangeHandler(
              props,
              `${(props.value?.[props.property] ?? 0) + resolvedStep}`,
            );
          } else if (key.downArrow) {
            ChangeHandler(
              props,
              `${(props.value?.[props.property] ?? 0) - resolvedStep}`,
            );
          }
        },
        { isActive: isFocused && !props.readonly },
      );
    },
  );
}
