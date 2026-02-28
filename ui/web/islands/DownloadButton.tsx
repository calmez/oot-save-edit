import { Button } from "../components/Button.tsx";

export interface DownloadButtonProps {
  saveData: Uint8Array;
  filename: string;
  title?: string;
  disabled?: boolean;
}

export function DownloadButton(props: DownloadButtonProps) {
  const bytes = new Uint8Array(props.saveData.byteLength);
  bytes.set(props.saveData);
  const blob = new Blob([bytes.buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  return (
    <a
      href={url}
      download={props.filename}
      rel="noopener noreferrer"
      target="_blank"
      class="justify-self-end"
    >
      <Button
        disabled={props.disabled ?? false}
      >
        {props.title ?? "Download"}
      </Button>
    </a>
  );
}
