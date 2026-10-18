# Domain docs

This repo uses a single-context domain layout.

## Before exploring

- Read root [GLOSSARY.md](../../GLOSSARY.md) for domain vocabulary.
- For slot lifecycle, gameplay relationships, or legacy model names, read the
  [domain model](../domain-model.md).
- Use the [ADR index](../adr/README.md) to find decisions that touch the area
  you are about to work in, then read those records.

If these files do not exist, proceed silently. The `domain-modeling` skill
creates them when terms or decisions are resolved.

## Layout

- `GLOSSARY.md`: shared domain terms at the repository root.
- `docs/domain-model.md`: slot lifecycle, gameplay relationships, and legacy
  names.
- `docs/adr/NNNN-description.md`: architectural decision records.
- `docs/agents/`: engineering skills configuration.
- `build/docs/`: generated TypeScript API documentation.

## Use the glossary's vocabulary

Use defined domain terms in issue titles, proposals, hypotheses, and tests. If a
needed concept is missing, reconsider whether it matches the project's language;
record a real vocabulary gap for `domain-modeling`.

## Surface ADR conflicts

If a proposal contradicts an existing ADR, identify the ADR and explain why the
decision should be revisited.
