import type { SraSaveFile } from "../../models/savefile.ts";
import type {
  ButtonEquips,
  CurrentEquipment,
  FaroresWindWarp,
  SaveSlot,
} from "../../models/saveslot.ts";
import {
  RoomWithEntranceFor,
  ValidEntrancesForRoom,
} from "../../models/scene.ts";
import type { Entrance, Room } from "../../models/scene.ts";
import {
  applyFieldReplacement,
  interpretSlotField,
  prepareFieldReplacement,
  readableSlot,
} from "../../utils/fieldinterpretation.ts";
import { getSlot, updateNamedFlag } from "../../utils/saveeditor.ts";
import type { DungeonStatusData } from "./fieldmanagers/dungeonstatus.tsx";
import type { HealthData } from "./fieldmanagers/health.tsx";
import type { InventoryData } from "./fieldmanagers/inventory.tsx";
import type { MagicData } from "./fieldmanagers/magic.tsx";
import type { ObtainedData } from "./fieldmanagers/obtained.tsx";

const scalarFields = [
  "playerName",
  "deathCounter",
  "age",
  "rupees",
  "magicBeans",
  "goldSkulltulaTokens",
  "bigPoePoints",
  "entranceIndex",
  "cutSceneNumber",
  "worldTime",
  "nightFlag",
  "ddOnly",
  "naviTimer",
  "biggoronsSwordFlag2",
  "savedSceneIndex",
  "entranceIndexTransport",
  "mapNumber",
  "warpPointSet",
  "fileIndex",
] as const;

export function getBooleanFlags(
  source: object,
): Array<{ name: string; value: boolean }> {
  const descriptors = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf(source),
  );
  return Object.entries(descriptors).filter(([, descriptor]) =>
    descriptor.get && descriptor.set
  )
    .map(([name]) => ({
      name,
      value: (source as Record<string, unknown>)[name],
    }))
    .filter((flag): flag is { name: string; value: boolean } =>
      typeof flag.value === "boolean"
    );
}

export function makeSlotFields(
  index: number,
  save: SraSaveFile,
): Record<string, unknown> {
  const slot = readableSlot(getSlot(save, index));
  if (slot.isEmpty) {
    return {
      [`slot_${index}_fileValid`]: slot.isValid,
      [`slot_${index}_checksum`]: slot.checksum,
      [`slot_${index}_slotState`]:
        "Empty slot. Use Ctrl+G to create a new-game slot.",
    };
  }
  const fields: Record<string, unknown> = Object.fromEntries(
    scalarFields.map((key) => [`slot_${index}_${key}`, slot[key]]),
  );
  const put = (key: string, value: unknown) =>
    fields[`slot_${index}_${key}`] = value;
  put("interpretations", null);
  put("fileValid", slot.isValid);
  put(
    "slotState",
    slot.isEmpty
      ? "Empty slot. Use Ctrl+G to create a new-game slot."
      : "Occupied slot",
  );
  put("checksum", slot.checksum);
  put("health", {
    maxHealth: slot.maxHealth / 16,
    currentHealth: slot.currentHealth / 16,
    doubleDefenseHearts: slot.doubleDefenseHearts,
  });
  put("magic", {
    current: slot.currentMagic,
    flag1: slot.magicFlag1,
    flag2: slot.magicFlag2,
  });
  put("roomWithEntrance", { room: slot.room, entrance: slot.entrance });
  put("faroresWindWarp", slot.faroresWindWarp);
  put("buttonEquips", slot.currentButtonEquips);
  put("currentEquipment", slot.currentlyEquippedEquipment);
  put("inventory", { items: slot.inventory, amounts: slot.inventoryAmounts });
  put("obtained", {
    equipment: slot.obtainedEquipment,
    upgrades: slot.obtainedUpgrades,
    questItems: slot.questStatusItems,
  });
  put("dungeonStatus", {
    items: slot.dungeonItems,
    smallKeys: slot.smallKeyAmount,
  });
  put("additionalData", slot.additionalData);
  put("permanentSceneFlags", {
    bytes: Array.from(slot.data.slice(0xD4, 0xE64)),
  });
  for (const group of ["eventFlags", "itemFlags", "otherFlags"] as const) {
    put(
      group,
      Object.fromEntries(
        getBooleanFlags(slot[group]).map((flag) => [flag.name, flag.value]),
      ),
    );
  }
  return fields;
}

