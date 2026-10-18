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

Filesystem loading currently rejects extension mismatches, while buffer loading
uses size alone. [SRA byte-order detection](../../models/savefile.ts) silently
chooses the original order when header-marker scores tie, including when neither
candidate matches. These behaviors remain to be aligned with the input policy.
