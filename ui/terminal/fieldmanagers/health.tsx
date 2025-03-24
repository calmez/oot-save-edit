import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import {
  FormFieldManagerWithSubfieldsFactory,
} from "./subfield.tsx";
import { IntegerFieldRendererFactory } from "./renderers/integer.tsx";

export interface HealthData {
  maxHealth: number;
  currentHealth: number;
  doubleDefenseHearts: number;
}

type FormFieldHealth = AbstractFormField<"health", HealthData>;

export const HealthFieldRenderer = IntegerFieldRendererFactory<
  FormFieldHealth,
  HealthData
>({
  maxHealth: 0,
  currentHealth: 0,
  doubleDefenseHearts: 0,
});

export const HealthFormFieldManager = FormFieldManagerWithSubfieldsFactory<
  FormFieldHealth,
  HealthData
>("health", (props: SpecificFormFieldRendererProps<FormFieldHealth>) => (
  <>
    {props.value?.currentHealth ?? 0}/{props.value?.maxHealth ?? 0} hearts (
    {props.value?.doubleDefenseHearts ?? 0} double defense hearts)
  </>
));
