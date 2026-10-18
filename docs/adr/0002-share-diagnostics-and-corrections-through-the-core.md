---
status: accepted
---

# Share diagnostics and corrections through the core

The editor serves progress recovery, replaying parts of the game, and technical
exploration. Put structural checks, gameplay consistency checks, and correction
semantics in the shared core so every interface and a TypeScript library API can
use the same domain knowledge. Present structural and gameplay findings
separately; the regular editing experience should suggest fixes with acceptance
as the default, while advanced users can decline both structural and gameplay
fixes.

## Acceptance and programmatic use

Diagnosis leaves the save unchanged. Suggested fixes appear selected in a review
step that explains their effects, and are applied after deliberate confirmation.
Advanced users can decline structural repairs and deliberately export invalid
checksums or validity markers for a recognized, readable layout.

The TypeScript API exposes findings and suggested corrections independently from
applying them. Callers explicitly select individual corrections or choose to
apply the recommended fixes.

Recommendations must respect the user's requested editing outcome. Explain
conflicts with that goal, and ask which outcome is desired before selecting a
correction that would change it. Uncertain interpretations are findings of
uncertainty; speculative fixes remain unselected, following the
[evidence policy](0009-ground-interpretation-in-version-specific-evidence.md).

## Advanced-user scope

Control over suggested fixes is part of the intended experience. General-purpose
raw byte and low-level field editing is outside the current product focus and is
not a supported API commitment; users can use other editors for that purpose.
Adding such capabilities remains a possible future direction. Existing raw
accessors and controls do not establish a requirement to retain that API shape.

## Provenance

Direction clarified during the domain-modeling interview as the project's
purpose became clearer. This does not establish that diagnostics motivated the
existing implementation.

## Current implementation

[SaveHeader](../../models/saveheader.ts) and
[SaveSlot](../../models/saveslot.ts) check validity markers, header padding, and
slot checksums. [Save-management helpers](../../utils/saveeditor.ts) expose
structural repair. General gameplay consistency diagnosis and suggested
corrections, including the review and acceptance workflow, are intended behavior
that remains to be implemented.
