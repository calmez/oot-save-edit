---
status: accepted
---

# Prefer local browser save editing

The server initially acted as the program running the core, with the graphical
interface acting as its command interface, because that was an easy
implementation path. Prefer loading and editing save data entirely within the
browser; server-side handling of the save is not a product requirement. This
follows the
[browser-independent core boundary](0006-keep-the-core-independent-of-ui-and-deno.md).

## Provenance

The maintainer explained the historical convenience of server-side handling and
confirmed the preference for local editing during the domain-modeling interview.
The existing upload flow should not be interpreted as an intentional requirement
for server-side processing.

## Current implementation

[The save route](../../ui/web/routes/save.tsx) receives uploaded bytes and
[the Save component](../../ui/web/components/Save.tsx) parses them server-side.
Subsequent editing and export already happen in
[the browser island](../../ui/web/islands/SaveEditor.tsx). Making initial
loading local remains an implementation gap.
