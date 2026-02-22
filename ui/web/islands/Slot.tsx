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
import { Field } from "../components/Field.tsx";
import { Section } from "../components/Section.tsx";

interface SlotProps {
  slotData: Uint8Array;
  index: number;
}

function BooleanCheckbox(props: { value: boolean }) {
  return (
    <input
      type="checkbox"
      checked={props.value}
      disabled
      className="h-4 w-4 accent-blue-600"
    />
  );
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

function getBooleanFlags(
  source: object,
): Array<{ name: string; value: boolean }> {
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
      className={`rounded-xl border p-4 shadow-sm transition-all md:p-5 ${
        expanded
          ? "border-blue-300 bg-blue-50/70 shadow-md"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 md:text-xl">
          File {index + 1}
        </h3>
        <span
          className="text-sm font-medium text-blue-700 cursor-pointer"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Hide details" : "Show details"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Player Name">{slot.playerName}</Field>
        <Field label="Deaths">{slot.deathCounter}</Field>
        <Field label="Age">{Age[slot.age]}</Field>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <Section title="World State">
            <Field label="Entrance Index">{slot.entranceIndex}</Field>
            <Field label="Cutscene">{slot.cutSceneNumber}</Field>
            <Field label="World Time">{slot.worldTime}</Field>
            <Field label="Day/Night">{enumLabel(Time, slot.nightFlag)}</Field>
            <Field label="DD Only">
              <BooleanCheckbox value={slot.ddOnly} />
            </Field>
            <Field label="Navi Timer">{slot.naviTimer}</Field>
          </Section>

          <Section title="Vitals & Currency">
            <Field label="Health">
              {slot.currentHealth / 16} / {slot.maxHealth / 16}{" "}
              ({slot.doubleDefenseHearts / 16})
            </Field>
            <Field label="Magic Meter">
              <span>
                {enumLabel(MagicAmount, slot.currentMagic)} / {slot.maxMagic}
              </span>
              <span className="ml-2 text-xs text-slate-600">
                {slot.magicFlag1 ? "Flag 1 " : ""}
                {slot.magicFlag2 ? "Flag 2" : ""}
              </span>
            </Field>
            <Field label="Rupees">{slot.rupees}</Field>
          </Section>

          <Section title="Location & Progress">
            <Field label="Biggoron Flag 1">
              <BooleanCheckbox value={slot.biggoronsSwordFlag1} />
            </Field>
            <Field label="Biggoron Flag 2">
              <BooleanCheckbox value={slot.biggoronsSwordFlag2} />
            </Field>
            <Field label="Saved Scene">
              {enumLabel(Scene, slot.savedSceneIndex)}
            </Field>
            <Field label="Location">
              {Room[slot.room]} ({Entrance[slot.entrance]})
            </Field>
            <Field label="Magic Beans">{slot.magicBeans}</Field>
            <Field label="Gold Skulltula Tokens">
              {slot.goldSkulltulaTokens}
            </Field>
          </Section>

          <Section title="Equipment & Buttons" cols="grid grid-cols-1 gap-3">
            <Field label="Button Equips">
              B: {inventoryItemLabel(slot.bButtonEquip)}, C←:{" "}
              {inventoryItemLabel(slot.cLeftButtonEquip)}, C↓:{" "}
              {inventoryItemLabel(slot.cDownButtonEquip)}, C→:{" "}
              {inventoryItemLabel(slot.cRightButtonEquip)}
            </Field>
            <Field label="Equip Offsets">
              C←: {slot.currentButtonEquips.cLeftOffset === 0xFF
                ? "Unset"
                : slot.currentButtonEquips.cLeftOffset}, C↓:{" "}
              {slot.currentButtonEquips.cDownOffset === 0xFF
                ? "Unset"
                : slot.currentButtonEquips.cDownOffset}, C→:{" "}
              {slot.currentButtonEquips.cRightOffset === 0xFF
                ? "Unset"
                : slot.currentButtonEquips.cRightOffset}
            </Field>
            <Field label="Currently Equipped">
              Sword:{" "}
              {equipmentLabel(slot.currentlyEquippedEquipment.sword)}, Shield:
              {" "}
              {equipmentLabel(slot.currentlyEquippedEquipment.shield)}, Tunic:
              {" "}
              {equipmentLabel(slot.currentlyEquippedEquipment.tunic)}, Boots:
              {" "}
              {equipmentLabel(slot.currentlyEquippedEquipment.boots)}
            </Field>
          </Section>

          <Section title="Inventory" cols="grid grid-cols-1 gap-3">
            <Field label="Inventory">
              {slot.inventory.map((item) => inventoryItemLabel(item)).join(
                ", ",
              )}
            </Field>
            <Field label="Inventory Amounts">
              {slot.inventoryAmounts.join(", ")}
            </Field>
          </Section>

          <Section title="Collected & Upgrades" cols="grid grid-cols-1 gap-3">
            <Field label="Obtained Equipment">
              {slot.obtainedEquipment.map((item) => equipmentLabel(item)).join(
                ", ",
              )}
            </Field>
            <Field label="Obtained Upgrades">
              {slot.obtainedUpgrades.map((item) => upgradeLabel(item)).join(
                ", ",
              )}
            </Field>
            <Field label="Quest Items">
              {slot.questStatusItems.map((item) => questItemLabel(item)).join(
                ", ",
              )}
            </Field>
          </Section>

          <Section title="Dungeon Status" cols="grid grid-cols-1 gap-3">
            <Field label="Dungeon Items">
              {slot.dungeonItems.map((items, dungeonIndex) => (
                `D${dungeonIndex + 1}: ${
                  items.map((item) => enumLabel(DungeonItems, item)).join(
                    "|",
                  ) || "None"
                }`
              )).join(", ")}
            </Field>
            <Field label="Small Keys">
              {slot.smallKeyAmount.map((value, dungeonIndex) => (
                `D${dungeonIndex + 1}: ${value === 0xFF ? "None" : value}`
              )).join(", ")}
            </Field>
          </Section>

          <Section
            title="Advanced"
            cols="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <Field label="Big Poe Points">{slot.bigPoePoints}</Field>
            <Field label="Farores Wind Warp">
              {slot.faroresWindWarp.x}, {slot.faroresWindWarp.y},{" "}
              {slot.faroresWindWarp.z}, {slot.faroresWindWarp.yRotation}
            </Field>
            <Field label="Transport Scene">
              {enumLabel(Scene, slot.entranceIndexTransport)}
            </Field>
            <Field label="Map #">{slot.mapNumber}</Field>
            <Field label="Warp Point Set">
              <BooleanCheckbox value={slot.warpPointSet} />
            </Field>
            <Field label="Checksum">{slot.checksum}</Field>
            <Field label="File Index">{slot.fileIndex}</Field>
            <Field label="Valid">
              <BooleanCheckbox value={slot.isValid} />
            </Field>
          </Section>

          <Section title="Flags" cols="grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Event Flags
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {eventFlags.map((flag) => (
                    <label
                      className="inline-flex items-center gap-2 text-sm"
                      key={flag.name}
                    >
                      <BooleanCheckbox value={flag.value} />
                      <span>{formatFlagName(flag.name)}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Item Flags
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {itemFlags.map((flag) => (
                    <label
                      className="inline-flex items-center gap-2 text-sm"
                      key={flag.name}
                    >
                      <BooleanCheckbox value={flag.value} />
                      <span>{formatFlagName(flag.name)}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Other Flags
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {otherFlags.map((flag) => (
                    <label
                      className="inline-flex items-center gap-2 text-sm"
                      key={flag.name}
                    >
                      <BooleanCheckbox value={flag.value} />
                      <span>{formatFlagName(flag.name)}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
