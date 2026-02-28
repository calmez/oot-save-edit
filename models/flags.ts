export abstract class Flags<TFlags extends Uint8Array | Uint16Array> {
  private flags: TFlags;

  protected get minBytes(): number {
    return 0;
  }

  protected abstract createArray(length: number): TFlags;

  constructor(flags?: TFlags) {
    if (flags !== undefined) {
      if (flags.length < this.minBytes) {
        throw new Error(
          `Flags data must be at least ${this.minBytes} bytes, got ${flags.length}.`,
        );
      }
      this.flags = flags.slice(0, this.minBytes) as TFlags;
    } else {
      this.flags = this.createArray(this.minBytes);
    }
  }

  get data(): TFlags {
    return this.flags.slice() as TFlags;
  }

  protected getBit(coord: { byte: number; bit: number }): boolean {
    return (this.flags[coord.byte] & (1 << coord.bit)) !== 0;
  }

  protected setBit(coord: { byte: number; bit: number }, value: boolean): void {
    if (value) {
      this.flags[coord.byte] |= 1 << coord.bit;
    } else {
      this.flags[coord.byte] &= ~(1 << coord.bit);
    }
  }
}
