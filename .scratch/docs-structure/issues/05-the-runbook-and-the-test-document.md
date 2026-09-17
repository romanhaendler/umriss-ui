# 05 — The runbook leaves the test document

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/docs-structure/spec.md`

## Scope

`TESTS.md` (230 lines) is a runbook, a strategy and a status in one file. It splits along the audience.

**`CONTRIBUTING.md`** (new, at the root) takes what a person needs before they can work:

- Prerequisites: pnpm 9.14.4 (the `packageManager` field pins it), Node 22 — `TESTS.md` records that jsdom is held at ^26 because jsdom 30 does not load on Node 22.11.
- First run: `pnpm install`, `npx playwright install chromium`, `pnpm test:unit && pnpm test:visual`.
- The commands, as the table from `TESTS.md` §Commands, unchanged.
- The demo dev servers and their ports (4173 core, 4174 charts, 4175 table).
- How work is organised here: specs and tickets under `.scratch/<effort>/`, the triage vocabulary — one paragraph, linking `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` rather than restating them.
- The rules that bind a change, as a short list of one-liners, each linking the document that argues it: tokens only, no raw colour values; everything English (ADR-0018); a new export goes at the **end** of `src/index.ts`; a baseline moves only when a ticket says it may; a prop without JSDoc breaks the build.

**`docs/testing.md`** keeps the rest, in its current order: the layers table, the pure modules (the checkable seam), the conventions, "The demo shows one page at a time", "The order of exports is part of the appearance", "Known open". Its opening paragraph is rewritten to say what the document is now — the test standing — instead of repeating the commands.

`TESTS.md` disappears. Its live pointers: `CHANGELOG.md` line 595, `packages/core/HANDOFF.md` (preamble), `packages/charts/STATUS.md`, `CLAUDE.md` if it names it. Chase them with a grep; leave `.scratch/` alone.

## Acceptance

- `CONTRIBUTING.md` and `docs/testing.md` exist; `TESTS.md` does not.
- No sentence appears in both files.
- Every command in `CONTRIBUTING.md` runs from a clean clone.
- Every live pointer outside `.scratch/` resolves; the map (ticket 02) has both rows under "What moved".
