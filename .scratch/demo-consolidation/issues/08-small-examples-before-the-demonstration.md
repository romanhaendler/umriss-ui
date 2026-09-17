# 08 — Small examples before the demonstration

Status: done
Type: task

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

`Dock` and `TreeView` have no small example at all — only `99-demonstration.tsx`, 151 and 232 lines. The shell's `examplesOf` already argues the case ("whoever saw it first would read six hundred lines before having seen thirty") and sorts the demonstration last; what is missing are the examples it should sort *after*.

- **`TreeView`**: two. `01-a-tree.tsx` — a handful of nodes, one active, arrow keys and nothing else. `02-ticking.tsx` — the cascade with an indeterminate parent, which is the model decision a reader most often comes for (ADR-0003).
- **`Dock`**: two. `01-a-tool-strip.tsx` — a dock at its resting place with two tools. `02-the-four-places.tsx` — moved by the grip and by the arrow keys, which is what makes it a dock rather than a toolbar (ADR-0013).

They are new files under the existing folders and change nothing about the demonstrations, which keep their number and their place at the end.

Each new example is a new picture in both themes — that is the derivation working. Four files, eight baselines, and they are added, not updated.

## Acceptance

- Four new example files, each with a `title` export, each under 40 lines.
- `pnpm test:visual` adds eight baselines and modifies none.
- Neither demonstration was edited.
