import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import React from "react";

import { MagicAmount } from "../../../models/saveslot.ts";
import { BooleanFieldRendererFactory } from "./renderers/boolean.tsx";
import { EnumFieldRendererFactory } from "./renderers/enum.tsx";
import { NumberFieldRendererFactory } from "./renderers/number.tsx";
import { FormFieldManagerWithSubfieldsFactory } from "./subfield.tsx";

export interface MagicData {
  current: MagicAmount;
  flag1: boolean;
  flag2: boolean;
}

type FormFieldMagic = AbstractFormField<"magic", MagicData>;

export const MagicNumberFieldRenderer = NumberFieldRendererFactory<
  FormFieldMagic,
  MagicData
>({
  current: MagicAmount.Empty,
  flag1: false,
  flag2: false,
});

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
    Magic: {props.value?.current ?? 0}, Flag1: {props.value?.flag1 === undefined
      ? "[Unavailable]"
      : props.value.flag1
      ? "[True]"
      : "[False]"}, Flag2: {props.value?.flag2 === undefined
      ? "[Unavailable]"
      : props.value.flag2
      ? "[True]"
      : "[False]"}
  </>
));
