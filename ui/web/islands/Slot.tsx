import { useState } from "preact/hooks";
import {
  Age,
  BombBag,
  Boots,
  BulletBag,
  DekuNutUpgrades,
  DekuStickUpgrades,
  DiveMeter,
  DungeonItems,
  InventoryItems,
  MagicAmount,
  Medallions,
  QuestItems,
  Quiver,
  SaveSlot,
  Shield,
  Songs,
  SpiritualStones,
  StrengthUpgrades,
  Sword,
  Tokens,
  Tunic,
  Wallet,
} from "../../../models/saveslot.ts";
import { Entrance, Room, Scene, Time } from "../../../models/scene.ts";

interface SlotProps {
  slotData: Uint8Array;
  index: number;
}

function enumLabel<T extends number>(
  enumObject: Record<string, string | number>,
  value: T,
): string {
  return enumObject[value] ? String(enumObject[value]) : String(value);
}

function formatFlagName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
}

function getBooleanFlags(source: object): Array<{ name: string; value: boolean }> {
  const prototype = Object.getPrototypeOf(source) as object;
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  const flags: Array<{ name: string; value: boolean }> = [];

  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (name === "constructor" || name === "data" || !descriptor.get) {
      continue;
    }
    try {
      const value = (source as Record<string, unknown>)[name];
      if (typeof value === "boolean") {
        flags.push({ name, value });
      }
    } catch {
      continue;
    }
  }

  return flags;
}

function inventoryItemLabel(item: InventoryItems): string {
  return enumLabel(InventoryItems, item);
}

function questItemLabel(item: QuestItems): string {
  const fromMedallions = Medallions[item as Medallions];
  if (fromMedallions) {
    return String(fromMedallions);
  }
  const fromSongs = Songs[item as Songs];
  if (fromSongs) {
    return String(fromSongs);
  }
  const fromSpiritualStones = SpiritualStones[item as SpiritualStones];
  if (fromSpiritualStones) {
    return String(fromSpiritualStones);
  }
  const fromTokens = Tokens[item as Tokens];
  if (fromTokens) {
    return String(fromTokens);
  }
  return String(item);
}

function upgradeLabel(value: number): string {
  const fromDekuNut = DekuNutUpgrades[value as DekuNutUpgrades];
  if (fromDekuNut) {
    return String(fromDekuNut);
  }
  const fromDekuStick = DekuStickUpgrades[value as DekuStickUpgrades];
  if (fromDekuStick) {
    return String(fromDekuStick);
  }
  const fromBulletBag = BulletBag[value as BulletBag];
  if (fromBulletBag) {
    return String(fromBulletBag);
  }
  const fromWallet = Wallet[value as Wallet];
  if (fromWallet) {
    return String(fromWallet);
  }
  const fromDiveMeter = DiveMeter[value as DiveMeter];
  if (fromDiveMeter) {
    return String(fromDiveMeter);
  }
  const fromStrength = StrengthUpgrades[value as StrengthUpgrades];
  if (fromStrength) {
    return String(fromStrength);
  }
  const fromBombBag = BombBag[value as BombBag];
  if (fromBombBag) {
    return String(fromBombBag);
  }
  const fromQuiver = Quiver[value as Quiver];
  if (fromQuiver) {
    return String(fromQuiver);
  }
  return String(value);
}

function equipmentLabel(value: number): string {
  const fromSword = Sword[value as Sword];
  if (fromSword) {
    return String(fromSword);
  }
  const fromShield = Shield[value as Shield];
  if (fromShield) {
    return String(fromShield);
  }
  const fromTunic = Tunic[value as Tunic];
  if (fromTunic) {
    return String(fromTunic);
  }
  const fromBoots = Boots[value as Boots];
  if (fromBoots) {
    return String(fromBoots);
  }
  return "None";
}

