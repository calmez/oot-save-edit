import type { ComponentChildren } from "preact";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../../../models/saveheader.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import { FileFormat, FileUtil } from "../../../utils/fileutil.ts";
import { DownloadButton } from "../islands/DownloadButton.tsx";
import Slot from "../islands/Slot.tsx";

interface SaveProps {
  filename: string;
  save: Uint8Array;
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

interface FieldProps {
  label: string;
  children: ComponentChildren;
  className?: string;
}

function Field(props: FieldProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white/80 p-3 ${
        props.className ?? ""
      }`}
    >
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {props.label}
      </span>
      <div className="mt-1 tabular-nums break-words text-slate-900">
        {props.children}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ComponentChildren;
  cols?: string;
}

function Section(props: SectionProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold tracking-wide text-slate-700">
        {props.title}
      </h3>
      <div className={props.cols ?? "grid grid-cols-1 gap-3 md:grid-cols-3"}>
        {props.children}
      </div>
    </section>
  );
}

export default function Save(props: SaveProps) {
  const saveFile = FileUtil.loadFileFromBuffer(props.save);
  const detectedFormat = FileUtil.detectFileFormatByBufferSize(props.save);

  return (
    <div class="mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4">
      <div className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">
            Save File Details
          </h2>
          <DownloadButton
            saveData={saveFile.getDataForWrite()}
            filename={props.filename}
            title="Save"
          />
        </div>

        <div className="space-y-4">
          <Section title="File Info">
            <Field label="Filename">{props.filename}</Field>
            <Field label="Word Swapped">
              <BooleanCheckbox value={saveFile.isByteSwapped} />
            </Field>
            <Field label="File Format">{FileFormat[detectedFormat]}</Field>
            <Field label="Data Size">{saveFile.data.byteLength}</Field>
            <Field label="Header Valid">
              <BooleanCheckbox value={saveFile.header.isValid} />
            </Field>
          </Section>

          <Section title="Save Options">
            <Field label="Output Filename">{props.filename}</Field>
            <Field label="Swap Words">
              <BooleanCheckbox value={saveFile.isByteSwapped} />
            </Field>
            <Field label="File Format">{FileFormat[detectedFormat]}</Field>
          </Section>

          <Section title="General Info">
            <Field label="Language">
              {LanguageOption[saveFile.header.languageOption]}
            </Field>
            <Field label="Z-Target">
              {ZTargetOption[saveFile.header.zTargetOption]}
            </Field>
            <Field label="Sound">
              {SoundOption[saveFile.header.soundOption]}
            </Field>
          </Section>
        </div>

        <div className="my-6 border-t border-slate-200" />

        <div className="space-y-4">
          {saveFile.slots.map((slot: SaveSlot, idx: number) => (
            <Slot
              key={`save-slot-${idx}`}
              slotData={slot.data}
              index={idx}
            />
          ))}
        </div>

        <div className="my-6 border-t border-slate-200" />

        <details className="space-y-4">
          <summary className="cursor-pointer text-lg font-semibold text-slate-900">
            Backup Slots
          </summary>
          <div className="mt-4 space-y-4">
            {saveFile.backups.map((slot: SaveSlot, idx: number) => (
              <Slot
                key={`backup-slot-${idx}`}
                slotData={slot.data}
                index={idx + saveFile.slots.length}
              />
            ))}
          </div>
        </details>
      </div>

      <a href="/" class="underline">Go back</a>
    </div>
  );
}
