import React from "react";
import { Box, Text, useFocus } from "ink";
import { FormField } from "ink-form";
import { SubfieldRendererProps } from "../subfield.tsx";

export type InputRendererProps<F extends FormField, V> = {
  rendererProps: SubfieldRendererProps<F, V>;
  label: string;
  value: unknown;
  isFocused: boolean;
  readonly: boolean;
};

export function SubfieldRendererFactory<F extends FormField, V>(
  renderInput: React.FC<InputRendererProps<F, V>>,
  renderBehavior?: (
    props: SubfieldRendererProps<F, V>,
    isFocused: boolean,
  ) => void,
): React.FC<SubfieldRendererProps<F, V>> {
  return (
    props: SubfieldRendererProps<F, V>,
  ) => {
    const { isFocused } = useFocus({ id: String(props.property) });

    const readonly = typeof props.readonly === "function"
      ? props.readonly(props.value)
      : props.readonly ?? false;

    const resolvedProps = {
      ...props,
      readonly: readonly,
    };

    renderBehavior?.(resolvedProps, isFocused);

    return (
      <Box width="100%" gap={0} flexDirection="column">
        <Text>
          {props.label}
          {readonly ? " (readonly)" : ""}:
        </Text>
        <Box
          borderStyle="round"
          marginX={2}
          paddingX={1}
          borderColor={isFocused ? "blue" : undefined}
        >
          {React.createElement(renderInput, {
            rendererProps: resolvedProps,
            label: String(props.property),
            value: props.value?.[props.property],
            isFocused: isFocused,
            readonly: readonly,
          })}
        </Box>
      </Box>
    );
  };
}
