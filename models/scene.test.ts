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

Deno.test({
  name: "should throw an error for invalid age in DepthTest room",
  fn() {
    const room = Room.DepthTest;
    const entrance = Entrance.Default;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in DepthTest room",
  fn() {
    const room = Room.DepthTest;
    const entrance = Entrance.Default;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in DepthTest room",
  fn() {
    const room = Room.DepthTest;
    const entrance = Entrance.Default;
    const age = Age.Adult;
    const time = Time.Day;
    const cutsceneOffset = 1;
    assertThrows(() => SceneFrom(room, entrance, age, time, cutsceneOffset));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromMarketEntrance",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromMarketEntrance;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in GanonsCastle entering FromMarketEntrance",
  fn() {
    const room = Room.GanonsCastle;
    const entrance = Entrance.FromMarketEntrance;
    const age = Age.Child;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromCastleCourtyard",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromCastleCourtyard;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in GanonsCastle entering FromInsideGanonsCastle",
  fn() {
    const room = Room.GanonsCastle;
    const entrance = Entrance.FromInsideGanonsCastle;
    const age = Age.Child;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromCastleCourtyard2",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromCastleCourtyard2;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in HyruleCastle entering FromCastleCourtyard2",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromCastleCourtyard2;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in Market entering FromCastle",
  fn() {
    const room = Room.Market;
    const entrance = Entrance.FromCastle;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in Market entering FromGanonsCastle",
  fn() {
    const room = Room.Market;
    const entrance = Entrance.FromGanonsCastle;
    const age = Age.Child;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in SacredForestMeadow entering FromLostWoods2",
  fn() {
    const room = Room.SacredForestMeadow;
    const entrance = Entrance.FromLostWoods2;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in SacredForestMeadow entering FromLostWoods2",
  fn() {
    const room = Room.SacredForestMeadow;
    const entrance = Entrance.FromLostWoods2;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in CutsceneMap entering CutsceneEntrance",
  fn() {
    const room = Room.CutsceneMap;
    const entrance = Entrance.CutsceneEntrance;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in CutsceneMap entering CutsceneEntrance",
  fn() {
    const room = Room.CutsceneMap;
    const entrance = Entrance.CutsceneEntrance;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in ShootingGallery entering FromKakarikoVillage4",
  fn() {
    const room = Room.ShootingGallery;
    const entrance = Entrance.FromKakarikoVillage4;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in ShootingGallery entering FromKakarikoVillage4",
  fn() {
    const room = Room.ShootingGallery;
    const entrance = Entrance.FromKakarikoVillage4;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromGreatFairysFountainSpells",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromGreatFairysFountainSpells;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in GanonsCastle entering FromGreatFairysFountainUpgrades",
  fn() {
    const room = Room.GanonsCastle;
    const entrance = Entrance.FromGreatFairysFountainUpgrades;
    const age = Age.Child;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromGreatFairysFountainSpells2",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromGreatFairysFountainSpells2;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in HyruleCastle entering FromGreatFairysFountainSpells2",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromGreatFairysFountainSpells2;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromCastleCourtyardCaughtByGuard",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromCastleCourtyardCaughtByGuard;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in GanonsCastle entering FromCastleCourtyardCaughtByGuard",
  fn() {
    const room = Room.GanonsCastle;
    const entrance = Entrance.FromCastleCourtyardCaughtByGuard;
    const age = Age.Child;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid age in HyruleCastle entering FromCastleCourtyardCaughtByGuard2",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromCastleCourtyardCaughtByGuard2;
    const age = Age.Adult;
    const time = Time.Day;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});

Deno.test({
  name: "should throw an error for invalid time in HyruleCastle entering FromCastleCourtyardCaughtByGuard2",
  fn() {
    const room = Room.HyruleCastle;
    const entrance = Entrance.FromCastleCourtyardCaughtByGuard2;
    const age = Age.Child;
    const time = Time.Night;
    assertThrows(() => SceneFrom(room, entrance, age, time));
  }
});
