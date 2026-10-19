import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import React from "react";

import { Boots, Shield, Sword, Tunic } from "../../../models/saveslot.ts";
import { EnumFieldRendererFactory } from "./renderers/enum.tsx";
import { FormFieldManagerWithSubfieldsFactory } from "./subfield.tsx";

export interface CurrentEquipmentData {
  sword: number;
  shield: number;
  tunic: number;
  boots: number;
}

type FormFieldCurrentEquip = AbstractFormField<
  "currentequip",
  CurrentEquipmentData
>;

export const CurrentEquipSwordRenderer = EnumFieldRendererFactory<
  FormFieldCurrentEquip,
  CurrentEquipmentData
>({
  sword: 0,
  shield: 0,
  tunic: 0,
  boots: 0,
});

export const CurrentEquipShieldRenderer = EnumFieldRendererFactory<
  FormFieldCurrentEquip,
  CurrentEquipmentData
>({
  sword: 0,
  shield: 0,
  tunic: 0,
  boots: 0,
});

export const CurrentEquipTunicRenderer = EnumFieldRendererFactory<
  FormFieldCurrentEquip,
  CurrentEquipmentData
>({
  sword: 0,
  shield: 0,
  tunic: 0,
  boots: 0,
});

export const CurrentEquipBootsRenderer = EnumFieldRendererFactory<
  FormFieldCurrentEquip,
  CurrentEquipmentData
>({
  sword: 0,
  shield: 0,
  tunic: 0,
  boots: 0,
});

export const CurrentEquipFormFieldManager =
  FormFieldManagerWithSubfieldsFactory<
    FormFieldCurrentEquip,
    CurrentEquipmentData
  >(
    "currentequip",
    (
      props: SpecificFormFieldRendererProps<FormFieldCurrentEquip>,
    ) => (
      <>
        Sword: {Sword[props.value?.sword ?? 0] ||
          (props.value?.sword ? `Unknown (${props.value.sword})` : "None")},
        Shield: {Shield[props.value?.shield ?? 0] ||
          (props.value?.shield ? `Unknown (${props.value.shield})` : "None")},
        Tunic: {Tunic[props.value?.tunic ?? 0] ||
          (props.value?.tunic ? `Unknown (${props.value.tunic})` : "None")},
        Boots: {Boots[props.value?.boots ?? 0] ||
          (props.value?.boots ? `Unknown (${props.value.boots})` : "None")}
      </>
    ),
  );
