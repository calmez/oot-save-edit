import { useState } from "preact/hooks";
import type { SraSaveFile } from "../../../models/savefile.ts";
import {
  copySlot,
  getSlot,
  repairSave,
  resetSlotToNewGame,
  slotCount,
  slotLabel,
} from "../../../utils/saveeditor.ts";
import { Button } from "./Button.tsx";
import { Field } from "./Field.tsx";
import { Section } from "./Section.tsx";

export default function SaveManagement(
  props: { save: SraSaveFile; onChange: () => void },
) {
  const [source, setSource] = useState(0);
  const [target, setTarget] = useState(3);
  const [message, setMessage] = useState("");
  const options = Array.from(
    { length: slotCount },
    (_, index) => <option key={index} value={index}>{slotLabel(index)}</option>,
  );
  function perform(action: () => void, message: string) {
    action();
    props.onChange();
    setMessage(message);
  }
  return (
    <Section title="Save management">
      <Field label="Copy from">
        <select
          aria-label="Copy from"
          value={source}
          onChange={(event) => setSource(Number(event.currentTarget.value))}
        >
          {options}
        </select>
      </Field>
      <Field label="Destination / slot to repair or reset">
        <select
          aria-label="Destination slot"
          value={target}
          onChange={(event) => setTarget(Number(event.currentTarget.value))}
        >
          {options}
        </select>
      </Field>
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button
          type="button"
          disabled={source === target}
          onClick={() =>
            perform(
              () => copySlot(props.save, source, target),
              `Copied ${slotLabel(source)} to ${slotLabel(target)}.`,
            )}
        >
          Copy / restore slot
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(() => {
              for (let i = 0; i < 3; i++) copySlot(props.save, i, i + 3);
            }, "Backups synchronized.")}
        >
          Synchronize backups
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(() => props.save.header.makeValid(), "Header repaired.")}
        >
          Repair header
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(
              () => getSlot(props.save, target).makeValid(),
              `${slotLabel(target)} repaired.`,
            )}
        >
          Repair selected slot
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(
              () => repairSave(props.save),
              "Header and all slots repaired.",
            )}
        >
          Repair all
        </Button>
        <Button
          type="button"
          onClick={() =>
            perform(
              () => resetSlotToNewGame(props.save, target),
              `${slotLabel(target)} reset to a new game.`,
            )}
        >
          Reset selected slot to a new game
        </Button>
      </div>
      <p className="text-sm text-slate-600 md:col-span-2">
        Resetting creates a new-game slot in the selected record only. Its
        paired primary or backup is unchanged.
      </p>
      {message && (
        <p role="status">{message} Download the save to keep your changes.</p>
      )}
    </Section>
  );
}
