import { Flags } from "./flags.ts";

class PermanentSceneFlag extends Flags<Uint32Array> {
  private static readonly minBitIndex = 0;
  private static readonly maxBitIndex = 31;

  protected override get minElements(): number {
    return 1;
  }

  protected override createArray(length: number): Uint32Array {
    return new Uint32Array(length);
  }

  private validateIndex(index: number): void {
    if (!Number.isInteger(index)) {
      throw new Error(`Flag index must be an integer, got ${index}.`);
    }
    if (
      index < PermanentSceneFlag.minBitIndex ||
      index > PermanentSceneFlag.maxBitIndex
    ) {
      throw new Error(
        `Flag index must be between ${PermanentSceneFlag.minBitIndex} and ${PermanentSceneFlag.maxBitIndex}, got ${index}.`,
      );
    }
  }

  public getFlag(index: number): boolean {
    this.validateIndex(index);
    return this.getBit({ byte: 0, bit: index });
  }

  public setFlag(index: number, value: boolean): void {
    this.validateIndex(index);
    return this.setBit({ byte: 0, bit: index }, value);
  }
}

export class ChestFlags extends PermanentSceneFlag {}
export class SwitchFlags extends PermanentSceneFlag {}
export class RoomClearFlags extends PermanentSceneFlag {}
export class CollectibleFlags extends PermanentSceneFlag {}
export class UnusedFlags extends PermanentSceneFlag {}
export class VisitedRoomsFlags extends PermanentSceneFlag {}
export class VisitedFloorsFlags extends PermanentSceneFlag {}

export interface PermanentSceneFlags {
  chestFlags: ChestFlags;
  switches: SwitchFlags;
  roomClearFlags: RoomClearFlags;
  collectibleFlags: CollectibleFlags;
  unused: UnusedFlags;
  visitedRooms: VisitedRoomsFlags;
  visitedFloors: VisitedFloorsFlags;
}
