import { Flags } from "./flags.ts";

class PermanentSceneFlag extends Flags<Uint32Array> {
  protected override get minBytes(): number {
    return 1;
  }

  protected override createArray(length: number): Uint32Array {
    return new Uint32Array(length);
  }

  public getFlag(index: number): boolean {
    return this.getBit({ byte: 1, bit: index });
  }

  public setFlag(index: number, value: boolean): void {
    return this.setBit({ byte: 1, bit: index }, value);
  }
}

export class ChestFlags extends PermanentSceneFlag {};
export class SwitchFlags extends PermanentSceneFlag {};
export class RoomClearFlags extends PermanentSceneFlag {};
export class CollectibleFlags extends PermanentSceneFlag {};
export class UnusedFlags extends PermanentSceneFlag {};
export class VisitedRoomsFlags extends PermanentSceneFlag {};
export class VisitedFloorsFlags extends PermanentSceneFlag {};

export interface PermanentSceneFlags {
  chestFlags: ChestFlags;
  switches: SwitchFlags;
  roomClearFlags: RoomClearFlags;
  collectibleFlags: CollectibleFlags;
  unused: UnusedFlags;
  visitedRooms: VisitedRoomsFlags;
  visitedFloors: VisitedFloorsFlags;
}
