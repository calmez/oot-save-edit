# Architectural decision records

Records distinguish retrospective explanations from directions clarified during
the maintainer interview. Accepted direction does not imply completed
implementation; individual records describe relevant gaps.

| Record                                                                                                                         | Basis                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [0001: SRA as the editable save model](0001-use-sra-as-the-editable-save-model.md)                                             | Historical decision confirmed by the maintainer.                                        |
| [0002: Shared diagnostics and corrections](0002-share-diagnostics-and-corrections-through-the-core.md)                         | Direction clarified in the interview.                                                   |
| [0003: Preserve unknown save data](0003-preserve-unknown-save-data.md)                                                         | Requirement confirmed in the interview; SRA-tail handling identified as an oversight.   |
| [0004: Recovery preserves the user's choice of progress](0004-offer-recovery-without-choosing-progress-for-the-user.md)        | Policy confirmed in the interview.                                                      |
| [0005: Colocate save-file classes](0005-colocate-save-file-classes-to-resolve-cyclic-imports.md)                               | Historical rationale recorded in commit `ba82a7b`.                                      |
| [0006: Core independence and API evolution](0006-keep-the-core-independent-of-ui-and-deno.md)                                  | Boundary confirmed in the interview; Deno learning motivation documented in the README. |
| [0007: Fresh and Webview for initial graphical interfaces](0007-use-fresh-and-webview-for-the-initial-graphical-interfaces.md) | Historical motivations confirmed by the maintainer; replacement remains possible.       |
| [0008: Local browser save editing](0008-prefer-local-browser-save-editing.md)                                                  | Historical server convenience explained; local editing preferred going forward.         |
| [0009: Version-specific evidence and compatibility](0009-ground-interpretation-in-version-specific-evidence.md)                | Policy confirmed in the interview.                                                      |
