import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { MagicAmount } from "../../../models/saveslot.ts";
import { EnumFieldRendererFactory } from "./renderers/enum.tsx";
import { FormFieldManagerWithSubfieldsFactory } from "./subfield.tsx";
import { BooleanFieldRendererFactory } from "./renderers/boolean.tsx";

export interface MagicData {
  current: MagicAmount;
  flag1: boolean;
  flag2: boolean;
}

type FormFieldMagic = AbstractFormField<"magic", MagicData>;

export const MagicEnumFieldRenderer = EnumFieldRendererFactory<
  FormFieldMagic,
  MagicData
>({
  current: MagicAmount.Empty,
  flag1: false,
  flag2: false,
});

export const MagicBooleanFieldRenderer = BooleanFieldRendererFactory<
  FormFieldMagic,
  MagicData
>({
  current: MagicAmount.Empty,
  flag1: false,
  flag2: false,
});

export const MagicFormFieldManager = FormFieldManagerWithSubfieldsFactory<
  FormFieldMagic,
  MagicData
>("magic", (props: SpecificFormFieldRendererProps<FormFieldMagic>) => (
  <>
    Bar: {MagicAmount[props.value?.current ?? MagicAmount.Empty]}, Flag1:{" "}
    {props.value?.flag1 ?? false ? "[True]" : "[False]"}, Flag2:{" "}
    {props.value?.flag2 ?? false ? "[True]" : "[False]"}
  </>
));
