import { SaveSlot } from "../../../models/saveslot.ts";
import { Entrance, Room } from "../../../models/scene.ts";
import { FileUtil } from "../../../utils/fileutil.ts";
import { DownloadButton } from "../islands/DownloadButton.tsx";

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
          <h2 className="text-2xl font-bold mb-4">Save File Details - {props.filename}</h2>
          <DownloadButton saveData={saveFile.getDataForWrite()} filename={props.filename} title="Save" />
        </div>
        <div className="space-y-6">
        {saveFile.slots.map((slot: SaveSlot, idx: number) => (
          <div key={idx} className="border rounded p-4 bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Slot {idx + 1}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Player Name:</span>{" "}
                <span className="tabular-nums">{slot.playerName}</span>
              </div>
              <div>
                <span className="font-medium">Health:</span>{" "}
                <span className="tabular-nums">{slot.currentHealth / 16} / {slot.maxHealth / 16} ({slot.doubleDefenseHearts})</span>
              </div>
              <div>
                <span className="font-medium">Rupees:</span>{" "}
                <span className="tabular-nums">{slot.rupees}</span>
              </div>
              <div>
                <span className="font-medium">Location:</span>{" "}
                <span>{Room[slot.room]} ({Entrance[slot.entrance]})</span>
              </div>
              <div>
                <span className="font-medium">Deaths:</span>{" "}
                <span className="tabular-nums">{slot.deathCounter}</span>
              </div>
              <div>
                <span className="font-medium">Gold Skulltulas:</span>{" "}
                <span className="tabular-nums">{slot.goldSkulltulaTokens}</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      <a href="/" class="underline">Go back</a>
    </div>
  );
}
