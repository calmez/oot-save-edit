import { getSlot, slotCount, slotLabel } from "../../utils/saveeditor.ts";
import {
  applySlotFields,
  getBooleanFlags,
  makeSlotFields,
} from "./slotdata.ts";
import { AdditionalDataFormFieldManager } from "./fieldmanagers/additionaldata.tsx";
import SaveManagement from "./management.tsx";
import { sceneIdOptions } from "../labels.ts";
import React, { useEffect, useMemo, useState } from "react";
import { SraSaveFile } from "../../models/savefile.ts";
import { Box, Text, useInput, useStdout } from "ink";
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
import { Entrance, Room, Scene, Time } from "../../models/scene.ts";
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
  MagicFormFieldManager,
  MagicNumberFieldRenderer,
} from "./fieldmanagers/magic.tsx";
import {
  ButtonEquipsBButtonRenderer,
  ButtonEquipsCOffsetRenderer,
  ButtonEquipsFormFieldManager,
} from "./fieldmanagers/buttonequips.tsx";
import {
  CurrentEquipBootsRenderer,
  CurrentEquipFormFieldManager,
  CurrentEquipShieldRenderer,
  CurrentEquipSwordRenderer,
  CurrentEquipTunicRenderer,
} from "./fieldmanagers/currentequip.tsx";
import { InventoryFormFieldManager } from "./fieldmanagers/inventory.tsx";
import { ObtainedFormFieldManager } from "./fieldmanagers/obtained.tsx";
import {
  DungeonStatusFormFieldManager,
} from "./fieldmanagers/dungeonstatus.tsx";
import { FlagsGroupFormFieldManager } from "./fieldmanagers/flagsgroup.tsx";
import {
  PermanentSceneFlagsFormFieldManager,
} from "./fieldmanagers/permanentsceneflags.tsx";
import { FileFormat, FileUtil } from "../../utils/fileutil.ts";
import {
  Boots,
  InventoryItems,
  Shield,
  Sword,
  Tunic,
} from "../../models/saveslot.ts";

type SlotIndex = 0 | 1 | 2 | 3 | 4 | 5;

type SlotFormFields = {
  [K in `slot_${SlotIndex}_${string}`]: unknown;
};

function slotKey<K extends string>(
  index: SlotIndex,
  key: K,
): `slot_${SlotIndex}_${K}` {
  return `slot_${index}_${key}`;
}

type FormFields =
  & {
    info_filename: string;
    info_wordSwapped: boolean;
    info_fileFormat: FileFormat;
    saveoptions_filename: string;
    saveoptions_swapWords: boolean;
    saveoptions_fileFormat: FileFormat;
    header_languageOption: LanguageOption;
    header_zTargetOption: ZTargetOption;
    header_soundOption: SoundOption;
  }
  & SlotFormFields;

interface FormState {
  saveFile: SraSaveFile;
  currentFormData: FormFields;
}

interface SaveProps {
  filename: string;
  createNew?: boolean;
}

