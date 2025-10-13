import { assertInstanceOf } from "@std/assert/instance-of";
import {
  Age,
  BombBag,
  Boots,
  BulletBag,
  ButtonEquips,
  CurrentEquipment,
  DekuNutUpgrades,
  DekuStickUpgrades,
  DungeonItems,
  EquippableItems,
  FaroresWindWarp,
  InventoryItems,
  MagicAmount,
  Medallions,
  ObtainableUpgrades,
  QuestItems,
  Quiver,
  SaveSlot,
  Shield,
  Songs,
  SpiritualStones,
  Sword,
  Tokens,
  Tunic,
} from "./saveslot.ts";
import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import { toNumber, toUint8Array } from "../utils/conversions.ts";
import { OotText } from "../utils/text.ts";
import { Entrance, Room, RoomWithEntranceFor, Scene } from "./scene.ts";

Deno.test({
  name: "should create",
  fn() {
    const instance = new SaveSlot();
    assertInstanceOf(instance, SaveSlot);
  },
});

Deno.test({
  name: "should raise an error when incorrect size of data is given",
  fn() {
    const wrongInput = new Uint8Array(42);
    assertThrows(() => new SaveSlot(wrongInput));
  },
});

Deno.test({
  name: "should provide its data",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const instance = new SaveSlot(testData);
    assertEquals(instance.data, testData);
  },
});

Deno.test({
  name: "should provide an entrance index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEntranceIndex = 23;
    testData.set(toUint8Array(expectedEntranceIndex, 4), 0x0000);
    const instance = new SaveSlot(testData);
    assertEquals(instance.entranceIndex, expectedEntranceIndex);
  },
});

Deno.test({
  name: "should set an entrance index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEntranceIndex = 23;
    const instance = new SaveSlot(testData);
    instance.entranceIndex = expectedEntranceIndex;
    assertEquals(instance.entranceIndex, expectedEntranceIndex);
  },
});

Deno.test({
  name: "should provide the Age",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedAge = Age.Adult;
    testData.set(toUint8Array(expectedAge, 4), 0x0004);
    const instance = new SaveSlot(testData);
    assertEquals(instance.age, expectedAge);
  },
});

Deno.test({
  name: "should set the Age",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedAge = Age.Adult;
    const instance = new SaveSlot(testData);
    instance.age = expectedAge;
    assertEquals(instance.age, expectedAge);
  },
});

Deno.test({
  name: "should provide the cutscene number",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedCutsceneNumber = 32;
    testData.set(toUint8Array(expectedCutsceneNumber, 2), 0x000A);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cutSceneNumber, expectedCutsceneNumber);
  },
});

Deno.test({
  name: "should set the cutscene number",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedCutsceneNumber = 32;
    const instance = new SaveSlot(testData);
    instance.cutSceneNumber = expectedCutsceneNumber;
    assertEquals(instance.cutSceneNumber, expectedCutsceneNumber);
  },
});

Deno.test({
  name: "should provide the world time",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedWorldTime = 1;
    testData.set(toUint8Array(expectedWorldTime, 2), 0x000C);
    const instance = new SaveSlot(testData);
    assertEquals(instance.worldTime, expectedWorldTime);
  },
});

Deno.test({
  name: "should set the world time",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedWorldTime = 1;
    const instance = new SaveSlot(testData);
    instance.worldTime = expectedWorldTime;
    assertEquals(instance.worldTime, expectedWorldTime);
  },
});

Deno.test({
  name: "should provide the night flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedNightFlag = 1;
    testData.set(toUint8Array(expectedNightFlag, 4), 0x0010);
    const instance = new SaveSlot(testData);
    assertEquals(instance.nightFlag, expectedNightFlag);
  },
});

Deno.test({
  name: "should set the night flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedNightFlag = 1;
    const instance = new SaveSlot(testData);
    instance.nightFlag = expectedNightFlag;
    assertEquals(instance.nightFlag, expectedNightFlag);
  },
});

