import { assertEquals, assertThrows } from "@std/assert";

import {
  ChecksumPolicy,
  ExportByteOrder,
  SraSaveFile,
  SrmSaveFile,
} from "../models/savefile.ts";
import { BombBag, DungeonItems, Shield } from "../models/saveslot.ts";
import { setAdditionalField } from "../ui/additionalfields.ts";
import { diagnoseSave } from "./diagnostics.ts";
import {
  applyFieldReplacement,
  fieldReplacementInput,
  inspectSlotFields,
  interpretSlotField,
  prepareFieldReplacement,
} from "./fieldinterpretation.ts";
import { FileFormat, FileUtil } from "./fileutil.ts";

Deno.test("unavailable Boolean interpretation preserves storage until a replacement is accepted", () => {
  const save = new SraSaveFile();
  const slot = save.backups[0];
  slot.data[0x3A] = 2;
  const checksum = slot.checksum;
  const before = save.getData();
  const result = interpretSlotField(slot, "magicFlag1");
  assertEquals(result.status, "unavailable");
  assertEquals(result.storedValue, 2);
  assertEquals(result.value, undefined);
  const finding = diagnoseSave(save).findings.find((finding) =>
    finding.ruleId === "field.unsupported" &&
    finding.scope.kind === "slot" && finding.scope.record === "backup" &&
    finding.scope.index === 0 && finding.scope.field === "magicFlag1"
  );
  assertEquals(finding?.category, "uncertainty");
  const replacement = prepareFieldReplacement(slot, "magicFlag1", false);
  assertEquals(save.getData(), before);
  applyFieldReplacement(slot, replacement);
  assertEquals(slot.magicFlag1, false);
  assertEquals(slot.checksum, checksum);
  assertThrows(() => prepareFieldReplacement(slot, "magicFlag1", 2));
});

Deno.test("button replacement labels share diagnostics identities and tentative fields remain uncertain", () => {
  assertEquals(
    fieldReplacementInput("currentButtonEquips.bButton").options?.[61],
    "BiggoronSword",
  );
  assertEquals(
    fieldReplacementInput("additionalData.childButtonItems.0").options?.[85],
    "GiantsKnife",
  );
  const slot = new SraSaveFile().slots[0];
  slot.data[0x33] = 17;
  assertEquals(interpretSlotField(slot, "currentMagic").status, "available");
  slot.data.fill(255, 0xE78, 0xE7C);
  assertEquals(
    interpretSlotField(slot, "entranceIndexTransport").status,
    "uncertain",
  );
  slot.mapNumber = 1;
  assertEquals(interpretSlotField(slot, "mapNumber").status, "uncertain");
  slot.faroresWindWarp = { x: 1, y: 2, z: 3, yRotation: 4 };
  assertEquals(interpretSlotField(slot, "faroresWindWarp").status, "uncertain");
});

Deno.test("partial saves retain unrelated bytes through SRA/SRM export under both checksum policies", () => {
  for (const format of [FileFormat.SRA, FileFormat.SRM]) {
    const original = new SraSaveFile();
    original.slots[0].data[0x3A] = 2;
    original.backups[0].data[0x24] = 255;
    original.backups[0].data[0x3D] = 2;
    original.backups[0].data[0xE83] = 2;
    original.slots[0].checksum = 0x1234;
    const container = SrmSaveFile.fromSaveFile(
      original,
      ExportByteOrder.Automatic,
      ChecksumPolicy.Preserve,
    );
    container.eeprom.fill(0xAA);
    container.mempacks[0].fill(0xBB);
    container.flashram.fill(0xCC);
    const source = format === FileFormat.SRA
      ? original.getData()
      : container.getData();
    const save = FileUtil.loadFileFromBuffer(source);
    const before = save.getData();
    const backup = save.backups[0].data.slice();
    diagnoseSave(save);
    inspectSlotFields(save.slots[0]);
    assertEquals(save.getData(), before);
    assertEquals(
      FileUtil.getFileData(
        save,
        format,
        ExportByteOrder.Automatic,
        ChecksumPolicy.Preserve,
      ),
      source,
    );
    save.slots[0].rupees = 42;
    for (
      const policy of [ChecksumPolicy.Preserve, ChecksumPolicy.MaintainEdited]
    ) {
      const exported = FileUtil.getFileData(
        save,
        format,
        ExportByteOrder.Automatic,
        policy,
      );
      const reread = FileUtil.loadFileFromBuffer(exported);
      assertEquals(reread.slots[0].rupees, 42);
      assertEquals(reread.slots[0].data[0x3A], 2);
      assertEquals(
        reread.slots[0].checksum,
        policy === ChecksumPolicy.Preserve
          ? 0x1234
          : reread.slots[0].calculateChecksum(),
      );
      assertEquals(reread.backups[0].data, backup);
      if (format === FileFormat.SRM) {
        const retained = new SrmSaveFile().read(exported);
        assertEquals(retained.eeprom, container.eeprom);
        assertEquals(retained.mempacks, container.mempacks);
        assertEquals(retained.flashram, container.flashram);
      }
    }
    assertEquals(save.slots[0].checksum, 0x1234);
  }
});