export function applySlotFields(
  slot: SaveSlot,
  index: number,
  values: Record<string, unknown>,
  previous: Record<string, unknown>,
): void {
  const get = (key: string) => values[`slot_${index}_${key}`];
  const changed = (key: string) =>
    get(key) !== undefined &&
    JSON.stringify(get(key)) !==
      JSON.stringify(previous[`slot_${index}_${key}`]);
  if (changed("interpretations")) {
    const accepted = get("interpretations") as
      | { field: string; value: unknown }
      | null;
    if (accepted) {
      applyFieldReplacement(
        slot,
        prepareFieldReplacement(slot, accepted.field, accepted.value),
      );
    }
  }
  if (changed("additionalData")) {
    const next = get("additionalData") as typeof slot.additionalData;
    const old =
      previous[`slot_${index}_additionalData`] as typeof slot.additionalData;
    const patch = Object.fromEntries(
      Object.entries(next).filter(([key, value]) =>
        value !== undefined &&
        JSON.stringify(value) !== JSON.stringify(old?.[key as keyof typeof old])
      ),
    );
    slot.additionalData = { ...slot.additionalData, ...patch };
  }
  if (changed("permanentSceneFlags")) {
    const { bytes } = get("permanentSceneFlags") as { bytes: number[] };
    if (
      bytes.length !== 0xD90 ||
      bytes.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)
    ) {
      throw new Error("Permanent scene flags must contain exactly 3472 bytes.");
    }
    slot.data.set(bytes, 0xD4);
  }
  for (const key of scalarFields) {
    if (changed(key) && interpretSlotField(slot, key).status === "available") {
      (slot as unknown as Record<string, unknown>)[key] = get(key);
    }
  }
  if (changed("health")) {
    const health = get("health") as HealthData;
    slot.maxHealth = Math.round(health.maxHealth * 16);
    slot.currentHealth = Math.min(
      slot.maxHealth,
      Math.round(health.currentHealth * 16),
    );
    slot.doubleDefenseHearts = Math.min(255, health.doubleDefenseHearts);
  }
  if (changed("magic")) {
    const magic = get("magic") as MagicData;
    const old = previous[`slot_${index}_magic`] as MagicData;
    if (magic.flag1 !== undefined && magic.flag1 !== old?.flag1) {
      slot.magicFlag1 = magic.flag1;
    }
    if (magic.flag2 !== undefined && magic.flag2 !== old?.flag2) {
      slot.magicFlag2 = magic.flag2;
    }
    if (magic.current !== undefined && magic.current !== old?.current) {
      slot.currentMagic = magic.current;
    }
  }
  if (changed("roomWithEntrance")) {
    const location = get("roomWithEntrance") as {
      room: Room;
      entrance: Entrance;
    };
    const entrances = ValidEntrancesForRoom(location.room);
    slot.roomWithEntrance = RoomWithEntranceFor(
      location.room,
      entrances.includes(location.entrance) ? location.entrance : entrances[0],
    );
  }
  if (changed("faroresWindWarp")) {
    slot.faroresWindWarp = get("faroresWindWarp") as FaroresWindWarp;
  }
  if (changed("buttonEquips")) {
    slot.currentButtonEquips = get("buttonEquips") as ButtonEquips;
  }
  if (changed("currentEquipment")) {
    slot.currentlyEquippedEquipment = get(
      "currentEquipment",
    ) as CurrentEquipment;
  }
  if (changed("inventory")) {
    const inventory = get("inventory") as InventoryData;
    slot.inventory = inventory.items;
    slot.inventoryAmounts = inventory.amounts;
  }
  if (changed("obtained")) {
    const obtained = get("obtained") as ObtainedData;
    slot.obtainedEquipment = obtained.equipment;
    slot.obtainedUpgrades = obtained.upgrades;
    slot.questStatusItems = obtained.questItems;
  }
  if (changed("dungeonStatus")) {
    const dungeon = get("dungeonStatus") as DungeonStatusData;
    slot.dungeonItems = dungeon.items;
    slot.smallKeyAmount = dungeon.smallKeys;
  }
  for (const group of ["eventFlags", "itemFlags", "otherFlags"] as const) {
    if (changed(group)) {
      const old = previous[`slot_${index}_${group}`] as
        | Record<string, boolean>
        | undefined;
      for (
        const [name, value] of Object.entries(
          get(group) as Record<string, boolean>,
        )
      ) {
        if (old?.[name] !== value) updateNamedFlag(slot, group, name, value);
      }
    }
  }
}
