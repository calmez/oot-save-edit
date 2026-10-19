import { assertEquals } from "@std/assert";

import {
  Age,
  Boots,
  ChecksumPolicy,
  diagnoseSave,
  ExportByteOrder,
  InventoryItems,
  Shield,
  SraSaveFile,
  SrmSaveFile,
  Sword,
  Tunic,
} from "../index.ts";

Deno.test("diagnosis separates header and occupied-slot integrity failures from empty slots", () => {
  const save = new SraSaveFile();
  save.header.data[3] = 0;
  save.header.data[12] = 1;
  save.slots[0].data[0x1C] = 0;
  save.backups[0].checksum ^= 1;
  const before = save.getData();
  const result = diagnoseSave(save);
  assertEquals(result.slots.map((slot) => slot.occupancy), [
    "occupied",
    "empty",
    "empty",
    "occupied",
    "empty",
    "empty",
  ]);
  assertEquals(
    result.findings.filter((finding) => finding.category === "structural")
      .map((finding) => [finding.ruleId, finding.scope]),
    [
      ["header.signature", { kind: "header", field: "signature" }],
      ["header.padding", { kind: "header", field: "padding" }],
      ["slot.marker", {
        kind: "slot",
        record: "primary",
        index: 0,
        field: "marker",
      }],
      ["slot.checksum", {
        kind: "slot",
        record: "primary",
        index: 0,
        field: "checksum",
      }],
      ["slot.checksum", {
        kind: "slot",
        record: "backup",
        index: 0,
        field: "checksum",
      }],
    ],
  );
  assertEquals(save.getData(), before);
  assertEquals(diagnoseSave(save), result);
});

Deno.test("valid and empty records need no structural or gameplay findings", () => {
  const save = new SraSaveFile();
  save.header.makeValid(true);
  save.slots[1].data.fill(0);
  save.slots[2].checksum ^= 1;
  const result = diagnoseSave(save);
  assertEquals(result.findings.map((finding) => finding.ruleId), [
    "context.game-version",
  ]);
  assertEquals(result.slots.slice(1, 3).map((slot) => slot.occupancy), [
    "empty",
    "empty",
  ]);
});

Deno.test("diagnosis preserves complete bytes, object identity and export state without Deno", () => {
  const original = new SrmSaveFile();
  original.eeprom.fill(0x12);
  original.mempacks.forEach((pack) => pack.fill(0x34));
  original.flashram.fill(0x56);
  const sraBytes = new SraSaveFile().getData();
  sraBytes.fill(0x78, SraSaveFile.requiredSize);
  original.sram.set(sraBytes);
  const save = original.saveFile;
  save.header.data[3] = 0;
  save.slots[0].age = Age.Adult;
  save.slots[0].data[0x1C] = 0;
  save.slots[0].checksum = 123;
  save.backups[0].data[0x71] = 0x11;
  save.backups[0].checksum = 456;
  const records = [...save.slots, ...save.backups];
  const header = save.header;
  const snapshot = () => ({
    data: save.getData(),
    export: save.getDataForWrite(
      ExportByteOrder.Automatic,
      ChecksumPolicy.MaintainEdited,
    ),
    source: save.sourceSrmData?.slice(),
    srm: SrmSaveFile.fromSaveFile(save).getData(),
    swapped: save.isByteSwapped,
    slots: records.map((slot) => ({
      bytes: slot.data.slice(),
      additional: slot.additionalData,
      equipment: slot.currentlyEquippedEquipment,
      buttons: slot.currentButtonEquips,
      age: slot.age,
      valid: slot.isValid,
      empty: slot.isEmpty,
    })),
  });
  const before = snapshot();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Deno")!;
  Reflect.deleteProperty(globalThis, "Deno");
  try {
    const first = diagnoseSave(save);
    assertEquals(first.context.container, "srm");
    assertEquals(diagnoseSave(save), first);
    assertEquals(
      new Set(first.findings.map((finding) => finding.id)).size,
      first.findings.length,
    );
    assertEquals(snapshot(), before);
    assertEquals(save.header === header, true);
    assertEquals(
      [...save.slots, ...save.backups].every((slot, i) => slot === records[i]),
      true,
    );
    const id = first.findings.find((finding) =>
      finding.scope.field === "checksum"
    )!.id;
    save.slots[0].checksum = 124;
    assertEquals(
      diagnoseSave(save).findings.find((finding) => finding.id === id)?.id,
      id,
    );
  } finally {
    Object.defineProperty(globalThis, "Deno", descriptor);
  }
});

