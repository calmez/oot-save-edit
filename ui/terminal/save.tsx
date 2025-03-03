import React, { useState } from "react";
import { SaveFile } from "../../models/savefile.ts";
import { Box } from "ink";
import { Form } from "ink-form";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../../models/saveheader.ts";
import { Age } from "../../models/saveslot.ts";
import { EnumFieldManager } from "./enumfieldmanager.tsx";

interface FormData {
  header_languageOption: LanguageOption;
  header_zTargetOption: ZTargetOption;
  header_soundOption: SoundOption;
  slot_0_playerName: string;
  slot_0_age: Age;
}

interface SaveProps {
  filename: string;
}

export const Save = ({ filename }: SaveProps): React.JSX.Element => {
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
        onSubmit={(_values: FormData) => {
          const outfile = Deno.openSync(filename, { write: true });
          saveFile.write(outfile);
          outfile.close();
        }}
      />
    </Box>
  );
};
