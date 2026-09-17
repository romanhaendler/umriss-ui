# 11 — The documents

Status: done
Type: task

Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10
Spec: `.scratch/schedule-lane-groups/spec.md` (user story 42 and the whole)

## Scope

- `packages/schedule/CHANGELOG.md` (the appearances' new look is a visible change for callers; new props), `README.md`, `docs/journal.md`, `docs/adr/README.md`, `CONTEXT.md` read once against what was built.
- The props tables of the demo show the new props; the spec and every ticket set to `done` with their delivery reports.

## Acceptance

- Every word the code uses for groups, rows, slots and miniature is either in `CONTEXT.md` or private to one module and said to be so at its site.

## Comments

### Delivery

- **`packages/schedule/CHANGELOG.md`**: the section is "Lanes that fold, and
  one language for the bars", with an **Added** half - `<LaneGroup>` with a
  worked example, the three collapsed props, the miniature and what it does and
  does not show, the header with its chevron, and the spring-open - and the
  **Changed** half the bar tickets wrote, plus the handle answering with a
  strip.
- **`README.md`**: a new section "Lanes that fold"; "What a bar says" now names
  the one channel each appearance owns; the vocabulary list gained **Lane
  group** and **Miniature**.
- **`docs/journal.md`**: an entry for the whole effort. It records what is
  invisible from outside - the layout that stopped multiplying, the three
  defects only the rendered picture could show, the two tests that had passed
  for the wrong reason, the two new checking tools - and carries the three
  decisions and the two Open items.
- **`docs/testing.md`**: three new rows (the rows module, `pixels.ts`,
  `ownData`), and **Known open** widened: the charts' text drift reaches the
  schedule when an example MOVES, with the measurement that shows the plot is
  byte-identical and every difference is text.
- **`docs/adr/README.md`** indexes ADR-0025, written in 07.
- **The props tables** carry the new props: `props.json` is 12 types now, with
  `LaneGroupProps` among them and `collapsedGroups`, `defaultCollapsedGroups`
  and `onCollapsedGroupsChange` in `ScheduleProps`. The gate would have refused
  any of them without a doc comment.

### The acceptance, checked

> Every word the code uses for groups, rows, slots and miniature is either in
> `CONTEXT.md` or private to one module and said to be so at its site.

- **Lane group** and **Miniature** are entries in `CONTEXT.md`, section "The
  schedule".
- **Row** and **Slot** are `rows.ts`'s, and the module's first paragraph says
  so: "ROW is this module's private word and appears nowhere in the API."
  Checked: neither word occurs in `src/index.ts`.
- The word reaches the DOM in exactly one place, `data-row` on a header, and
  that is now said where it is written - with what its three values mean and
  why an application needs to tell them apart.
