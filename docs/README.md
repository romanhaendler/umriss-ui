# The documents

Which document answers which question. Sorted by the question, because that is
what a reader has — the filename is what they are looking for.

| I want to know | Read |
|---|---|
| what umriss is and how to install it | [`../README.md`](../README.md) |
| how a component is used, with running code | the demo of its package — [online](https://romanhaendler.github.io/umriss-ui/), or `pnpm dev:core`, `pnpm dev:charts`, `pnpm dev:table`, `pnpm dev:schedule`, `pnpm dev:calculation` |
| what changed for me as a caller | `packages/<package>/CHANGELOG.md` |
| what a word in this workspace means | [`../CONTEXT.md`](../CONTEXT.md) |
| why something was decided the way it was | [`adr/README.md`](adr/README.md) |
| how the design language works | [`design-language.md`](design-language.md) |
| how this repository is worked in | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| how a version is published to npm | [`releasing.md`](releasing.md) |
| what is tested, and how | [`testing.md`](testing.md) |
| what capability is proved, and by what | the capability record of the package: [`../packages/charts/docs/capabilities.md`](../packages/charts/docs/capabilities.md), [`../packages/core/docs/capabilities-tree.md`](../packages/core/docs/capabilities-tree.md) |
| what was worked on here, and when | [`journal.md`](journal.md) |
| how an agent should read this repository | [`../CLAUDE.md`](../CLAUDE.md), [`agents/`](agents/) |
| what a document used to be called | **What moved**, below |

## What moved, September 2026

The documents were sorted by genre and by audience: what travels to npm with a
package lives in the package, what describes the workspace lives at the root,
and a capitalised filename is reserved for the names the ecosystem knows.

| was | is |
|---|---|
| `TESTS.md` | [`testing.md`](testing.md) — and the runbook half of it, [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| `CHANGELOG.md` (repository root) | [`journal.md`](journal.md) — the package changelogs keep their name and their place |
| `packages/core/GLYPHS.md` | [`../packages/core/docs/glyphs.md`](../packages/core/docs/glyphs.md) |
| `packages/core/TREE.md` | [`../packages/core/docs/capabilities-tree.md`](../packages/core/docs/capabilities-tree.md) |
| `packages/charts/STATUS.md` | [`../packages/charts/docs/capabilities.md`](../packages/charts/docs/capabilities.md) |
| `packages/core/HANDOFF.md` | [`archive/handoff-2026-08.md`](archive/handoff-2026-08.md) |
| the `Old → New` tables in `CONTEXT.md` | [`archive/rename-2026-09.md`](archive/rename-2026-09.md) |
| the "Ink & Paper" passage in `packages/core/README.md` | [`design-language.md`](design-language.md) |

`CONTEXT.md` and `docs/adr/` did **not** move: both are addressed by name, and
the mechanism that keeps the vocabulary in use is worth more than the tidiness
would have been. The specs under `.scratch/` were not rewritten either — they are
delivery records, read backwards. Whoever
follows an old spec into a path that no longer resolves finds it in the table
above.

## What is deliberately not here

**No documentation website.** The demos are the documentation for the
components, and they are online as they are —
<https://romanhaendler.github.io/umriss-ui/>, built by `pnpm build:pages`. A site
that hosts this prose beside them is still a product decision with a spec of its
own. This page is its table of contents when it comes.

**No prose copy of the demos.** A component is described where it runs, with the
source that produced it and a props table generated from `src/` — a second
description in a document would drift away from it within a month.
