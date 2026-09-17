# 08 — Lane groups

Status: done
Type: task

Blocked by: 05, 07
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 27, 28, 35–38, 40, 42)

## Scope

- `<LaneGroup id label>` to any depth; `parent` on `LaneConfig` through context; the tree derived in registration order.
- `collapsedGroups`, `defaultCollapsedGroups`, `onCollapsedGroupsChange`; inner entries kept while an outer group is folded.
- Headers: chevron button with `aria-expanded`/`aria-controls`, label, count of lanes, indentation by a token per depth; the wording in English and `wording/de`. `styles.headerRun` settled.
- Open groups show their slim head; a folded group shows an **empty** row of the miniature's height - the drawing is 09.
- The chapter *Lane groups* with examples: a group, nesting, controlled state.

## Acceptance

- Browser: fold by button, by keyboard, from outside; nested state restored on re-opening; subtasks on folded lanes are not drawn on other rows.
- "Nothing in its own way" covers the group headers.
- axe clean on the new chapter; pictures new, count stated.

## Comments

### Delivery

- **`<LaneGroup id label>`**, to any depth. A group gives its id downwards
  through context (`LaneGroupContext`); a lane never names its group, so moving
  a machine between groups is moving a line of JSX. `SceneData` registers
  groups as it registers lanes, in registration order.
- **`collapsedGroups`, `defaultCollapsedGroups`, `onCollapsedGroupsChange`** -
  the shape `selectedTask` has. The caller's list is never written to: where
  the state is controlled, only the report goes out. A folded outer group hides
  the inner ones without touching their entries, which `rows.ts` already
  guaranteed and a browser test now proves through the DOM.
- **Headers are per ROW**, not per lane: a lane's header, an open group's slim
  head, a folded group's one row. Each carries `data-row`, its depth as a
  padding of one token per level, and - for a group - a chevron button with
  `aria-expanded` and the count of lanes it holds. The wording is two entries in
  English and in `wording/de`, plus the count.
- `styles.headerRun` is settled: it exists in the stylesheet now, and the header
  column still moves as a whole so that a header and its row cannot drift apart
  by a rounding.

### Three things the picture showed that the code did not

1. **Folding took the keyboard focus away.** The header's React key was
   `kind:id`, and a group's head becomes a miniature when it folds - a new key,
   so the chevron was unmounted and remounted under the finger that had just
   pressed it. The key is the row's own id now, which is the same row in two
   states.
2. **Every lane wore its parent's chevron.** A lane row carries its group's id
   so that a drag can find it; that is not the same as being a group. The
   chevron and the lane count are drawn for `groupHead` and `miniature` rows
   only.
3. **`will-change: transform` on the header column moved eight pictures** that
   have no group in them at all. It promotes the column to a compositor layer
   and that changes how its text is rasterised. It was speculative and is gone;
   with it gone, no picture outside the new chapter moved.

### `plot.ts` stopped multiplying, too

A test that worked out a lane's y as `index * 44` was right until it silently
was not: with a group head above them the rows are no longer all the same
height. `plotOf` reads each row's height from the header the plot really
rendered, and `plot.row(lane)` gives its top and height. That is what found
defect 2 - the first run put the welding bay's bar 24 pixels off.

### What is NOT drawn yet

A folded group's row carries its lanes' work already, because the slots exist
the moment the layout does. The ticket allows an empty row and 09 draws the
miniature; drawing nothing here would have meant deliberately throwing away
what the layout already knew. What 09 adds is the strip's own drawing - main
time in the task colour, setup and teardown faint, no appearance, no label, no
rail - and the hit, the transports and the findings on it.

### Tests

- **6 new browser tests**: the head above its lanes with the lanes still in
  declaration order; the chevron as a real button with `aria-expanded` and an
  `aria-controls` that names elements which exist whether the group is open or
  folded; folding by Enter and by Space; folding from outside with the state
  staying the application's; an inner group keeping its state while the outer
  one is folded; and a subtask on a folded lane drawn on no other row.
- `focusGuard` was red, correctly: the schedule had put nothing into the tab
  order until now, and the chevron is the first thing it does. It has a focus
  ring of its own (ADR-0021) and the guard names it.
- axe runs on the new chapter: `lane-groups` is in the accessibility sample.
- **"Nothing in its own way" covers the group headers** - added after a review
  found this ticket's own acceptance unmet and unrecorded. A header's ROW is
  the clipping box and its label, count and chevron are the overlays in it:
  "a header never leaves its row", which is what the spec's Testing Decisions
  ask for. Not the header COLUMN - a header below the fold is scrolled to, not
  lost, and marking the column made the check fail on a truth.
- All schedule suites: **283 passed**, 135 skipped. Unit: 191.

### Pictures

**6 new** - the three examples of the new chapter, light and dark - and **2
modified**: the overview's page head, which lists the chapters. 130 baselines
now, from 122. Nothing else moved.
