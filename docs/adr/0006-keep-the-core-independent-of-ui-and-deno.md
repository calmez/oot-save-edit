---
status: accepted
---

# Keep the core independent of UI and Deno

Keep parsing, editing, diagnosis, correction, and buffer export in a shared
TypeScript core, independent of terminal and graphical interface code. These
operations must remain usable in a browser without Deno; filesystem and process
operations belong at the platform boundary. Deno remains the project's tooling
and runtime choice, originally adopted in part as an opportunity to learn it.

## API evolution

The existing library API is provisional. Align its mutation behavior before
establishing a stable contract: current live byte arrays, detached getter
results, and overlapping snapshots are implementation details to review, not
precedents that future domain operations must preserve. Correcting misleading
location names is also allowed as the API is clarified.

## Instrumentation

Telemetry remains optional experimentation. Core save operations must function
independently of a collector, network connection, or telemetry configuration;
instrumentation must not determine whether those operations succeed. Commit
`583ed8a` records the original learning motivation as "dipping toes lightly into
telemetry."

## Provenance

The maintainer confirmed the core boundary and provisional API during the
domain-modeling interview. The Deno learning motivation is documented in the
[README](../../README.md).

## Current implementation

[Buffer editing tests](../../utils/fileutil.test.ts) cover SRA and SRM without a
global `Deno` object. [FileUtil](../../utils/fileutil.ts) still groups buffer
and filesystem methods together, and [SaveFile](../../models/savefile.ts)
exposes Deno-specific file operations alongside its buffer API.
