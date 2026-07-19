import React, { useEffect, useMemo, useState } from "react";
import { SraSaveFile } from "../../models/savefile.ts";
import { Box, Text, useInput, useStdout } from "ink";
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
import {
  Entrance,
  Room,
  RoomWithEntranceFor,
  Scene,
  Time,
} from "../../models/scene.ts";
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
import {
  ButtonEquipsBButtonRenderer,
  ButtonEquipsCOffsetRenderer,
  ButtonEquipsData,
  ButtonEquipsFormFieldManager,
} from "./fieldmanagers/buttonequips.tsx";
import {
  CurrentEquipBootsRenderer,
  CurrentEquipFormFieldManager,
  CurrentEquipShieldRenderer,
  CurrentEquipSwordRenderer,
  CurrentEquipTunicRenderer,
} from "./fieldmanagers/currentequip.tsx";
import {
  InventoryData,
  InventoryFormFieldManager,
} from "./fieldmanagers/inventory.tsx";
import {
  ObtainedData,
  ObtainedFormFieldManager,
} from "./fieldmanagers/obtained.tsx";
import {
  DungeonStatusData,
  DungeonStatusFormFieldManager,
} from "./fieldmanagers/dungeonstatus.tsx";
import { FlagsGroupFormFieldManager } from "./fieldmanagers/flagsgroup.tsx";
import {
  PermanentSceneFlagsData,
  PermanentSceneFlagsFormFieldManager,
} from "./fieldmanagers/permanentsceneflags.tsx";
import { FileFormat, FileUtil } from "../../utils/fileutil.ts";
import {
  Boots,
  DungeonItems,
  InventoryItems,
  Shield,
  Sword,
  Tunic,
} from "../../models/saveslot.ts";
import { CurrentEquipmentData } from "./fieldmanagers/currentequip.tsx";

type SlotIndex = 0 | 1 | 2;

function getBooleanFlags(
  source: object,
): Array<{ name: string; value: boolean }> {
  const prototype = Object.getPrototypeOf(source) as object;
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  const flags: Array<{ name: string; value: boolean }> = [];
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (name === "constructor" || name === "data" || !descriptor.get) continue;
    try {
      const value = (source as Record<string, unknown>)[name];
      if (typeof value === "boolean") flags.push({ name, value });
    } catch {
      continue;
    }
  }
  return flags;
}

type SlotFormFields = {
  [K in `slot_${SlotIndex}_${string}`]: unknown;
};

function slotKey<K extends string>(
  index: SlotIndex,
  key: K,
): `slot_${SlotIndex}_${K}` {
  return `slot_${index}_${key}`;
}

