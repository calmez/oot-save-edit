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
  return <input type="checkbox" checked={props.value} disabled />;
}

export default function Save(props: SaveProps) {
  const saveFile = FileUtil.loadFileFromBuffer(props.save);

  return (
    <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
      <div className="w-full bg-white rounded shadow p-6 mb-6">
        <div className="grid grid-cols-2 space-y-6">
          <h2 className="text-2xl font-bold mb-4">
            Save File Details - {props.filename}
          </h2>
          <DownloadButton
            saveData={saveFile.getDataForWrite()}
            filename={props.filename}
            title="Save"
          />
        </div>

        <div className="space-y-6">
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">File Info</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Filename:</span>
                <span>{props.filename}</span>
              </div>
              <div>
                <span className="font-medium">Word swapped:</span>
                <BooleanCheckbox value={saveFile.isByteSwapped} />
              </div>
              <div>
                <span className="font-medium">File format:</span>
                <span>
                  {FileFormat[
                    FileUtil.detectFileFormatByBufferSize(props.save)
                  ]}
                </span>
              </div>
              <div>
                <span className="font-medium">Data size:</span>
                <span>{saveFile.data.byteLength}</span>
              </div>
              <div>
                <span className="font-medium">Header valid:</span>
                <BooleanCheckbox value={saveFile.header.isValid} />
              </div>
            </div>
          </div>

          <div className="border rounded p-4 bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Save Options</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Output filename:</span>
                <span>{props.filename}</span>
              </div>
              <div>
                <span className="font-medium">Swap words:</span>
                <BooleanCheckbox value={saveFile.isByteSwapped} />
              </div>
              <div>
                <span className="font-medium">File format:</span>
                <span>
                  {FileFormat[
                    FileUtil.detectFileFormatByBufferSize(props.save)
                  ]}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded p-4 bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">General Info</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Language:</span>
                <span>{LanguageOption[saveFile.header.languageOption]}</span>
              </div>
              <div>
                <span className="font-medium">Z-Target:</span>
                <span>{ZTargetOption[saveFile.header.zTargetOption]}</span>
              </div>
              <div>
                <span className="font-medium">Sound:</span>
                <span>{SoundOption[saveFile.header.soundOption]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider my-6" />

        <div className="space-y-6">
          {saveFile.slots.map((slot: SaveSlot, idx: number) => (
            <Slot
              key={`save-slot-${idx}`}
              slotData={slot.data}
              index={idx}
            />
          ))}
        </div>

        <div className="divider my-6" />

        <details className="space-y-6">
          <summary className="text-xl font-semibold mb-2 cursor-pointer">
            Backup Slots
          </summary>
          <div className="space-y-6 mt-4">
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
