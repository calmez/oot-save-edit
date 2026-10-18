---
status: accepted
---

# Use Fresh and Webview for the initial graphical interfaces

Fresh was chosen because it appeared simple and carried less baggage than other
frameworks, with learning a substantial part of the motivation. Reuse the web
editor inside a Webview desktop wrapper to provide both graphical targets with
less implementation work than building a separate native interface.

## Evolution

These are replaceable interface choices. A justified framework change is
allowed, and a native desktop implementation remains a desirable possible
direction; desktop and web are not required to share one graphical
implementation. The
[independent core boundary](0006-keep-the-core-independent-of-ui-and-deno.md)
continues to apply to either approach.

## Provenance

Historical motivations confirmed retrospectively by the maintainer during the
domain-modeling interview. No specific evaluation of competing frameworks or
desktop wrappers was established.

## Current implementation

The graphical editor lives in [ui/web](../../ui/web/deno.json).
[The desktop entry point](../../ui/main.ts) starts the bundled Fresh application
in a Worker and displays it through Webview.
