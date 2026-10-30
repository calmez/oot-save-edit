---
status: accepted
---

# Offer recovery without choosing progress for the user

A primary slot can contain desired progress despite failing a structural check,
while its backup can pass checks but contain less progress. Offer structural
repair of the primary and restoration from the backup as distinct choices when
available, explaining their effects. Restoration and backup synchronization
require an explicit choice; do not silently merge or replace the records.

## Provenance

Recovery policy confirmed during the domain-modeling interview. This records the
intended responsibility boundary rather than claiming that the existing controls
were originally designed around this rationale.

## Current implementation

[Save-management helpers](../../utils/saveeditor.ts) provide slot copying and
structural repair, and the interfaces expose backup synchronization. Automatic
diagnosis and recovery recommendations remain to be implemented.
