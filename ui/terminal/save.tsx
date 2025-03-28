import React, { useState } from "react";
import { FileFormat, SaveFile } from "../../models/savefile.ts";
import { Box } from "ink";
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
}

interface SaveProps {
  filename: string;
}

interface FormState {
  saveFile: SaveFile;
  currentFormData: FormData;
}

export const Save = ({ filename }: SaveProps): React.JSX.Element => {
  const file = Deno.openSync(filename);
  const originalSaveFile = new SaveFile(file);
  const [formState, setFormState] = useState<FormState>({
    saveFile: originalSaveFile,
    currentFormData: {
      info_filename: filename,
      info_wordSwapped: false,
      info_fileFormat: FileFormat.SRA,
      saveoptions_filename: filename,
      saveoptions_swapWords: false,
      saveoptions_fileFormat: FileFormat.SRA,
      header_languageOption: originalSaveFile.header.languageOption,
      header_zTargetOption: originalSaveFile.header.zTargetOption,
      header_soundOption: originalSaveFile.header.soundOption,
      slot_0_playerName: originalSaveFile.slots[0].playerName,
      slot_0_deathCounter: originalSaveFile.slots[0].deathCounter,
      slot_0_age: originalSaveFile.slots[0].age,
      slot_0_health: {
        maxHealth: originalSaveFile.slots[0].maxHealth / 16,
        currentHealth: originalSaveFile.slots[0].currentHealth / 16,
        doubleDefenseHearts: originalSaveFile.slots[0].doubleDefenseHearts,
      },
      slot_0_magic: {
        current: originalSaveFile.slots[0].currentMagic,
        flag1: originalSaveFile.slots[0].magicFlag1,
        flag2: originalSaveFile.slots[0].magicFlag2,
      },
      slot_0_rupees: originalSaveFile.slots[0].rupees,
      slot_0_roomWithEntrance: {
        room: originalSaveFile.slots[0].room,
        entrance: originalSaveFile.slots[0].entrance,
      },
      slot_0_magicBeans: originalSaveFile.slots[0].magicBeans,
      slot_0_goldSkulltulaTokens: originalSaveFile.slots[0].goldSkulltulaTokens,
    },
  });
  file.close();

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
            {
              title: "Slot 1",
              fields: [
                {
                  type: "string",
                  name: "slot_0_playerName",
                  label: "Player Name",
                  initialValue: formState.saveFile.slots[0].playerName,
                  regex: /^[A-Za-z]{1,8}$/,
                },
                {
                  type: "integer",
                  min: 0,
                  max: 0xffff,
                  name: "slot_0_deathCounter",
                  label: "Deaths",
                  initialValue: formState.saveFile.slots[0].deathCounter,
                },
                {
                  type: "enum",
                  name: "slot_0_age",
                  label: "Age",
                  enum: Age,
                  initialValue: formState.saveFile.slots[0].age,
                },
                {
                  type: "health",
                  name: "slot_0_health",
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
                        max: formState.saveFile.slots[0].maxHealth / 16,
                        step: 0.25,
                        isFloat: true,
                      },
                    },
                    doubleDefenseHearts: {
                      renderer: HealthFieldRenderer,
                      props: {
                        label: "Double Defense Hearts",
                        min: 0,
                        max: formState.saveFile.slots[0].maxHealth / 16,
                      },
                    },
                  },
                  initialValue: {
                    currentHealth: formState.saveFile.slots[0].currentHealth /
                      16,
                    maxHealth: formState.saveFile.slots[0].maxHealth / 16,
                    doubleDefenseHearts:
                      formState.saveFile.slots[0].doubleDefenseHearts,
                  },
                },
                {
                  type: "magic",
                  name: "slot_0_magic",
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
                    current: formState.saveFile.slots[0].currentMagic,
                    flag1: formState.saveFile.slots[0].magicFlag1,
                    flag2: formState.saveFile.slots[0].magicFlag2,
                  },
                },
                {
                  type: "integer",
                  min: 0,
                  max: 500,
                  name: "slot_0_rupees",
                  label: "Rupees",
                  initialValue: formState.saveFile.slots[0].rupees,
                },
                {
                  type: "room",
                  name: "slot_0_roomWithEntrance",
                  label: "Room and Entrance",
                  initialValue: {
                    room: formState.saveFile.slots[0].room,
                    entrance: formState.saveFile.slots[0].entrance,
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
                        options: ValidEntrancesForRoom(
                          formState.saveFile.slots[0].room,
                        ).map((entrance) => {
                          return { label: Entrance[entrance], value: entrance };
                        }),
                      },
                    },
                  },
                },
                // TODO look into how to handle the inventory
                {
                  type: "integer",
                  min: 0,
                  max: 0xff,
                  name: "slot_0_magicBeans",
                  label: "Magic Beans",
                  initialValue: formState.saveFile.slots[0].magicBeans,
                },
                {
                  type: "integer",
                  min: 0,
                  max: 99,
                  name: "slot_0_goldSkulltulaTokens",
                  label: "Gold Skulltula Tokens",
                  initialValue: formState.saveFile.slots[0].goldSkulltulaTokens,
                },
                {
                  type: "integer",
                  min: 0,
                  max: 0xffffffff,
                  step: 100,
                  name: "slot_0_bigPoePoints",
                  label: "Big Poe Points",
                  initialValue: formState.saveFile.slots[0].bigPoePoints,
                },
                {
                  type: "point3d",
                  name: "slot_0_faroresWindWarp",
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
                  initialValue: formState.saveFile.slots[0].faroresWindWarp,
                },
              ],
            },
          ],
        }}
        onChange={(values: FormData) => {
          // header
          formState.saveFile.header.languageOption =
            values.header_languageOption;
          formState.saveFile.header.zTargetOption = values.header_zTargetOption;
          formState.saveFile.header.soundOption = values.header_soundOption;
          // slot 1
          formState.saveFile.slots[0].playerName = values.slot_0_playerName;
          formState.saveFile.slots[0].deathCounter = values.slot_0_deathCounter;
          formState.saveFile.slots[0].age = values.slot_0_age;
          formState.saveFile.slots[0].currentHealth =
            values.slot_0_health.currentHealth * 16;
          formState.saveFile.slots[0].maxHealth =
            values.slot_0_health.maxHealth * 16;
          formState.saveFile.slots[0].doubleDefenseHearts =
            values.slot_0_health.doubleDefenseHearts;
          formState.saveFile.slots[0].currentMagic =
            values.slot_0_magic.current;
          formState.saveFile.slots[0].magicFlag1 = values.slot_0_magic.flag1;
          formState.saveFile.slots[0].magicFlag2 = values.slot_0_magic.flag2;
          formState.saveFile.slots[0].maxMagic = ((flag1, flag2) => {
            if (flag1 && flag2) {
              return 2;
            } else if (flag1) {
              return 1;
            }
            return 0;
          })(
            formState.saveFile.slots[0].magicFlag1,
            formState.saveFile.slots[0].magicFlag2,
          );
          formState.saveFile.slots[0].rupees = values.slot_0_rupees;
          if (
            formState.saveFile.slots[0].room !==
              values.slot_0_roomWithEntrance.room
          ) {
            formState.saveFile.slots[0].roomWithEntrance = RoomWithEntranceFor(
              values.slot_0_roomWithEntrance.room,
              ValidEntrancesForRoom(values.slot_0_roomWithEntrance.room)[0],
            );
          }
          if (
            ValidEntrancesForRoom(values.slot_0_roomWithEntrance.room).includes(
              values.slot_0_roomWithEntrance.entrance,
            )
          ) {
            formState.saveFile.slots[0].entrance =
              values.slot_0_roomWithEntrance.entrance;
          }
          formState.saveFile.slots[0].magicBeans = values.slot_0_magicBeans;
          formState.saveFile.slots[0].goldSkulltulaTokens =
            values.slot_0_goldSkulltulaTokens;

          // TODO slot 2
          // TODO slot 3

          setFormState({
            ...formState,
            currentFormData: {
              ...values,
              slot_0_roomWithEntrance: {
                room: formState.saveFile.slots[0].room,
                entrance: formState.saveFile.slots[0].entrance,
              },
            },
          });
        }}
        value={formState.currentFormData}
        onSubmit={(values: FormData) => {
          const outfile = Deno.openSync(values.saveoptions_filename, {
            write: true,
            create: true,
          });
          formState.saveFile.write(outfile);
          outfile.close();
        }}
      />
    </Box>
  );
};
