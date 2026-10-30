---
status: accepted
---

# Preserve unknown save data

Technical exploration requires retaining data the editor does not yet
understand. Preserve unknown bytes outside the user's chosen changes, including
untouched emulator-container sections, throughout loading, editing, and export.
Rewriting unknown data into a normalized representation must be a deliberate
user action.

## Checksums and unchanged saves

Ordinary export maintains checksums for slots affected by edits. An invalid
checksum in an untouched slot is a separate structural finding whose repair is
offered to the user. Advanced workflows can decline structural fixes as
described in
[ADR 0002](0002-share-diagnostics-and-corrections-through-the-core.md).

Exporting an unchanged save in the same format and byte order, with all
suggested fixes declined, must preserve its bytes.

## Output representation and container creation

Export should identify the desired output representation explicitly. Same-format
exports preserve source byte order by default; new files and conversions use
verified defaults for the target layout. Overrides identify the intended memory
region while preserving unrelated container data.

Reuse an existing SRM container when available. Fresh containers require
documented, verified initialization rules for the supported emulator layout;
current zero-filled EEPROM, MemPak, and FlashRAM defaults remain provisional
until verified.

## Partially interpretable saves

For a recognized layout, retain values that cannot be interpreted and report the
affected fields while allowing work on the readable remainder. Keep the original
data intact until a correction is accepted.

## Provenance

Preservation requirement confirmed during the domain-modeling interview. The
maintainer identified the existing SRA-tail handling as an oversight, rather
than a deliberate normalization policy.

## Current implementation

[SRM conversion](../../models/savefile.ts) retains surrounding emulator
sections. However, SRA loading retains only the modeled `0x7A00` bytes, and
serialization allocates a new `0x8000`-byte image, zeroing the final `0x600`
bytes. Preserving this tail remains an implementation gap.

[FileUtil.getFileData](../../utils/fileutil.ts) currently refreshes all six slot
checksums on export, including untouched slots. That behavior also needs to be
aligned with the preservation requirement.

The current `forceSwap` option reverses bytes within every four-byte word of the
exported buffer, including unrelated SRM sections. Its toggle semantics need to
be aligned with explicit output representation and preservation of unrelated
data.
