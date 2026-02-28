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
  EquippableItems,
  InventoryItems,
  MagicAmount,
  Medallions,
  ObtainableUpgrades,
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
import type { PermanentSceneFlags } from "../../../models/permanentsceneflags.ts";
import {
  Entrance,
  Room,
  RoomWithEntranceFor,
  Scene,
  Time,
  ValidEntrancesForRoom,
} from "../../../models/scene.ts";
import { Field } from "../components/Field.tsx";
import { Section } from "../components/Section.tsx";
import { JSX } from "preact/compat/jsx-dev-runtime";

interface SlotProps {
  slot: SaveSlot;
  index: number;
  onChange?: () => void;
  readOnly?: boolean;
}

function BooleanCheckbox(
  props: {
    value: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
  },
) {
  return (
    <input
      type="checkbox"
      checked={props.value}
      disabled={props.disabled}
      onChange={(event) => props.onChange?.(event.currentTarget.checked)}
      className="h-4 w-4 accent-blue-600"
    />
  );
}

function NumberInput(props: {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      value={String(props.value)}
      min={props.min}
      max={props.max}
      step={props.step ?? 1}
      disabled={props.disabled}
      onInput={(event) => {
        const next = Number(event.currentTarget.value);
        if (!Number.isNaN(next)) {
          props.onChange?.(next);
        }
      }}
      className="w-full rounded border border-slate-300 px-2 py-1"
    />
  );
}

function enumValues<T extends number>(
  enumObject: Record<string, string | number>,
): T[] {
  return Object.values(enumObject)
    .filter((value): value is number => typeof value === "number")
    .map((value) => value as T);
}