Deno.test({
  name: "should provide the death counter",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedDeathCounter = 1337;
    testData.set(toUint8Array(expectedDeathCounter, 2), 0x0022);
    const instance = new SaveSlot(testData);
    assertEquals(instance.deathCounter, expectedDeathCounter);
  },
});

Deno.test({
  name: "should set the death counter",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedDeathCounter = 1337;
    const instance = new SaveSlot(testData);
    instance.deathCounter = expectedDeathCounter;
    assertEquals(instance.deathCounter, expectedDeathCounter);
  },
});

Deno.test({
  name: "should provide the player name",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedName = "LINKTEST";
    testData.set(new OotText().encode(expectedName), 0x0024);
    const instance = new SaveSlot(testData);
    assertEquals(instance.playerName, expectedName);
  },
});

Deno.test({
  name: "should set the player name",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedName = "LINKTEST";
    const instance = new SaveSlot(testData);
    instance.playerName = expectedName;
    assertEquals(instance.playerName, expectedName);
  },
});

Deno.test({
  name: "should provide the ddOnly flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    testData.set(toUint8Array(expectedFlag, 2), 0x002C);
    const instance = new SaveSlot(testData);
    assertEquals(instance.ddOnly, expectedFlag);
  },
});

Deno.test({
  name: "should set the ddOnly flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    const instance = new SaveSlot(testData);
    instance.ddOnly = expectedFlag;
    assertEquals(instance.ddOnly, expectedFlag);
  },
});

Deno.test({
  name: "should provide the maximum health",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedHealth = 32;
    testData.set(toUint8Array(expectedHealth, 2), 0x002E);
    const instance = new SaveSlot(testData);
    assertEquals(instance.maxHealth, expectedHealth);
  },
});

Deno.test({
  name: "should set the maximum health",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedHealth = 32;
    const instance = new SaveSlot(testData);
    instance.maxHealth = expectedHealth;
    assertEquals(instance.maxHealth, expectedHealth);
  },
});

Deno.test({
  name: "should provide the current health",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedHealth = 32;
    testData.set(toUint8Array(expectedHealth, 2), 0x0030);
    const instance = new SaveSlot(testData);
    assertEquals(instance.currentHealth, expectedHealth);
  },
});

Deno.test({
  name: "should set the current health",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedHealth = 32;
    const instance = new SaveSlot(testData);
    instance.currentHealth = expectedHealth;
    assertEquals(instance.currentHealth, expectedHealth);
  },
});

Deno.test({
  name: "should provide the maximum magic",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedMagic = 2;
    testData.set(toUint8Array(expectedMagic, 1), 0x0032);
    const instance = new SaveSlot(testData);
    assertEquals(instance.maxMagic, expectedMagic);
  },
});

Deno.test({
  name: "should set the maximum magic",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedMagic = 2;
    const instance = new SaveSlot(testData);
    instance.maxMagic = expectedMagic;
    assertEquals(instance.maxMagic, expectedMagic);
  },
});

Deno.test({
  name: "should provide the current magic",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedMagic = MagicAmount.Half;
    testData.set(toUint8Array(expectedMagic, 1), 0x0033);
    const instance = new SaveSlot(testData);
    assertEquals(instance.currentMagic, expectedMagic);
  },
});

Deno.test({
  name: "should throw an error when current magic is invalid",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedMagic = 3;
    testData.set(toUint8Array(expectedMagic, 1), 0x0033);
    assertThrows(() => {
      new SaveSlot(testData).currentMagic;
    });
  },
});

Deno.test({
  name: "should set the current magic",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedMagic = MagicAmount.Half;
    const instance = new SaveSlot(testData);
    instance.currentMagic = expectedMagic;
    assertEquals(instance.currentMagic, expectedMagic);
  },
});

Deno.test({
  name: "should provide the rupees",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedRupees = 9001;
    testData.set(toUint8Array(expectedRupees, 2), 0x0034);
    const instance = new SaveSlot(testData);
    assertEquals(instance.rupees, expectedRupees);
  },
});

Deno.test({
  name: "should set the rupees",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedRupees = 500;
    const instance = new SaveSlot(testData);
    instance.rupees = expectedRupees;
    assertEquals(instance.rupees, expectedRupees);
  },
});

