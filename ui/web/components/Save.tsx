import { SaveSlot } from "../../../models/saveslot.ts";
import { FileUtil } from "../../../utils/fileutil.ts";
import { DownloadButton } from "../islands/DownloadButton.tsx";
import Slot from "../islands/Slot.tsx";

interface SaveProps {
  filename: string;
  save: Uint8Array;
}

export default function Save(props: SaveProps) {
  const saveFile = FileUtil.loadFileFromBuffer(props.save);

  return (
    <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
      <div className="w-full bg-white rounded shadow p-6 mb-6">
        <div className="grid grid-cols-2">
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
          {saveFile.slots.map((slot: SaveSlot, idx: number) => (
            <Slot slotData={slot.data} index={idx} />
          ))}
        </div>
      </div>

      <a href="/" class="underline">Go back</a>
    </div>
  );
}
