import React, { useState } from "react";
import { Box, render, Text, useFocus } from "ink";
import Gradient from "ink-gradient";
import { Form } from "ink-form";
import SelectInput from "ink-select-input";
import { SaveFile } from "../models/savefile.ts";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../models/saveheader.ts";
import { Age } from "../models/saveslot.ts";

interface SaveProps {
  filename: string;
}

interface FormData {
  header_languageOption: LanguageOption;
  header_zTargetOption: ZTargetOption;
  header_soundOption: SoundOption;
  slot_0_playerName: string;
  slot_0_age: Age;
}

const EnumFieldManager = {
  type: "enum",
  renderValue: ({ value, field }) => {
    const options = Object.values(field.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: field.enum[key], value: key };
      });

    return (
      <>
        {options.find((option) => option.value === value)?.label ??
          value ??
          "No value"}
      </>
    );
  },
  renderField: (props) => {
    const options = Object.values(props.field.enum)
      .filter((value) => typeof value === "number")
      .map((key) => {
        return { label: props.field.enum[key], value: key };
      });

    return (
      <Box borderStyle={"round"} width="100%">
        <SelectInput
          items={options}
          onHighlight={(option) => props.onChange(option.value)}
          initialIndex={options.findIndex(
            (option) => option.value === props.value
          )}
        />
      </Box>
    );
  },
};

const Save = ({ filename }: SaveProps): React.JSX.Element => {
  const file = Deno.openSync(filename);
  const [saveFile, setSaveFile] = useState<SaveFile>(new SaveFile(file));
  file.close();

  return (
    <Box flexDirection="column">
      <Form
        customManagers={[EnumFieldManager]}
        form={{
          title: "Edit Save",
          sections: [
            {
              title: "General",
              fields: [
                {
                  type: "enum",
                  name: "header_languageOption",
                  label: "Language",
                  enum: LanguageOption,
                  initialValue: saveFile.header.languageOption,
                },
                {
                  type: "enum",
                  name: "header_zTargetOption",
                  label: "Z-Target",
                  enum: ZTargetOption,
                  initialValue: saveFile.header.zTargetOption,
                },
                {
                  type: "enum",
                  name: "header_soundOption",
                  label: "Sound",
                  enum: SoundOption,
                  initialValue: saveFile.header.soundOption,
                },
              ],
            },
            {
              title: "Slot 1",
              fields: [
                {
                  type: "string",
                  name: "slot_0_playerName",
                  label: "Player Name",
                  initialValue: saveFile.slots[0].playerName,
                  regex: /^[A-Za-z]{1,8}$/,
                },
                {
                  type: "enum",
                  name: "slot_0_age",
                  label: "Age",
                  enum: Age,
                  initialValue: saveFile.slots[0].age,
                },
              ],
            },
          ],
        }}
        onChange={(values: FormData) => {
          saveFile.header.languageOption = values.header_languageOption;
          saveFile.header.zTargetOption = values.header_zTargetOption;
          saveFile.header.soundOption = values.header_soundOption;
          saveFile.slots[0].playerName = values.slot_0_playerName;
          saveFile.slots[0].age = values.slot_0_age;
          setSaveFile(saveFile);
        }}
        onSubmit={(values: FormData) => {
          const outfile = Deno.openSync(filename, { write: true });
          saveFile.write(outfile);
          outfile.close();
        }}
      />
    </Box>
  );
};

const App = () => {
  const { _isFocused } = useFocus();
  const width = Deno.consoleSize().columns;
  const height = Deno.consoleSize().rows;
  const filename: string = Deno.args[0];

  return (
    <Box
      width={width}
      height={height}
      flexDirection="column"
      gap={1}
      padding={1}
      borderStyle="round"
      borderColor="white"
    >
      <Box flexDirection="row" justifyContent="center">
        <Gradient name="rainbow">
          <Text>"Welcome to OOT Save Edit!"</Text>
        </Gradient>
      </Box>
      {!!filename && filename.length > 0 ? (
        <Save filename={filename} />
      ) : (
        <Text>
          No file selected, please provide a filename as first argument.
        </Text>
      )}
    </Box>
  );
};

render(<App />);
