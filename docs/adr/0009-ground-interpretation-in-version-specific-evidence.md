---
status: accepted
---

# Ground interpretation in version-specific evidence

Save-format references, decompilation work, other editors, and observed saves
can disagree or describe different game versions. Prefer reproducible game
behavior for the particular supported version, record the evidence behind
interpretations, and report unresolved disagreements as uncertainty. Keep
recognized layouts separate from verified compatibility with a game version and
emulator or platform; file size alone does not establish support.

## Consequences

Tentative field names and existing accessor types are not sufficient evidence
for gameplay rules. Speculative fixes remain unselected; confidently supported
fixes can be recommended by default, subject to the user's editing goal and
acceptance. Compatibility claims must be tied to verified combinations.

## Input interpretation

Use the recognized data layout across interfaces, treating a conflicting
filename extension as a diagnostic and offering an appropriate export filename.
Keep the recognized save accessible.

Use additional reliable evidence when stored byte order is ambiguous. If the
interpretation remains unresolved, report the uncertainty and require an
explicit choice before interpreting and editing the save.

For the recognized SRAM layout, automatically select a byte order only when a
complete header signature or intact occupied-slot marker supports that candidate
and neither kind of evidence supports the other candidate. Check primary and
backup records. A damaged checksum does not invalidate an intact marker as
directional evidence. Checksums corroborate the interpretation; partial header
matches, checksum-only evidence, and empty records alone do not establish byte
order. Conflicting directional evidence requires an explicit choice rather than
ranking the header above slot records or choosing by majority.

This rule was clarified during triage of #88. Reproduction with synthetic SRA
and SRM data confirmed that an intact header can disagree with intact slot
markers, and that both byte orders can pass checksums even for nonzero records.

## Provenance

Interpretation and compatibility policy confirmed during the domain-modeling
interview. No historical ranking of the maintainer's preferred reference
sources, or specific compatibility matrix, was established.

## Current implementation

[Additional-data definitions](../../models/additionaldata.ts) cite the
decompilation's save layout, while [scene definitions](../../models/scene.ts)
cite CloudModding's entrance table. Several fields remain explicitly tentative.
[FileUtil](../../utils/fileutil.ts) recognizes containers by their sizes; this
does not establish game-version compatibility.

Filesystem and buffer loading select the parser from the recognized container
size. When a source filename is available, `sourceFile` metadata reports a
conflicting extension as a nonfatal diagnostic and suggests an export filename.
Both editors display these findings and use the selected export format for the
output extension; loading never renames the source.
[Input inspection](../../utils/inputdiagnostics.ts) evaluates header and slot
evidence for both byte orders without changing source bytes. Model and FileUtil
loading require an explicit choice for unresolved input. Both editors offer that
choice before editing, and retain conflicting evidence after an override.