Deno.test({
  name: "should provide the first big gorons sword flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    testData.set(toUint8Array(expectedFlag, 1), 0x0036);
    const instance = new SaveSlot(testData);
    assertEquals(instance.biggoronsSwordFlag1, expectedFlag);
  },
});

Deno.test({
  name: "should set the first big gorons sword flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    const instance = new SaveSlot(testData);
    instance.biggoronsSwordFlag1 = expectedFlag;
    assertEquals(instance.biggoronsSwordFlag1, expectedFlag);
  },
});

Deno.test({
  name: "should provide the navi timer",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedTimer = 300;
    testData.set(toUint8Array(expectedTimer, 2), 0x0038);
    const instance = new SaveSlot(testData);
    assertEquals(instance.naviTimer, expectedTimer);
  },
});

Deno.test({
  name: "should set the navi timer",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const epxectedTimer = 300;
    const instance = new SaveSlot(testData);
    instance.naviTimer = epxectedTimer;
    assertEquals(instance.naviTimer, epxectedTimer);
  },
});

Deno.test({
  name: "should provide the first magic flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    testData.set(toUint8Array(expectedFlag, 1), 0x003A);
    const instance = new SaveSlot(testData);
    assertEquals(instance.magicFlag1, expectedFlag);
  },
});

Deno.test({
  name: "should set the first magic flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    const instance = new SaveSlot(testData);
    instance.magicFlag1 = expectedFlag;
    assertEquals(instance.magicFlag1, expectedFlag);
  },
});

Deno.test({
  name: "should provide the second magic flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    testData.set(toUint8Array(expectedFlag, 1), 0x003C);
    const instance = new SaveSlot(testData);
    assertEquals(instance.magicFlag2, expectedFlag);
  },
});

Deno.test({
  name: "should set the second magic flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    const instance = new SaveSlot(testData);
    instance.magicFlag2 = expectedFlag;
    assertEquals(instance.magicFlag2, expectedFlag);
  },
});

Deno.test({
  name: "should provide the second big gorons sword flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    testData.set(toUint8Array(expectedFlag, 1), 0x003E);
    const instance = new SaveSlot(testData);
    assertEquals(instance.biggoronsSwordFlag2, expectedFlag);
  },
});

Deno.test({
  name: "should set the second big gorons sword flag",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedFlag = true;
    const instance = new SaveSlot(testData);
    instance.biggoronsSwordFlag2 = expectedFlag;
    assertEquals(instance.biggoronsSwordFlag2, expectedFlag);
  },
});

Deno.test({
  name: "should provide the saved scene index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedIndex = Scene.KokiriForest_FromDekuTree_Adult_Day;
    testData.set(toUint8Array(expectedIndex, 2), 0x0066);
    const instance = new SaveSlot(testData);
    assertEquals(instance.savedSceneIndex, expectedIndex);
  },
});

Deno.test({
  name: "should set the saved scene index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedIndex = Scene.KokiriForest_FromDekuTree_Adult_Day;
    const instance = new SaveSlot(testData);
    instance.savedSceneIndex = expectedIndex;
    assertEquals(instance.savedSceneIndex, expectedIndex);
  },
});

Deno.test({
  name: "should provide the current room",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    testData.set(
      toUint8Array(Scene.KokiriForest_FromDekuTree_Adult_Day, 2),
      0x0066,
    );
    const expectedRoom = Room.KokiriForest;
    const instance = new SaveSlot(testData);
    assertEquals(instance.room, expectedRoom);
  },
});

Deno.test({
  name: "should set the current room",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    testData.set(
      toUint8Array(Scene.ActionTestingRoom_Default_Adult_Day, 2),
      0x0066,
    );
    const expectedRoom = Room.Beshitu;
    const instance = new SaveSlot(testData);
    instance.room = expectedRoom;
    assertEquals(instance.room, expectedRoom);
  },
});

