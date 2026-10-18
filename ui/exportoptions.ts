import { ExportByteOrder } from "../models/savefile.ts";

export const exportByteOrderOptions = [
  {
    value: ExportByteOrder.Automatic,
    label: "Automatic (preserve source or use layout default)",
  },
  { value: ExportByteOrder.BigEndian, label: "Big-endian" },
  { value: ExportByteOrder.WordSwapped, label: "Word-swapped (32-bit)" },
];
