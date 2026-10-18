import { useMemo, useState } from "preact/hooks";

import { ExportByteOrder } from "../../../models/savefile.ts";
import type { SraSaveFile } from "../../../models/savefile.ts";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../../../models/saveheader.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import { FileFormat, FileUtil } from "../../../utils/fileutil.ts";
import { exportByteOrderOptions } from "../../exportoptions.ts";
import { Field } from "../components/Field.tsx";
import SaveManagement from "../components/SaveManagement.tsx";
import { Section } from "../components/Section.tsx";
import { DownloadButton } from "./DownloadButton.tsx";
import Slot from "./Slot.tsx";

interface SaveEditorProps {
  filename: string;
  initialSaveData: Uint8Array;
  isByteSwapped: boolean;
  detectedFormat: FileFormat;
}

function BooleanCheckbox(props: {
  value: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
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

function enumValues<T extends number>(
  enumObject: Record<string, string | number>,
): T[] {
  return Object.values(enumObject)
    .filter((value): value is number => typeof value === "number")
    .map((value) => value as T);
}

function enumLabel(
  enumObject: Record<string, string | number>,
  value: number,
): string {
  const text = enumObject[value];
  return text ? String(text) : String(value);
}

function extensionFor(format: FileFormat): "sra" | "srm" {
  return format === FileFormat.SRA ? "sra" : "srm";
}

function createSaveFile(bytes: Uint8Array): SraSaveFile {
  return FileUtil.loadFileFromBuffer(bytes);
}

function ensureFilenameExtension(filename: string, format: FileFormat): string {
  const ext = extensionFor(format);
  const parts = filename.split(".");

  if (parts.length < 2) {
    return `${filename}.${ext}`;
  }

  parts[parts.length - 1] = ext;
  return parts.join(".");
}

export default function SaveEditor(props: SaveEditorProps) {
  const [saveFile, setSaveFile] = useState(() =>
    createSaveFile(props.initialSaveData)
  );
  const [outputFormat, setOutputFormat] = useState<FileFormat>(
    props.detectedFormat,
  );
  const [outputFilename, setOutputFilename] = useState<string>(() =>
    ensureFilenameExtension(props.filename, outputFormat)
  );
  const [byteOrder, setByteOrder] = useState(ExportByteOrder.Automatic);
  const [version, setVersion] = useState(0);

  const downloadData = useMemo(() => {
    return FileUtil.getFileData(saveFile, outputFormat, byteOrder);
  }, [saveFile, outputFormat, byteOrder, version]);

  function onFormatChange(value: FileFormat) {
    setOutputFormat(value);
    setOutputFilename((previous) => ensureFilenameExtension(previous, value));
  }

  function notifyChanged() {
    setSaveFile(saveFile);
    setVersion((current) => current + 1);
  }

  return (
    <div class="mx-auto flex max-w-5xl flex-col items-center justify-center px-4">
      <div className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">
            Save File Details
          </h2>
          <DownloadButton
            saveData={downloadData}
            filename={outputFilename}
            title="Save"
          />
        </div>

        <div className="space-y-4">
          <Section title="File Info">
            <Field label="Filename">{props.filename}</Field>
            <Field label="Data Size">{saveFile.data.byteLength}</Field>
            <Field label="Header Valid">
              <BooleanCheckbox value={saveFile.header.isValid} disabled />
            </Field>
            <Field label="Word Swapped">
              <BooleanCheckbox value={props.isByteSwapped} disabled />
            </Field>
            <Field label="File Format">
              {FileFormat[props.detectedFormat]}
            </Field>
          </Section>

          <Section title="Save Options">
            <Field label="Output Filename">
              <input
                type="text"
                value={outputFilename}
                onInput={(event) =>
                  setOutputFilename(event.currentTarget.value)}
                className="w-full rounded border border-slate-300 px-2 py-1"
              />
            </Field>
            <Field
              label="SRAM Byte Order"
              help="Automatic preserves source order for the same format; new files and conversions use the selected layout's default. Overrides apply only to SRAM."
            >
              <select
                aria-label="SRAM Byte Order"
                value={byteOrder}
                onChange={(event) =>
                  setByteOrder(event.currentTarget.value as ExportByteOrder)}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1"
              >
                {exportByteOrderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="File Format"
              help="SRA: raw SRAM, with big-endian as its layout default. SRM: the Mupen64Plus-Next layout on little-endian hosts, with word-swapped SRAM as its default. Other emulator layouts are unverified. Newly created SRM containers have provisional empty sections."
            >
              <select
                aria-label="File Format"
                value={String(outputFormat)}
                onChange={(event) =>
                  onFormatChange(
                    Number(event.currentTarget.value) as FileFormat,
                  )}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1"
              >
                {enumValues<FileFormat>(FileFormat).map((format) => (
                  <option key={format} value={String(format)}>
                    {enumLabel(FileFormat, format)}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="General Info">
            <Field
              label="Language"
              help="Sets the game language. Changing this affects save compatibility - choose the language matching your game cartridge / ROM."
            >
              <select
                value={String(saveFile.header.languageOption)}
                onChange={(event) => {
                  saveFile.header.languageOption = Number(
                    event.currentTarget.value,
                  ) as LanguageOption;
                  notifyChanged();
                }}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1"
              >
                {enumValues<LanguageOption>(LanguageOption).map((option) => (
                  <option key={option} value={String(option)}>
                    {enumLabel(LanguageOption, option)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Z-Target"
              help="Sets how targeting is handled: the Z button can either be held or toggled to target an enemy."
            >
              <select
                value={String(saveFile.header.zTargetOption)}
                onChange={(event) => {
                  saveFile.header.zTargetOption = Number(
                    event.currentTarget.value,
                  ) as ZTargetOption;
                  notifyChanged();
                }}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1"
              >
                {enumValues<ZTargetOption>(ZTargetOption).map((option) => (
                  <option key={option} value={String(option)}>
                    {enumLabel(ZTargetOption, option)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Sound"
              help="Keeps original sound settings. Changing this won't affect gameplay but preserves the sound layout of your original cartridge."
            >
              <select
                value={String(saveFile.header.soundOption)}
                onChange={(event) => {
                  saveFile.header.soundOption = Number(
                    event.currentTarget.value,
                  ) as SoundOption;
                  notifyChanged();
                }}
                className="w-full rounded border border-slate-300 bg-white px-2 py-1"
              >
                {enumValues<SoundOption>(SoundOption).map((option) => (
                  <option key={option} value={String(option)}>
                    {enumLabel(SoundOption, option)}
                  </option>
                ))}
              </select>
            </Field>
          </Section>
        </div>

        <SaveManagement save={saveFile} onChange={notifyChanged} />
        <div className="my-6 border-t border-slate-200" />

        <div className="space-y-4">
          {saveFile.slots.map((slot: SaveSlot, idx: number) => (
            <Slot
              key={`save-slot-${idx}`}
              slot={slot}
              index={idx}
              onChange={notifyChanged}
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
                slot={slot}
                index={idx}
                slotType="backup"
                onChange={notifyChanged}
              />
            ))}
          </div>
        </details>
      </div>

      <a href="/" class="underline">Go back</a>
    </div>
  );
}