Deno.test("button item restrictions cover swords, trade items and neutral assignments", () => {
  // Worked examples from gItemAgeReqs at the pinned revision, not equipment masks.
  const cases: [Age, number, boolean][] = [
    [Age.Child, 0x3B, false],
    [Age.Child, 0x3C, true],
    [Age.Child, 0x3D, true],
    [Age.Child, 0x55, true],
    [Age.Adult, 0x3B, true],
    [Age.Adult, 0x3C, false],
    [Age.Adult, 0x3D, false],
    [Age.Adult, 0x55, false],
    [Age.Adult, 0x00, true],
    [Age.Child, 0x03, true],
    [Age.Adult, 0x06, true],
    [Age.Child, 0x0B, true],
    [Age.Adult, 0x10, true],
    [Age.Child, 0x11, true],
    [Age.Adult, 0x21, true],
    [Age.Adult, 0x2C, true],
    [Age.Child, 0x2D, true],
    [Age.Child, 0x37, true],
    [Age.Child, 0x38, true],
    [Age.Child, 0x3A, true],
    [Age.Child, 0x01, false],
    [Age.Adult, 0x02, false],
    [Age.Adult, 0x07, false],
    [Age.Child, 0x08, false],
    [Age.Child, 0x14, false],
    [Age.Adult, 0x1B, false],
    [Age.Child, 0xFF, false],
    [Age.Adult, 0xFF, false],
  ];
  const save = new SraSaveFile();
  for (const [age, item, mismatch] of cases) {
    save.slots[0].age = age;
    save.slots[0].cRightButtonEquip = item as InventoryItems;
    const findings = diagnoseSave(save).findings.filter((finding) =>
      finding.scope.field === "active.buttons.cRight"
    );
    assertEquals(
      findings.map((finding) => finding.category),
      mismatch ? ["gameplay"] : [],
      `${Age[age]} item ${item.toString(16)}`,
    );
  }
});

Deno.test("active equipment and buttons diagnose age compatibility rather than ownership", () => {
  const save = new SraSaveFile();
  const slot = save.slots[0];
  slot.age = Age.Adult;
  slot.currentlyEquippedEquipment = {
    sword: Sword.KokiriSword,
    shield: Shield.KokiriShield,
    tunic: Tunic.KokiriTunic,
    boots: Boots.KokiriBoots,
  };
  slot.bButtonEquip = 0x3B as InventoryItems; // Kokiri Sword item ID, distinct from equipment bits.
  slot.cLeftButtonEquip = InventoryItems.ZeldasLetter;
  slot.cDownButtonEquip = InventoryItems.DekuNut;
  slot.obtainedEquipment = [Sword.KokiriSword, Shield.KokiriShield];
  const fields = () =>
    diagnoseSave(save).findings
      .filter((finding) => finding.category === "gameplay")
      .map((finding) => finding.scope.field);
  assertEquals(fields(), [
    "active.equipment.sword",
    "active.equipment.shield",
    "active.buttons.b",
    "active.buttons.cLeft",
  ]);
  slot.age = Age.Child;
  slot.currentlyEquippedEquipment = {
    sword: Sword.MasterSword,
    shield: Shield.HylianShield,
    tunic: Tunic.GoronTunic,
    boots: Boots.HoverBoots,
  };
  slot.bButtonEquip = 0x3C as InventoryItems;
  slot.cLeftButtonEquip = InventoryItems.PocketEgg;
  assertEquals(fields(), [
    "active.equipment.sword",
    "active.equipment.tunic",
    "active.equipment.boots",
    "active.buttons.b",
    "active.buttons.cLeft",
  ]);
  slot.currentlyEquippedEquipment = {
    sword: 0 as Sword,
    shield: Shield.HylianShield,
    tunic: Tunic.KokiriTunic,
    boots: Boots.KokiriBoots,
  };
  slot.bButtonEquip = InventoryItems.Empty;
  slot.cLeftButtonEquip = InventoryItems.Empty;
  slot.inventory = new Array(24).fill(InventoryItems.Hookshot);
  slot.obtainedEquipment = [Sword.MasterSword, Shield.MirrorShield];
  assertEquals(fields(), []);
});

