import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { FormFieldManagerWithSubfieldsFactory } from "./subfield.tsx";
import { EnumFieldRendererFactory } from "./renderers/enum.tsx";
import { NumberFieldRendererFactory } from "./renderers/number.tsx";
import { InventoryItems } from "../../../models/saveslot.ts";

export interface ButtonEquipsData {
  bButton: InventoryItems;
  cLeftButton: InventoryItems;
  cDownButton: InventoryItems;
  cRightButton: InventoryItems;
  cLeftOffset: number;
  cDownOffset: number;
  cRightOffset: number;
}

type FormFieldButtonEquips = AbstractFormField<
  "buttonequips",
  ButtonEquipsData
>;

export const ButtonEquipsBButtonRenderer = EnumFieldRendererFactory<
  FormFieldButtonEquips,
  ButtonEquipsData
>({
  bButton: InventoryItems.Empty,
  cLeftButton: InventoryItems.Empty,
  cDownButton: InventoryItems.Empty,
  cRightButton: InventoryItems.Empty,
  cLeftOffset: 0,
  cDownOffset: 0,
  cRightOffset: 0,
});

export const ButtonEquipsCOffsetRenderer = NumberFieldRendererFactory<
  FormFieldButtonEquips,
  ButtonEquipsData
>({
  bButton: InventoryItems.Empty,
  cLeftButton: InventoryItems.Empty,
  cDownButton: InventoryItems.Empty,
  cRightButton: InventoryItems.Empty,
  cLeftOffset: 0,
  cDownOffset: 0,
  cRightOffset: 0,
});

export const ButtonEquipsFormFieldManager =
  FormFieldManagerWithSubfieldsFactory<
    FormFieldButtonEquips,
    ButtonEquipsData
  >(
    "buttonequips",
    (
      props: SpecificFormFieldRendererProps<FormFieldButtonEquips>,
    ) => (
      <>
        B: {InventoryItems[props.value?.bButton ?? InventoryItems.Empty]}, C-L:
        {" "}
        {InventoryItems[props.value?.cLeftButton ?? InventoryItems.Empty]}, C-D:
        {" "}
        {InventoryItems[props.value?.cDownButton ?? InventoryItems.Empty]}, C-R:
        {" "}
        {InventoryItems[props.value?.cRightButton ?? InventoryItems.Empty]}
      </>
    ),
  );
