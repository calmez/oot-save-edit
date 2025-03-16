import React, { useState } from "react";
import { FileFormat, SaveFile } from "../../models/savefile.ts";
import { Box } from "ink";
import { Form } from "ink-form";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../../models/saveheader.ts";
import { Age } from "../../models/saveslot.ts";
import { EnumFormFieldManager } from "./fieldmanagers/enum.tsx";
import { ReadonlyStringFormFieldManager } from "./fieldmanagers/readonlystring.tsx";
import { ReadonlyBooleanFormFieldManager } from "./fieldmanagers/readonlyboolean.tsx";
import { ReadonlyEnumFormFieldManager } from "./fieldmanagers/readonlyenum.tsx";

interface FormData {
  info_filename: string;
  info_wordSwapped: boolean;
  info_fileFormat: FileFormat;
  saveoptions_filename: string;
  saveoptions_swapWords: boolean;
  saveoptions_fileFormat: FileFormat;
  header_languageOption: LanguageOption;
  header_zTargetOption: ZTargetOption;
  header_soundOption: SoundOption;
  slot_0_playerName: string;
  slot_0_age: Age;
  slot_0_currentHealth: number;
  slot_0_maxHealth: number;
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
        customManagers={[
          EnumFormFieldManager,
          ReadonlyStringFormFieldManager,
          ReadonlyBooleanFormFieldManager,
          ReadonlyEnumFormFieldManager,
        ]}
        form={{
          title: "Edit Save",
          sections: [
            {
              title: "File info",
              fields: [
                {
                  type: "readonly.string",
                  name: "info_filename",
                  label: "Filename",
                  initialValue: filename,
                },
                {
                  type: "readonly.boolean",
                  name: "info_wordSwapped",
                  label: "Word Swapped",
                  // TODO set this when we have this info from the save file
                  initialValue: false,
                },
                {
                  type: "readonly.enum",
                  name: "info_fileFormat",
                  label: "File Format",
                  enum: FileFormat,
                  // TODO set this when we have this info from the save file
                  initialValue: FileFormat.SRA,
                },
              ],
            },
            {
              title: "Save options",
              fields: [
                {
                  type: "string",
                  name: "saveoptions_filename",
                  label: "Output Filename",
                  initialValue: filename,
                },
                {
                  type: "boolean",
                  name: "saveoptions_swapWords",
                  label: "Swap Words",
                  initialValue: false,
                },
                {
                  type: "enum",
                  name: "saveoptions_fileFormat",
                  label: "File Format",
                  enum: FileFormat,
                  // TODO set this to the input file format
                  initialValue: FileFormat.SRA,
                },
              ],
            },
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
                {
                  type: "float",
                  step: 0.25,
                  min: 0,
                  max: saveFile.slots[0].maxHealth / 16,
                  name: "slot_0_currentHealth",
                  label: "Current Health",
                  initialValue: saveFile.slots[0].currentHealth / 16,
                },
                {
                  type: "integer",
                  min: 0,
                  name: "slot_0_maxHealth",
                  label: "Max Health",
                  initialValue: saveFile.slots[0].maxHealth / 16,
                },
              ],
            },
          ],
        }}
        onChange={(values: FormData) => {
          // header
          saveFile.header.languageOption = values.header_languageOption;
          saveFile.header.zTargetOption = values.header_zTargetOption;
          saveFile.header.soundOption = values.header_soundOption;
          // slot 1
          saveFile.slots[0].playerName = values.slot_0_playerName;
          saveFile.slots[0].age = values.slot_0_age;
          saveFile.slots[0].currentHealth = values.slot_0_currentHealth * 16;
          saveFile.slots[0].maxHealth = values.slot_0_maxHealth * 16;

          setSaveFile(saveFile);
        }}
        onSubmit={(values: FormData) => {
          const outfile = Deno.openSync(values.saveoptions_filename, {
            write: true,
            create: true,
          });
          saveFile.write(outfile);
          outfile.close();
        }}
      />
    </Box>
  );
};
