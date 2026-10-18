import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import type { SraSaveFile } from "../../models/savefile.ts";
import {
  copySlot,
  getSlot,
  repairSave,
  resetSlot,
  slotCount,
  slotLabel,
} from "../../utils/saveeditor.ts";

interface SaveManagementProps {
  save: SraSaveFile;
  onChange: () => void;
  onClose: () => void;
}

export default function SaveManagement(
  { save, onChange, onClose }: SaveManagementProps,
) {
  const [stage, setStage] = useState("actions");
  const [source, setSource] = useState(0);
  const [message, setMessage] = useState("");
  useInput((_input, key) => {
    if (key.escape) onClose();
  });
  const slots = Array.from(
    { length: slotCount },
    (_, value) => ({ label: slotLabel(value), value: String(value) }),
  );
  const actions = [
    { label: "Repair header", value: "header" },
    { label: "Repair all slots and header", value: "repair-all" },
    { label: "Repair one slot", value: "repair" },
    { label: "Copy or restore a slot", value: "source" },
    { label: "Synchronize all backups from primary slots", value: "sync" },
    { label: "Reset a slot to a new game", value: "reset" },
    { label: "Return to editor", value: "close" },
  ];
  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>Save management</Text>
      <Text>
        {stage === "source"
          ? "Copy from:"
          : stage === "target"
          ? `Copy ${slotLabel(source)} to:`
          : stage === "repair" || stage === "reset"
          ? "Choose slot:"
          : "Choose action:"}
      </Text>
      <Box key={stage}>
        <SelectInput
          items={stage === "actions" ? actions : slots}
          onSelect={({ value }) => {
            if (stage === "actions") {
              if (value === "close") return onClose();
              if (value === "header") save.header.makeValid();
              else if (value === "repair-all") repairSave(save);
              else if (value === "sync") {
                for (let i = 0; i < 3; i++) {
                  copySlot(save, i, i + 3);
                }
              } else {
                setStage(value);
                return;
              }
            } else if (stage === "source") {
              setSource(Number(value));
              setStage("target");
              return;
            } else if (stage === "target") {
              copySlot(
                save,
                source,
                Number(value),
              );
            } else if (stage === "repair") {
              getSlot(save, Number(value))
                .makeValid();
            } else if (stage === "reset") {
              resetSlot(save, Number(value));
            }
            onChange();
            setStage("actions");
            setMessage(
              "Updated. Save the file from the editor to write these changes.",
            );
          }}
        />
      </Box>
      {message && <Text color="green">{message}</Text>}
      <Text dimColor>Escape returns to the editor.</Text>
    </Box>
  );
}
