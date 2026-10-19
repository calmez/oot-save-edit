## Getting Started

To get started parsing a save file you will want to use
[`FileUtil`](./classes/FileUtil.html#loadfile) with a filepath to read a SRA or
SRM file from.

## Exporting edited saves

`FileUtil.getFileData` returns an export copy. By default it maintains checksums
only for primary or backup slots whose non-checksum bytes differ from the loaded
record (or the initial record for a new save). Untouched invalid checksums
remain available through `slot.isChecksumValid()`; export does not repair
validity markers, synchronize backups, or initialize empty slots. Preparing
download data leaves the working save unchanged.

Use `ChecksumPolicy.Preserve` to retain stored checksum bytes even after editing
content:

```typescript
import { ChecksumPolicy, FileFormat, FileUtil } from "./index.ts";

const save = FileUtil.loadFile("game.sra");
save.slots[0].rupees = 500;

const output = FileUtil.getFileData(save, FileFormat.SRA);
const preserved = FileUtil.getFileData(
  save,
  FileFormat.SRA,
  false,
  ChecksumPolicy.Preserve,
);
```

`FileUtil.saveFile` accepts the same policy after its `forceSwap` argument.
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
