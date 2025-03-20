import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { Box, Text, useFocus, useInput } from "ink";
import TextInput from "ink-text-input";
import {
  FormFieldManagerWithSubfieldsFactory,
  SubfieldRendererProps,
} from "./subfield.tsx";

export interface HealthData {
  maxHealth: number;
  currentHealth: number;
  doubleDefenseHearts: number;
}

type FormFieldHealth = AbstractFormField<"health", HealthData> & {
  // TODO move these in renderer props
  step?: number;
  min?: number;
  max?: number;
};

export const HealthFieldRenderer: React.FC<
  SubfieldRendererProps<FormFieldHealth, HealthData>
> = (props: SubfieldRendererProps<FormFieldHealth, HealthData>) => {
  const { isFocused } = useFocus({ id: props.property });
  const regex = /^-?\d+$/;

  const change = (value: string) => {
    if (regex.test(value)) {
      props.onClearError();
      const newValue = parseInt(value);
      if (props.value === undefined) {
        props.value = {
          maxHealth: 0,
          currentHealth: 0,
          doubleDefenseHearts: 0,
        };
      }
      if (props.field.min !== undefined && props.field.min > newValue) {
        props.onError(
          `"${value}" too small, must be above or equal to ${props.field.min}.`,
        );
        props.onChange({
          ...{
            maxHealth: props.value?.maxHealth ?? 0,
            currentHealth: props.value?.currentHealth ?? 0,
            doubleDefenseHearts: props.value?.doubleDefenseHearts ?? 0,
          },
          [props.property]: newValue,
        });
        return;
      }
      if (props.field.max !== undefined && props.field.max < newValue) {
        props.onError(
          `"${value}" too big, must be below or equal to ${props.field.max}.`,
        );
        props.onChange({
          ...{
            maxHealth: props.value?.maxHealth ?? 0,
            currentHealth: props.value?.currentHealth ?? 0,
            doubleDefenseHearts: props.value?.doubleDefenseHearts ?? 0,
          },
          [props.property]: newValue,
        });
        return;
      } else {
        props.onChange({
          ...props.value,
          [props.property]: newValue,
        });
      }
    } else {
      props.onError(
        `"${value}" in field "${props.property}" is not an integer.`,
      );
      props.onChange({
        ...{
          maxHealth: props.value?.maxHealth ?? 0,
          currentHealth: props.value?.currentHealth ?? 0,
          doubleDefenseHearts: props.value?.doubleDefenseHearts ?? 0,
        },
        // deno-lint-ignore no-explicit-any
        [props.property]: value as any,
      });
    }
  };

  useInput(
    (_, key) => {
      if (key.upArrow) {
        change(
          `${(props.value?.[props.property] ?? 0) + (props.field.step ?? 1)}`,
        );
      } else if (key.downArrow) {
        change(
          `${(props.value?.[props.property] ?? 0) - (props.field.step ?? 1)}`,
        );
      }
    },
    { isActive: isFocused },
  );

  return (
    <Box width="100%" gap={0} flexDirection="column">
      <Text>{props.label}:</Text>
      <Box
        borderStyle="round"
        marginX={2}
        paddingX={1}
        borderColor={isFocused ? "blue" : undefined}
      >
        <TextInput
          placeholder={props.property}
          onChange={change}
          value={`${props.value?.[props.property]}`}
          focus={isFocused}
        />
      </Box>
    </Box>
  );
};

export const HealthFormFieldManager = FormFieldManagerWithSubfieldsFactory<
  FormFieldHealth,
  HealthData
>("health", (props: SpecificFormFieldRendererProps<FormFieldHealth>) => (
  <>
    {props.value?.currentHealth ?? 0}/{props.value?.maxHealth ?? 0} hearts (
    {props.value?.doubleDefenseHearts ?? 0} double defense hearts)
  </>
));
