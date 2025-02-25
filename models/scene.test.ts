import { assertEquals, assertThrows } from "@std/assert";
import { Age } from "./saveslot.ts";
import {
  Entrance,
  Room,
  RoomWithEntrance,
  RoomWithEntranceFor,
  Scene,
  SceneFrom,
  Time,
  ValidEntrancesForRoom,
} from "./scene.ts";

Deno.test({
  name: "should return valid entrances for DekuTree room",
  fn() {
    const room = Room.DekuTree;
    const validEntrances = ValidEntrancesForRoom(room);
    const expectedEntrances = [
      Entrance.FromKokiriForest,
      Entrance.FromDekuTreeBoss,
    ];
    assertEquals(validEntrances, expectedEntrances);
  },
});

Deno.test({
  name: "should throw an error for an invalid room",
  fn() {
    const room = -1 as Room; // Invalid room
    assertThrows(() => ValidEntrancesForRoom(room));
  },
});

Deno.test({
  name:
    "should return the correct RoomWithEntrance for valid Room and Entrance",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.FromKokiriForest;
    const expectedRoomWithEntrance = RoomWithEntrance.DekuTree_FromKokiriForest;
    const roomWithEntrance = RoomWithEntranceFor(room, entrance);
    assertEquals(roomWithEntrance, expectedRoomWithEntrance);
  },
});

Deno.test({
  name: "should throw an error for invalid Room and Entrance combination",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.Unknown;
    assertThrows(() => RoomWithEntranceFor(room, entrance));
  },
});

Deno.test({
  name:
    "should return the correct Scene for given Room, Entrance, Age, and Time",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.FromKokiriForest;
    const age = Age.Child;
    const time = Time.Day;
    const expectedScene = Scene.DekuTree_FromKokiriForest_Child_Day;
    const scene = SceneFrom(room, entrance, age, time);
    assertEquals(scene, expectedScene);
  },
});

Deno.test({
  name:
    "should return the correct Scene for given Room, Entrance, Age, and Time at Night",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.FromKokiriForest;
    const age = Age.Child;
    const time = Time.Night;
    const expectedScene = Scene.DekuTree_FromKokiriForest_Child_Night;
    const scene = SceneFrom(room, entrance, age, time);
    assertEquals(scene, expectedScene);
  },
});

Deno.test({
  name:
    "should return the correct Scene for given Room, Entrance, Age, and Time as Adult",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.FromKokiriForest;
    const age = Age.Adult;
    const time = Time.Day;
    const expectedScene = Scene.DekuTree_FromKokiriForest_Adult_Day;
    const scene = SceneFrom(room, entrance, age, time);
    assertEquals(scene, expectedScene);
  },
});

Deno.test({
  name:
    "should return the correct Scene for given Room, Entrance, Age, and Time as Adult at Night",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.FromKokiriForest;
    const age = Age.Adult;
    const time = Time.Night;
    const expectedScene = Scene.DekuTree_FromKokiriForest_Adult_Night;
    const scene = SceneFrom(room, entrance, age, time);
    assertEquals(scene, expectedScene);
  },
});

Deno.test({
  name: "should throw an error for invalid RoomWithEntrance",
  fn() {
    const room = Room.DekuTree;
    const entrance = Entrance.Unknown;
    const age = Age.Child;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  },
});

Deno.test({
  name:
    "should return the correct Scene for given Room, Entrance, Age, Time, and cutsceneOffset",
  fn() {
    const room = Room.RoyalFamilysTomb;
    const entrance = Entrance.FromGraveyard;
    const age = Age.Child;
    const time = Time.Day;
    const cutsceneOffset = 1;
    const expectedScene = Scene.RoyalFamilysTomb_FromGraveyard_Cutscene1;
    const scene = SceneFrom(room, entrance, age, time, cutsceneOffset);
    assertEquals(scene, expectedScene);
  },
});
