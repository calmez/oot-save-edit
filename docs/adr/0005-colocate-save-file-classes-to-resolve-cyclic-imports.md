---
status: accepted
---

# Colocate save-file classes to resolve cyclic imports

Separate modules for the SRA and SRM save-file classes had cyclic import
dependencies. Consolidate the save-file classes in
[models/savefile.ts](../../models/savefile.ts) to resolve those dependencies.

## Provenance

Historical decision recorded retrospectively from commit `ba82a7b`, authored
2025-09-07: "resolved cyclic import dependencies by merging savefile classes
into one file."

This records the reason for the existing module layout. It does not establish a
general rule that mutually dependent models must always share a file.