Deno.test({
  name: "should provide the current entrance",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    testData.set(
      toUint8Array(Scene.KokiriForest_FromDekuTree_Adult_Day, 2),
      0x0066,
    );
    const expectedEntrance = Entrance.FromDekuTree;
    const instance = new SaveSlot(testData);
    assertEquals(instance.entrance, expectedEntrance);
  },
});

Deno.test({
  name: "should set the current entrance",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    testData.set(
      toUint8Array(Scene.BackAlley_FromBombchuShop_Adult_Day, 2),
      0x0066,
    );
    const expectedEntrance = Entrance.FromPuppyWomansHouse;
    const instance = new SaveSlot(testData);
    instance.entrance = expectedEntrance;
    assertEquals(instance.entrance, expectedEntrance);
  },
});

Deno.test({
  name: "should set the current room and entrance",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    testData.set(
      toUint8Array(Scene.ActionTestingRoom_Default_Adult_Day, 2),
      0x0066,
    );
    const expectedRoom = Room.BackAlley;
    const expectedEntrance = Entrance.FromPuppyWomansHouse;
    const instance = new SaveSlot(testData);
    instance.roomWithEntrance = RoomWithEntranceFor(
      expectedRoom,
      expectedEntrance,
    );
    assertEquals(instance.room, expectedRoom);
    assertEquals(instance.entrance, expectedEntrance);
  },
});

Deno.test({
  name: "should get the current button equips",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquips: ButtonEquips = {
      bButton: 12,
      cLeftButton: 23,
      cDownButton: 32,
      cRightButton: 42,
      cLeftOffset: 1,
      cDownOffset: 2,
      cRightOffset: 3,
    };
    testData.set(
      new Uint8Array([
        ...toUint8Array(expectedEquips.bButton, 1),
        ...toUint8Array(expectedEquips.cLeftButton, 1),
        ...toUint8Array(expectedEquips.cDownButton, 1),
        ...toUint8Array(expectedEquips.cRightButton, 1),
        ...toUint8Array(expectedEquips.cLeftOffset, 1),
        ...toUint8Array(expectedEquips.cDownOffset, 1),
        ...toUint8Array(expectedEquips.cRightOffset, 1),
      ]),
      0x0068,
    );
    const instance = new SaveSlot(testData);
    assertEquals(instance.currentButtonEquips, expectedEquips);
  },
});

Deno.test({
  name: "should set the currentButtonEquips",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquips: ButtonEquips = {
      bButton: 12,
      cLeftButton: 23,
      cDownButton: 32,
      cRightButton: 42,
      cLeftOffset: 1,
      cDownOffset: 2,
      cRightOffset: 3,
    };
    const instance = new SaveSlot(testData);
    instance.currentButtonEquips = expectedEquips;
    assertEquals(instance.currentButtonEquips, expectedEquips);
  },
});

