import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { useInput } from "ink";
import TextInput from "ink-text-input";
import {
  FormFieldManagerWithSubfieldsFactory,
  SubfieldRendererProps,
} from "./subfield.tsx";
import {
  InputRendererProps,
  SubfieldRendererFactory,
} from "./renderers/subfield.tsx";

export interface HealthData {
  maxHealth: number;
  currentHealth: number;
  doubleDefenseHearts: number;
}

type FormFieldHealth = AbstractFormField<"health", HealthData>;

type HealthFieldRendererProps =
  & SubfieldRendererProps<
    FormFieldHealth,
    HealthData
  >
  & {
    step?: number;
    min?: number;
    max?: number;
  };

const HealthFieldRendererChangeHandler = (
  props: HealthFieldRendererProps,
  value: string,
) => {
  const regex = /^-?\d+$/;
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
    if (props.min !== undefined && props.min > newValue) {
      props.onError(
        `"${value}" too small, must be above or equal to ${props.min}.`,
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
    if (props.max !== undefined && props.max < newValue) {
      props.onError(
        `"${value}" too big, must be below or equal to ${props.max}.`,
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

export const HealthFieldRenderer = SubfieldRendererFactory<
  FormFieldHealth,
  HealthData
>(
  (props: InputRendererProps<FormFieldHealth, HealthData>) => (
    <TextInput
      placeholder={props.label}
      onChange={(input: string) =>
        HealthFieldRendererChangeHandler(
          props.rendererProps as HealthFieldRendererProps,
          input,
        )}
      value={props.value}
      focus={props.isFocused}
    />
  ),
  (props: HealthFieldRendererProps, isFocused: boolean) => {
    useInput(
      (_, key) => {
        if (key.upArrow) {
          HealthFieldRendererChangeHandler(
            props,
            `${(props.value?.[props.property] ?? 0) + (props.step ?? 1)}`,
          );
        } else if (key.downArrow) {
          HealthFieldRendererChangeHandler(
            props,
            `${(props.value?.[props.property] ?? 0) - (props.step ?? 1)}`,
          );
        }
      },
      { isActive: isFocused },
    );
  },
);

export const HealthFormFieldManager = FormFieldManagerWithSubfieldsFactory<
  FormFieldHealth,
  HealthData
>("health", (props: SpecificFormFieldRendererProps<FormFieldHealth>) => (
  <>
    {props.value?.currentHealth ?? 0}/{props.value?.maxHealth ?? 0} hearts (
    {props.value?.doubleDefenseHearts ?? 0} double defense hearts)
  </>
));
