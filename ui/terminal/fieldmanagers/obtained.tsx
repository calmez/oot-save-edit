import React, { useState } from "react";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { Box, Text, useInput } from "ink";
import {
  BombBag,
  Boots,
  BulletBag,
  DekuNutUpgrades,
  DekuStickUpgrades,
  DiveMeter,
  EquippableItems,
  Medallions,
  ObtainableUpgrades,
  QuestItems,
  Quiver,
  Shield,
  Songs,
  SpiritualStones,
  StrengthUpgrades,
  Sword,
  Tokens,
  Tunic,
  Wallet,
} from "../../../models/saveslot.ts";

export interface ObtainedData {
  equipment: EquippableItems[];
  upgrades: ObtainableUpgrades[];
  questItems: QuestItems[];
}

type FormFieldObtained = AbstractFormField<"obtained", ObtainedData>;

const equipmentOptions: number[] = Object.values({
  ...Sword,
  ...Shield,
  ...Tunic,
  ...Boots,
})
  .filter((v): v is number => typeof v === "number");

const upgradeOptions: number[] = Object.values({
  ...DekuNutUpgrades,
  ...DekuStickUpgrades,
  ...BulletBag,
  ...Wallet,
  ...DiveMeter,
  ...StrengthUpgrades,
  ...BombBag,
  ...Quiver,
})
  .filter((v): v is number => typeof v === "number");

const questItemOptions: number[] = Object.values({
  ...Medallions,
  ...Songs,
  ...SpiritualStones,
  ...Tokens,
})
  .filter((v): v is number => typeof v === "number");

function optionLabel(value: number): string {
  return EquippableItems[value as keyof typeof EquippableItems] as string ||
    ObtainableUpgrades[value as keyof typeof ObtainableUpgrades] as string ||
    QuestItems[value as keyof typeof QuestItems] as string ||
    `0x${value.toString(16)}`;
}

function toggleItem<T>(arr: T[], value: T): T[] {
  return arr.includes(value)
    ? arr.filter((item: T) => item !== value)
    : [...arr, value];
}

const ObtainedField: React.FC<
  SpecificFormFieldRendererProps<FormFieldObtained>
> = (props: SpecificFormFieldRendererProps<FormFieldObtained>) => {
  const equipment = props.value?.equipment ?? [];
  const upgrades = props.value?.upgrades ?? [];
  const questItems = props.value?.questItems ?? [];

  const eqCount = equipmentOptions.length;
  const upCount = upgradeOptions.length;
  const totalCount = eqCount + upCount + questItemOptions.length;

  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(Math.max(0, cursor - 1));
    }
    if (key.downArrow) {
      setCursor(Math.min(totalCount - 1, cursor + 1));
    }
    if (input === " ") {
      if (cursor < eqCount) {
        const opt = equipmentOptions[cursor] as EquippableItems;
        const newEq = toggleItem(equipment, opt);
        props.onChange({ equipment: newEq, upgrades, questItems });
      } else if (cursor < eqCount + upCount) {
        const opt = upgradeOptions[cursor - eqCount] as ObtainableUpgrades;
        const newUp = toggleItem(upgrades, opt);
        props.onChange({ equipment, upgrades: newUp, questItems });
      } else {
        const opt = questItemOptions[cursor - eqCount - upCount] as QuestItems;
        const newQi = toggleItem(questItems, opt);
        props.onChange({ equipment, upgrades, questItems: newQi });
      }
    }
  }, { isActive: true });

  function renderSection(
    label: string,
    allOptions: number[],
    selected: number[],
    offset: number,
  ) {
    return (
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        <Text bold>{label}</Text>
        {allOptions.map((opt: number, i: number) => {
          const idx = offset + i;
          const checked = selected.includes(opt);
          return (
            <Box key={`opt-${idx}`}>
              <Text inverse={cursor === idx}>
                {cursor === idx ? "▶" : " "} {checked ? "[X]" : "[ ]"}{" "}
                {optionLabel(opt)}
              </Text>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100">
      {renderSection("Equipment", equipmentOptions, equipment, 0)}
      {renderSection("Upgrades", upgradeOptions, upgrades, eqCount)}
      {renderSection(
        "Quest Items",
        questItemOptions,
        questItems,
        eqCount + upCount,
      )}
    </Box>
  );
};

export const ObtainedFormFieldManager = {
  type: "obtained",
  renderValue: (
    props: SpecificFormFieldRendererProps<FormFieldObtained>,
  ) => {
    const equipment = props.value?.equipment ?? [];
    const upgrades = props.value?.upgrades ?? [];
    const questItems = props.value?.questItems ?? [];
    return (
      <Text>
        {equipment.length} equipment, {upgrades.length} upgrades,{" "}
        {questItems.length} quest items
      </Text>
    );
  },
  renderField: ObtainedField,
} as FormFieldManager<FormFieldObtained>;