export const Save = (
  { filename, createNew = false }: SaveProps,
): React.JSX.Element => {
  const [loaded] = useState(() => {
    try {
      return {
        save: createNew ? new SraSaveFile() : FileUtil.loadFile(filename),
        error: "",
      };
    } catch (error) {
      return {
        save: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
  if (!loaded.save) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error loading save file: {loaded.error}</Text>
      </Box>
    );
  }
  return <SaveForm filename={filename} originalSaveFile={loaded.save} />;
};

const SaveForm = (
  { filename, originalSaveFile }: {
    filename: string;
    originalSaveFile: SraSaveFile;
  },
): React.JSX.Element => {
  function makeSlotSections(
    index: SlotIndex,
    saveFile: SraSaveFile,
  ): { title: string; fields: unknown[] } {
    const slot = getSlot(saveFile, index);
    const slotKeyForIndex = (key: string) => slotKey(index, key);
    return {
      title: slotLabel(index),
      fields: [
        {
          type: "string",
          name: slotKeyForIndex("playerName"),
          label: "Player Name",
          initialValue: slot.playerName,
          regex: /^[A-Za-z]{0,8}$/,
        },
        {
          type: "readonly.boolean",
          name: slotKeyForIndex("fileValid"),
          label: "File Valid",
          initialValue: slot.isValid,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffff,
          name: slotKeyForIndex("deathCounter"),
          label: "Deaths",
          initialValue: slot.deathCounter,
        },
        {
          type: "enum",
          name: slotKeyForIndex("age"),
          label: "Age",
          enum: Age,
          initialValue: slot.age,
        },
        {
          type: "health",
          name: slotKeyForIndex("health"),
          label: "Health",
          subfields: {
            maxHealth: {
              renderer: HealthFieldRenderer,
              props: { label: "Max Health", min: 0, max: 0xffff },
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
            currentHealth: slot.currentHealth / 16,
            maxHealth: slot.maxHealth / 16,
            doubleDefenseHearts: slot.doubleDefenseHearts,
          },
        },
        {
          type: "magic",
          name: slotKeyForIndex("magic"),
          label: "Magic",
          subfields: {
            current: {
              renderer: MagicNumberFieldRenderer,
              props: {
                label: "Amount",
                min: 0,
                max: (value?: MagicData) => value?.flag2 ? 96 : 48,
                readonly: (value?: MagicData) => !(value?.flag1 ?? false),
              },
            },
            flag1: {
              renderer: MagicBooleanFieldRenderer,
              props: { label: "Flag 1" },
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
            current: slot.currentMagic,
            flag1: slot.magicFlag1,
            flag2: slot.magicFlag2,
          },
        },
        {
          type: "integer",
          min: 0,
          max: 500,
          name: slotKeyForIndex("rupees"),
          label: "Rupees",
          initialValue: slot.rupees,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffffffff,
          name: slotKeyForIndex("entranceIndex"),
          label: "Entrance Index",
          initialValue: slot.entranceIndex,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffff,
          name: slotKeyForIndex("cutSceneNumber"),
          label: "Cutscene",
          initialValue: slot.cutSceneNumber,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffff,
          name: slotKeyForIndex("worldTime"),
          label: "World Time",
          initialValue: slot.worldTime,
        },
        {
          type: "enum",
          name: slotKeyForIndex("nightFlag"),
          label: "Day/Night",
          enum: Time,
          initialValue: slot.nightFlag,
        },
        {
          type: "boolean",
          name: slotKeyForIndex("ddOnly"),
          label: "DD Only",
          initialValue: slot.ddOnly,
        },
        {
          type: "integer",
          min: 0,
          max: 0xffff,
          name: slotKeyForIndex("naviTimer"),
          label: "Navi Timer",
          initialValue: slot.naviTimer,
        },
        {
          type: "boolean",
          name: slotKeyForIndex("biggoronsSwordFlag2"),
          label: "Biggoron Sword acquired",
          initialValue: slot.biggoronsSwordFlag2,
        },
        {
          type: "enum",
          name: slotKeyForIndex("savedSceneIndex"),
          label: "Saved Scene",
          enum: sceneIdOptions,
          initialValue: slot.savedSceneIndex,
        },
        {
          type: "room",
          name: slotKeyForIndex("roomWithEntrance"),
          label: "Room and Entrance",
          initialValue: { room: slot.room, entrance: slot.entrance },
          subfields: {
            room: {
              renderer: RoomFieldEnumRenderer,
              props: { label: "Room", enum: Room },
            },
            entrance: {
              renderer: RoomFieldSelectionRenderer,
              props: {
                label: "Entrance",
                options: (value?: RoomData) => {
                  if (value?.room !== undefined) {
                    return ValidEntrancesForRoom(value.room).map(
                      (entrance) => ({
                        label: Entrance[entrance],
                        value: entrance,
                      }),
                    );
                  }
                  return [];
                },
              },
            },
          },
        },
        {
          type: "integer",
          min: 0,
          max: 0xff,
          name: slotKeyForIndex("magicBeans"),
          label: "Magic Beans",
          initialValue: slot.magicBeans,
        },
        {
          type: "integer",
          min: 0,
          max: 100,
          name: slotKeyForIndex("goldSkulltulaTokens"),
          label: "Gold Skulltula Tokens",
          initialValue: slot.goldSkulltulaTokens,
        },
        {
          type: "buttonequips",
          name: slotKeyForIndex("buttonEquips"),
          label: "Button Equips & Offsets",
          initialValue: slot.currentButtonEquips,
          subfields: {
            bButton: {
              renderer: ButtonEquipsBButtonRenderer,
              props: { label: "B Button", enum: InventoryItems },
            },
            cLeftButton: {
              renderer: ButtonEquipsBButtonRenderer,
              props: { label: "C-Left", enum: InventoryItems },
            },
            cDownButton: {
              renderer: ButtonEquipsBButtonRenderer,
              props: { label: "C-Down", enum: InventoryItems },
            },
            cRightButton: {
              renderer: ButtonEquipsBButtonRenderer,
              props: { label: "C-Right", enum: InventoryItems },
            },
            cLeftOffset: {
              renderer: ButtonEquipsCOffsetRenderer,
              props: { label: "C-Left Offset", min: 0, max: 0xff },
            },
            cDownOffset: {
              renderer: ButtonEquipsCOffsetRenderer,
              props: { label: "C-Down Offset", min: 0, max: 0xff },
            },
            cRightOffset: {
              renderer: ButtonEquipsCOffsetRenderer,
              props: { label: "C-Right Offset", min: 0, max: 0xff },
            },
          },
        },
        {
          type: "currentequip",
          name: slotKeyForIndex("currentEquipment"),
          label: "Currently Equipped",
          initialValue: slot.currentlyEquippedEquipment,
          subfields: {
            sword: {
              renderer: CurrentEquipSwordRenderer,
              props: { label: "Sword", enum: { ...Sword, None: 0, 0: "None" } },
            },
            shield: {
              renderer: CurrentEquipShieldRenderer,
              props: {
                label: "Shield",
                enum: { ...Shield, None: 0, 0: "None" },
              },
            },
            tunic: {
              renderer: CurrentEquipTunicRenderer,
              props: { label: "Tunic", enum: { ...Tunic, None: 0, 0: "None" } },
            },
            boots: {
              renderer: CurrentEquipBootsRenderer,
              props: { label: "Boots", enum: { ...Boots, None: 0, 0: "None" } },
            },
          },
        },
        {
          type: "inventory",
          name: slotKeyForIndex("inventory"),
          label: "Inventory Items & Amounts",
          initialValue: {
            items: slot.inventory,
            amounts: slot.inventoryAmounts,
          },
        },
        {
          type: "obtained",
          name: slotKeyForIndex("obtained"),
          label: "Obtained Equipment, Upgrades, Quest Items",
          initialValue: {
            equipment: slot.obtainedEquipment,
            upgrades: slot.obtainedUpgrades,
            questItems: slot.questStatusItems,
          },
        },
        {
          type: "dungeonstatus",
          name: slotKeyForIndex("dungeonStatus"),
          label: "Dungeon Items & Small Keys",
          initialValue: {
            items: slot.dungeonItems,
            smallKeys: slot.smallKeyAmount,
          },
        },
        {
          type: "integer",
          min: 0,
          max: 0xffffffff,
          step: 100,
          name: slotKeyForIndex("bigPoePoints"),
          label: "Big Poe Points",
          initialValue: slot.bigPoePoints,
        },
        {
          type: "point3d",
          name: slotKeyForIndex("faroresWindWarp"),
          label: "Farore's Wind Warp",
          initialValue: slot.faroresWindWarp,
          subfields: {
            x: {
              renderer: Point3DFieldRenderer,
              props: { label: "X", min: -0x80000000, max: 0x7fffffff },
            },
            y: {
              renderer: Point3DFieldRenderer,
              props: { label: "Y", min: -0x80000000, max: 0x7fffffff },
            },
            z: {
              renderer: Point3DFieldRenderer,
              props: { label: "Z", min: -0x80000000, max: 0x7fffffff },
            },
            yRotation: {
              renderer: Point3DFieldRenderer,
              props: { label: "Y Rotation", min: -0x80000000, max: 0x7fffffff },
            },
          },
        },
        {
          type: "enum",
          name: slotKeyForIndex("entranceIndexTransport"),
          label: "Transport Scene",
          enum: Scene,
          initialValue: slot.entranceIndexTransport,
        },
        {
          type: "integer",
          min: 0,
          max: 0xff,
          name: slotKeyForIndex("mapNumber"),
          label: "Map #",
          initialValue: slot.mapNumber,
        },
        {
          type: "boolean",
          name: slotKeyForIndex("warpPointSet"),
          label: "Warp Point Set",
          initialValue: slot.warpPointSet,
        },
        {
          type: "readonly.string",
          name: slotKeyForIndex("checksum"),
          label: "Checksum (calculated)",
          initialValue: String(slot.checksum),
        },
        {
          type: "integer",
          min: 0,
          max: 0xffffffff,
          name: slotKeyForIndex("fileIndex"),
          label: "File Index",
          initialValue: slot.fileIndex,
        },
        {
          type: "flagsgroup",
          name: slotKeyForIndex("eventFlags"),
          label: "Event Flags",
          flags: getBooleanFlags(slot.eventFlags),
          initialValue: Object.fromEntries(
            getBooleanFlags(slot.eventFlags).map((
              f,
            ) => [f.name, f.value]),
          ),
        },
        {
          type: "flagsgroup",
          name: slotKeyForIndex("itemFlags"),
          label: "Item Flags",
          flags: getBooleanFlags(slot.itemFlags),
          initialValue: Object.fromEntries(
            getBooleanFlags(slot.itemFlags).map((
              f,
            ) => [f.name, f.value]),
          ),
        },
        {
          type: "flagsgroup",
          name: slotKeyForIndex("otherFlags"),
          label: "Other Flags",
          flags: getBooleanFlags(slot.otherFlags),
          initialValue: Object.fromEntries(
            getBooleanFlags(slot.otherFlags).map((
              f,
            ) => [f.name, f.value]),
          ),
        },
        {
          type: "additionaldata",
          name: slotKeyForIndex("additionalData"),
          label: "Additional progress and advanced data",
          saveSlot: slot,
          initialValue: slot.additionalData,
        },
        {
          type: "permanentsceneflags",
          name: slotKeyForIndex("permanentSceneFlags"),
          label: "Permanent Scene Flags",
          saveSlot: slot,
          initialValue: { bytes: Array.from(slot.data.slice(0xD4, 0xE64)) },
        },
      ],
    };
  }

  const [formState, setFormState] = useState<FormState>({
    saveFile: originalSaveFile,
    currentFormData: {
      info_filename: filename,
      info_dataSize: `${originalSaveFile.data.byteLength}`,
      info_headerValid: originalSaveFile.header.isValid,
      info_wordSwapped: originalSaveFile.isByteSwapped,
      info_fileFormat: FileUtil.detectFileFormatByExtension(filename),
      saveoptions_filename: filename,
      saveoptions_swapWords: false,
      saveoptions_fileFormat: FileUtil.detectFileFormatByExtension(filename),
      header_languageOption: originalSaveFile.header.languageOption,
      header_zTargetOption: originalSaveFile.header.zTargetOption,
      header_soundOption: originalSaveFile.header.soundOption,
      ...Object.assign(
        {},
        ...Array.from(
          { length: slotCount },
          (_, index) => makeSlotFields(index, originalSaveFile),
        ),
      ),
    } as FormFields,
  });

  const { stdout } = useStdout();
  const [termRows, setTermRows] = useState(stdout.rows);
  useEffect(() => {
    const onResize = () => setTermRows(stdout.rows);
    stdout.on("resize", onResize);
    return () => stdout.off("resize", onResize);
  }, [stdout]);
  const viewportHeight = termRows - 8;
  const FIELDS_PER_PAGE = Math.max(1, Math.floor(viewportHeight / 5));
  const [slotPage, setSlotPage] = useState(0);
  const [managementOpen, setManagementOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const slotSectionDefs = useMemo(
    () =>
      Array.from(
        { length: slotCount },
        (_, index) => makeSlotSections(index as SlotIndex, formState.saveFile),
      ),
    [formState.saveFile],
  );

  const allSections = useMemo(() => {
    const base = [
      {
        title: "Info",
        fields: [
          {
            type: "readonly.string",
            name: "info_filename",
            label: "Filename",
            initialValue: filename,
          },
          {
            type: "readonly.string",
            name: "info_dataSize",
            label: "Data Size",
            initialValue: `${originalSaveFile.data.byteLength}`,
          },
          {
            type: "readonly.boolean",
            name: "info_headerValid",
            label: "Header Valid",
            initialValue: originalSaveFile.header.isValid,
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
        title: "Output",
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
        title: "Options",
        fields: [
          {
            type: "enum",
            name: "header_languageOption",
            label: "Language",
            enum: LanguageOption,
            initialValue: originalSaveFile.header.languageOption,
          },
          {
            type: "enum",
            name: "header_zTargetOption",
            label: "Z-Target",
            enum: ZTargetOption,
            initialValue: originalSaveFile.header.zTargetOption,
          },
          {
            type: "enum",
            name: "header_soundOption",
            label: "Sound",
            enum: SoundOption,
            initialValue: originalSaveFile.header.soundOption,
          },
        ],
      },
      ...slotSectionDefs,
    ];
    return base.map((section, i) => {
      if (i >= 3) {
        const totalPages = Math.ceil(section.fields.length / FIELDS_PER_PAGE);
        const pg = Math.min(slotPage, totalPages - 1);
        const start = pg * FIELDS_PER_PAGE;
        const end = start + FIELDS_PER_PAGE;
        return {
          ...section,
          title: `${i < 6 ? "Slot " + (i - 2) : "B" + (i - 5)}`,
          fields: section.fields.slice(start, end),
        };
      }
      return section;
    });
  }, [slotSectionDefs, slotPage, termRows]);

  useInput((input, key) => {
    if (key.ctrl && input === "g") setManagementOpen(true);
    else if (input === "]") {
      const maxPg = Math.max(
        ...slotSectionDefs.map((s: { fields: unknown[] }) =>
          Math.ceil(s.fields.length / FIELDS_PER_PAGE)
        ),
      );
      setSlotPage((prev: number) => Math.min(prev + 1, maxPg - 1));
    } else if (input === "[") {
      setSlotPage((prev: number) => Math.max(prev - 1, 0));
    }
  });

  if (managementOpen) {
    return (
      <SaveManagement
        save={formState.saveFile}
        onClose={() => setManagementOpen(false)}
        onChange={() => {
          const fields = Object.assign(
            {},
            ...Array.from(
              { length: slotCount },
              (_, index) => makeSlotFields(index, formState.saveFile),
            ),
          );
          setFormState({
            ...formState,
            currentFormData: {
              ...formState.currentFormData,
              ...fields,
              header_languageOption: formState.saveFile.header.languageOption,
              header_soundOption: formState.saveFile.header.soundOption,
              header_zTargetOption: formState.saveFile.header.zTargetOption,
              info_headerValid: formState.saveFile.header.isValid,
            } as FormFields,
          });
        }}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box height={viewportHeight} overflow="hidden">
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
            ButtonEquipsFormFieldManager,
            CurrentEquipFormFieldManager,
            InventoryFormFieldManager,
            ObtainedFormFieldManager,
            DungeonStatusFormFieldManager,
            FlagsGroupFormFieldManager,
            PermanentSceneFlagsFormFieldManager,
            AdditionalDataFormFieldManager,
          ]}
          form={{
            title: "Edit Save",
            sections: allSections,
          }}
          onChange={(values: FormFields) => {
            formState.saveFile.header.languageOption =
              values.header_languageOption;
            formState.saveFile.header.zTargetOption =
              values.header_zTargetOption;
            formState.saveFile.header.soundOption = values.header_soundOption;

            for (let index = 0; index < slotCount; index++) {
              applySlotFields(
                getSlot(formState.saveFile, index),
                index,
                values,
                formState.currentFormData,
              );
            }
            const newData = {
              ...values,
              ...Object.assign(
                {},
                ...Array.from(
                  { length: slotCount },
                  (_, index) => makeSlotFields(index, formState.saveFile),
                ),
              ),
            };
            setFormState({
              ...formState,
              currentFormData: newData as FormFields,
            });
          }}
          value={formState.currentFormData}
          onSubmit={(values: FormFields) => {
            try {
              FileUtil.saveFile(
                values.saveoptions_filename,
                values.saveoptions_fileFormat,
                formState.saveFile,
                values.saveoptions_swapWords,
              );
              setSaveMessage(`Saved ${values.saveoptions_filename}`);
            } catch (error) {
              setSaveMessage(
                error instanceof Error ? error.message : String(error),
              );
            }
          }}
        />
      </Box>
      <Box justifyContent="center" marginTop={1}>
        <Text dimColor>
          ↑ ↓ fields · [ ] page {slotPage + 1} · ← → tabs · Ctrl+G manage
        </Text>
      </Box>
      {saveMessage && <Text>{saveMessage}</Text>}
    </Box>
  );
};
