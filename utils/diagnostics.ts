import type { SraSaveFile } from "../models/savefile.ts";
import { Age, InventoryItems } from "../models/saveslot.ts";
import { toNumber } from "./conversions.ts";

export enum DiagnosticCategory {
  Structural = "structural",
  Gameplay = "gameplay",
  Uncertainty = "uncertainty",
}

export enum DiagnosticConfidence {
  Evidenced = "evidenced",
  Unknown = "unknown",
}

export type DiagnosticScope =
  | { kind: "file" | "header"; field: string }
  | {
    kind: "slot";
    record: "primary" | "backup";
    index: number;
    field: string;
  };

export interface DiagnosticContext {
  layout: "sra";
  container: "sra" | "srm";
  gameVersion: null;
  platformCompatibility: "unverified";
}

export interface DiagnosticEvidence {
  source: string;
  reference: string;
  applicability: string;
  limitations: string;
}

export interface DiagnosticFinding {
  /** Stable rule and scope identity, independent of message text and values. */
  id: string;
  ruleId: string;
  category: DiagnosticCategory;
  scope: DiagnosticScope;
  explanation: string;
  confidence: DiagnosticConfidence;
  evidence: DiagnosticEvidence[];
  context: DiagnosticContext;
}

export interface SlotDiagnosis {
  record: "primary" | "backup";
  index: number;
  occupancy: "empty" | "occupied";
}

export interface SaveDiagnosis {
  context: DiagnosticContext;
  slots: SlotDiagnosis[];
  findings: DiagnosticFinding[];
}

const sourceRoot =
  "https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/";

function structuralEvidence(): DiagnosticEvidence {
  return {
    source: `${sourceRoot}src/code/z_sram.c`,
    reference:
      "Sram_InitSram, Sram_VerifyAndLoadAllSaves; existing core integrity checks",
    applicability: "Recognized original N64 SRAM layout",
    limitations:
      "Integrity does not establish gameplay consistency or runtime compatibility.",
  };
}

function ageEvidence(): DiagnosticEvidence {
  return {
    source:
      `${sourceRoot}src/overlays/misc/ovl_kaleido_scope/z_kaleido_scope.c`,
    reference: "gEquipAgeReqs and gItemAgeReqs",
    applicability:
      "Age restrictions shared by original N64 versions; child/adult loadout context",
    limitations:
      "Does not verify ownership, button usability, progression, modified games, or runtime compatibility.",
  };
}

type AgeRequirement = Age.Child | Age.Adult | null;

const equipmentAgeRequirements: ReadonlyArray<{
  field: string;
  shift: number;
  ages: readonly AgeRequirement[];
}> = [
  { field: "sword", shift: 0, ages: [null, Age.Child, Age.Adult, Age.Adult] },
  { field: "shield", shift: 4, ages: [null, Age.Child, null, Age.Adult] },
  { field: "tunic", shift: 8, ages: [null, null, Age.Adult, Age.Adult] },
  { field: "boots", shift: 12, ages: [null, null, Age.Adult, Age.Adult] },
];

// gItemAgeReqs also covers these button item IDs absent from InventoryItems.
enum ButtonItemId {
  KokiriSword = 0x3B,
  MasterSword = 0x3C,
  BiggoronSword = 0x3D,
  DekuShield = 0x3E,
  MirrorShield = 0x40,
  GoronTunic = 0x42,
  ZoraTunic = 0x43,
  IronBoots = 0x45,
  HoverBoots = 0x46,
  BulletBag30 = 0x47,
  BulletBag40 = 0x48,
  BulletBag50 = 0x49,
  Quiver30 = 0x4A,
  Quiver40 = 0x4B,
  Quiver50 = 0x4C,
  GoronsBracelet = 0x50,
  SilverGauntlets = 0x51,
  GoldenGauntlets = 0x52,
  GiantsKnife = 0x55,
}

