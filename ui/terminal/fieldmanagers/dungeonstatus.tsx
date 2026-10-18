import { sceneLabel } from "../../labels.ts";
import React, { useState } from "react";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { DungeonItems, SaveSlot } from "../../../models/saveslot.ts";

export interface DungeonStatusData {
  items: DungeonItems[][];
  smallKeys: number[];
}

type FormFieldDungeon = AbstractFormField<
  "dungeonstatus",
  DungeonStatusData
>;

const dungeonOptions: DungeonItems[] = Object.values(DungeonItems)
  .filter((v): v is number => typeof v === "number")
  .map((v) => v as DungeonItems);

const DUNGEON_COUNT = 20;

const DungeonField: React.FC<
  SpecificFormFieldRendererProps<FormFieldDungeon>
> = (props: SpecificFormFieldRendererProps<FormFieldDungeon>) => {
  const items = props.value?.items ?? Array.from(
    { length: DUNGEON_COUNT },
    () => [] as DungeonItems[],
  );
  const smallKeys = props.value?.smallKeys ??
    new Array(SaveSlot.smallKeyCount).fill(0xFF);

  const totalRows = DUNGEON_COUNT;
  const colsPerRow = 4;
  const [cursor, setCursor] = useState(0);
  const row = Math.floor(cursor / colsPerRow);
  const col = cursor % colsPerRow;

  useInput((input, key) => {
    if (key.upArrow) {
      const next = Math.max(0, cursor - colsPerRow);
      setCursor(next);
    }
    if (key.downArrow) {
      const next = Math.min(totalRows * colsPerRow - 1, cursor + colsPerRow);
      setCursor(next);
    }
    if (key.leftArrow) {
      const next = Math.max(0, cursor - 1);
      if (Math.floor(next / colsPerRow) === row || next < 0) {
        setCursor(next);
      } else {
        setCursor(row * colsPerRow);
      }
    }
    if (key.rightArrow) {
      const next = Math.min(totalRows * colsPerRow - 1, cursor + 1);
      if (
        Math.floor(next / colsPerRow) === row || next >= totalRows * colsPerRow
      ) {
        setCursor(next);
      } else {
        setCursor((row + 1) * colsPerRow - 1);
      }
    }
    if (input === " " && col < 3) {
      const dungeonItem = dungeonOptions[col];
      const currentItems = items[row];
      const hasItem = currentItems.includes(dungeonItem);
      const newItems = [...items];
      newItems[row] = hasItem
        ? currentItems.filter((di: DungeonItems) => di !== dungeonItem)
        : [...currentItems, dungeonItem];
      props.onChange({ items: newItems, smallKeys });
    }
  }, { isActive: true });

  function setKey(rowIdx: number, value: number) {
    if (rowIdx >= SaveSlot.smallKeyCount) return;
    const newKeys = [...smallKeys];
    newKeys[rowIdx] = Math.max(0, Math.min(255, value));
    props.onChange({ items, smallKeys: newKeys });
  }

  return (
    <Box flexDirection="column" width="100">
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        <Text>Dungeon Boss key Compass Map Keys</Text>
        {items.slice(Math.floor(row / 8) * 8, Math.floor(row / 8) * 8 + 8).map(
          (dungeonItems: DungeonItems[], i: number) => {
            const di = Math.floor(row / 8) * 8 + i;
            const isRow = cursor >= di * 4 && cursor < di * 4 + 4;
            return (
              <Box key={`dungeon-${di}`}>
                <Box width={18}>
                  <Text inverse={isRow}>
                    {sceneLabel(di)}
                  </Text>
                </Box>
                {[0, 1, 2].map((ci: number) => {
                  const hasItem = dungeonItems.includes(dungeonOptions[ci]);
                  const isCursor = cursor === di * 4 + ci;
                  return (
                    <Box key={`di-${di}-${ci}`} width={ci === 0 ? 10 : 8}>
                      <Text inverse={isCursor}>
                        {hasItem ? "X" : "-"}
                      </Text>
                    </Box>
                  );
                })}
                <Box width={8}>
                  {di >= SaveSlot.smallKeyCount
                    ? <Text>—</Text>
                    : cursor === di * 4 + 3
                    ? (
                      <TextInput
                        value={String(smallKeys[di])}
                        onChange={(v: string) => {
                          const n = parseInt(v);
                          if (!isNaN(n)) setKey(di, n);
                        }}
                      />
                    )
                    : <Text>{String(smallKeys[di])}</Text>}
                </Box>
              </Box>
            );
          },
        )}
      </Box>
    </Box>
  );
};

export const DungeonStatusFormFieldManager = {
  type: "dungeonstatus",
  renderValue: (
    props: SpecificFormFieldRendererProps<FormFieldDungeon>,
  ) => {
    const items = props.value?.items ?? [];
    const total = items.reduce(
      (sum: number, di: DungeonItems[]) => sum + di.length,
      0,
    );
    return <Text>{total} dungeon items</Text>;
  },
  renderField: DungeonField,
} as FormFieldManager<FormFieldDungeon>;
