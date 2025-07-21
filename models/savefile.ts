export class SaveFile {
  static get requiredSize(): number {
    throw new Error("Method not implemented.");
  }

  static get acceptedSize(): number {
    throw new Error("Method not implemented.");
  }

  getData(_forceSwap: boolean = false): Uint8Array {
    throw new Error("Method not implemented.");
  }

  get data(): Uint8Array {
    return this.getData(false);
  }

  set data(_bytes: Uint8Array) {
    throw new Error("Method not implemented.");
  }
  
  protected checkDataOnRead(bytes: Uint8Array): Uint8Array {
    return bytes;
  }

  read(source: Deno.FsFile | Uint8Array): this {
    const klass = this.constructor as typeof SaveFile;
    const requiredSize = klass.requiredSize;

    let bytes: Uint8Array;
    if (source instanceof Uint8Array) {
      if (source.length < requiredSize) {
        throw Error(
          `Incorrect data size, cannot read save file. Expected at least ${requiredSize} bytes, got ${source.length}.`,
        );
      }
      bytes = source.slice(0, requiredSize);
    } else {
      bytes = new Uint8Array(requiredSize);
      const readBytes = source.readSync(bytes);
      if ((readBytes ?? 0) < requiredSize) {
        throw Error(
          `Incorrect file size, cannot read save file. Expected at least ${requiredSize} bytes, got ${readBytes}.`,
        );
      }
    }

    this.data = this.checkDataOnRead(bytes);

    return this;
  }

  write(file: Deno.FsFile, forceSwap: boolean = false): void {
    file.writeSync(this.getData(forceSwap));
  }
}
