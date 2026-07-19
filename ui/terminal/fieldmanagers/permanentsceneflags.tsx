import React, { useState } from "react";
import {
  AbstractFormField,
  FormFieldManager,
  SpecificFormFieldRendererProps,
} from "ink-form";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import { SaveSlot } from "../../../models/saveslot.ts";
import type { PermanentSceneFlags } from "../../../models/permanentsceneflags.ts";

export interface PermanentSceneFlagsData {
  version: number;
}

type FormFieldPermScene =
  & AbstractFormField<
    "permanentsceneflags",
    PermanentSceneFlagsData
  >
  & {
    saveSlot: SaveSlot;
  };

const SCENE_COUNT = 101;

const flagGroups: Array<{
  key: keyof PermanentSceneFlags;
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

const sceneOptions: Array<{ label: string; value: number }> = Array.from(
  { length: SCENE_COUNT },
  (_, i) => ({ label: `Scene ${i}`, value: i }),
);

const bitOptions = Array.from({ length: 32 }, (_, i) => i);

const PermanentSceneFlagsField: React.FC<
  SpecificFormFieldRendererProps<FormFieldPermScene>
> = (props: SpecificFormFieldRendererProps<FormFieldPermScene>) => {
  const saveSlot: SaveSlot = props.field.saveSlot;
  const allFlags = saveSlot.permanentSceneFlags;

  const [sceneIndex, setSceneIndex] = useState(0);
  const [groupCursor, setGroupCursor] = useState(0);
  const [bitCursor, setBitCursor] = useState(0);
  const [mode, setMode] = useState<"scene" | "group" | "bits">("scene");

  const activeScene = allFlags[Math.min(sceneIndex, SCENE_COUNT - 1)];
  const activeGroup = activeScene[flagGroups[groupCursor].key];

  function changed() {
    props.onChange({ version: (props.value?.version ?? 0) + 1 });
  }

  function toggleBit(bit: number) {
    const newValue = !activeGroup.getFlag(bit);
    const newAllFlags = saveSlot.permanentSceneFlags;
    newAllFlags[Math.min(sceneIndex, SCENE_COUNT - 1)][
      flagGroups[groupCursor].key
    ].setFlag(bit, newValue);
    saveSlot.permanentSceneFlags = newAllFlags;
    changed();
  }

  function countSetForGroup(idx: number): number {
    let count = 0;
    const sg = allFlags[Math.min(sceneIndex, SCENE_COUNT - 1)][
      flagGroups[idx].key
    ];
    for (const bit of bitOptions) {
      if (sg.getFlag(bit)) count++;
    }
    return count;
  }

  function countSetActive(): number {
    let count = 0;
    for (const bit of bitOptions) {
      if (activeGroup.getFlag(bit)) count++;
    }
    return count;
  }

  useInput((input, key) => {
    if (key.backspace || key.delete) {
      if (mode === "group") setMode("scene");
      else if (mode === "bits") setMode("group");
      return;
    }
    if (mode === "group") {
      if (key.upArrow) setGroupCursor(Math.max(0, groupCursor - 1));
      if (key.downArrow) {
        setGroupCursor(Math.min(flagGroups.length - 1, groupCursor + 1));
      }
      if (key.return) {
        setMode("bits");
        setBitCursor(0);
      }
    }
    if (mode === "bits") {
      if (key.upArrow) {
        const next = bitCursor - 8;
        if (next >= 0) setBitCursor(next);
      }
      if (key.downArrow) {
        const next = bitCursor + 8;
        if (next < 32) setBitCursor(next);
      }
      if (key.leftArrow) setBitCursor(Math.max(0, bitCursor - 1));
      if (key.rightArrow) setBitCursor(Math.min(31, bitCursor + 1));
      if (input === " ") toggleBit(bitCursor);
    }
  }, { isActive: true });

  if (mode === "scene") {
    return (
      <Box flexDirection="column" width="100">
        <Box borderStyle="round" paddingX={1} flexDirection="column">
          <Text bold>Select Scene</Text>
          <SelectInput
            items={sceneOptions}
            onHighlight={(option: { label: string; value: number }) => {
              setSceneIndex(option.value);
            }}
            onSelect={(option: { label: string; value: number }) => {
              setSceneIndex(option.value);
              setMode("group");
            }}
            initialIndex={sceneIndex}
            limit={10}
          />
          <Text dimColor>Enter to select scene, escape to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (mode === "group") {
    return (
      <Box flexDirection="column" width="100">
        <Box borderStyle="round" paddingX={1} flexDirection="column">
          <Text bold>
            Scene {sceneIndex} - Select Group
          </Text>
          {flagGroups.map((
            group: { key: keyof PermanentSceneFlags; label: string },
            gi: number,
          ) => (
            <Box key={group.key}>
              <Text inverse={groupCursor === gi}>
                {groupCursor === gi ? "▶" : " "} {group.label} (
                {countSetForGroup(gi)}/32)
              </Text>
            </Box>
          ))}
          <Text dimColor>
            ↑↓ navigate, Enter to edit, backspace to go back
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100">
      <Box borderStyle="round" paddingX={1} flexDirection="column">
        <Text bold>
          Scene {sceneIndex} - {flagGroups[groupCursor].label} (
          {countSetActive()}/32)
        </Text>
        <Box>
          <Box flexDirection="column">
            {Array.from({ length: 4 }, (_, row) => (
              <Box key={`row-${row}`}>
                {Array.from({ length: 8 }, (_, col) => {
                  const bit = row * 8 + col;
                  const val = activeGroup.getFlag(bit);
                  return (
                    <Box key={`bit-${bit}`} width={3}>
                      <Text
                        backgroundColor={bitCursor === bit ? "blue" : undefined}
                        color={val ? "green" : "gray"}
                      >
                        {val ? "1" : "0"}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
        <Text dimColor>
          ←↑↓→ to navigate, space to toggle, backspace to go back
        </Text>
      </Box>
    </Box>
  );
};

export const PermanentSceneFlagsFormFieldManager = {
  type: "permanentsceneflags",
  needCtrlToReturnSave: true,
  renderValue: (
    props: SpecificFormFieldRendererProps<FormFieldPermScene>,
  ) => {
    const slot = props.field.saveSlot;
    const allFlags = slot.permanentSceneFlags;
    let total = 0;
    for (let si = 0; si < SCENE_COUNT; si++) {
      const scene = allFlags[si];
      for (const g of flagGroups) {
        for (let b = 0; b < 32; b++) {
          if (scene[g.key].getFlag(b)) total++;
        }
      }
    }
    return (
      <Text>{total} / {SCENE_COUNT * flagGroups.length * 32} flags set</Text>
    );
  },
  renderField: PermanentSceneFlagsField,
} as FormFieldManager<FormFieldPermScene>;