function makeSlotFields(
  index: SlotIndex,
  saveFile: SraSaveFile,
): SlotFormFields {
  const slot = saveFile.slots[index];
  return {
    [slotKey(index, "playerName")]: slot.playerName,
    [slotKey(index, "fileValid")]: slot.isValid,
    [slotKey(index, "deathCounter")]: slot.deathCounter,
    [slotKey(index, "age")]: slot.age,
    [slotKey(index, "health")]: {
      maxHealth: slot.maxHealth / 16,
      currentHealth: slot.currentHealth / 16,
      doubleDefenseHearts: slot.doubleDefenseHearts,
    },
    [slotKey(index, "magic")]: {
      current: slot.currentMagic,
      flag1: slot.magicFlag1,
      flag2: slot.magicFlag2,
    },
    [slotKey(index, "rupees")]: slot.rupees,
    [slotKey(index, "roomWithEntrance")]: {
      room: slot.room,
      entrance: slot.entrance,
    },
    [slotKey(index, "magicBeans")]: slot.magicBeans,
    [slotKey(index, "goldSkulltulaTokens")]: slot.goldSkulltulaTokens,
    [slotKey(index, "bigPoePoints")]: slot.bigPoePoints,
    [slotKey(index, "faroresWindWarp")]: slot.faroresWindWarp,
    [slotKey(index, "entranceIndex")]: slot.entranceIndex,
    [slotKey(index, "cutSceneNumber")]: slot.cutSceneNumber,
    [slotKey(index, "worldTime")]: slot.worldTime,
    [slotKey(index, "nightFlag")]: slot.nightFlag,
    [slotKey(index, "ddOnly")]: slot.ddOnly,
    [slotKey(index, "naviTimer")]: slot.naviTimer,
    [slotKey(index, "biggoronsSwordFlag1")]: slot.biggoronsSwordFlag1,
    [slotKey(index, "biggoronsSwordFlag2")]: slot.biggoronsSwordFlag2,
    [slotKey(index, "savedSceneIndex")]: slot.savedSceneIndex,
    [slotKey(index, "buttonEquips")]: slot.currentButtonEquips,
    [slotKey(index, "currentEquipment")]: slot.currentlyEquippedEquipment,
    [slotKey(index, "inventory")]: {
      items: slot.inventory,
      amounts: slot.inventoryAmounts,
    },
    [slotKey(index, "obtained")]: {
      equipment: slot.obtainedEquipment,
      upgrades: slot.obtainedUpgrades,
      questItems: slot.questStatusItems,
    },
    [slotKey(index, "dungeonStatus")]: {
      items: slot.dungeonItems,
      smallKeys: slot.smallKeyAmount,
    },
    [slotKey(index, "entranceIndexTransport")]: slot.entranceIndexTransport,
    [slotKey(index, "mapNumber")]: slot.mapNumber,
    [slotKey(index, "warpPointSet")]: slot.warpPointSet,
    [slotKey(index, "checksum")]: slot.checksum,
    [slotKey(index, "fileIndex")]: slot.fileIndex,
    [slotKey(index, "eventFlags")]: Object.fromEntries(
      getBooleanFlags(slot.eventFlags).map((
        f,
      ) => [f.name, f.value]),
    ),
    [slotKey(index, "itemFlags")]: Object.fromEntries(
      getBooleanFlags(slot.itemFlags).map((
        f,
      ) => [f.name, f.value]),
    ),
    [slotKey(index, "otherFlags")]: Object.fromEntries(
      getBooleanFlags(slot.otherFlags).map((
        f,
      ) => [f.name, f.value]),
    ),
    [slotKey(index, "permanentSceneFlags")]: { version: 0 },
  };
}

