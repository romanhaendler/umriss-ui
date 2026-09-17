# 07 — Rows instead of a multiplication

Status: done
Type: task

Spec: `.scratch/schedule-lane-groups/spec.md` ("Lane groups - Rows"; enables user stories 27–41)

## Scope

- ADR-0025 and the `CONTEXT.md` entry **Lane group** first: structure over lanes, never a lane; the miniature is a scale, not a packing.
- A pure module beside `geometry.ts`: tree + collapsed set → rows (`lane`, `groupHead`, `miniature`) with `top` and `height`, and a slot per real lane. Test-first.
- `laneTop`, `laneAt`, `maxScroll`, `lanesBottom`, `subtaskBox`, `drawGrid`, `drawOverlap`, `clientPointOf` and the headers read rows. No group exists yet, so the tree is flat.

## Acceptance

- Unit: the flat case equals today's arithmetic exactly; nested, folded, folded within folded; `laneAt` inverse to `laneTop` over random trees.
- **No picture is renewed.** A flat schedule is pixel-identical; every browser suite green without touching a snapshot.

## Comments

### Delivery

- **ADR-0025** and the two `CONTEXT.md` entries first, as the ticket asks:
  **Lane group** (structure over lanes, never a lane; folding is not an intent)
  and **Miniature** (the real work smaller - not a summary, not a packing).
  Both standing sentences are cited in the ADR at the place they would be
  tempting to break.
- **`src/rows.ts`** is the pure module, written test-first. It turns the lanes,
  the groups and the collapsed set into **rows** (`lane`, `groupHead`,
  `miniature`) with a `top` and a `height` each, and gives every real lane a
  **slot** - its own row, or its strip inside a miniature. `rowAt` is a binary
  search over the prefix sums the layout already produced.
- **Row is the module's private word** and appears nowhere in the API, which is
  said at its site: "a lane is not a row" is a standing sentence, and a layout
  that called them the same thing would break it by accident.
- Everything that needed a y now asks for a slot: `laneTop`, `laneAt`,
  `maxScroll`, `lanesBottom`, `subtaskBox`, `drawGrid`, `drawOverlap`,
  `drawRefusedLanes`, `ghostBox` and `clientPointOf`. `SubtaskBox` carries its
  `lane` and whether it is a strip, instead of a lane INDEX - an index cannot
  say where a bar is once a folded group is one row.
- `attachY` compares the two boxes' tops rather than their lane indices, which
  is what the spec asks for and what a miniature needs.

### Tests

**21 unit tests, written before the module.** The first thing they ask is that
nothing changes: a flat plan lays out exactly as `laneIndex * laneHeight` did,
top and height, and every lane's slot is its whole row. Then the tree, the
fold, the fold inside a fold, the strip's floor of three pixels, a large group
folding to a TALLER row rather than an unreadable one, and the inner group's
state surviving an outer fold.

`laneAt` as the inverse of `laneTop` is checked over forty trees drawn at
random - at the top, the middle and the last row of every row, plus "the rows
lie end to end with no gap and no overlap". That is the property the
multiplication had for free and a binary search has to earn.

Two refusals are tested as well: a `parent` naming nothing leaves its lane at
the top level rather than making it vanish, and a group holding no lane is
dropped rather than drawn as a head with nothing under it.

### The acceptance

**No picture is renewed. Not one.** All schedule suites: 265 passed, 127
skipped, and `git status` over the snapshot directory is empty. A flat schedule
is pixel-identical, which is what this ticket had to prove.

### Repaired on the way

`demo-smoke.test.tsx` had been red since 05: it asks every page for a props
table, and the chapters of a feature cut have none of their own. They are named
exceptions now, with one shared reason - a chapter is one thing `<Schedule>`
does, and the props that do it stand once in `ScheduleProps` on *First
schedule*. Thirteen copies of that table would be thirteen things to keep true.
It was caught here because 05 and 06 were verified with lint and the browser
suites and not with the unit tests; that is the lesson, and the remaining
tickets run both.
