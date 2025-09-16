interface SaveProps {
  filename: string;
  save: Uint8Array;
}

export default function Save(props: SaveProps) {
  return (
    <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <div class="flex gap-8 py-6">
          <p class="text-3xl tabular-nums">{props.filename}</p>
          <p class="text-3xl tabular-nums">{props.save.byteLength} bytes</p>
        </div>
      </div>
    </div>
  );
}
