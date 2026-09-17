# 04 — The pictures

Status: done
Type: task

Blocked by: 03

Spec: `.scratch/demo-rubrics/spec.md`

## Scope

A rubric name is printed on the page head, on the overview's cards and in the
palette's finds, so a regrouping moves pictures — and exactly those three kinds
and no others.

- Adopt them in **one** run: `pnpm test:visual --project=ui-light
  --project=ui-dark --update-snapshots`.
- Count before and after, and record both in this ticket's delivery note. The
  expectation, from core's 240 baselines: the `page-*` pictures of every page
  whose rubric changed (roughly 48 across both themes), the two overview
  pictures, and up to ten palette pictures.
- **No `example-*` picture may move.** An example is photographed inside its own
  section, which no rubric name reaches. If one moves, stop: something in ticket
  02 touched a page body.
- charts and table baselines must not change at all.

## Acceptance

- `git status` shows modified baselines only under `page-*`, `overview` and
  `palette*`, and only in `packages/core`.
- `pnpm test:visual` is green afterwards for `ui-light`, `ui-dark`, `table-light`
  and `table-dark`. (The charts projects carry a known, unrelated flakiness —
  `docs/testing.md`, Known open.)
- The before/after counts stand in the delivery note.

## Comments

**Delivered in one run**, as the ticket asks:
`pnpm test:visual --project=ui-light --project=ui-dark --update-snapshots`.

**Before: 240 baselines in `packages/core`. After: 240.** None added, none
removed — which is the first thing worth saying, because a page that had
silently gained or lost a picture would show up here as a count and nowhere else.

**Moved: 54 of the 240.** Counted by hashing every baseline before the run and
again after, not by reading `git status`:

| Kind | Moved | Why |
|---|---|---|
| `page-*` | **48** of 80 | the 24 pages whose rubric name changed, in both themes — all forty minus the thirteen under `Forms` and the three under `Monitoring`, whose rubric names did not change |
| `page-overview` | **2** | the overview draws a card per rubric; four cards became eight |
| `palette-*` | **4** | `palette-window` and `palette-resting`, both themes |
| `example-*` | **0** | — |

**The spec predicted this almost exactly**: "roughly 48 images across both
themes" for the page heads (it is 48), "the two overview pictures" (it is 2).
Only the palette estimate was loose — it allowed "up to ten", and the answer is
**4, which is every palette picture there is**. Both are whole-viewport pictures,
and the sidebar stands behind the palette's translucent pane, so an eight-rubric
sidebar reaches them even where the find itself is unchanged (`palette-window`
searches `dtp`, a page under `Forms`).

**No `example-*` picture moved — zero of 146.** That is the ticket's stop
condition, and it is the evidence that ticket 02 changed the grouping and nothing
inside a page.

**charts and table baselines are untouched**, hashed before and after: 54 in
charts, 118 in table, both byte-identical.

**Afterwards `pnpm test:visual` is green** for `ui-light`, `ui-dark`,
`table-light` and `table-dark`. The first verification run failed one test —
`the resting pointer does not take the tick away from the keyboard` — which is
**not** a picture and not a consequence of adopting them; it is recorded with its
cause under ticket 03.
