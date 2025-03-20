import React, { useEffect } from "react";
import {
  FormField,
  FormFieldValueRendererProps,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { Box, Text, useFocusManager, useInput } from "ink";

export type SubfieldRendererProps<
  F extends FormField,
  V,
> = SpecificFormFieldRendererProps<F> & {
  property: keyof V;
  label: string;
};

type SubfieldProps<F extends FormField, V> = {
  renderer: React.FC<SubfieldRendererProps<F, V>>;
  props: SubfieldRendererProps<F, V>;
};

export function FormFieldManagerWithSubfieldsFactory<F extends FormField, V>(
  type: string,
  renderValue: React.FC<
    FormFieldValueRendererProps<
      F & {
        subfields: Record<keyof V, SubfieldProps<F, V>>;
      }
    >
  >,
) {
  return {
    type,
    renderField: (
      props: SpecificFormFieldRendererProps<
        F & {
          subfields: Record<keyof V, SubfieldProps<F, V>>;
        }
      >,
    ) => {
      const focusManager = useFocusManager();

      useEffect(() => {
        focusManager.disableFocus();
        // TODO figure out why this doesn't work
        // it calls the focus with the correct argument but in the renderer
        // useFocus doesn't report the component as focused
        focusManager.focus(Object.keys(props.field.subfields)[0]);
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
            {Object.keys(props.field.subfields ?? {}).map((key) => {
              const subfield = props.field.subfields[key as keyof V];
              return subfield.renderer({
                ...props,
                ...subfield.props,
                property: key as keyof V,
              });
            })}
          </Box>
          <Box>
            <Text dimColor>
              Press TAB and SHIFT-TAB to move between fields.
            </Text>
          </Box>
        </Box>
      );
    },
    renderValue,
  };
}
