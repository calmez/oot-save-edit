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
