export abstract class SaveFile {
  constructor(source?: Deno.FsFile | Uint8Array) { }
  abstract get data(): Uint8Array;
  abstract read(source: Deno.FsFile | Uint8Array): this;
  abstract write(file: Deno.FsFile, forceSwap: boolean): void;
}
