import { FileUtil } from "../../../utils/fileutil.ts";
import SaveEditor from "../islands/SaveEditor.tsx";

export interface SaveProps {
  filename: string;
  save: Uint8Array;
}

export default function Save(props: SaveProps) {
  const saveFile = FileUtil.loadFileFromBuffer(props.save);
  const detectedFormat = FileUtil.detectFileFormatByBufferSize(props.save);

  return (
    <SaveEditor
      filename={props.filename}
      initialSaveData={saveFile.getData()}
      isByteSwapped={saveFile.isByteSwapped}
      detectedFormat={detectedFormat}
    />
  );
}
