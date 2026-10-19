import type { SraSaveFile } from "../../models/savefile.ts";
import { MagicAmount } from "../../models/saveslot.ts";
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
import { getSlot, updateNamedFlag } from "../../utils/saveeditor.ts";
import { slotDisplayError } from "../slotreadability.ts";
import type { HealthData } from "./fieldmanagers/health.tsx";
import type { MagicData } from "./fieldmanagers/magic.tsx";
import type { InventoryData } from "./fieldmanagers/inventory.tsx";
import type { ObtainedData } from "./fieldmanagers/obtained.tsx";
import type { DungeonStatusData } from "./fieldmanagers/dungeonstatus.tsx";

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
  const slot = getSlot(save, index);
  const displayError = slotDisplayError(slot);
  if (slot.isEmpty || displayError) {
    return {
      [`slot_${index}_fileValid`]: slot.isValid,
      [`slot_${index}_checksum`]: slot.checksum,
      [`slot_${index}_slotState`]: displayError ??
        "Empty slot. Use Ctrl+G to create a new-game slot.",
    };
  }
  const fields: Record<string, unknown> = Object.fromEntries(
    scalarFields.map((key) => [`slot_${index}_${key}`, slot[key]]),
  );
  const put = (key: string, value: unknown) =>
    fields[`slot_${index}_${key}`] = value;
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
  if (changed("additionalData")) {
    slot.additionalData = get("additionalData") as typeof slot.additionalData;
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
    if (changed(key)) {
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
    slot.magicFlag1 = magic.flag1;
    slot.magicFlag2 = magic.flag1 && magic.flag2;
    slot.currentMagic = magic.flag1 ? magic.current : MagicAmount.Empty;
    slot.maxMagic = slot.magicFlag1 ? (slot.magicFlag2 ? 2 : 1) : 0;
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
  slot.updateChecksum();
}