Deno.test({
  name: "should provide the B button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.DekuStick;
    testData.set(toUint8Array(expectedEquipment, 1), 0x0068);
    const instance = new SaveSlot(testData);
    assertEquals(instance.bButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the B button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.DekuStick;
    const instance = new SaveSlot(testData);
    instance.bButtonEquip = expectedEquipment;
    assertEquals(instance.bButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the C left button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.Bombchu;
    testData.set(toUint8Array(expectedEquipment, 1), 0x0069);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cLeftButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the C left button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.Bombchu;
    const instance = new SaveSlot(testData);
    instance.cLeftButtonEquip = expectedEquipment;
    assertEquals(instance.cLeftButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the C down button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.Bomb;
    testData.set(toUint8Array(expectedEquipment, 1), 0x006A);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cDownButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the C down button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.Bomb;
    const instance = new SaveSlot(testData);
    instance.cDownButtonEquip = expectedEquipment;
    assertEquals(instance.cDownButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the C right button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.DekuNut;
    testData.set(toUint8Array(expectedEquipment, 1), 0x006B);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cRightButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the C right button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = InventoryItems.DekuNut;
    const instance = new SaveSlot(testData);
    instance.cRightButtonEquip = expectedEquipment;
    assertEquals(instance.cRightButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should get the currently equipped equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment: CurrentEquipment = {
      sword: Sword.KokiriSword,
      shield: Shield.KokiriShield,
      tunic: Tunic.KokiriTunic,
      boots: Boots.KokiriBoots,
    };
    const equipmentData = expectedEquipment.sword | expectedEquipment.shield |
      expectedEquipment.tunic | expectedEquipment.boots;
    testData.set(toUint8Array(equipmentData, 2), 0x0070);
    const instance = new SaveSlot(testData);
    assertEquals(instance.currentlyEquippedEquipment, expectedEquipment);
  },
});

Deno.test({
  name: "should set the currently equipped equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment: CurrentEquipment = {
      sword: Sword.MasterSword,
      shield: Shield.HylianShield,
      tunic: Tunic.GoronTunic,
      boots: Boots.IronBoots,
    };
    const instance = new SaveSlot(testData);
    instance.currentlyEquippedEquipment = expectedEquipment;
    assertEquals(instance.currentlyEquippedEquipment, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the inventory",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItem = InventoryItems.Bomb;
    const testInventory = new Uint8Array(24);
    testInventory.set(toUint8Array(expectedItem, 1), 0);
    testData.set(testInventory, 0x0074);
    const instance = new SaveSlot(testData);
    assertEquals(instance.inventory[0], expectedItem);
  },
});

Deno.test({
  name: "should set the inventory",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedInventory = new Array<InventoryItems>(24).fill(
      InventoryItems.DekuStick,
    );
    const instance = new SaveSlot(testData);
    instance.inventory = expectedInventory;
    assertEquals(instance.inventory, expectedInventory);
  },
});

Deno.test({
  name: "should provide the inventory amounts",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedAmounts = new Array<number>(0xF).fill(42);
    testData.set(expectedAmounts, 0x008C);
    const instance = new SaveSlot(testData);
    assertEquals(instance.inventoryAmounts, expectedAmounts);
  },
});

Deno.test({
  name: "should set the inventory amounts",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedAmounts = new Array<number>(0xF).fill(42);
    const instance = new SaveSlot(testData);
    instance.inventoryAmounts = expectedAmounts;
    assertEquals(instance.inventoryAmounts, expectedAmounts);
  },
});

Deno.test({
  name: "should provide magic beans",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedBeans = 42;
    testData.set(toUint8Array(expectedBeans, 1), 0x009B);
    const instance = new SaveSlot(testData);
    assertEquals(instance.magicBeans, expectedBeans);
  },
});

Deno.test({
  name: "should set magic beans",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedBeans = 44;
    const instance = new SaveSlot(testData);
    instance.magicBeans = expectedBeans;
    assertEquals(instance.magicBeans, expectedBeans);
  },
});

Deno.test({
  name: "should get obtained equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment: Array<EquippableItems> = [
      Sword.KokiriSword,
      Sword.MasterSword,
      Shield.KokiriShield,
      Tunic.ZoraTunic,
      Boots.HoverBoots,
    ];
    testData.set(
      toUint8Array(expectedEquipment.reduce((l, r) => l | r), 2),
      0x009C,
    );
    const instance = new SaveSlot(testData);
    assertEquals(instance.obtainedEquipment, expectedEquipment);
  },
});

Deno.test({
  name: "should set obtained equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment: Array<EquippableItems> = [
      Sword.MasterSword,
      Shield.MirrorShield,
      Tunic.KokiriTunic,
      Boots.HoverBoots,
      Boots.IronBoots,
    ];
    const instance = new SaveSlot(testData);
    instance.obtainedEquipment = expectedEquipment;
    assertEquals(
      instance.obtainedEquipment.toSorted(),
      expectedEquipment.toSorted(),
    );
  },
});

Deno.test({
  name: "should get obtained upgrades",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedUpgrades: Array<ObtainableUpgrades> = [
      DekuNutUpgrades.DekuNutUpgradeHolds30Nuts,
      DekuStickUpgrades.DekuStickUpgradeHolds20Sticks,
      DekuStickUpgrades.DekuStickUpgradeHolds30Sticks,
      BulletBag.BulletBagHolds30,
      BombBag.BombBagHolds20,
      Quiver.QuiverHolds40,
    ];
    testData.set(
      toUint8Array(expectedUpgrades.reduce((l, r) => l | r), 4),
      0x00A0,
    );
    const instance = new SaveSlot(testData);
    assertEquals(instance.obtainedUpgrades, expectedUpgrades);
  },
});

