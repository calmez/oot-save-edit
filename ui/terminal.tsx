import React from "react";
import { Box, render, Text, useFocus } from "ink";
import Gradient from "ink-gradient";
import { Form } from "ink-form";
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

const Save = ({ filename }: SaveProps): React.JSX.Element => {
  const file = Deno.openSync(filename);
  const saveFile = new SaveFile(file);
  file.close();

  return (
    <Box flexDirection="column">
      <Form
        form={{
          title: "Edit Save",
          sections: [
            {
              title: "General",
              fields: [
                {
                  type: "select",
                  name: "header.languageOption",
                  label: "Language",
                  options: Object.values(LanguageOption)
                    .filter((value) => typeof value === "number")
                    .map((key) => {
                      return { key: key, value: LanguageOption[key] };
                    }),
                  initialValue: LanguageOption[saveFile.header.languageOption],
                },
                {
                  type: "select",
                  name: "header.zTargetOption",
                  label: "Z-Target",
                  options: Object.values(ZTargetOption)
                    .filter((value) => typeof value === "number")
                    .map((key) => {
                      return { key: key, value: ZTargetOption[key] };
                    }),
                  initialValue: ZTargetOption[saveFile.header.zTargetOption],
                },
                {
                  type: "select",
                  name: "header.soundOption",
                  label: "Sound",
                  options: Object.values(SoundOption)
                    .filter((value) => typeof value === "number")
                    .map((key) => {
                      return { key: key, value: SoundOption[key] };
                    }),
                  initialValue: SoundOption[saveFile.header.soundOption],
                },
              ],
            },
            {
              title: "Slot 1",
              fields: [
                {
                  type: "string",
                  name: "slot.0.playerName",
                  label: "Player Name",
                  initialValue: saveFile.slots[0].playerName,
                },
                {
                  type: "select",
                  name: "slot.0.age",
                  label: "Age",
                  options: Object.values(Age)
                    .filter((value) => typeof value === "number")
                    .map((key) => {
                      return { key: key, value: Age[key] };
                    }),
                  initialValue: Age[saveFile.slots[0].age],
                },
              ],
            },
          ],
        }}
        onChange={(values: any) => {
          console.log(`Form updated with values: ${JSON.stringify(values)}`);
        }}
        onSubmit={(values: any) => {
          console.log(`Form submitted with values: ${JSON.stringify(values)}`);
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
