---
status: accepted
---

# Use SRA as the editable save model

SRA represents how the original game stores its save data, while SRM is an
emulator container that can be unpacked and repacked. Use the SRA representation
as the common editable model, extracting it from SRM and retaining the
surrounding container data for export. Revisit this boundary if supporting
additional formats makes SRA unsuitable as the common representation.

## Provenance

Historical decision, recorded retrospectively from the maintainer's confirmation
during the domain-modeling interview. The original decision date was not
established.

## Current implementation

[FileUtil](../../utils/fileutil.ts) returns `SraSaveFile` for both supported
input formats. [SrmSaveFile](../../models/savefile.ts) extracts the SRAM data
and retains the source container for repacking.