const childItems = new Set<number>([
  InventoryItems.DekuStick,
  InventoryItems.Slingshot,
  InventoryItems.Boomerang,
  InventoryItems.MagicBeans,
  InventoryItems.WeirdEgg,
  InventoryItems.Chicken,
  InventoryItems.ZeldasLetter,
  InventoryItems.KeatonMask,
  InventoryItems.SkullMask,
  InventoryItems.SpokyMask,
  InventoryItems.BunnyHood,
  InventoryItems.GoronMask,
  InventoryItems.ZoraMask,
  InventoryItems.GerudoMask,
  InventoryItems.MaskofTruth,
  InventoryItems.SoldOutSign,
  ButtonItemId.KokiriSword,
  ButtonItemId.DekuShield,
  ButtonItemId.BulletBag30,
  ButtonItemId.BulletBag40,
  ButtonItemId.BulletBag50,
  ButtonItemId.GoronsBracelet,
]);
const adultItems = new Set<number>([
  InventoryItems.RegularArrow,
  InventoryItems.FireArrowUpgrade,
  InventoryItems.Hookshot,
  InventoryItems.Longshot,
  InventoryItems.IceArrow,
  InventoryItems.MegatonHammer,
  InventoryItems.LightArrow,
  InventoryItems.PocketEgg,
  InventoryItems.PocketCucco,
  InventoryItems.Cojiro,
  InventoryItems.OldMushroom,
  InventoryItems.OddPotion,
  InventoryItems.PoachersSaw,
  InventoryItems.GoronsSwordBroken,
  InventoryItems.Prescription,
  InventoryItems.EyeballFrog,
  InventoryItems.EyeDrops,
  InventoryItems.ClaimCheck,
  InventoryItems.FireArrowPoweredUp,
  InventoryItems.IceArrowPoweredUp,
  InventoryItems.LightArrowPoweredUp,
  ButtonItemId.MasterSword,
  ButtonItemId.BiggoronSword,
  ButtonItemId.MirrorShield,
  ButtonItemId.GoronTunic,
  ButtonItemId.ZoraTunic,
  ButtonItemId.IronBoots,
  ButtonItemId.HoverBoots,
  ButtonItemId.Quiver30,
  ButtonItemId.Quiver40,
  ButtonItemId.Quiver50,
  ButtonItemId.SilverGauntlets,
  ButtonItemId.GoldenGauntlets,
  ButtonItemId.GiantsKnife,
]);

const buttonNames = ["b", "cLeft", "cDown", "cRight"] as const;

