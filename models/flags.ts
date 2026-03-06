import { toUint8Array } from "../utils/conversions.ts";

export abstract class Flags<
  TFlags extends Uint8Array | Uint16Array | Uint32Array,
> {
  private flags: TFlags;

  protected get minElements(): number {
    return 0;
  }

  protected abstract createArray(length: number): TFlags;

  constructor(flags?: TFlags) {
    if (flags !== undefined) {
      if (flags.length < this.minElements) {
        throw new Error(
          `Flags data must be at least ${this.minElements} elements, got ${flags.length}.`,
        );
      }
      this.flags = flags.slice(0, this.minElements) as TFlags;
    } else {
      this.flags = this.createArray(this.minElements);
    }
  }

  get data(): TFlags {
    return this.flags.slice() as TFlags;
  }

  get dataAsUint8Array(): Uint8Array {
    return toUint8Array(this.data);
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
