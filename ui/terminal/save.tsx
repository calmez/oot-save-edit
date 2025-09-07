import React, { useState } from "react";
import { SraSaveFile } from "../../models/savefile.ts";
import { Box, Text } from "ink";
import { Form } from "ink-form";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../../models/saveheader.ts";
import { Age, MagicAmount } from "../../models/saveslot.ts";
import { EnumFormFieldManager } from "./fieldmanagers/enum.tsx";
import { ReadonlyStringFormFieldManager } from "./fieldmanagers/readonlystring.tsx";
import { ReadonlyBooleanFormFieldManager } from "./fieldmanagers/readonlyboolean.tsx";
import { ReadonlyEnumFormFieldManager } from "./fieldmanagers/readonlyenum.tsx";
import { Entrance, Room, RoomWithEntranceFor } from "../../models/scene.ts";
import { ValidEntrancesForRoom } from "../../index.ts";
import { SelectionFormFieldManager } from "./fieldmanagers/selection.tsx";
import {
  Point3DFieldRenderer,
  Point3DFormFieldManager,
} from "./fieldmanagers/3dpoint.tsx";
import {
  HealthData,
  HealthFieldRenderer,
  HealthFormFieldManager,
} from "./fieldmanagers/health.tsx";
import {
  RoomData,
  RoomFieldEnumRenderer,
  RoomFieldSelectionRenderer,
  RoomFormFieldManager,
} from "./fieldmanagers/room.tsx";
import {
  MagicBooleanFieldRenderer,
  MagicData,
  MagicEnumFieldRenderer,
  MagicFormFieldManager,
} from "./fieldmanagers/magic.tsx";
import { FileFormat, FileUtil } from "../../utils/fileutil.ts";

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
  slot_0_deathCounter: number;
  slot_0_age: Age;
  slot_0_health: HealthData;
  slot_0_magic: MagicData;
  slot_0_rupees: number;
  slot_0_room: Room;
  slot_0_entrance: Entrance;
  slot_0_roomWithEntrance: RoomData;
  slot_0_magicBeans: number;
  slot_0_goldSkulltulaTokens: number;
  slot_0_bigPoePoints: number;
  slot_1_playerName: string;
  slot_1_deathCounter: number;
  slot_1_age: Age;
  slot_1_health: HealthData;
  slot_1_magic: MagicData;
  slot_1_rupees: number;
  slot_1_room: Room;
  slot_1_entrance: Entrance;
  slot_1_roomWithEntrance: RoomData;
  slot_1_magicBeans: number;
  slot_1_goldSkulltulaTokens: number;
  slot_1_bigPoePoints: number;
  slot_2_playerName: string;
  slot_2_deathCounter: number;
  slot_2_age: Age;
  slot_2_health: HealthData;
  slot_2_magic: MagicData;
  slot_2_rupees: number;
  slot_2_room: Room;
  slot_2_entrance: Entrance;
  slot_2_roomWithEntrance: RoomData;
  slot_2_magicBeans: number;
  slot_2_goldSkulltulaTokens: number;
  slot_2_bigPoePoints: number;
}

interface SaveProps {
  filename: string;
}

interface FormState {
  saveFile: SraSaveFile;
  currentFormData: FormData;
}

