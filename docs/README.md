# The documents

Which document answers which question. Sorted by the question, because that is
what a reader has — the filename is what they are looking for.

| I want to know | Read |
|---|---|
| what umriss is and how to install it | [`../README.md`](../README.md) |
| how a component is used, with running code | the demo of its package — `pnpm start` for all of them at the version checked out, or `pnpm dev:core`, `pnpm dev:charts`, `pnpm dev:table`, `pnpm dev:schedule`, `pnpm dev:calculation`, `pnpm dev:dashboard`, `pnpm dev:alarms` |
| what changed for me as a caller | `packages/<package>/CHANGELOG.md` |
| what a word in this workspace means | [`../CONTEXT.md`](../CONTEXT.md) |
| why something was decided the way it was | [`adr/README.md`](adr/README.md) |
| what umriss deliberately does not build, and what to do instead | [`adr/0032-what-umriss-is-not.md`](adr/0032-what-umriss-is-not.md), [`adr/0059-the-set-of-chart-kinds-is-open.md`](adr/0059-the-set-of-chart-kinds-is-open.md), [`adr/0060-validation-and-a-layout-editor-are-never-time-zones-not-yet.md`](adr/0060-validation-and-a-layout-editor-are-never-time-zones-not-yet.md) |
| how the design language works | [`design-language.md`](design-language.md) |
| how wide and how tall a control is, and how a new field is built for it | [`design-language.md`](design-language.md), "Sizes" — the decision in [`adr/0041-a-fields-width-never-follows-what-it-shows.md`](adr/0041-a-fields-width-never-follows-what-it-shows.md) |
| which industrial standards umriss follows (ISA-18.2, ISA-101), and where it does not | [`standards.md`](standards.md) |
| how this repository is worked in | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| how a version is published to npm | [`releasing.md`](releasing.md) |
| what is tested, and how | [`testing.md`](testing.md) |
| what capability is proved, and by what | the capability record of the package: [`../packages/charts/docs/capabilities.md`](../packages/charts/docs/capabilities.md), [`../packages/table/docs/capabilities.md`](../packages/table/docs/capabilities.md), [`../packages/schedule/docs/capabilities.md`](../packages/schedule/docs/capabilities.md), [`../packages/core/docs/capabilities-tree.md`](../packages/core/docs/capabilities-tree.md) |
| what was worked on here until 2026-10-11 (frozen; the commit history carries on) | [`journal.md`](journal.md) |
| where the work stands today and what comes next | [`../.scratch/open-points-roadmap/next.md`](../.scratch/open-points-roadmap/next.md) |
| what was still open in October 2026, what was decided about it and in which order it is built | [`research/open-points-2026-10/`](research/open-points-2026-10/), [`../.scratch/open-points-roadmap/spec.md`](../.scratch/open-points-roadmap/spec.md) |
| how umriss compares with other libraries, and what follows from it | [`research/library-comparison-2026-09/`](research/library-comparison-2026-09/) |
| what state-of-the-art component documentation looks like, and where the site stands against it | [`research/component-docs-2026-10/`](research/component-docs-2026-10/) |
| how other chart libraries take their data, and what follows for the charts | [`research/chart-data-input-2026-10/`](research/chart-data-input-2026-10/) |
| how dashboards that users arrange themselves are built elsewhere, what their users ask for, and what follows for a dashboard package | [`research/user-dashboards-2026-10/`](research/user-dashboards-2026-10/) (`report.md` is the synthesis, in German) |
| how a table in a pane of fixed height should fill it and page, how other grids, design systems and control-room software do it, and what follows for the table | [`research/table-height-and-paging-2026-10/`](research/table-height-and-paging-2026-10/) (`report.md` is the synthesis, in German) |
| how a coding agent reads a package's documentation | `docs/llms-full.md` inside the installed package, the version in the lockfile; the local site (`pnpm start`) has `llms.txt` beside each demo, linking every page's Markdown twin (the page's address with `.md`, `index.md` for the scenarios page); `llms-full.txt` for every page at once — all generated from the demo by `packages/demo/src/tooling/llms.ts` |
| how an agent should read this repository | [`../CLAUDE.md`](../CLAUDE.md), [`agents/`](agents/) |
| how the packed packages are put into real applications and customers' hands to find what the own checks cannot see, and who those customers are | [`agents/shakedown/`](agents/shakedown/) - the findings of the last run stand in [`../.scratch/shakedown/`](../.scratch/shakedown/) |
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
would have been. Whoever follows an old pointer into a path that no longer resolves finds it in the table
above.

## What is deliberately not here

**No hosted documentation.** The demos are the documentation for the
components; `pnpm start` builds and serves them on the reader's machine, at the
version checked out (ADR-0065). A public site would need an imprint, and it
could only ever show `main`. Every demo page is a path with its text prerendered, so
that the text, the Markdown twins and the search index are made from it
(ADR-0037). The same build renders a fixed list of the documents here as pages of
that site — the design language, the standards and ADR-0032, ADR-0059 and ADR-0060 — read from their
files when it runs, so that no second text exists to drift (ADR-0046). The list
stands in `packages/demo/src/tooling/documents.ts`; a document not on it stays
on GitHub.

**No prose copy of the demos.** A component is described where it runs, with the
source that produced it and a props table generated from `src/` — a second
description in a document would drift away from it within a month.
