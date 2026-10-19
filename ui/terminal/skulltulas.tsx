import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";
import React, { useState } from "react";

import type { ChecksumPolicy, SraSaveFile } from "../../models/savefile.ts";
import {
  readSkulltulaLocations,
  skulltulaLocations,
} from "../../models/skulltulas.ts";
import type { SkulltulaIntent } from "../../models/skulltulas.ts";
import { getSlot, slotLabel } from "../../utils/saveeditor.ts";
import { CorrectionReview } from "../correctionreview.ts";
import ReviewCorrections from "./correctionreview.tsx";

interface SkulltulaEditorProps {
  save: SraSaveFile;
  target: number;
  onChange: (policy?: ChecksumPolicy) => void;
  onClose: () => void;
}

export default function SkulltulaEditor(
  { save, target, onChange, onClose }: SkulltulaEditorProps,
) {
  const [review] = useState(() => new CorrectionReview(save));
  const [stage, setStage] = useState("locations");
  const [total, setTotal] = useState("");
  const [error, setError] = useState("");
  const slot = getSlot(save, target);
  const locations = readSkulltulaLocations(slot);
  useInput((_input, key) => {
    if (key.escape && stage !== "review") {
      if (stage === "total") setStage("locations");
      else onClose();
    }
  });
  function request(intent: SkulltulaIntent) {
    try {
      review.stageSkulltula(intent);
      setStage("review");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }
  if (stage === "review") {
    return (
      <ReviewCorrections
        review={review}
        onCancel={() => setStage("locations")}
        onConfirm={() => {
          onChange(review.checksumPolicy);
          setStage("locations");
        }}
      />
    );
  }
  const record = target < 3 ? "primary" : "backup";
  const index = target % 3;
  return (
    <Box flexDirection="column">
      <Text bold>Skulltula reconciliation: {slotLabel(target)}</Text>
      <Text>
        Original N64 mapping; exact ROM/platform unverified. Partial coverage: 3
        of 100 locations. Other bits remain unchanged. No absolute total is
        recommended.
      </Text>
      <Text>
        Stored total:{" "}
        {slot.goldSkulltulaTokens}. Review before applying. Cancel discards the
        request; declining adjustments retains dependent fields. No
        indicator-clearing rule at zero.
      </Text>
      {stage === "total"
        ? (
          <Box>
            <Text>Requested total (0–100):</Text>
            <TextInput
              value={total}
              onChange={setTotal}
              onSubmit={() => {
                if (total.trim() === "") {
                  setError("Enter a requested total from 0 to 100.");
                  return;
                }
                request({ kind: "total", record, index, total: Number(total) });
              }}
            />
          </Box>
        )
        : (
          <SelectInput
            items={[
              ...skulltulaLocations.map((location) => ({
                label: `[${
                  locations[location.id] ? "x" : " "
                }] ${location.label}`,
                value: location.id,
              })),
              {
                label: "Request a token total (preserve all locations)",
                value: "total",
              },
              { label: "Return to save management", value: "close" },
            ]}
            onSelect={({ value }) => {
              if (value === "close") onClose();
              else if (value === "total") {
                setTotal("");
                setStage("total");
              } else {
                const location = skulltulaLocations.find((item) =>
                  item.id === value
                )!;
                request({
                  kind: "locations",
                  record,
                  index,
                  locations: { [location.id]: !locations[location.id] },
                });
              }
            }}
          />
        )}
      {error && <Text color="red">{error}</Text>}
      <Text>Escape cancels.</Text>
    </Box>
  );
}