Deno.test("saved loadouts use their own ages and accept uninitialized loadouts", () => {
  const save = new SraSaveFile();
  const slot = save.backups[0];
  const fields = () =>
    diagnoseSave(save).findings
      .filter((finding) => finding.category === "gameplay")
      .map((finding) => finding.scope);
  slot.age = Age.Adult;
  slot.additionalData = {
    ...slot.additionalData,
    childEquipment: 0x2322, // Master Sword, Hylian Shield, Zora Tunic, Iron Boots.
    childButtonItems: [0x3D, InventoryItems.Hookshot, 0xFF, 0xFF],
  };
  assertEquals(
    fields(),
    [
      "child.equipment.sword",
      "child.equipment.tunic",
      "child.equipment.boots",
      "child.buttons.b",
      "child.buttons.cLeft",
    ].map((field) => ({ kind: "slot", record: "backup", index: 0, field })),
  );
  slot.age = Age.Child;
  slot.additionalData = {
    ...slot.additionalData,
    childEquipment: 0,
    childButtonItems: [0, 0, 0, 0],
    adultEquipment: 0x0011,
    adultButtonItems: [0x3B, InventoryItems.Boomerang, 0xFF, 0xFF],
  };
  assertEquals(
    fields(),
    [
      "adult.equipment.sword",
      "adult.equipment.shield",
      "adult.buttons.b",
      "adult.buttons.cLeft",
    ].map((field) => ({ kind: "slot", record: "backup", index: 0, field })),
  );
  slot.additionalData = {
    ...slot.additionalData,
    adultEquipment: 0,
    adultButtonItems: [0xFF, 0xFF, 0xFF, 0xFF],
  };
  assertEquals(fields(), []);
});

Deno.test("unknown versions, ages, values and tentative fields retain uncertainty and provenance", () => {
  const save = new SraSaveFile();
  const slot = save.slots[0];
  slot.age = 0x1234 as Age;
  slot.data[0x70] = 0xF0; // Unknown boots tier.
  slot.bButtonEquip = 0xFE as InventoryItems;
  slot.cLeftButtonEquip = InventoryItems.Hookshot;
  slot.entranceIndexTransport = 1;
  const result = diagnoseSave(save);
  assertEquals(result.context.gameVersion, null);
  assertEquals(result.context.platformCompatibility, "unverified");
  assertEquals(
    result.findings.filter((finding) => finding.category === "gameplay"),
    [],
  );
  const uncertain = result.findings.filter((finding) =>
    finding.category === "uncertainty"
  );
  assertEquals(uncertain.map((finding) => finding.ruleId), [
    "context.game-version",
    "age.unknown",
    "age.unknown-value",
    "age.unknown-value",
    "interpretation.tentative",
  ]);
  assertEquals(uncertain.map((finding) => finding.scope.field), [
    "gameVersion",
    "age",
    "active.equipment.boots",
    "active.buttons.b",
    "entranceIndexTransport",
  ]);
  for (const finding of uncertain) {
    assertEquals(finding.confidence, "unknown");
    assertEquals(finding.evidence.length > 0, true);
    assertEquals(
      finding.evidence.every((evidence) =>
        evidence.source.length > 0 && evidence.reference.length > 0 &&
        evidence.applicability.length > 0 && evidence.limitations.length > 0
      ),
      true,
    );
  }
  save.header.languageOption = 0;
  assertEquals(diagnoseSave(save).context.gameVersion, null);
  save.header.languageOption = 2;
  assertEquals(diagnoseSave(save).context.gameVersion, null);
});