Deno.test({
  name: "should set obtained upgrades",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedUpgrades: Array<ObtainableUpgrades> = [
      DekuNutUpgrades.DekuNutUpgradeHolds30Nuts,
      BulletBag.BulletBagHolds40,
      BombBag.BombBagHolds30,
      Quiver.QuiverHolds30,
      Quiver.QuiverHolds50,
    ];
    const instance = new SaveSlot(testData);
    instance.obtainedUpgrades = expectedUpgrades;
    assertEquals(
      instance.obtainedUpgrades.toSorted(),
      expectedUpgrades.toSorted(),
    );
  },
});

Deno.test({
  name: "should get obtained quest items",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItems: Array<QuestItems> = [
      Medallions.ForestMedallion,
      Medallions.FireMedallion,
      Songs.SariasSong,
      SpiritualStones.StoneofAgony,
      Tokens.GoldSkulltulaToken,
    ];
    testData.set(
      toUint8Array(expectedItems.reduce((l, r) => l | r), 4),
      0x00A4,
    );
    const instance = new SaveSlot(testData);
    assertEquals(instance.questStatusItems, expectedItems);
  },
});

Deno.test({
  name: "should set obtained quest items",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItems: Array<QuestItems> = [
      Medallions.ForestMedallion,
      Medallions.ShadowMedallion,
      Songs.SariasSong,
      SpiritualStones.StoneofAgony,
      Tokens.GoldSkulltulaToken,
      Tokens.GerudosCard,
    ];
    const instance = new SaveSlot(testData);
    instance.questStatusItems = expectedItems;
    assertEquals(
      instance.questStatusItems.toSorted(),
      expectedItems.toSorted(),
    );
  },
});

Deno.test({
  name: "should provide dungeon items",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItems = new Array<Array<DungeonItems>>(0x14).fill([
      DungeonItems.Compass,
    ]);
    testData.set(
      expectedItems.map((itemSet) => itemSet.reduce((l, r) => l | r)),
      0x00A8,
    );
    const instance = new SaveSlot(testData);
    assertEquals(instance.dungeonItems, expectedItems);
  },
});

Deno.test({
  name: "should set dungeon items",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItems = new Array<Array<DungeonItems>>(0x14).fill([
      DungeonItems.DungeonMap,
    ]);
    const instance = new SaveSlot(testData);
    instance.dungeonItems = expectedItems;
    assertEquals(instance.dungeonItems, expectedItems);
  },
});

Deno.test({
  name: "should provide small key amount",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedKeys = new Array<number>(0x14).fill(0x23);
    testData.set(expectedKeys, 0x00BC);
    const instance = new SaveSlot(testData);
    assertEquals(instance.smallKeyAmount, expectedKeys);
  },
});

Deno.test({
  name: "should set small key amount",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedKeys = new Array<number>(0x14).fill(0x23);
    const instance = new SaveSlot(testData);
    instance.smallKeyAmount = expectedKeys;
    assertEquals(instance.smallKeyAmount, expectedKeys);
  },
});

Deno.test({
  name: "should provide double defense hearts",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedHearts = 13;
    testData.set(toUint8Array(expectedHearts, 1), 0x00CF);
    const instance = new SaveSlot(testData);
    assertEquals(instance.doubleDefenseHearts, expectedHearts);
  },
});

Deno.test({
  name: "should set double defense hearts",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedHearts = 23;
    const instance = new SaveSlot(testData);
    instance.doubleDefenseHearts = expectedHearts;
    assertEquals(instance.doubleDefenseHearts, expectedHearts);
  },
});

