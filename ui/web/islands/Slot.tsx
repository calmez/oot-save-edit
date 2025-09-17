import { useState } from "preact/hooks";
import { SaveSlot } from "../../../models/saveslot.ts";
import { Entrance, Room } from "../../../models/scene.ts";

interface SlotProps {
  slotData: Uint8Array;
  index: number;
}

export default function Slot(props: SlotProps) {
  const { slotData, index } = props;
  const slot = new SaveSlot(slotData);

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      key={index}
      className={`border rounded p-4 ${
        expanded ? "bg-blue-300/90 shadow-lg h-max" : "bg-gray-50 h-min"
      } hover:cursor-pointer`}
      onClick={() => {
        setExpanded(!expanded);
      }}
    >
      <h3 className="text-xl font-semibold mb-2">File {index + 1}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <span className="font-medium">Player Name:</span>{" "}
          <span className="tabular-nums">{slot.playerName}</span>
        </div>
        <div>
          <span className="font-medium">Health:</span>{" "}
          <span className="tabular-nums">
            {slot.currentHealth / 16} / {slot.maxHealth / 16}{" "}
            ({slot.doubleDefenseHearts / 16})
          </span>
        </div>
        <div>
          <span className="font-medium">Deaths:</span>{" "}
          <span className="tabular-nums">{slot.deathCounter}</span>
        </div>
      </div>
      {expanded && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Rupees:</span>{" "}
            <span className="tabular-nums">{slot.rupees}</span>
          </div>
          <div>
            <span className="font-medium">Magic Meter:</span>{" "}
            <span className="tabular-nums">
              {slot.currentMagic} / {slot.maxMagic}
            </span>
          </div>
          <div>
            <span className="font-medium">Location:</span>{" "}
            <span className="tabular-nums">
              {Room[slot.room]} ({Entrance[slot.entrance]})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