export default function Slot(props: SlotProps) {
  const { slotData, index } = props;
  const slot = new SaveSlot(slotData);
  const eventFlags = getBooleanFlags(slot.eventFlags);
  const itemFlags = getBooleanFlags(slot.itemFlags);
  const otherFlags = getBooleanFlags(slot.otherFlags);

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      key={index}
      className={`border rounded p-4 ${
        expanded ? "bg-blue-300/90 shadow-lg h-max" : "bg-gray-50 h-min"
      }`}
    >
      <h3 
        className="text-xl font-semibold mb-2 hover:cursor-pointer"
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        File {index + 1}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <span className="font-medium">Player Name:</span>{" "}
          <span className="tabular-nums">{slot.playerName}</span>
        </div>
        <div>
          <span className="font-medium">Deaths:</span>{" "}
          <span className="tabular-nums">{slot.deathCounter}</span>
        </div>
        <div>
          <span className="font-medium">Age:</span>{" "}
          <span className="tabular-nums">{Age[slot.age]}</span>
        </div>
      </div>
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Entrance Index:</span>{" "}
            <span className="tabular-nums">{slot.entranceIndex}</span>
          </div>
          <div>
            <span className="font-medium">Cutscene:</span>{" "}
            <span className="tabular-nums">{slot.cutSceneNumber}</span>
          </div>
          <div>
            <span className="font-medium">World Time:</span>{" "}
            <span className="tabular-nums">{slot.worldTime}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Day/Night:</span>{" "}
            <span className="tabular-nums">{enumLabel(Time, slot.nightFlag)}</span>
          </div>
          <div>
            <span className="font-medium">DD Only:</span>{" "}
            <span className="tabular-nums">{slot.ddOnly ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="font-medium">Navi Timer:</span>{" "}
            <span className="tabular-nums">{slot.naviTimer}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Health:</span>{" "}
            <span className="tabular-nums">
              {slot.currentHealth / 16} / {slot.maxHealth / 16}{" "}
              ({slot.doubleDefenseHearts / 16})
            </span>
          </div>
          <div>
            <span className="font-medium">Magic Meter:</span>{" "}
            <span className="tabular-nums">
              {enumLabel(MagicAmount, slot.currentMagic)} / {slot.maxMagic}
            </span>
            <span>{slot.magicFlag1 ? "Flag 1" : ""}</span>
            <span>{slot.magicFlag2 ? "Flag 2" : ""}</span>
          </div>
          <div>
            <span className="font-medium">Rupees:</span>{" "}
            <span className="tabular-nums">{slot.rupees}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Biggoron Flag 1:</span>{" "}
            <span className="tabular-nums">{slot.biggoronsSwordFlag1 ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="font-medium">Biggoron Flag 2:</span>{" "}
            <span className="tabular-nums">{slot.biggoronsSwordFlag2 ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="font-medium">Saved Scene:</span>{" "}
            <span className="tabular-nums">{enumLabel(Scene, slot.savedSceneIndex)}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Location:</span>{" "}
            <span className="tabular-nums">
              {Room[slot.room]} ({Entrance[slot.entrance]})
            </span>
          </div>
          <div>
            <span className="font-medium">Magic Beans:</span>{" "}
            <span className="tabular-nums">{slot.magicBeans}</span>
          </div>
          <div>
            <span className="font-medium">Gold Skulltula Tokens:</span>{" "}
            <span className="tabular-nums">{slot.goldSkulltulaTokens}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Button Equips:</span>{" "}
            <span className="tabular-nums">
              B: {inventoryItemLabel(slot.bButtonEquip)}, C←: {inventoryItemLabel(slot.cLeftButtonEquip)}, C↓: {inventoryItemLabel(slot.cDownButtonEquip)}, C→: {inventoryItemLabel(slot.cRightButtonEquip)}
            </span>
          </div>
          <div>
            <span className="font-medium">Equip Offsets:</span>{" "}
            <span className="tabular-nums">
              C←: {slot.currentButtonEquips.cLeftOffset === 0xFF ? "Unset" : slot.currentButtonEquips.cLeftOffset}, C↓: {slot.currentButtonEquips.cDownOffset === 0xFF ? "Unset" : slot.currentButtonEquips.cDownOffset}, C→: {slot.currentButtonEquips.cRightOffset === 0xFF ? "Unset" : slot.currentButtonEquips.cRightOffset}
            </span>
          </div>
          <div>
            <span className="font-medium">Equipped:</span>{" "}
            <span className="tabular-nums">
              {equipmentLabel(slot.currentlyEquippedEquipment.sword)}, {equipmentLabel(slot.currentlyEquippedEquipment.shield)}, {equipmentLabel(slot.currentlyEquippedEquipment.tunic)}, {equipmentLabel(slot.currentlyEquippedEquipment.boots)}
            </span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <span className="font-medium">Inventory:</span>{" "}
            <span className="tabular-nums">
              {slot.inventory.map((item) => inventoryItemLabel(item)).join(", ")}
            </span>
          </div>
          <div>
            <span className="font-medium">Inventory Amounts:</span>{" "}
            <span className="tabular-nums">{slot.inventoryAmounts.join(", ")}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <span className="font-medium">Obtained Equipment:</span>{" "}
            <span className="tabular-nums">
              {slot.obtainedEquipment.map((item) => equipmentLabel(item)).join(", ")}
            </span>
          </div>
          <div>
            <span className="font-medium">Obtained Upgrades:</span>{" "}
            <span className="tabular-nums">
              {slot.obtainedUpgrades.map((item) => upgradeLabel(item)).join(", ")}
            </span>
          </div>
          <div>
            <span className="font-medium">Quest Items:</span>{" "}
            <span className="tabular-nums">
              {slot.questStatusItems.map((item) => questItemLabel(item)).join(", ")}
            </span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <span className="font-medium">Dungeon Items:</span>{" "}
            <span className="tabular-nums">
              {slot.dungeonItems.map((items, dungeonIndex) => (
                `D${dungeonIndex + 1}: ${items.map((item) => enumLabel(DungeonItems, item)).join("|") || "None"}`
              )).join(", ")}
            </span>
          </div>
          <div>
            <span className="font-medium">Small Keys:</span>{" "}
            <span className="tabular-nums">
              {slot.smallKeyAmount.map((value, dungeonIndex) => (
                `D${dungeonIndex + 1}: ${value === 0xFF ? "None" : value}`
              )).join(", ")}
            </span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Big Poe Points:</span>{" "}
            <span className="tabular-nums">
              {slot.bigPoePoints}
            </span>
          </div>
          <div>
            <span className="font-medium">Farores Wind Warp:</span>{" "}
            <span className="tabular-nums">
              {slot.faroresWindWarp.x}, {slot.faroresWindWarp.y},{" "}
              {slot.faroresWindWarp.z}, {slot.faroresWindWarp.yRotation}
            </span>
          </div>
          <div>
            <span className="font-medium">Transport Scene:</span>{" "}
            <span className="tabular-nums">{enumLabel(Scene, slot.entranceIndexTransport)}</span>
          </div>
          <div>
            <span className="font-medium">Map #:</span>{" "}
            <span className="tabular-nums">{slot.mapNumber}</span>
          </div>
          <div>
            <span className="font-medium">Warp Point Set:</span>{" "}
            <span className="tabular-nums">{slot.warpPointSet ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="font-medium">Checksum:</span>{" "}
            <span className="tabular-nums">{slot.checksum}</span>
          </div>
          <div>
            <span className="font-medium">File Index:</span>{" "}
            <span className="tabular-nums">{slot.fileIndex}</span>
          </div>
          <div>
            <span className="font-medium">Valid:</span>{" "}
            <span className="tabular-nums">{slot.isValid ? "Yes" : "No"}</span>
          </div>
        </div>
      )}
      {expanded && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <details>
              <summary className="font-medium cursor-pointer">Event Flags</summary>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {eventFlags.map((flag) => (
                  <label className="inline-flex items-center gap-2" key={flag.name}>
                    <input type="checkbox" checked={flag.value} disabled />
                    <span>{formatFlagName(flag.name)}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <div>
            <details>
              <summary className="font-medium cursor-pointer">Item Flags</summary>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {itemFlags.map((flag) => (
                  <label className="inline-flex items-center gap-2" key={flag.name}>
                    <input type="checkbox" checked={flag.value} disabled />
                    <span>{formatFlagName(flag.name)}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <div>
            <details>
              <summary className="font-medium cursor-pointer">Other Flags</summary>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {otherFlags.map((flag) => (
                  <label className="inline-flex items-center gap-2" key={flag.name}>
                    <input type="checkbox" checked={flag.value} disabled />
                    <span>{formatFlagName(flag.name)}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