function EnumSelect<T extends number>(props: {
  enumObject: Record<string, string | number>;
  value: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  options?: T[];
  keyPrefix?: string;
}) {
  const values = props.options ?? enumValues<T>(props.enumObject);

  return (
    <select
      name={props.keyPrefix}
      value={String(props.value)}
      disabled={props.disabled}
      onChange={(event) =>
        props.onChange?.(Number(event.currentTarget.value) as T)}
      className="w-full rounded border border-slate-300 bg-white px-2 py-1"
    >
      {values.map((value) => (
        <option key={`${props.keyPrefix ?? ""}${value}`} value={String(value)}>
          {enumLabel(props.enumObject, value)}
        </option>
      ))}
    </select>
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

function toggleArrayValue<T extends number>(
  values: T[],
  value: T,
  checked: boolean,
): T[] {
  if (checked) {
    if (values.includes(value)) {
      return values;
    }
    return [...values, value];
  }

  return values.filter((entry) => entry !== value);
}

const equipmentOptions: EquippableItems[] = Object.values({
  ...Sword,
  ...Shield,
  ...Tunic,
  ...Boots,
})
  .filter((value): value is number => typeof value === "number")
  .map((value) => value as EquippableItems);

const upgradeOptions: ObtainableUpgrades[] = Object.values({
  ...DekuNutUpgrades,
  ...DekuStickUpgrades,
  ...BulletBag,
  ...Wallet,
  ...DiveMeter,
  ...StrengthUpgrades,
  ...BombBag,
  ...Quiver,
})
  .filter((value): value is number => typeof value === "number")
  .map((value) => value as ObtainableUpgrades);

const questItemOptions: QuestItems[] = Object.values({
  ...Medallions,
  ...Songs,
  ...SpiritualStones,
  ...Tokens,
})
  .filter((value): value is number => typeof value === "number")
  .map((value) => value as QuestItems);

const dungeonItemOptions: DungeonItems[] = enumValues<DungeonItems>(
  DungeonItems,
);

const permanentSceneCount = 101;
const permanentSceneOptions = Array.from(
  { length: permanentSceneCount },
  (_, index) => index,
);

type PermanentSceneFlagGroupKey = keyof PermanentSceneFlags;

const permanentSceneFlagGroups: Array<{
  key: PermanentSceneFlagGroupKey;
  label: string;
}> = [
  { key: "chestFlags", label: "Chest" },
  { key: "switches", label: "Switches" },
  { key: "roomClearFlags", label: "Room Clear" },
  { key: "collectibleFlags", label: "Collectibles" },
  { key: "unused", label: "Unused" },
  { key: "visitedRooms", label: "Visited Rooms" },
  { key: "visitedFloors", label: "Visited Floors" },
];

const permanentSceneFlagBits = Array.from({ length: 32 }, (_, index) => index);

export default function Slot(props: SlotProps) {
  const { slot, index, onChange, readOnly = false } = props;
  const eventFlags = getBooleanFlags(slot.eventFlags);
  const itemFlags = getBooleanFlags(slot.itemFlags);
  const otherFlags = getBooleanFlags(slot.otherFlags);

  const [expanded, setExpanded] = useState(false);
  const [selectedPermanentScene, setSelectedPermanentScene] = useState(0);
  const [selectedPermanentGroup, setSelectedPermanentGroup] = useState<
    PermanentSceneFlagGroupKey
  >("chestFlags");

  function changed() {
    if (!readOnly) {
      slot.updateChecksum();
      onChange?.();
    }
  }

  function setRoom(nextRoom: Room) {
    if (readOnly) {
      return;
    }

    const validEntrances = ValidEntrancesForRoom(nextRoom);
    const nextEntrance = validEntrances[0];
    slot.roomWithEntrance = RoomWithEntranceFor(nextRoom, nextEntrance);
    changed();
  }

  function setEntrance(nextEntrance: Entrance) {
    if (readOnly) {
      return;
    }

    const validEntrances = ValidEntrancesForRoom(slot.room);
    if (validEntrances.includes(nextEntrance)) {
      slot.entrance = nextEntrance;
      changed();
    }
  }

  function updateMagicMax() {
    if (slot.magicFlag1 && slot.magicFlag2) {
      slot.maxMagic = 2;
      return;
    }

    if (slot.magicFlag1) {
      slot.maxMagic = 1;
      return;
    }

    slot.maxMagic = 0;
  }

  function setPermanentSceneFlag(
    sceneIndex: number,
    group: PermanentSceneFlagGroupKey,
    bit: number,
    value: boolean,
  ): JSX.Element | void {
    if (readOnly) {
      return;
    }

    const allFlags = slot.permanentSceneFlags;
    allFlags[sceneIndex][group].setFlag(bit, value);
    slot.permanentSceneFlags = allFlags;
    changed();
  }

  function countSetPermanentSceneFlags(
    scene: PermanentSceneFlags,
    group: PermanentSceneFlagGroupKey,
  ): number {
    let count = 0;
    for (const bit of permanentSceneFlagBits) {
      if (scene[group].getFlag(bit)) {
        count += 1;
      }
    }
    return count;
  }

  const activePermanentScene = Math.min(
    Math.max(selectedPermanentScene, 0),
    permanentSceneCount - 1,
  );
  const activePermanentSceneFlags =
    slot.permanentSceneFlags[activePermanentScene];

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
        <button
          type="button"
          className="text-sm font-medium text-blue-700 cursor-pointer bg-transparent border-0 p-0"
          aria-expanded={expanded}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Hide details" : "Show details"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Player Name">
          <input
            type="text"
            value={slot.playerName}
            disabled={readOnly}
            maxLength={8}
            onInput={(event) => {
              slot.playerName = event.currentTarget.value;
              changed();
            }}
            className="w-full rounded border border-slate-300 px-2 py-1"
          />
        </Field>
        <Field label="Deaths">
          <NumberInput
            value={slot.deathCounter}
            disabled={readOnly}
            min={0}
            max={0xFFFF}
            onChange={(value) => {
              slot.deathCounter = value;
              changed();
            }}
          />
        </Field>
        <Field label="Age">
          <EnumSelect
            keyPrefix={`slot-${index}-age-`}
            enumObject={Age}
            value={slot.age}
            disabled={readOnly}
            options={[Age.Child, Age.Adult]}
            onChange={(value) => {
              slot.age = value;
              changed();
            }}
          />
        </Field>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <Section title="World State">
            <Field label="Entrance Index">
              <NumberInput
                value={slot.entranceIndex}
                disabled={readOnly}
                min={0}
                max={0xFFFFFFFF}
                onChange={(value) => {
                  slot.entranceIndex = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Cutscene">
              <NumberInput
                value={slot.cutSceneNumber}
                disabled={readOnly}
                min={0}
                max={0xFFFF}
                onChange={(value) => {
                  slot.cutSceneNumber = value;
                  changed();
                }}
              />
            </Field>
            <Field label="World Time">
              <NumberInput
                value={slot.worldTime}
                disabled={readOnly}
                min={0}
                max={0xFFFF}
                onChange={(value) => {
                  slot.worldTime = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Day/Night">
              <EnumSelect
                keyPrefix={`slot-${index}-time-`}
                enumObject={Time}
                value={slot.nightFlag}
                disabled={readOnly}
                onChange={(value) => {
                  slot.nightFlag = value;
                  changed();
                }}
              />
            </Field>
            <Field label="DD Only">
              <BooleanCheckbox
                value={slot.ddOnly}
                disabled={readOnly}
                onChange={(value) => {
                  slot.ddOnly = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Navi Timer">
              <NumberInput
                value={slot.naviTimer}
                disabled={readOnly}
                min={0}
                max={0xFFFF}
                onChange={(value) => {
                  slot.naviTimer = value;
                  changed();
                }}
              />
            </Field>
          </Section>

          <Section title="Vitals & Currency">
            <Field label="Health">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <NumberInput
                  value={slot.currentHealth / 16}
                  disabled={readOnly}
                  min={0}
                  max={slot.maxHealth / 16}
                  step={0.25}
                  onChange={(value) => {
                    slot.currentHealth = Math.round(value * 16);
                    if (slot.currentHealth > slot.maxHealth) {
                      slot.currentHealth = slot.maxHealth;
                    }
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.maxHealth / 16}
                  disabled={readOnly}
                  min={0}
                  max={0xFFFF / 16}
                  step={0.25}
                  onChange={(value) => {
                    slot.maxHealth = Math.round(value * 16);
                    if (slot.currentHealth > slot.maxHealth) {
                      slot.currentHealth = slot.maxHealth;
                    }
                    if (slot.doubleDefenseHearts > slot.maxHealth) {
                      slot.doubleDefenseHearts = slot.maxHealth;
                    }
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.doubleDefenseHearts / 16}
                  disabled={readOnly}
                  min={0}
                  max={slot.maxHealth / 16}
                  step={0.25}
                  onChange={(value) => {
                    slot.doubleDefenseHearts = Math.round(value * 16);
                    if (slot.doubleDefenseHearts > slot.maxHealth) {
                      slot.doubleDefenseHearts = slot.maxHealth;
                    }
                    changed();
                  }}
                />
              </div>
            </Field>
            <Field label="Magic Meter">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <EnumSelect
                  enumObject={MagicAmount}
                  value={slot.currentMagic}
                  disabled={readOnly || !slot.magicFlag1}
                  keyPrefix={`slot-${index}-magic-`}
                  onChange={(value) => {
                    slot.currentMagic = value;
                    changed();
                  }}
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <BooleanCheckbox
                    value={slot.magicFlag1}
                    disabled={readOnly}
                    onChange={(value) => {
                      slot.magicFlag1 = value;
                      if (!value) {
                        slot.magicFlag2 = false;
                        slot.currentMagic = MagicAmount.Empty;
                      }
                      updateMagicMax();
                      changed();
                    }}
                  />
                  <span>Flag 1</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <BooleanCheckbox
                    value={slot.magicFlag2}
                    disabled={readOnly || !slot.magicFlag1}
                    onChange={(value) => {
                      slot.magicFlag2 = value;
                      updateMagicMax();
                      changed();
                    }}
                  />
                  <span>Flag 2</span>
                </label>
              </div>
            </Field>
            <Field label="Rupees">
              <NumberInput
                value={slot.rupees}
                disabled={readOnly}
                min={0}
                max={500}
                onChange={(value) => {
                  slot.rupees = value;
                  changed();
                }}
              />
            </Field>
          </Section>

          <Section title="Location & Progress">
            <Field label="Biggoron Flag 1">
              <BooleanCheckbox
                value={slot.biggoronsSwordFlag1}
                disabled={readOnly}
                onChange={(value) => {
                  slot.biggoronsSwordFlag1 = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Biggoron Flag 2">
              <BooleanCheckbox
                value={slot.biggoronsSwordFlag2}
                disabled={readOnly}
                onChange={(value) => {
                  slot.biggoronsSwordFlag2 = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Saved Scene">
              <EnumSelect
                enumObject={Scene}
                value={slot.savedSceneIndex}
                disabled={readOnly}
                keyPrefix={`slot-${index}-saved-scene-`}
                onChange={(value) => {
                  slot.savedSceneIndex = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Location">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <EnumSelect
                  keyPrefix={`slot-${index}-room-`}
                  enumObject={Room}
                  value={slot.room}
                  disabled={readOnly}
                  onChange={(value) => setRoom(value)}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-entrance-`}
                  enumObject={Entrance}
                  value={slot.entrance}
                  disabled={readOnly}
                  options={ValidEntrancesForRoom(slot.room)}
                  onChange={(value) => setEntrance(value)}
                />
              </div>
            </Field>
            <Field label="Magic Beans">
              <NumberInput
                value={slot.magicBeans}
                disabled={readOnly}
                min={0}
                max={0xFF}
                onChange={(value) => {
                  slot.magicBeans = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Gold Skulltula Tokens">
              <NumberInput
                value={slot.goldSkulltulaTokens}
                disabled={readOnly}
                min={0}
                max={99}
                onChange={(value) => {
                  slot.goldSkulltulaTokens = value;
                  changed();
                }}
              />
            </Field>
          </Section>

          <Section title="Equipment & Buttons" cols="grid grid-cols-1 gap-3">
            <Field label="Button Equips">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <EnumSelect
                  keyPrefix={`slot-${index}-b-button-equip-`}
                  enumObject={InventoryItems}
                  value={slot.bButtonEquip}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.bButtonEquip = value;
                    changed();
                  }}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-c-left-button-equip-`}
                  enumObject={InventoryItems}
                  value={slot.cLeftButtonEquip}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.cLeftButtonEquip = value;
                    changed();
                  }}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-c-down-button-equip-`}
                  enumObject={InventoryItems}
                  value={slot.cDownButtonEquip}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.cDownButtonEquip = value;
                    changed();
                  }}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-c-right-button-equip-`}
                  enumObject={InventoryItems}
                  value={slot.cRightButtonEquip}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.cRightButtonEquip = value;
                    changed();
                  }}
                />
              </div>
            </Field>
            <Field label="Equip Offsets">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <NumberInput
                  value={slot.currentButtonEquips.cLeftOffset}
                  disabled={readOnly}
                  min={0}
                  max={0xFF}
                  onChange={(value) => {
                    slot.currentButtonEquips = {
                      ...slot.currentButtonEquips,
                      cLeftOffset: value,
                    };
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.currentButtonEquips.cDownOffset}
                  disabled={readOnly}
                  min={0}
                  max={0xFF}
                  onChange={(value) => {
                    slot.currentButtonEquips = {
                      ...slot.currentButtonEquips,
                      cDownOffset: value,
                    };
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.currentButtonEquips.cRightOffset}
                  disabled={readOnly}
                  min={0}
                  max={0xFF}
                  onChange={(value) => {
                    slot.currentButtonEquips = {
                      ...slot.currentButtonEquips,
                      cRightOffset: value,
                    };
                    changed();
                  }}
                />
              </div>
            </Field>
            <Field label="Currently Equipped">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <EnumSelect
                  keyPrefix={`slot-${index}-currently-equipped-sword-`}
                  enumObject={Sword}
                  value={slot.currentlyEquippedEquipment.sword}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.currentlyEquippedEquipment = {
                      ...slot.currentlyEquippedEquipment,
                      sword: value,
                    };
                    changed();
                  }}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-currently-equipped-shield-`}
                  enumObject={Shield}
                  value={slot.currentlyEquippedEquipment.shield}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.currentlyEquippedEquipment = {
                      ...slot.currentlyEquippedEquipment,
                      shield: value,
                    };
                    changed();
                  }}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-currently-equipped-tunic-`}
                  enumObject={Tunic}
                  value={slot.currentlyEquippedEquipment.tunic}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.currentlyEquippedEquipment = {
                      ...slot.currentlyEquippedEquipment,
                      tunic: value,
                    };
                    changed();
                  }}
                />
                <EnumSelect
                  keyPrefix={`slot-${index}-currently-equipped-boots-`}
                  enumObject={Boots}
                  value={slot.currentlyEquippedEquipment.boots}
                  disabled={readOnly}
                  onChange={(value) => {
                    slot.currentlyEquippedEquipment = {
                      ...slot.currentlyEquippedEquipment,
                      boots: value,
                    };
                    changed();
                  }}
                />
              </div>
            </Field>
          </Section>

          <Section title="Inventory" cols="grid grid-cols-1 gap-3">
            <Field label="Inventory">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {slot.inventory.map((item, inventoryIndex) => (
                  <div key={`slot-${index}-inventory-${inventoryIndex}`}>
                    <span className="mb-1 block text-xs text-slate-600">
                      Slot {inventoryIndex + 1}
                    </span>
                    <EnumSelect
                      keyPrefix={`slot-${index}-inventory-${inventoryIndex}-`}
                      enumObject={InventoryItems}
                      value={item}
                      disabled={readOnly}
                      onChange={(value) => {
                        const inventory = [...slot.inventory];
                        inventory[inventoryIndex] = value;
                        slot.inventory = inventory;
                        changed();
                      }}
                    />
                  </div>
                ))}
              </div>
            </Field>
            <Field label="Inventory Amounts">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {slot.inventoryAmounts.map((amount, amountIndex) => (
                  <div key={`slot-${index}-inventory-amount-${amountIndex}`}>
                    <span className="mb-1 block text-xs text-slate-600">
                      Amount {amountIndex + 1}
                    </span>
                    <NumberInput
                      value={amount}
                      disabled={readOnly}
                      min={0}
                      max={0xFF}
                      onChange={(value) => {
                        const amounts = [...slot.inventoryAmounts];
                        amounts[amountIndex] = value;
                        slot.inventoryAmounts = amounts;
                        changed();
                      }}
                    />
                  </div>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Collected & Upgrades" cols="grid grid-cols-1 gap-3">
            <Field label="Obtained Equipment">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {equipmentOptions.map((item) => (
                  <label
                    key={`slot-${index}-equipment-${item}`}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <BooleanCheckbox
                      value={slot.obtainedEquipment.includes(item)}
                      disabled={readOnly}
                      onChange={(checked) => {
                        slot.obtainedEquipment = toggleArrayValue(
                          slot.obtainedEquipment,
                          item,
                          checked,
                        );
                        changed();
                      }}
                    />
                    <span>{equipmentLabel(item)}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Obtained Upgrades">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {upgradeOptions.map((item) => (
                  <label
                    key={`slot-${index}-upgrade-${item}`}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <BooleanCheckbox
                      value={slot.obtainedUpgrades.includes(item)}
                      disabled={readOnly}
                      onChange={(checked) => {
                        slot.obtainedUpgrades = toggleArrayValue(
                          slot.obtainedUpgrades,
                          item,
                          checked,
                        );
                        changed();
                      }}
                    />
                    <span>{upgradeLabel(item)}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Quest Items">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {questItemOptions.map((item) => (
                  <label
                    key={`slot-${index}-quest-item-${item}`}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <BooleanCheckbox
                      value={slot.questStatusItems.includes(item)}
                      disabled={readOnly}
                      onChange={(checked) => {
                        slot.questStatusItems = toggleArrayValue(
                          slot.questStatusItems,
                          item,
                          checked,
                        );
                        changed();
                      }}
                    />
                    <span>{questItemLabel(item)}</span>
                  </label>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Dungeon Status" cols="grid grid-cols-1 gap-3">
            <Field label="Dungeon Items">
              <div className="grid grid-cols-1 gap-3">
                {slot.dungeonItems.map((items, dungeonIndex) => (
                  <div
                    key={`slot-${index}-dungeon-items-${dungeonIndex}`}
                    className="rounded border border-slate-200 p-2"
                  >
                    <span className="mb-2 block text-xs font-semibold text-slate-600">
                      Dungeon {dungeonIndex + 1}
                    </span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {dungeonItemOptions.map((item) => (
                        <label
                          key={`slot-${index}-dungeon-${dungeonIndex}-${item}`}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          <BooleanCheckbox
                            value={items.includes(item)}
                            disabled={readOnly}
                            onChange={(checked) => {
                              const dungeonItems = [...slot.dungeonItems];
                              dungeonItems[dungeonIndex] = toggleArrayValue(
                                dungeonItems[dungeonIndex],
                                item,
                                checked,
                              );
                              slot.dungeonItems = dungeonItems;
                              changed();
                            }}
                          />
                          <span>{enumLabel(DungeonItems, item)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Field>
            <Field label="Small Keys">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {slot.smallKeyAmount.map((value, dungeonIndex) => (
                  <div key={`slot-${index}-small-key-${dungeonIndex}`}>
                    <span className="mb-1 block text-xs text-slate-600">
                      Dungeon {dungeonIndex + 1}
                    </span>
                    <NumberInput
                      value={value}
                      disabled={readOnly}
                      min={0}
                      max={0xFF}
                      onChange={(next) => {
                        const keys = [...slot.smallKeyAmount];
                        keys[dungeonIndex] = next;
                        slot.smallKeyAmount = keys;
                        changed();
                      }}
                    />
                  </div>
                ))}
              </div>
            </Field>
          </Section>

          <Section
            title="Advanced"
            cols="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <Field label="Big Poe Points">
              <NumberInput
                value={slot.bigPoePoints}
                disabled={readOnly}
                min={0}
                max={0xFFFFFFFF}
                step={100}
                onChange={(value) => {
                  slot.bigPoePoints = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Farores Wind Warp">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <NumberInput
                  value={slot.faroresWindWarp.x}
                  disabled={readOnly}
                  min={0}
                  max={0xFFFFFFFF}
                  onChange={(value) => {
                    slot.faroresWindWarp = {
                      ...slot.faroresWindWarp,
                      x: value,
                    };
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.faroresWindWarp.y}
                  disabled={readOnly}
                  min={0}
                  max={0xFFFFFFFF}
                  onChange={(value) => {
                    slot.faroresWindWarp = {
                      ...slot.faroresWindWarp,
                      y: value,
                    };
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.faroresWindWarp.z}
                  disabled={readOnly}
                  min={0}
                  max={0xFFFFFFFF}
                  onChange={(value) => {
                    slot.faroresWindWarp = {
                      ...slot.faroresWindWarp,
                      z: value,
                    };
                    changed();
                  }}
                />
                <NumberInput
                  value={slot.faroresWindWarp.yRotation}
                  disabled={readOnly}
                  min={0}
                  max={0xFFFF}
                  onChange={(value) => {
                    slot.faroresWindWarp = {
                      ...slot.faroresWindWarp,
                      yRotation: value,
                    };
                    changed();
                  }}
                />
              </div>
            </Field>
            <Field label="Transport Scene">
              <EnumSelect
                enumObject={Scene}
                value={slot.entranceIndexTransport}
                disabled={readOnly}
                keyPrefix={`slot-${index}-transport-scene-`}
                onChange={(value) => {
                  slot.entranceIndexTransport = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Map #">
              <NumberInput
                value={slot.mapNumber}
                disabled={readOnly}
                min={0}
                max={0xFF}
                onChange={(value) => {
                  slot.mapNumber = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Warp Point Set">
              <BooleanCheckbox
                value={slot.warpPointSet}
                disabled={readOnly}
                onChange={(value) => {
                  slot.warpPointSet = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Checksum">
              <NumberInput
                value={slot.checksum}
                disabled={readOnly}
                min={0}
                max={0xFFFF}
                onChange={(value) => {
                  slot.checksum = value;
                  changed();
                }}
              />
            </Field>
            <Field label="File Index">
              <NumberInput
                value={slot.fileIndex}
                disabled={readOnly}
                min={0}
                max={0xFFFFFFFF}
                onChange={(value) => {
                  slot.fileIndex = value;
                  changed();
                }}
              />
            </Field>
            <Field label="Valid">
              <BooleanCheckbox value={slot.isValid} disabled />
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
                      key={`slot-${index}-event-flag-${flag.name}`}
                    >
                      <BooleanCheckbox
                        value={flag.value}
                        disabled={readOnly}
                        onChange={(value) => {
                          (slot.eventFlags as unknown as Record<
                            string,
                            unknown
                          >)[
                            flag.name
                          ] = value;
                          changed();
                        }}
                      />
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
                      key={`slot-${index}-item-flag-${flag.name}`}
                    >
                      <BooleanCheckbox
                        value={flag.value}
                        disabled={readOnly}
                        onChange={(value) => {
                          (slot.itemFlags as unknown as Record<
                            string,
                            unknown
                          >)[
                            flag.name
                          ] = value;
                          changed();
                        }}
                      />
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
                      key={`slot-${index}-other-flag-${flag.name}`}
                    >
                      <BooleanCheckbox
                        value={flag.value}
                        disabled={readOnly}
                        onChange={(value) => {
                          (slot.otherFlags as unknown as Record<
                            string,
                            unknown
                          >)[
                            flag.name
                          ] = value;
                          changed();
                        }}
                      />
                      <span>{formatFlagName(flag.name)}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/80 p-3">
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Permanent Scene Flags
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Scene
                      </label>
                      <select
                        value={String(activePermanentScene)}
                        onChange={(event) =>
                          setSelectedPermanentScene(
                            Math.min(
                              Math.max(Number(event.currentTarget.value), 0),
                              permanentSceneCount - 1,
                            ),
                          )}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1"
                      >
                        {permanentSceneOptions.map((scene) => (
                          <option
                            key={`slot-${index}-permanent-scene-${scene}`}
                            value={String(scene)}
                          >
                            Scene {scene}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Group
                      </label>
                      <select
                        value={selectedPermanentGroup}
                        onChange={(event) =>
                          setSelectedPermanentGroup(
                            event.currentTarget
                              .value as PermanentSceneFlagGroupKey,
                          )}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1"
                      >
                        {permanentSceneFlagGroups.map((group) => (
                          <option
                            key={`slot-${index}-permanent-group-${group.key}`}
                            value={group.key}
                          >
                            {group.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {permanentSceneFlagGroups.map((group) => (
                      <div
                        className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        key={`slot-${index}-permanent-summary-${group.key}`}
                      >
                        {group.label}: {countSetPermanentSceneFlags(
                          activePermanentSceneFlags,
                          group.key,
                        )} / 32
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-8">
                    {permanentSceneFlagBits.map((bit) => (
                      <label
                        className="inline-flex items-center gap-2 rounded border border-slate-200 px-2 py-1 text-xs"
                        key={`slot-${index}-scene-${activePermanentScene}-${selectedPermanentGroup}-${bit}`}
                      >
                        <BooleanCheckbox
                          value={activePermanentSceneFlags[
                            selectedPermanentGroup
                          ]
                            .getFlag(bit)}
                          disabled={readOnly}
                          onChange={(value) =>
                            setPermanentSceneFlag(
                              activePermanentScene,
                              selectedPermanentGroup,
                              bit,
                              value,
                            )}
                        />
                        <span>{bit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
