export abstract class SaveFile {
  static get requiredSize(): number {
    throw new Error("Method not implemented.");
  }
  static get acceptedSize(): number {
    throw new Error("Method not implemented.");
  }

  abstract get data(): Uint8Array;
  abstract read(source: Deno.FsFile | Uint8Array): this;
  abstract write(file: Deno.FsFile, forceSwap: boolean): void;
}
