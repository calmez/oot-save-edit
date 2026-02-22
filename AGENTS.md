# Guide for LLM-Powered Agents

This repository parses save files from The Legend of Zelda: Ocarina of Time.
It provides a TypeScript core with terminal and web UIs, plus tooling to build
web, desktop, and terminal targets.

## Project map

- Core models/utilities: `models/`, `utils/`, `index.ts`.
- Terminal UI: `ui/terminal/` (Ink-based).
- Web UI (Fresh + Vite + Preact): `ui/web/`.
- Desktop GUI wrapper: `ui/main.ts` (webview + bundled web UI).
- Docs: `docs.md`, `tsconfig.doc.json`, `deno task build:docs`.

## Build, lint, test

All commands use Deno. Prefer `deno task ...` when available.

Root tasks (see `deno.json`):
- Format + lint + type-check: `deno task check`.
- Web dev server: `deno task web:dev`.
- Web production build: `deno task build:web`.
- Web production build for container: `deno task build:web:production`.
- Desktop GUI run: `deno task run:gui`.
- Terminal UI run: `deno task run:tui`.
- Desktop GUI build (per target): `deno task build:gui:<target>`.
- Terminal UI build (per target): `deno task build:tui:<target>`.
- Docs build: `deno task build:docs`.

Web UI tasks (see `ui/web/deno.json`):
- Format + lint + type-check: `deno task --cwd ./ui/web check`.
- Dev server: `deno task --cwd ./ui/web dev`.
- Build: `deno task --cwd ./ui/web build`.
- Start prod server: `deno task --cwd ./ui/web start`.
- Fresh update: `deno task --cwd ./ui/web update`.

Tests:
- Run all tests: `deno test`.
- Run a single test file: `deno test models/saveslot.test.ts`.
- Run a single test by name: `deno test --filter "should set an entrance index"`.
- Run a single test by name in one file: `deno test --filter "should set" models/saveslot.test.ts`.

Container build:
- Build image: `deno task build:container` (uses `Containerfile`).

## Code style and conventions

General:
- All code is TypeScript.
- Use spaces for indentation; run `deno fmt` before submitting.
- Avoid verbose comments; add only when behavior is non-obvious.
- Prefer small, composable methods with clear names.

Imports:
- External imports first, internal imports second.
- Alphabetize within groups.
- Use `import type` for type-only imports.
- Prefer jsr/std imports (e.g., `@std/assert`) over deep URLs.

Naming:
- camelCase for variables, functions, methods.
- PascalCase for classes, interfaces, types, enums, and components.
- Component files are lowercase (e.g., `button.tsx`).
- Model files are lowercase (e.g., `saveslot.ts`).
- Tests use `.test.ts` suffix.

TypeScript:
- Use explicit return types for complex functions.
- Use interfaces for component props (e.g., `ButtonProps`).
- Prefer enums for fixed sets (e.g., scene, room, item types).
- When displaying enum values, use their string representation (e.g., `Room[slot.room]`).

Error handling:
- Throw `Error` with specific, contextual messages.
- Validate sizes and inputs early (see `SaveFile.read` and `FileUtil`).
- Keep errors deterministic; avoid swallowing exceptions.

Tests:
- Prefer `Deno.test` with descriptive names.
- Write tests for all public methods and properties.
- Use `@std/assert` helpers (`assertEquals`, `assertThrows`, etc.).

UI (web):
- Use JSX (Preact in `ui/web/`) and follow `ui/web/components` structure.
- Use Tailwind CSS for styling.
- Interactive components belong in `ui/web/islands` (Fresh pattern).

UI (terminal):
- Ink components live in `ui/terminal/`.

Domain rules:
- Follow the OoT save format specification:
  https://wiki.cloudmodding.com/oot/Save_Format
- Use enums/types from the project models (e.g., `models/saveslot.ts`, `models/scene.ts`).
- For text encoding/decoding, use `utils/text.ts` (`OotText`).
- For file operations, use `utils/fileutil.ts` (`FileUtil`).

## Cursor/Copilot rules

Copilot instructions from `.github/copilot-instructions.md`:
- All code must be written in TypeScript.
- Prefer `Deno.test` for unit tests and use descriptive test names.
- Write tests for all public methods and properties.
- Do not add verbose comments.
- Use enums and types from project models.
- Follow the OoT save format specification.
- Use `OotText` for text encoding/decoding.
- Use `FileUtil` for file operations.
- UI code uses React/JSX and follows `ui/web/components` structure.
- Use Tailwind CSS for web UI components.
- When displaying enum values, use their string representation.

Cursor rules:
- No `.cursor/rules/` or `.cursorrules` found in this repository.
