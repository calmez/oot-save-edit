import { assertEquals, assertThrows } from "@std/assert";
import { SraSaveFile } from "../models/savefile.ts";
import { Age, InventoryItems } from "../models/saveslot.ts";
import { compareRecoveryPair } from "./recovery.ts";

Deno.test("recovery comparison reports neutral interpreted values and remaining byte differences", () => {
  const save = new SraSaveFile();
  save.slots[0].maxHealth = 160;
  save.slots[0].rupees = 321;
  save.backups[0].maxHealth = 48;
  save.backups[0].rupees = 0;
  save.backups[0].data[0x700] = 0xA5;

  const pair = compareRecoveryPair(save, 0);

  assertEquals(pair.identical, false);
  assertEquals(pair.byteDifferences > 0, true);
  assertEquals(pair.uninterpretedByteDifferences, 1);
  assertEquals(
    pair.comparisons.find((item) => item.field === "healthCapacity"),
    {
      field: "healthCapacity",
      label: "Health capacity",
      primary: { available: true, value: "10 hearts" },
      backup: { available: true, value: "3 hearts" },
      equal: false,
    },
  );
  assertEquals(
    pair.comparisons.find((item) => item.field === "rupees")?.equal,
    false,
  );
  assertEquals(pair.primaryIntegrity.occupied, true);
  assertEquals(pair.backupIntegrity.occupied, true);
});

Deno.test("recovery comparison marks uninterpretable age as unavailable without choosing a record", () => {
  const save = new SraSaveFile();
  save.slots[0].age = Age.Invalid;
  save.slots[0].updateChecksum();

  const pair = compareRecoveryPair(save, 0);

  const age = pair.comparisons.find((item) => item.field === "age")!;
  assertEquals(age.primary.available, false);
  assertEquals(age.equal, null);
  assertEquals(pair.primaryIntegrity.checksumValid, true);
});

Deno.test("recovery comparison marks malformed inventory and upgrade values unavailable", () => {
  const save = new SraSaveFile();
  const inventory = save.slots[0].inventory;
  inventory[0] = 0xFE as InventoryItems;
  save.slots[0].inventory = inventory;
  save.slots[0].data[0xA3] = 4;
  save.slots[0].updateChecksum();

  const pair = compareRecoveryPair(save, 0);

  assertEquals(
    pair.comparisons.find((item) => item.field === "inventory")?.primary
      .available,
    false,
  );
  assertEquals(
    pair.comparisons.find((item) => item.field === "upgrades")?.primary
      .available,
    false,
  );
});

Deno.test("recovery comparison validates the paired slot index", () => {
  assertThrows(() => compareRecoveryPair(new SraSaveFile(), 3), Error);
});