export const Save = ({ filename }: SaveProps): React.JSX.Element => {
  let originalSaveFile: SraSaveFile;
  try {
    originalSaveFile = FileUtil.loadFile(filename);
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";
    return (
      <Box flexDirection="column">
        <Text color="red">Error loading save file: {errorMessage}</Text>
      </Box>
    );
  }

  function makeSlotForm(index: 0 | 1 | 2) {
    return {
      title: `Slot ${index + 1}`,
      fields: [
        {
          type: "string",
          name: `slot_${index}_playerName`,
          label: "Player Name",
          initialValue: formState.saveFile.slots[index].playerName,
          regex: /^[A-Za-z]{1,8}$/,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffff,
          name: `slot_${index}_deathCounter`,
          label: "Deaths",
          initialValue: formState.saveFile.slots[index].deathCounter,
        },
        {
          type: "enum",
          name: `slot_${index}_age`,
          label: "Age",
          enum: Age,
          initialValue: formState.saveFile.slots[index].age,
        },
        {
          type: "health",
          name: `slot_${index}_health`,
          label: "Health",
          subfields: {
            maxHealth: {
              renderer: HealthFieldRenderer,
              props: {
                label: "Max Health",
                min: 0,
                max: 0xffff,
              },
            },
            currentHealth: {
              renderer: HealthFieldRenderer,
              props: {
                label: "Current Health",
                min: 0,
                max: (value: HealthData) => value.maxHealth ?? 0xffff,
                step: 0.25,
                isFloat: true,
              },
            },
            doubleDefenseHearts: {
              renderer: HealthFieldRenderer,
              props: {
                label: "Double Defense Hearts",
                min: 0,
                max: (value: HealthData) => value.maxHealth ?? 0xffff,
              },
            },
          },
          initialValue: {
            currentHealth: formState.saveFile.slots[index].currentHealth /
              16,
            maxHealth: formState.saveFile.slots[index].maxHealth / 16,
            doubleDefenseHearts:
              formState.saveFile.slots[index].doubleDefenseHearts,
          },
        },
        {
          type: "magic",
          name: `slot_${index}_magic`,
          label: "Magic",
          subfields: {
            current: {
              renderer: MagicEnumFieldRenderer,
              props: {
                label: "Bar",
                enum: MagicAmount,
                readonly: (value?: MagicData) => !(value?.flag1 ?? false),
              },
            },
            flag1: {
              renderer: MagicBooleanFieldRenderer,
              props: {
                label: "Flag 1",
              },
            },
            flag2: {
              renderer: MagicBooleanFieldRenderer,
              props: {
                label: "Flag 2",
                readonly: (value?: MagicData) => !(value?.flag1 ?? false),
              },
            },
          },
          initialValue: {
            current: formState.saveFile.slots[index].currentMagic,
            flag1: formState.saveFile.slots[index].magicFlag1,
            flag2: formState.saveFile.slots[index].magicFlag2,
          },
        },
        {
          type: "integer",
          min: 0,
          max: 500,
          name: `slot_${index}_rupees`,
          label: "Rupees",
          initialValue: formState.saveFile.slots[index].rupees,
        },
        {
          type: "room",
          name: `slot_${index}_roomWithEntrance`,
          label: "Room and Entrance",
          initialValue: {
            room: formState.saveFile.slots[index].room,
            entrance: formState.saveFile.slots[index].entrance,
          },
          subfields: {
            room: {
              renderer: RoomFieldEnumRenderer,
              props: {
                label: "Room",
                enum: Room,
              },
            },
            entrance: {
              renderer: RoomFieldSelectionRenderer,
              props: {
                label: "Entrance",
                options: (value?: RoomData) => {
                  if (value?.room) {
                    return ValidEntrancesForRoom(
                      value.room,
                    ).map((entrance) => {
                      return {
                        label: Entrance[entrance],
                        value: entrance,
                      };
                    });
                  }
                  return [];
                },
              },
            },
          },
        },
        // TODO look into how to handle the inventory
        {
          type: "integer",
          min: 0,
          max: 0xff,
          name: `slot_${index}_magicBeans`,
          label: "Magic Beans",
          initialValue: formState.saveFile.slots[index].magicBeans,
        },
        {
          type: "integer",
          min: 0,
          max: 99,
          name: `slot_${index}_goldSkulltulaTokens`,
          label: "Gold Skulltula Tokens",
          initialValue: formState.saveFile.slots[index].goldSkulltulaTokens,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffffffff,
          step: 100,
          name: `slot_${index}_bigPoePoints`,
          label: "Big Poe Points",
          initialValue: formState.saveFile.slots[index].bigPoePoints,
        },
        {
          type: "point3d",
          name: `slot_${index}_faroresWindWarp`,
          label: "Farores Wind Warp",
          subfields: {
            x: {
              renderer: Point3DFieldRenderer,
              props: {
                label: "X",
                min: 0,
                max: 0xffff,
              },
            },
            y: {
              renderer: Point3DFieldRenderer,
              props: {
                label: "Y",
                min: 0,
                max: 0xffff,
              },
            },
            z: {
              renderer: Point3DFieldRenderer,
              props: {
                label: "Z",
                min: 0,
                max: 0xffff,
              },
            },
            yRotation: {
              renderer: Point3DFieldRenderer,
              props: {
                label: "Y Rotation",
                min: 0,
                max: 0xffff,
              },
            },
          },
          initialValue: formState.saveFile.slots[index].faroresWindWarp,
        },
      ],
    };
  }

  function readFormData(
    saveFile: SraSaveFile,
    values: FormData,
    index: 0 | 1 | 2,
  ): SraSaveFile {
    saveFile.slots[index].playerName = values[`slot_${index}_playerName`];
    saveFile.slots[index].deathCounter = values[`slot_${index}_deathCounter`];
    saveFile.slots[index].age = values[`slot_${index}_age`];
    saveFile.slots[index].currentHealth =
      values[`slot_${index}_health`].currentHealth * 16;
    saveFile.slots[index].maxHealth = values[`slot_${index}_health`].maxHealth *
      16;
    saveFile.slots[index].doubleDefenseHearts =
      values[`slot_${index}_health`].doubleDefenseHearts;
    saveFile.slots[index].currentMagic = values[`slot_${index}_magic`].current;
    saveFile.slots[index].magicFlag1 = values[`slot_${index}_magic`].flag1;
    saveFile.slots[index].magicFlag2 = values[`slot_${index}_magic`].flag2;
    saveFile.slots[index].maxMagic = ((flag1, flag2) => {
      if (flag1 && flag2) {
        return 2;
      } else if (flag1) {
        return 1;
      }
      return 0;
    })(
      saveFile.slots[index].magicFlag1,
      saveFile.slots[index].magicFlag2,
    );
    saveFile.slots[index].rupees = values[`slot_${index}_rupees`];
    if (
      saveFile.slots[index].room !==
        values[`slot_${index}_roomWithEntrance`].room
    ) {
      saveFile.slots[index].roomWithEntrance = RoomWithEntranceFor(
        values[`slot_${index}_roomWithEntrance`].room,
        ValidEntrancesForRoom(values[`slot_${index}_roomWithEntrance`].room)[0],
      );
    }
    if (
      ValidEntrancesForRoom(values[`slot_${index}_roomWithEntrance`].room)
        .includes(
          values[`slot_${index}_roomWithEntrance`].entrance,
        )
    ) {
      saveFile.slots[index].entrance =
        values[`slot_${index}_roomWithEntrance`].entrance;
    }
    saveFile.slots[index].magicBeans = values[`slot_${index}_magicBeans`];
    saveFile.slots[index].goldSkulltulaTokens =
      values[`slot_${index}_goldSkulltulaTokens`];

    return saveFile;
  }

  function makeFormData(
    saveFile: SraSaveFile,
    index: 0 | 1 | 2,
  ): Partial<FormData> {
    return {
      [`slot_${index}_playerName`]: saveFile.slots[index].playerName,
      [`slot_${index}_deathCounter`]: saveFile.slots[index].deathCounter,
      [`slot_${index}_age`]: saveFile.slots[index].age,
      [`slot_${index}_health`]: {
        maxHealth: saveFile.slots[index].maxHealth / 16,
        currentHealth: saveFile.slots[index].currentHealth / 16,
        doubleDefenseHearts: saveFile.slots[index].doubleDefenseHearts,
      },
      [`slot_${index}_magic`]: {
        current: saveFile.slots[index].currentMagic,
        flag1: saveFile.slots[index].magicFlag1,
        flag2: saveFile.slots[index].magicFlag2,
      },
      [`slot_${index}_rupees`]: saveFile.slots[index].rupees,
      [`slot_${index}_roomWithEntrance`]: {
        room: saveFile.slots[index].room,
        entrance: saveFile.slots[index].entrance,
      },
      [`slot_${index}_magicBeans`]: saveFile.slots[index].magicBeans,
      [`slot_${index}_goldSkulltulaTokens`]:
        saveFile.slots[index].goldSkulltulaTokens,
    };
  }

  const [formState, setFormState] = useState<FormState>({
    saveFile: originalSaveFile,
    currentFormData: {
      info_filename: filename,
      info_wordSwapped: originalSaveFile.isByteSwapped,
      info_fileFormat: FileUtil.detectFileFormatByExtension(filename),
      saveoptions_filename: filename,
      saveoptions_swapWords: false,
      saveoptions_fileFormat: FileUtil.detectFileFormatByExtension(filename),
      header_languageOption: originalSaveFile.header.languageOption,
      header_zTargetOption: originalSaveFile.header.zTargetOption,
      header_soundOption: originalSaveFile.header.soundOption,
      ...makeFormData(originalSaveFile, 0),
      ...makeFormData(originalSaveFile, 1),
      ...makeFormData(originalSaveFile, 2),
    },
  });

  return (
    <Box flexDirection="column">
      <Form
        customManagers={[
          EnumFormFieldManager,
          SelectionFormFieldManager,
          Point3DFormFieldManager,
          HealthFormFieldManager,
          RoomFormFieldManager,
          MagicFormFieldManager,
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
                  initialValue: originalSaveFile.isByteSwapped,
                },
                {
                  type: "readonly.enum",
                  name: "info_fileFormat",
                  label: "File Format",
                  enum: FileFormat,
                  initialValue: FileUtil.detectFileFormatByExtension(filename),
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
                  initialValue: FileUtil.detectFileFormatByExtension(filename),
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
                  initialValue: formState.saveFile.header.languageOption,
                },
                {
                  type: "enum",
                  name: "header_zTargetOption",
                  label: "Z-Target",
                  enum: ZTargetOption,
                  initialValue: formState.saveFile.header.zTargetOption,
                },
                {
                  type: "enum",
                  name: "header_soundOption",
                  label: "Sound",
                  enum: SoundOption,
                  initialValue: formState.saveFile.header.soundOption,
                },
              ],
            },
            makeSlotForm(0),
            makeSlotForm(1),
            makeSlotForm(2),
          ],
        }}
        onChange={(values: FormData) => {
          // header
          formState.saveFile.header.languageOption =
            values.header_languageOption;
          formState.saveFile.header.zTargetOption = values.header_zTargetOption;
          formState.saveFile.header.soundOption = values.header_soundOption;

          formState.saveFile = readFormData(
            formState.saveFile,
            values,
            0,
          );
          formState.saveFile = readFormData(
            formState.saveFile,
            values,
            1,
          );
          formState.saveFile = readFormData(
            formState.saveFile,
            values,
            2,
          );

          setFormState({
            ...formState,
            currentFormData: {
              ...values,
              slot_0_roomWithEntrance: {
                room: formState.saveFile.slots[0].room,
                entrance: formState.saveFile.slots[0].entrance,
              },
              slot_1_roomWithEntrance: {
                room: formState.saveFile.slots[1].room,
                entrance: formState.saveFile.slots[1].entrance,
              },
              slot_2_roomWithEntrance: {
                room: formState.saveFile.slots[2].room,
                entrance: formState.saveFile.slots[2].entrance,
              },
            },
          });
        }}
        value={formState.currentFormData}
        onSubmit={(values: FormData) => {
          FileUtil.saveFile(
            values.saveoptions_filename,
            values.saveoptions_fileFormat,
            formState.saveFile,
            values.saveoptions_swapWords,
          );
        }}
      />
    </Box>
  );
};
