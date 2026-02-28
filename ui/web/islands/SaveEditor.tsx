import { useMemo, useState } from "preact/hooks";
import {
  LanguageOption,
  SoundOption,
  ZTargetOption,
} from "../../../models/saveheader.ts";
import { SraSaveFile, SrmSaveFile } from "../../../models/savefile.ts";
import { SaveSlot } from "../../../models/saveslot.ts";
import { FileFormat, FileUtil } from "../../../utils/fileutil.ts";
import { DownloadButton } from "./DownloadButton.tsx";
import Slot from "./Slot.tsx";
import { Field } from "../components/Field.tsx";
import { Section } from "../components/Section.tsx";

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
  const saveFile = new SraSaveFile();
  saveFile.data = new Uint8Array(bytes);
  return saveFile;
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
  const [swapWords, setSwapWords] = useState<boolean>(false);
  const [version, setVersion] = useState(0);

  const downloadData = useMemo(() => {
    if (outputFormat === FileFormat.SRA) {
      const bytes = saveFile.getData();
      if (swapWords) {
        FileUtil.byteSwap(bytes, true);
      }
      return bytes;
    }

    const srm = SrmSaveFile.fromSaveFile(saveFile);
    const bytes = srm.getData();
    if (swapWords) {
      FileUtil.byteSwap(bytes, true);
    }
    return bytes;
  }, [saveFile, outputFormat, swapWords, version]);

  function onFormatChange(value: FileFormat) {
    setOutputFormat(value);
    setOutputFilename((previous) => ensureFilenameExtension(previous, value));
  }

  function notifyChanged() {
    setSaveFile(saveFile);
    setVersion((current) => current + 1);
  }

  return (
    <div class="mx-auto flex max-w-screen-lg flex-col items-center justify-center px-4">
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
            <Field label="Word Swapped">
              <BooleanCheckbox value={props.isByteSwapped} disabled />
            </Field>
            <Field label="File Format">
              {FileFormat[props.detectedFormat]}
            </Field>
            <Field label="Data Size">{saveFile.data.byteLength}</Field>
            <Field label="Header Valid">
              <BooleanCheckbox value={saveFile.header.isValid} disabled />
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
            <Field label="Swap Words">
              <BooleanCheckbox value={swapWords} onChange={setSwapWords} />
            </Field>
            <Field label="File Format">
              <select
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
            <Field label="Language">
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
            <Field label="Z-Target">
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
            <Field label="Sound">
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
            Backup Slots (Read-only)
          </summary>
          <div className="mt-4 space-y-4">
            {saveFile.backups.map((slot: SaveSlot, idx: number) => (
              <Slot
                key={`backup-slot-${idx}`}
                slot={slot}
                index={idx + saveFile.slots.length}
                readOnly
              />
            ))}
          </div>
        </details>
      </div>

      <a href="/" class="underline">Go back</a>
    </div>
  );
}
