export abstract class SaveFile {
  abstract read(source: Deno.FsFile | Uint8Array): this;
  abstract write(file: Deno.FsFile, forceSwap: boolean): void;
}
