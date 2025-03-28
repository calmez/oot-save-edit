import React from "react";
import { FormField, ValueOfField } from "ink-form";
import { SubfieldRendererProps } from "../subfield.tsx";
import SelectInput from "ink-select-input";
import { InputRendererProps, SubfieldRendererFactory } from "./subfield.tsx";
import { Text } from "ink";

export type SelectionRendererProps<
  F extends FormField,
  V,
> = SubfieldRendererProps<F, V> & {
  options:
    | Array<{ label?: string; value: number }>
    | ((value?: ValueOfField<F>) => Array<{ label?: string; value: number }>);
};

export function SelectionRendererChangeHandlerFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  return (props: SelectionRendererProps<F, V>, value: number) => {
    props.onChange({
      ...initialValue,
      ...props.value,
      [props.property]: value,
    });
  };
}

export function SelectionFieldRendererFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  const ChangeHandler = SelectionRendererChangeHandlerFactory<F, V>(
    initialValue,
  );
  return SubfieldRendererFactory<F, V>((props: InputRendererProps<F, V>) => {
    const rendererProps = props.rendererProps as SelectionRendererProps<F, V>;
    const resolvedOptions = typeof rendererProps.options === "function"
      ? rendererProps.options(rendererProps.value)
      : rendererProps.options;

    if (props.readonly) {
      return (
        <Text>
          {resolvedOptions.find((option) => option.value === props.value)
            ?.label ??
            props.value ??
            "No value"}
        </Text>
      );
    }

    return (
      <SelectInput
        items={resolvedOptions.map((option) => ({
          value: option.value,
          label: option.label ?? String(option.value),
        }))}
        onHighlight={(option) =>
          ChangeHandler(
            props.rendererProps as SelectionRendererProps<F, V>,
            option.value,
          )}
        initialIndex={resolvedOptions.findIndex(
          (option) => option.value === props.value,
        ) ?? 0}
        isFocused={props.isFocused}
        limit={10}
      />
    );
  });
}
