import { assertInstanceOf } from "@std/assert/instance-of";
import { Age, InventoryItems, Items, SaveSlot } from "./saveslot.ts";
import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import { toUint8Array } from "../utils/conversions.ts";
import { OotText } from "../utils/text.ts";

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
    const expectedMagic = 1;
    testData.set(toUint8Array(expectedMagic, 1), 0x0033);
    const instance = new SaveSlot(testData);
    assertEquals(instance.currentMagic, expectedMagic);
  },
});

Deno.test({
  name: "should set the current magic",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedMagic = 2;
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
    const expectedIndex = 12;
    testData.set(toUint8Array(expectedIndex, 2), 0x0066);
    const instance = new SaveSlot(testData);
    assertEquals(instance.savedSceneIndex, expectedIndex);
  },
});

Deno.test({
  name: "should set the saved scene index",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedIndex = 12;
    const instance = new SaveSlot(testData);
    instance.savedSceneIndex = expectedIndex;
    assertEquals(instance.savedSceneIndex, expectedIndex);
  },
});

Deno.test({
  name: "should provide the B button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 56;
    testData.set(toUint8Array(expectedEquipment, 1), 0x0068);
    const instance = new SaveSlot(testData);
    assertEquals(instance.bButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the B button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 56;
    const instance = new SaveSlot(testData);
    instance.bButtonEquip = expectedEquipment;
    assertEquals(instance.bButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the C left button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 58;
    testData.set(toUint8Array(expectedEquipment, 1), 0x0069);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cLeftButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the C left button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 58;
    const instance = new SaveSlot(testData);
    instance.cLeftButtonEquip = expectedEquipment;
    assertEquals(instance.cLeftButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the C down button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 60;
    testData.set(toUint8Array(expectedEquipment, 1), 0x006A);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cDownButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the C down button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 60;
    const instance = new SaveSlot(testData);
    instance.cDownButtonEquip = expectedEquipment;
    assertEquals(instance.cDownButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the C right button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 62;
    testData.set(toUint8Array(expectedEquipment, 1), 0x006B);
    const instance = new SaveSlot(testData);
    assertEquals(instance.cRightButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should set the C right button equipment",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedEquipment = 62;
    const instance = new SaveSlot(testData);
    instance.cRightButtonEquip = expectedEquipment;
    assertEquals(instance.cRightButtonEquip, expectedEquipment);
  },
});

Deno.test({
  name: "should provide the inventory",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItem = Items.Bomb;
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
      InventoryItems.Empty,
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
  name: "should provide dungeon items",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItems = new Uint8Array(0x14).fill(0x23);
    testData.set(expectedItems, 0x00A8);
    const instance = new SaveSlot(testData);
    assertEquals(instance.dungeonItems, expectedItems);
  },
});

Deno.test({
  name: "should set dungeon items",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedItems = new Uint8Array(0x14).fill(0x23);
    const instance = new SaveSlot(testData);
    instance.dungeonItems = expectedItems;
    assertEquals(instance.dungeonItems, expectedItems);
  },
});

Deno.test({
  name: "should provide small key amount",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedKeys = new Uint8Array(0x14).fill(0x23);
    testData.set(expectedKeys, 0x00BC);
    const instance = new SaveSlot(testData);
    assertEquals(instance.smallKeyAmount, expectedKeys);
  },
});

Deno.test({
  name: "should set small key amount",
  fn() {
    const testData = new Uint8Array(SaveSlot.requiredSize);
    const expectedKeys = new Uint8Array(0x14).fill(0x23);
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