Deno.test({
  name: "should provide gold skulltula tokens",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedTokens = 50;
    testData.set(toUint8Array(expectedTokens, 2), 0x00D0);
    const instance = new SaveSlot(testData);
    assertEquals(instance.goldSkulltulaTokens, expectedTokens);
  },
});

Deno.test({
  name: "should set gold skulltula tokens",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedTokens = 50;
    const instance = new SaveSlot(testData);
    instance.goldSkulltulaTokens = expectedTokens;
    assertEquals(instance.goldSkulltulaTokens, expectedTokens);
  },
});

// TODO permanent scene flags

// TODO proper test for entrance index
Deno.test({
  name: "should get entrace index transport",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEntrance = 42;
    testData.set(toUint8Array(expectedEntrance, 2), 0x0E7A);
    const instance = new SaveSlot(testData);
    assertEquals(instance.entranceIndexTransport, expectedEntrance);
  },
});

Deno.test({
  name: "should get coordinates of farores wind warp",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedXCoordinate = 23;
    const expectedYCoordinate = 32;
    const expectedZCoordinate = 42;
    const expectedYRotation = 123;
    testData.set(toUint8Array(expectedXCoordinate, 4), 0x0E64);
    testData.set(toUint8Array(expectedYCoordinate, 4), 0x0E68);
    testData.set(toUint8Array(expectedZCoordinate, 4), 0x0E6C);
    testData.set(toUint8Array(expectedYRotation, 2), 0x0E72);
    const instance = new SaveSlot(testData);
    assertEquals(instance.faroresWindWarp, {
      x: expectedXCoordinate,
      y: expectedYCoordinate,
      z: expectedZCoordinate,
      yRotation: expectedYRotation,
    });
  },
});

Deno.test({
  name: "should set the coordinates of farores wind warp",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedWindWarp: FaroresWindWarp = {
      x: 23,
      y: 32,
      z: 42,
      yRotation: 123,
    };
    const instance = new SaveSlot(testData);
    instance.faroresWindWarp = expectedWindWarp;
    assertEquals(instance.faroresWindWarp, expectedWindWarp);
  },
});

Deno.test({
  name: "should get big poe points",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedPoints = 42;
    testData.set(toUint8Array(expectedPoints, 4), 0x0EBC);
    const instance = new SaveSlot(testData);
    assertEquals(instance.bigPoePoints, expectedPoints);
  },
});

Deno.test({
  name: "should set big poe points",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedPoints = 42;
    const instance = new SaveSlot(testData);
    instance.bigPoePoints = expectedPoints;
    assertEquals(instance.bigPoePoints, expectedPoints);
  },
});

Deno.test({
  name: "should calculate the checksum",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedSum = 42;
    testData.set(toUint8Array(0x00FF, 2), 0x0004);
    testData.set(toUint8Array(0xFF00, 2), 0x0006);
    testData.set(toUint8Array(expectedSum, 2), 0x001A);
    const instance = new SaveSlot(testData);
    assertEquals(instance.calculateChecksum(), expectedSum);
  },
});

Deno.test({
  name: "should update the checksum",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const instance = new SaveSlot(testData);
    const emptyChecksum = instance.checksum;
    instance.rupees = 42;
    assertNotEquals(instance.calculateChecksum(), emptyChecksum);
  },
});

Deno.test({
  name: "should report if slot is valid",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const encoder = new TextEncoder();
    const pattern = encoder.encode("ZELDAZ");
    testData.set(pattern, 0x001C);
    const instance = new SaveSlot(testData);
    assertEquals(instance.isValid, true);
  },
});

Deno.test({
  name: "should report if slot is not valid",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const instance = new SaveSlot(testData);
    assertEquals(instance.isValid, false);
  },
});

Deno.test({
  name: "should get file index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedIndex = 2;
    testData.set(toUint8Array(expectedIndex, 4), 0x1354);
    const instance = new SaveSlot(testData);
    assertEquals(instance.fileIndex, expectedIndex);
  },
});

Deno.test({
  name: "should set the file index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedIndex = 1;
    const instance = new SaveSlot(testData);
    instance.fileIndex = expectedIndex;
    assertEquals(instance.fileIndex, expectedIndex);
  },
});
