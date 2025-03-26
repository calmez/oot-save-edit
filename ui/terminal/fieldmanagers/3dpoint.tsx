import React from "react";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { FaroresWindWarp } from "../../../models/saveslot.ts";
import {
  FormFieldManagerWithSubfieldsFactory,
  SubfieldProps,
} from "./subfield.tsx";
import { NumberFieldRendererFactory } from "./renderers/number.tsx";

type FormFieldPoint3D = AbstractFormField<"point3d", FaroresWindWarp>;

export const Point3DFieldRenderer = NumberFieldRendererFactory<
  FormFieldPoint3D,
  FaroresWindWarp
>({
  x: 0,
  y: 0,
  z: 0,
  yRotation: 0,
});

export const Point3DFormFieldManager = FormFieldManagerWithSubfieldsFactory<
  FormFieldPoint3D,
  FaroresWindWarp
>("point3d", (
  props: SpecificFormFieldRendererProps<
    FormFieldPoint3D & {
      subfields: Record<
        keyof FaroresWindWarp,
        SubfieldProps<FormFieldPoint3D, FaroresWindWarp>
      >;
    }
  >,
) => (
  <>
    {"[" +
      Object.keys(props.value ?? { x: 0, y: 0, z: 0, yRotation: 0 })
        .map((key: string) => {
          const label =
            props.field.subfields[key as keyof FaroresWindWarp].props.label;
          const value = props.value?.[key as keyof FaroresWindWarp] ?? 0;
          return `${label}: ${value}`;
        })
        .join(", ") +
      "]"}
  </>
));