type FormFields =
  {
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

  function makeSlotSections(
    index: SlotIndex,
    saveFile: SraSaveFile,
  ): { title: string; fields: unknown[] } {
    const slot = saveFile.slots[index];
    const slotKeyForIndex = (key: string) => slotKey(index, key);
    return {
      title: `Slot ${index + 1}`,
      fields: [
        {
          type: "string",
          name: slotKeyForIndex("playerName"),
          label: "Player Name",
          initialValue: slot.playerName,
          regex: /^[A-Za-z]{1,8}$/,
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
              renderer: MagicEnumFieldRenderer,
              props: {
                label: "Bar",
                enum: MagicAmount,
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
          name: slotKeyForIndex("biggoronsSwordFlag1"),
          label: "Biggoron Flag 1",
          initialValue: slot.biggoronsSwordFlag1,
        },
        {
          type: "boolean",
          name: slotKeyForIndex("biggoronsSwordFlag2"),
          label: "Biggoron Flag 2",
          initialValue: slot.biggoronsSwordFlag2,
        },
        {
          type: "enum",
          name: slotKeyForIndex("savedSceneIndex"),
          label: "Saved Scene",
          enum: Scene,
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
                  if (value?.room) {
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
          max: 99,
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
              props: { label: "Sword", enum: Sword },
            },
            shield: {
              renderer: CurrentEquipShieldRenderer,
              props: { label: "Shield", enum: Shield },
            },
            tunic: {
              renderer: CurrentEquipTunicRenderer,
              props: { label: "Tunic", enum: Tunic },
            },
            boots: {
              renderer: CurrentEquipBootsRenderer,
              props: { label: "Boots", enum: Boots },
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
              props: { label: "X", min: 0, max: 0xffffffff },
            },
            y: {
              renderer: Point3DFieldRenderer,
              props: { label: "Y", min: 0, max: 0xffffffff },
            },
            z: {
              renderer: Point3DFieldRenderer,
              props: { label: "Z", min: 0, max: 0xffffffff },
            },
            yRotation: {
              renderer: Point3DFieldRenderer,
              props: { label: "Y Rotation", min: 0, max: 0xffff },
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
          type: "integer",
          min: 0,
          max: 0xffff,
          name: slotKeyForIndex("checksum"),
          label: "Checksum",
          initialValue: slot.checksum,
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
          type: "permanentsceneflags",
          name: slotKeyForIndex("permanentSceneFlags"),
          label: "Permanent Scene Flags",
          saveSlot: slot,
          initialValue: { version: 0 },
        },
      ],
    };
  }

  function readSlotData(
    saveFile: SraSaveFile,
    values: FormFields,
    index: SlotIndex,
  ): SraSaveFile {
    const slot = saveFile.slots[index];

    slot.playerName = values[`slot_${index}_playerName`] as unknown as string;
    slot.deathCounter =
      values[`slot_${index}_deathCounter`] as unknown as number;
    slot.age = values[`slot_${index}_age`] as unknown as Age;

    const health = values[`slot_${index}_health`] as unknown as HealthData;
    slot.currentHealth = Math.round(health.currentHealth * 16);
    slot.maxHealth = Math.round(health.maxHealth * 16);
    slot.doubleDefenseHearts = health.doubleDefenseHearts;

    const magic = values[`slot_${index}_magic`] as unknown as MagicData;
    slot.currentMagic = magic.current;
    slot.magicFlag1 = magic.flag1;
    slot.magicFlag2 = magic.flag2;
    slot.maxMagic = magic.flag1 ? (magic.flag2 ? 2 : 1) : 0;

    slot.rupees = values[`slot_${index}_rupees`] as unknown as number;

    const roomData =
      values[`slot_${index}_roomWithEntrance`] as unknown as RoomData;
    if (slot.room !== roomData.room) {
      slot.roomWithEntrance = RoomWithEntranceFor(
        roomData.room,
        ValidEntrancesForRoom(roomData.room)[0],
      );
    }
    if (ValidEntrancesForRoom(roomData.room).includes(roomData.entrance)) {
      slot.entrance = roomData.entrance;
    }

    slot.magicBeans = values[`slot_${index}_magicBeans`] as unknown as number;
    slot.goldSkulltulaTokens =
      values[`slot_${index}_goldSkulltulaTokens`] as unknown as number;
    slot.bigPoePoints =
      values[`slot_${index}_bigPoePoints`] as unknown as number;

    slot.entranceIndex =
      values[`slot_${index}_entranceIndex`] as unknown as number;
    slot.cutSceneNumber =
      values[`slot_${index}_cutSceneNumber`] as unknown as number;
    slot.worldTime = values[`slot_${index}_worldTime`] as unknown as number;
    slot.nightFlag = values[`slot_${index}_nightFlag`] as unknown as Time;
    slot.ddOnly = values[`slot_${index}_ddOnly`] as unknown as boolean;
    slot.naviTimer = values[`slot_${index}_naviTimer`] as unknown as number;
    slot.biggoronsSwordFlag1 =
      values[`slot_${index}_biggoronsSwordFlag1`] as unknown as boolean;
    slot.biggoronsSwordFlag2 =
      values[`slot_${index}_biggoronsSwordFlag2`] as unknown as boolean;

    const savedScene =
      values[`slot_${index}_savedSceneIndex`] as unknown as Scene;
    if (savedScene !== slot.savedSceneIndex) {
      slot.savedSceneIndex = savedScene;
    }

    const buttonEquips =
      values[`slot_${index}_buttonEquips`] as unknown as ButtonEquipsData;
    slot.currentButtonEquips = {
      bButton: buttonEquips.bButton,
      cLeftButton: buttonEquips.cLeftButton,
      cDownButton: buttonEquips.cDownButton,
      cRightButton: buttonEquips.cRightButton,
      cLeftOffset: buttonEquips.cLeftOffset,
      cDownOffset: buttonEquips.cDownOffset,
      cRightOffset: buttonEquips.cRightOffset,
    };

    const currentEquip = values[
      `slot_${index}_currentEquipment`
    ] as unknown as CurrentEquipmentData;
    slot.currentlyEquippedEquipment = {
      sword: currentEquip.sword,
      shield: currentEquip.shield,
      tunic: currentEquip.tunic,
      boots: currentEquip.boots,
    };

    const inv = values[`slot_${index}_inventory`] as unknown as InventoryData;
    if (inv.items.length === 24) slot.inventory = inv.items;
    if (inv.amounts.length === 15) slot.inventoryAmounts = inv.amounts;

    const obt = values[`slot_${index}_obtained`] as unknown as ObtainedData;
    slot.obtainedEquipment = obt.equipment;
    slot.obtainedUpgrades = obt.upgrades;
    slot.questStatusItems = obt.questItems;

    const dung =
      values[`slot_${index}_dungeonStatus`] as unknown as DungeonStatusData;
    slot.dungeonItems = dung.items;
    slot.smallKeyAmount = dung.smallKeys;

    slot.entranceIndexTransport =
      values[`slot_${index}_entranceIndexTransport`] as unknown as Scene;
    slot.mapNumber = values[`slot_${index}_mapNumber`] as unknown as number;
    slot.warpPointSet =
      values[`slot_${index}_warpPointSet`] as unknown as boolean;
    slot.checksum = values[`slot_${index}_checksum`] as unknown as number;
    slot.fileIndex = values[`slot_${index}_fileIndex`] as unknown as number;

    // Sync flags from form data to slot
    const eventFlagValues =
      values[`slot_${index}_eventFlags`] as unknown as Record<string, boolean>;
    if (eventFlagValues) {
      const ef = slot.eventFlags;
      for (const [name, value] of Object.entries(eventFlagValues)) {
        (ef as unknown as Record<string, unknown>)[name] = value;
      }
      slot.eventFlags = ef;
    }

    const itemFlagValues =
      values[`slot_${index}_itemFlags`] as unknown as Record<string, boolean>;
    if (itemFlagValues) {
      const itemf = slot.itemFlags;
      for (const [name, value] of Object.entries(itemFlagValues)) {
        (itemf as unknown as Record<string, unknown>)[name] = value;
      }
      slot.itemFlags = itemf;
    }

    const otherFlagValues =
      values[`slot_${index}_otherFlags`] as unknown as Record<string, boolean>;
    if (otherFlagValues) {
      const of = slot.otherFlags;
      for (const [name, value] of Object.entries(otherFlagValues)) {
        (of as unknown as Record<string, unknown>)[name] = value;
      }
      slot.otherFlags = of;
    }

    return saveFile;
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
      ...makeSlotFields(0, originalSaveFile) as unknown as Record<
        string,
        unknown
      >,
      ...makeSlotFields(1, originalSaveFile) as unknown as Record<
        string,
        unknown
      >,
      ...makeSlotFields(2, originalSaveFile) as unknown as Record<
        string,
        unknown
      >,
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

  const slotSectionDefs = useMemo(
    () => [
      makeSlotSections(0, formState.saveFile),
      makeSlotSections(1, formState.saveFile),
      makeSlotSections(2, formState.saveFile),
    ],
    [formState.saveFile],
  );

  const allSections = useMemo(() => {
    const base = [
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
          title: `${section.title} (${pg + 1}/${totalPages})`,
          fields: section.fields.slice(start, end),
        };
      }
      return section;
    });
  }, [slotSectionDefs, slotPage, termRows]);

  useInput((input, key) => {
    if (input === "]") {
      const maxPg = Math.max(
        ...slotSectionDefs.map((s) =>
          Math.ceil(s.fields.length / FIELDS_PER_PAGE)
        ),
      );
      setSlotPage((prev) => Math.min(prev + 1, maxPg - 1));
    } else if (input === "[") {
      setSlotPage((prev) => Math.max(prev - 1, 0));
    }
  });

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

            formState.saveFile = readSlotData(formState.saveFile, values, 0);
            formState.saveFile = readSlotData(formState.saveFile, values, 1);
            formState.saveFile = readSlotData(formState.saveFile, values, 2);

            // Update checksum for all slots
            for (let i = 0; i < 3; i++) {
              formState.saveFile.slots[i].updateChecksum();
            }

            const newData: Record<string, unknown> = {
              ...values as unknown as Record<string, unknown>,
            };
            // Re-sync room/entrance (they may have changed due to scene index)
            for (let i = 0; i < 3; i++) {
              const idx = i as SlotIndex;
              newData[`slot_${idx}_roomWithEntrance`] = {
                room: formState.saveFile.slots[idx].room,
                entrance: formState.saveFile.slots[idx].entrance,
              };
            }

            setFormState({
              ...formState,
              currentFormData: newData as FormFields,
            });
          }}
          value={formState.currentFormData}
          onSubmit={(values: FormFields) => {
            FileUtil.saveFile(
              values.saveoptions_filename,
              values.saveoptions_fileFormat,
              formState.saveFile,
              values.saveoptions_swapWords,
            );
          }}
        />
      </Box>
      <Box justifyContent="center" marginTop={1}>
        <Text dimColor>↑ ↓ fields · [ ] page · ← → tabs</Text>
      </Box>
    </Box>
  );
};
