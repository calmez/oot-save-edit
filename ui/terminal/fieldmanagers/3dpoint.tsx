import React, { useEffect } from "react";
import { Box, Text, useFocus, useFocusManager, useInput } from "ink";
import TextInput from "ink-text-input";
import { AbstractFormField, SpecificFormFieldRendererProps } from "ink-form";
import { FaroresWindWarp } from "../../../models/saveslot.ts";

type FormFieldPoint3D = AbstractFormField<"point3d", FaroresWindWarp> & {
  subfieldLabels: { [key in keyof FaroresWindWarp]: string };
};

type Point3DFieldRendererProps =
  & SpecificFormFieldRendererProps<FormFieldPoint3D>
  & {
    property: keyof FaroresWindWarp;
    step?: number;
    min?: number;
    max?: number;
  };

export const Point3DFieldRenderer: React.FC<Point3DFieldRendererProps> = (
  props: Point3DFieldRendererProps,
) => {
  const { isFocused } = useFocus({ id: props.property });
  const regex = /^-?\d+$/;

  const change = (value: string) => {
    if (regex.test(value)) {
      props.onClearError();
      const newValue = parseInt(value);
      if (props.value === undefined) {
        props.value = { x: 0, y: 0, z: 0, yRotation: 0 };
      }
      if (props.min !== undefined && props.min > newValue) {
        props.onError(
          `"${value}" too small, must be above or equal to ${props.min}.`,
        );
        props.onChange({
          ...{
            x: props.value?.x ?? 0,
            y: props.value?.y ?? 0,
            z: props.value?.z ?? 0,
            yRotation: props.value?.yRotation ?? 0,
          },
          [props.property]: newValue,
        });
        return;
      }
      if (props.min !== undefined && props.min > newValue) {
        props.onError(
          `"${value}" too big, must be below or equal to ${props.max}.`,
        );
        props.onChange({
          ...{
            x: props.value?.x ?? 0,
            y: props.value?.y ?? 0,
            z: props.value?.z ?? 0,
            yRotation: props.value?.yRotation ?? 0,
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
          x: props.value?.x ?? 0,
          y: props.value?.y ?? 0,
          z: props.value?.z ?? 0,
          yRotation: props.value?.yRotation ?? 0,
        },
        // deno-lint-ignore no-explicit-any
        [props.property]: value as any,
      });
    }
  };

  useInput(
    (_, key) => {
      if (key.upArrow) {
        change(`${(props.value?.[props.property] ?? 0) + (props.step ?? 1)}`);
      } else if (key.downArrow) {
        change(`${(props.value?.[props.property] ?? 0) - (props.step ?? 1)}`);
      }
    },
    { isActive: isFocused },
  );

  return (
    <Box width="100%" gap={0} flexDirection="column">
      <Text>{props.field.subfieldLabels[props.property]}:</Text>
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

export const Point3DFormFieldManager = {
  type: "point3d",
  renderField: (props: SpecificFormFieldRendererProps<FormFieldPoint3D>) => {
    const focusManager = useFocusManager();

    useEffect(() => {
      focusManager.disableFocus();
      focusManager.focus("x");
    }, []);

    useInput((_, key) => {
      // TODO handle circling focus around
      if (key.tab && !key.shift) {
        focusManager.focusNext();
      }
      if (key.tab && key.shift) {
        focusManager.focusPrevious();
      }
      if (key.escape) {
        props.onCancel();
      }
      if (key.return) {
        props.onSave();
      }
    });

    return (
      <Box flexDirection="column" width="100%">
        <Box gap={1} flexDirection="row">
          {Object.keys(props.value ?? {}).map((key) => (
            <Point3DFieldRenderer
              {...props}
              property={key as keyof typeof props.value}
              min={0}
              max={0xffff}
            />
          ))}
        </Box>
        <Box>
          <Text dimColor>
            Press TAB and SHIFT-TAB to move between fields and UP/DOWN to
            increase or decrease the value in the selected field.
          </Text>
        </Box>
      </Box>
    );
  },
  renderValue: (props: SpecificFormFieldRendererProps<FormFieldPoint3D>) => (
    <>
      {"[" +
        Object.keys(props.value ?? { x: 0, y: 0, z: 0, yRotation: 0 })
          .map((key: string) => {
            const label =
              props.field.subfieldLabels[key as keyof FaroresWindWarp];
            const value = props.value?.[key as keyof FaroresWindWarp] ?? 0;
            return `${label}: ${value}`;
          })
          .join(", ") +
        "]"}
    </>
  ),
};
