import { Text } from "ink";
import { FormField, ValueOfField } from "ink-form";
import SelectInput from "ink-select-input";
import React from "react";

import { SubfieldRendererProps } from "../subfield.tsx";
import { InputRendererProps, SubfieldRendererFactory } from "./subfield.tsx";

export type EnumRendererProps<F extends FormField, V> =
  & SubfieldRendererProps<
    F,
    V
  >
  & {
    enum: Record<number, string>;
  };

export function EnumRendererChangeHandlerFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  return (props: EnumRendererProps<F, V>, value: number) => {
    props.onChange({
      ...initialValue,
      ...props.value,
      [props.property]: value,
    });
  };
}

export function EnumFieldRendererFactory<F extends FormField, V>(
  initialValue: ValueOfField<F>,
) {
  const ChangeHandler = EnumRendererChangeHandlerFactory<F, V>(initialValue);
  return SubfieldRendererFactory<F, V>((props: InputRendererProps<F, V>) => {
    const rendererProps = props.rendererProps as EnumRendererProps<F, V>;
    const options = Object.values(rendererProps.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: rendererProps.enum[key], value: key };
      });

    if (
      props.readonly || !options.some((option) => option.value === props.value)
    ) {
      return (
        <Text>
          {options.find((option) => option.value === props.value)?.label ??
            props.value ??
            "Unavailable; use Field interpretations"}
        </Text>
      );
    }

    return (
      <SelectInput
        items={options}
        onSelect={(option) =>
          ChangeHandler(
            props.rendererProps as EnumRendererProps<F, V>,
            option.value,
          )}
        initialIndex={options.findIndex(
          (option) => option.value === props.value,
        )}
        isFocused={props.isFocused}
        limit={10}
      />
    );
  });
}