/** Read-only diagnosis of the editable SRAM model, including both record sets. */
export function diagnoseSave(save: SraSaveFile): SaveDiagnosis {
  const context: DiagnosticContext = {
    layout: "sra",
    container: save.sourceSrmData ? "srm" : "sra",
    gameVersion: null,
    platformCompatibility: "unverified",
  };
  const findings: DiagnosticFinding[] = structuredClone(
    [
      ...(save.sourceFile?.findings ?? []),
      ...(save.inputInterpretation?.findings ?? []),
    ],
  );
  const slots: SlotDiagnosis[] = [];
  const report = (
    ruleId: string,
    scope: DiagnosticScope,
    explanation: string,
    category = DiagnosticCategory.Structural,
    evidence = structuralEvidence(),
  ): void => {
    const location = scope.kind === "slot"
      ? `${scope.record}.${scope.index}`
      : scope.kind;
    findings.push({
      id: `${ruleId}:${location}.${scope.field}`,
      ruleId,
      category,
      scope,
      explanation,
      confidence: category === DiagnosticCategory.Uncertainty
        ? DiagnosticConfidence.Unknown
        : DiagnosticConfidence.Evidenced,
      evidence: [evidence],
      context: { ...context },
    });
  };
  report(
    "context.game-version",
    { kind: "file", field: "gameVersion" },
    "The save does not establish an exact game revision or platform. Shared N64 age rules apply; version-specific checks remain unresolved.",
    DiagnosticCategory.Uncertainty,
    {
      source: `${sourceRoot}src/code/z_sram.c`,
      reference:
        "sSramDefaultHeader; include/save.h SaveContext language definitions",
      applicability: "Recognized original N64 SRAM layout",
      limitations:
        "NTSC Japanese and PAL English both use language zero. Layout, language and checksum do not identify an exact version or verify runtime compatibility.",
    },
  );
  if (!save.header.isPatternValid) {
    report(
      "header.signature",
      { kind: "header", field: "signature" },
      "The header signature differs from the recognized SRAM signature.",
    );
  }
  if (!save.header.isPaddingValid) {
    report(
      "header.padding",
      { kind: "header", field: "padding" },
      "Header padding matches neither the retail nor debug pattern.",
    );
  }
  for (const record of ["primary", "backup"] as const) {
    const records = record === "primary" ? save.slots : save.backups;
    for (const [index, slot] of records.entries()) {
      const empty = slot.isEmpty;
      slots.push({ record, index, occupancy: empty ? "empty" : "occupied" });
      if (empty) continue;
      if (!slot.isPatternValid) {
        report(
          "slot.marker",
          { kind: "slot", record, index, field: "marker" },
          "The occupied-slot marker differs from ZELDAZ.",
        );
      }
      if (!slot.isChecksumValid()) {
        report("slot.checksum", {
          kind: "slot",
          record,
          index,
          field: "checksum",
        }, "The stored checksum differs from the calculated checksum.");
      }
      if (slot.age === Age.Invalid) {
        report(
          "age.unknown",
          { kind: "slot", record, index, field: "age" },
          `Stored age ${
            toNumber(slot.data.subarray(4, 8))
          } is neither child nor adult; active age comparisons are unresolved.`,
          DiagnosticCategory.Uncertainty,
          {
            ...ageEvidence(),
            source: `${sourceRoot}include/save.h`,
            reference: "Save.age / LINK_AGE_ADULT / LINK_AGE_CHILD",
          },
        );
      }
      const checkLoadout = (
        loadout: string,
        age: Age,
        equipment: number,
        buttons: readonly number[],
      ): void => {
        const check = (
          field: string,
          value: number,
          requirement: AgeRequirement | undefined,
        ): void => {
          const scope: DiagnosticScope = { kind: "slot", record, index, field };
          if (requirement === undefined) {
            report(
              "age.unknown-value",
              scope,
              `Value ${value} has no evidenced age interpretation.`,
              DiagnosticCategory.Uncertainty,
              ageEvidence(),
            );
          } else if (
            requirement !== null && age !== Age.Invalid && requirement !== age
          ) {
            report(
              "age.incompatible",
              scope,
              `Value ${value} requires ${
                Age[requirement]
              } equipment context; this loadout is ${Age[age]}.`,
              DiagnosticCategory.Gameplay,
              ageEvidence(),
            );
          }
        };
        for (const { field, shift, ages } of equipmentAgeRequirements) {
          const tier = (equipment >>> shift) & 0xF;
          check(`${loadout}.equipment.${field}`, tier, ages[tier]);
        }
        buttons.forEach((item, button) => {
          if (item === InventoryItems.Empty) return;
          const requirement = item > ButtonItemId.GiantsKnife
            ? undefined
            : childItems.has(item)
            ? Age.Child
            : adultItems.has(item)
            ? Age.Adult
            : null;
          check(`${loadout}.buttons.${buttonNames[button]}`, item, requirement);
        });
      };
      const buttons = slot.currentButtonEquips;
      checkLoadout(
        "active",
        slot.age,
        toNumber(slot.data.subarray(0x70, 0x72)),
        [
          buttons.bButton,
          buttons.cLeftButton,
          buttons.cDownButton,
          buttons.cRightButton,
        ],
      );
      const saved = slot.additionalData;
      for (const loadout of ["child", "adult"] as const) {
        const equipment = saved[`${loadout}Equipment`];
        const items = saved[`${loadout}ButtonItems`];
        if (
          equipment === 0 && items.every((item) => item === 0 || item === 0xFF)
        ) {
          continue;
        }
        checkLoadout(
          loadout,
          loadout === "child" ? Age.Child : Age.Adult,
          equipment,
          items,
        );
      }
      for (const field of ["entranceIndexTransport", "mapNumber"] as const) {
        if (slot[field] === 0) continue;
        report(
          "interpretation.tentative",
          { kind: "slot", record, index, field },
          `The legacy ${field} interpretation is tentative; no location compatibility rule is applied.`,
          DiagnosticCategory.Uncertainty,
          {
            source:
              "docs/domain-model.md#legacy-names-and-overlapping-representations",
            reference:
              "Tentative Farore's Wind field namespaces; ADR 0009 evidence policy",
            applicability: "Legacy accessor interpretation in this editor",
            limitations:
              "Accessor names and types do not establish a verified namespace or version-specific gameplay relationship.",
          },
        );
      }
    }
  }
  return { context, slots, findings };
}
