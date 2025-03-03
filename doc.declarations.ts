// deno-lint-ignore no-namespace
namespace Deno {
  export class FsFile {
    readSync(_bytes: Uint8Array): number {
      return 0;
    }
  }
}

// deno-lint-ignore no-unused-vars
class TextEncoder {
  encode(_text: string): Uint8Array {
    return new Uint8Array();
  }
}
