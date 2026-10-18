import { SraSaveFile } from "../models/savefile.ts";
import { SaveSlot, upgradeGroups } from "../models/saveslot.ts";
import type { ObtainableUpgrades } from "../models/saveslot.ts";

export const slotCount = 6;

export function selectUpgrade(
  values: ObtainableUpgrades[],
  item: ObtainableUpgrades,
  checked: boolean,
): ObtainableUpgrades[] {
  const group = upgradeGroups.find((group) =>
    Object.values(group.values).includes(item)
  );
  if (!group) throw new Error(`Unknown upgrade: ${item}.`);
  const next = values.filter((value) =>
    checked ? !Object.values(group.values).includes(value) : value !== item
  );
  return checked ? [...next, item] : next;
}

export function getSlot(save: SraSaveFile, index: number): SaveSlot {
  if (!Number.isInteger(index) || index < 0 || index >= slotCount) {
    throw new Error(
      `Slot index must be between 0 and ${slotCount - 1}, got ${index}.`,
    );
  }
  return index < 3 ? save.slots[index] : save.backups[index - 3];
}

export function slotLabel(index: number): string {
  return index < 3 ? `Slot ${index + 1}` : `Backup ${index - 2}`;
}

export function copySlot(
  save: SraSaveFile,
  source: number,
  target: number,
): void {
  const copy = new SaveSlot(getSlot(save, source).data.slice());
  getSlot(save, target).data.set(copy.data);
  getSlot(save, target).fileIndex = target % 3;
  getSlot(save, target).updateChecksum();
}

export function resetSlot(save: SraSaveFile, index: number): void {
  const slot = getSlot(save, index);
  slot.data.set(SaveSlot.createBlank().data);
  slot.fileIndex = index % 3;
}

export function repairSave(save: SraSaveFile): void {
  save.header.makeValid();
  for (let i = 0; i < slotCount; i++) getSlot(save, i).makeValid();
}

export function updateNamedFlag(
  slot: SaveSlot,
  group: "eventFlags" | "itemFlags" | "otherFlags",
  name: string,
  value: boolean,
): void {
  const flags = slot[group];
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(flags),
    name,
  );
  if (
    !descriptor?.set ||
    typeof (flags as unknown as Record<string, unknown>)[name] !== "boolean"
  ) {
    throw new Error(`Unknown ${group} flag: ${name}.`);
  }
  (flags as unknown as Record<string, unknown>)[name] = value;
  if (group === "eventFlags") slot.eventFlags = flags as typeof slot.eventFlags;
  else if (group === "itemFlags") {
    slot.itemFlags = flags as typeof slot.itemFlags;
  } else slot.otherFlags = flags as typeof slot.otherFlags;
}
