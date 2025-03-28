import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { EnumFieldRendererFactory } from "./renderers/enum.tsx";
import { FormFieldManagerWithSubfieldsFactory } from "./subfield.tsx";
import { Entrance, Room } from "../../../models/scene.ts";
import { SelectionFieldRendererFactory } from "./renderers/selection.tsx";

export interface RoomData {
  room: Room;
  entrance: Entrance;
}

type FormFieldRoom = AbstractFormField<"room", RoomData>;

export const RoomFieldEnumRenderer = EnumFieldRendererFactory<
  FormFieldRoom,
  RoomData
>({
  room: Room.HyruleCastle,
  entrance: Entrance.FromMarket,
});

export const RoomFieldSelectionRenderer = SelectionFieldRendererFactory<
  FormFieldRoom,
  RoomData
>({
  room: Room.HyruleCastle,
  entrance: Entrance.FromMarket,
});

export const RoomFormFieldManager = FormFieldManagerWithSubfieldsFactory<
  FormFieldRoom,
  RoomData
>("room", (props: SpecificFormFieldRendererProps<FormFieldRoom>) => (
  <>
    {Room[
      props.value?.room ?? Room.HyruleCastle
    ]}
    {" - "}
    {Entrance[
      props.value?.entrance ?? Entrance.FromMarket
    ]}
  </>
));
