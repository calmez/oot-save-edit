namespace Deno {
  export class FsFile {
    readSync(_bytes: Uint8Array): number {
      return 0;
    }
  }
}

class TextEncoder {
  encode(_text: string): Uint8Array {
    return new Uint8Array();
  }
}