Deno.test("replacement acceptance rejects stale proposals and another record without partial writes", () => {
  const save = new SraSaveFile();
  const slot = save.slots[0];
  slot.data[0x3A] = 2;
  const replacement = prepareFieldReplacement(slot, "magicFlag1", false);
  const backup = save.backups[0].data.slice();
  assertThrows(() => applyFieldReplacement(save.backups[0], replacement));
  assertEquals(save.backups[0].data, backup);
  slot.data[0x3A] = 3;
  const before = slot.data.slice();
  assertThrows(() => applyFieldReplacement(slot, replacement));
  assertEquals(slot.data, before);
});

Deno.test("composite replacements require supported members and warp coordinates can be replaced independently", () => {
  const slot = new SraSaveFile().slots[0];
  slot.additionalData = { ...slot.additionalData, childEquipment: 15 };
  assertThrows(() =>
    prepareFieldReplacement(slot, "additionalData.childEquipment", 15)
  );
  assertThrows(() =>
    prepareFieldReplacement(slot, "additionalData.childButtonItems", [
      254,
      255,
      255,
      255,
    ])
  );
  slot.faroresWindWarp = { x: 123, y: -456, z: 789, yRotation: -90 };
  const before = slot.data.slice();
  const replacement = prepareFieldReplacement(slot, "faroresWindWarp.x", -123);
  assertEquals(slot.data, before);
  applyFieldReplacement(slot, replacement);
  assertEquals(slot.faroresWindWarp, {
    x: -123,
    y: -456,
    z: 789,
    yRotation: -90,
  });
  assertThrows(() =>
    prepareFieldReplacement(slot, "faroresWindWarp.x", 0x80000000)
  );
});

Deno.test("field interpretation and replacement work without Deno globals", () => {
  const save = new SraSaveFile();
  save.slots[0].data[0x3A] = 2;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Deno");
  try {
    Object.defineProperty(globalThis, "Deno", {
      configurable: true,
      value: undefined,
    });
    assertEquals(
      interpretSlotField(save.slots[0], "magicFlag1").value,
      undefined,
    );
    const replacement = prepareFieldReplacement(
      save.slots[0],
      "magicFlag1",
      false,
    );
    applyFieldReplacement(save.slots[0], replacement);
    assertEquals(save.slots[0].magicFlag1, false);
    assertEquals(diagnoseSave(save).slots[0].occupancy, "occupied");
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "Deno", descriptor);
  }
});

Deno.test("unsupported text, enums and composite members are reported without inventing values", () => {
  const slot = new SraSaveFile().slots[0];
  slot.data[0x24] = 255;
  slot.data[7] = 9;
  slot.entranceIndex = 0xFFFFFFFF;
  slot.data[0x3D] = 2;
  slot.data[0x74] = 254;
  slot.data[0x71] = 0x15;
  slot.data[0xA3] = 7;
  slot.data[0xA8] = 0x80;
  const before = slot.data.slice();
  const fields = inspectSlotFields(slot).filter((field) =>
    field.status !== "available"
  );
  for (
    const name of [
      "playerName",
      "age",
      "entranceIndex",
      "additionalData.doubleDefenseAcquired",
      "inventory.0",
      "currentlyEquippedEquipment.sword",
      "obtainedUpgrades.7",
      "dungeonItems.0",
    ]
  ) {
    assertEquals(fields.some((field) => field.field === name), true, name);
  }
  assertEquals(interpretSlotField(slot, "age").storedValue, 9);
  assertEquals(interpretSlotField(slot, "rupees").status, "available");
  const replacement = prepareFieldReplacement(
    slot,
    "additionalData.doubleDefenseAcquired",
    false,
  );
  assertEquals(slot.data, before);
  applyFieldReplacement(slot, replacement);
  assertEquals(slot.data[0x3D], 0);
  const name = prepareFieldReplacement(slot, "playerName", "Link");
  applyFieldReplacement(slot, name);
  assertEquals(slot.playerName, "Link");
  assertThrows(() => prepareFieldReplacement(slot, "age", 9));
});

Deno.test("editing supported composite members preserves unsupported neighbors and unnamed bits", () => {
  const slot = new SraSaveFile().slots[0];
  for (const offset of [0x3D, 0xF40, 0x12C5]) slot.data[offset] = 2;
  setAdditionalField(slot, "totalDays", "5");
  assertEquals([slot.data[0x3D], slot.data[0xF40], slot.data[0x12C5]], [
    2,
    2,
    2,
  ]);
  slot.data[0xA3] = 7;
  slot.obtainedUpgrades = [...slot.obtainedUpgrades, BombBag.BombBagHolds20];
  assertEquals(slot.data[0xA3], 15);
  slot.data[0xA8] = 0x80;
  const dungeons = slot.dungeonItems;
  dungeons[0].push(DungeonItems.DungeonMap);
  slot.dungeonItems = dungeons;
  assertEquals(slot.data[0xA8], 0x84);
  slot.data[0x71] = 0x15;
  slot.currentlyEquippedEquipment = {
    ...slot.currentlyEquippedEquipment,
    shield: Shield.HylianShield,
  };
  assertEquals(slot.data[0x71], 0x25);
});
