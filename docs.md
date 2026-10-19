## Getting Started

To get started parsing a save file you will want to use
[`FileUtil`](./classes/FileUtil.html#loadfile) with a filepath to read a SRA or
SRM file from.

### Input byte order

`inspectInputByteOrder(sramBytes)` inspects both big-endian and 32-bit
word-swapped SRAM candidates without changing bytes. Its result contains
`candidates`, shared diagnostic `findings`, `confidence`, and one of three
states: `detected`, `overridden`, or `unresolved`. Each candidate reports the
header signature and primary/backup marker, emptiness, and checksum evidence.
Pass only the SRAM region to this inspection function, not a whole SRM
container.

Automatic detection requires a complete header signature or occupied-slot marker
supporting exactly one candidate. Partial signatures, empty slots, and checksums
alone cannot select an order. Conflicting complete evidence also remains
unresolved, regardless of how many records support each side.

`FileUtil.loadFile`, `loadFileFromBuffer`, and both save-file models' `read`
methods accept an optional input order. Without one, unresolved input throws
`UnresolvedByteOrderError`, carrying the inspection result and a copy of the
original SRA or SRM bytes in `sourceData`. No editable model is returned. An
explicit choice permits loading while keeping conflicting evidence visible in
`save.inputInterpretation` and `diagnoseSave(save)`. Selection never repairs the
save and does not verify its game version or platform.

In-memory conversion retains the original `inputInterpretation` and its
evidence; changing output order does not create an input override. On a
converted editable save, `isByteSwapped` describes the current stored
representation, which can differ from the original input's `selectedOrder`.

```typescript
import {
  ExportByteOrder,
  FileUtil,
  UnresolvedByteOrderError,
} from "./index.ts";

try {
  const save = FileUtil.loadFile("game.srm");
  console.log(save.inputInterpretation);
} catch (error) {
  if (!(error instanceof UnresolvedByteOrderError)) throw error;
  console.log(error.inspection.candidates);
  // After the user explicitly chooses word-swapped input:
  const save = FileUtil.loadFileFromBuffer(
    error.sourceData,
    ExportByteOrder.WordSwapped,
  );
  console.log(save.inputInterpretation);
}
```

Both editors offer input choices and cancellation before opening unresolved
saves. To revisit a detected interpretation, use **Choose input byte order** in
the web editor or **Ctrl+O** in the terminal editor. Choosing reloads the
original bytes and discards edits. These input choices are separate from the
export representation below.

If the selected interpretation contains record values that strict field readers
cannot display, the editors identify those fields and retain the record's bytes.
Other records, export, and input reselection remain available.

## Exporting edited saves

### SRAM byte order

All export paths accept `ExportByteOrder`: `FileUtil.getFileData` and
`saveFile`, model `getData`, `getDataForWrite`, `write`, and
`SrmSaveFile.fromSaveFile`. The terminal and web editors expose the same choices
as **SRAM Byte Order**.

| Choice        | Result                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Automatic`   | Preserve detected source order for the same format. New files and conversions use the target layout's default below. |
| `BigEndian`   | SRAM bytes in cartridge order, regardless of source order or output format.                                          |
| `WordSwapped` | Reverse each four-byte SRAM word relative to cartridge order, regardless of source order or output format.           |

Four-byte word swapping means `[0x12, 0x34, 0x56, 0x78]` becomes
`[0x78, 0x56, 0x34, 0x12]`. `FileUtil.byteSwap` implements this operation and
returns a copy unless `inPlace` is true. For arbitrary buffers, a final partial
word is reversed within its available bytes; supported SRAM images contain
complete words. Order changes apply to the whole `0x8000`-byte SRAM region,
including its unknown tail. In SRM, only offsets `0x20800`–`0x287FF` change
order; EEPROM, all four MemPaks, and FlashRAM retain their bytes.

The supported target representation defaults are:

- **SRA**: raw cartridge SRAM in big-endian order. This follows the original N64
  save-memory layout and direct SRAM transfers described by the
  [OoT save format](https://wiki.cloudmodding.com/oot/Save_Format) and
  [matching OoT decompilation](https://github.com/zeldaret/oot/blob/main/src/code/z_sram.c).
- **SRM**: the `0x48800`-byte Mupen64Plus-Next container on **little-endian
  hosts**, with word-swapped SRAM. Its
  [container structure](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/libretro/libretro_memory.h),
  [save-memory export](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/libretro/libretro.c),
  [SRAM access](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/mupen64plus-core/src/device/cart/sram.c),
  and
  [host-order macros](https://github.com/libretro/mupen64plus-libretro-nx/blob/develop/mupen64plus-core/src/osal/preproc.h)
  establish the section offsets and four-byte reversal on little-endian hosts.

These defaults are verified against the referenced layout/code, checked on
2026-10-19, rather than an end-to-end game/platform compatibility matrix. File
size recognizes a layout; it does not verify an emulator or game version. Other
SRM layouts and big-endian-host defaults are unverified. Existing files can
retain either detected order, and explicit choices deliberately override these
defaults. Fresh SRM containers still use provisional zero-filled non-SRAM
sections; verifying their initialization is tracked separately in issue #101.

Extracting SRA from a loaded SRM is a conversion, so automatic SRA export uses
big-endian order. Exporting the same working save back to SRM preserves the
original SRAM order and reuses its container. Exporting a preview never changes
that source metadata or the working bytes.

`SraSaveFile.read(source, knownOrder)` accepts an already known source order,
which the SRM adapter passes through even if the header marker was edited.
Omitting it uses the input evidence policy above and rejects unresolved input.

```typescript
import { ExportByteOrder, FileFormat, FileUtil } from "./index.ts";

const save = FileUtil.loadFile("game.srm");
const automatic = FileUtil.getFileData(save, FileFormat.SRM);
const bigEndian = FileUtil.getFileData(
  save,
  FileFormat.SRM,
  ExportByteOrder.BigEndian,
);
```

This replaces the provisional boolean `forceSwap` API. Replace `false` with
`ExportByteOrder.Automatic`; replace `true` with the desired **result**,
`BigEndian` or `WordSwapped`. The old boolean is rejected. The order argument
precedes the checksum policy in every export method, including
`getDataForWrite(order, checksumPolicy)` and
`SrmSaveFile.fromSaveFile(save, order, checksumPolicy)`.

### Checksums

`FileUtil.getFileData` returns an export copy. By default it maintains checksums
only for primary or backup slots whose non-checksum bytes differ from the loaded
record (or the initial record for a new save). Untouched invalid checksums
remain available through `slot.isChecksumValid()`; export does not repair
validity markers, synchronize backups, or initialize empty slots. Preparing
download data leaves the working save unchanged.

Use `ChecksumPolicy.Preserve` to retain stored checksum bytes even after editing
content:

```typescript
import {
  ChecksumPolicy,
  ExportByteOrder,
  FileFormat,
  FileUtil,
} from "./index.ts";

const save = FileUtil.loadFile("game.sra");
save.slots[0].rupees = 500;

const output = FileUtil.getFileData(save, FileFormat.SRA);
const preserved = FileUtil.getFileData(
  save,
  FileFormat.SRA,
  ExportByteOrder.Automatic,
  ChecksumPolicy.Preserve,
);
```

`FileUtil.saveFile` accepts the same policy after its byte-order argument.
`SraSaveFile.getDataForWrite` and `write` also maintain edited-slot checksums by
default. Raw snapshots through `getData()` or `data`, and conversion through
`SrmSaveFile.fromSaveFile`, preserve stored checksums by default.

For an explicit checksum-only repair, call `slot.updateChecksum()` on the chosen
record. This changes its stored checksum without rewriting its validity marker
or other records. `slot.makeValid()` additionally repairs the validity marker.

## Read-only diagnosis

`diagnoseSave(save)` accepts the editable `SraSaveFile` model, including one
loaded from an SRM container, without requiring a game version or filesystem
access. It returns explicit primary/backup slot occupancy and contextual
findings. `DiagnosticCategory` distinguishes structural, gameplay, and
uncertainty findings; `id` identifies a rule and affected scope independently of
message text or the current value.

```typescript
import { diagnoseSave, SraSaveFile } from "./index.ts";

const save = new SraSaveFile();
const diagnosis = diagnoseSave(save);
for (const finding of diagnosis.findings) {
  console.log(finding.category, finding.scope, finding.explanation);
}
```

Diagnosis checks header signature/padding and occupied-slot markers/checksums.
Recognized empty records remain empty and receive no damaged-game findings.
Gameplay checks cover age compatibility of active and saved child/adult
equipment and B/C-button items, independently of ownership. Unequipped
equipment, empty button assignments, and uninitialized saved loadouts are
accepted. Unknown ages or values produce uncertainty rather than inferred age
compatibility. Nonzero legacy Farore's Wind location fields retain their
tentative interpretation.

Each finding carries confidence, source evidence, applicability, limitations,
and layout/game context. Age rules follow `gEquipAgeReqs` and `gItemAgeReqs` in
[zeldaret/oot revision 14759ab](https://github.com/zeldaret/oot/blob/14759abf9abb4295de142cdc1452998630ea70fb/src/overlays/misc/ovl_kaleido_scope/z_kaleido_scope.c).
These tables share the age restrictions across original N64 versions; this does
not establish support for modified games or verify emulator/hardware
compatibility. Sword button item IDs are interpreted separately from equipped
sword bit values.

Exact game version remains unknown: layout, language, filename, and checksums
cannot establish it. The file-level `context.game-version` finding records that
limitation; shared age rules still run. Version-sensitive progression, location,
acquisition-history, and ownership checks are outside this initial rule set. No
correction discovery or application is performed, and all bytes and working
state, including invalid markers/checksums and container data, are preserved.
