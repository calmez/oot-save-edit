import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import React, { useState } from "react";

import type { ChecksumPolicy, SraSaveFile } from "../../models/savefile.ts";
import {
  copySlot,
  getSlot,
  resetSlotToNewGame,
  slotCount,
  slotLabel,
} from "../../utils/saveeditor.ts";

import type { CorrectionReview } from "../correctionreview.ts";
import SkulltulaEditor from "./skulltulas.tsx";
import ReviewCorrections from "./correctionreview.tsx";

interface SaveManagementProps {
  review: CorrectionReview;
  save: SraSaveFile;
  onChange: (policy?: ChecksumPolicy) => void;
  onClose: () => void;
}

export default function SaveManagement(
  { save, review, onChange, onClose }: SaveManagementProps,
) {
  const [stage, setStage] = useState("actions");
  const [source, setSource] = useState(0);
  const [target, setTarget] = useState(0);
  const [message, setMessage] = useState("");
  useInput((_input, key) => {
    if (key.escape && stage !== "review") onClose();
  });
  function openReview(
    filter?: Parameters<CorrectionReview["open"]>[0],
    recoveryFilter?: Parameters<CorrectionReview["open"]>[1],
  ) {
    review.open(filter, recoveryFilter);
    setStage("review");
  }
  if (stage === "skull-editor") {
    return (
      <SkulltulaEditor
        save={save}
        target={target}
        onChange={onChange}
        onClose={() => setStage("actions")}
      />
    );
  }
  if (stage === "review") {
    return (
      <ReviewCorrections
        review={review}
        onCancel={() => setStage("actions")}
        onConfirm={() => {
          onChange(review.checksumPolicy);
          setStage("actions");
          setMessage(
            "Reviewed corrections confirmed. Accepted correction history is available in review.",
          );
        }}
      />
    );
  }
  const slots = Array.from(
    { length: slotCount },
    (_, value) => ({
      label: `${slotLabel(value)}${
        getSlot(save, value).isEmpty ? " (empty slot)" : ""
      }`,
      value: String(value),
    }),
  );
  const actions = [
    { label: "Skulltula reconciliation", value: "skull-slot" },
    { label: "Review suggested corrections", value: "review-all" },
    { label: "Repair header", value: "header" },
    { label: "Repair all slots and header", value: "repair-all" },
    { label: "Repair one slot", value: "repair" },
    { label: "Copy or restore a slot", value: "source" },
    { label: "Synchronize all backups from primary slots", value: "sync" },
    { label: "Create or reset a new-game slot", value: "reset" },
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
          : stage === "confirm-empty-copy"
          ? `${
            slotLabel(source)
          } is empty. This replaces initialized progress in ${
            slotLabel(target)
          }. Confirm?`
          : stage === "repair" || stage === "reset"
          ? "Choose slot:"
          : "Choose action:"}
      </Text>
      <Box key={stage}>
        <SelectInput
          items={stage === "actions"
            ? actions
            : stage === "confirm-empty-copy"
            ? [
              { label: "Confirm empty record copy", value: "confirm" },
              { label: "Cancel", value: "cancel" },
            ]
            : slots}
          onSelect={({ value }) => {
            if (stage === "actions") {
              if (value === "close") return onClose();
              if (value === "review-all" || value === "repair-all") {
                openReview();
                return;
              }
              if (value === "header") {
                openReview(
                  (item) => item.scope.kind === "header",
                  () => false,
                );
                return;
              }
              if (value === "sync") {
                openReview(
                  () => false,
                  (item) => item.action === "synchronize",
                );
                review.recoverySuggestions
                  .forEach((item) => review.toggle(item.id));
                return;
              } else {
                setStage(value);
                return;
              }
            } else if (stage === "skull-slot") {
              setTarget(Number(value));
              setStage("skull-editor");
              return;
            } else if (stage === "source") {
              setSource(Number(value));
              setStage("target");
              return;
            } else if (stage === "target") {
              const destination = Number(value);
              if (
                getSlot(save, source).isEmpty &&
                !getSlot(save, destination).isEmpty
              ) {
                setTarget(destination);
                setStage("confirm-empty-copy");
                return;
              }
              copySlot(save, source, destination);
            } else if (stage === "confirm-empty-copy") {
              if (value === "confirm") {
                copySlot(save, source, target);
                onChange();
                setMessage(
                  `Copied empty ${slotLabel(source)} to ${slotLabel(target)}.`,
                );
              }
              setStage("actions");
              return;
            } else if (stage === "repair") {
              const target = Number(value);
              const record = target < 3 ? "primary" : "backup";
              openReview((item) =>
                item.scope.kind === "slot" && item.scope.index === target % 3 &&
                item.scope.record === record, (item) =>
                item.index === target % 3 &&
                (item.source === record || item.destination === record));
              return;
            } else if (stage === "reset") {
              resetSlotToNewGame(save, Number(value));
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
      <Text dimColor>
        Creating or resetting changes only the selected record. Synchronize its
        backup separately if wanted.
      </Text>
    </Box>
  );
}
