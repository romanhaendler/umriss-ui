# 09 — The miniature

Status: done
Type: task

Blocked by: 08
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 29–32, 39, 41)

## Scope

- Strips: main time in the task colour, setup and teardown faint, nothing else; height per the spec's rule, inner groups as hairlines.
- Overlap marks on strip and row; late transports as ever; findings computed per real lane, unchanged.
- Transports take y from the slot; `attach` compares slot tops.
- Hit, hover, tooltip, selection on strips; no grips for a box in a miniature. `clientPointOf`/`positionAt` answer with the slot.

## Acceptance

- Unit: slots and strip geometry. Browser: a transport arrives at a strip; an overlap inside a folded group is visible; a strip can be hovered and selected; `findings()` equal folded and unfolded.
- Examples: a folded group with transports, a finding inside a fold. Pictures new, count stated.

## Comments

### Delivery

- **`drawStrip`** draws a bar inside a miniature: the main time in the task's
  colour, the setup and teardown faint at 28 per cent, and nothing else. The
  reason stands at the site - a folded group is a change of SCALE and not a
  second kind of picture, and at a few pixels an appearance, a label or a rail
  is a mark nobody can read, or one somebody misreads.
- **No label and no grips on a strip.** `barLabelBox` answers null for a box in
  a miniature; the grips are not published for one. A bar three pixels high is
  not something to stretch by three pixels.
- **A finding is marked twice**: on the strip, and on the ROW. Folding is a
  planner tidying the view and must never be a planner hiding a finding, and a
  three-pixel strip is not where an alarm can live alone. That holds for BOTH
  findings - user story 31 says "an overlap **or a late transport**", and the
  late transport was missing until a review caught it: `drawLateInFolds` marks
  the time that is short on the row of the group the move arrives in.
- **Inner groups show as a hairline** between the strips where one inner group
  ends and the next begins: the structure is part of the plant, at a smaller
  scale like everything else in there.
- Transports already took their y from the slot and `attach` already compared
  slot tops - 07 did both, because a lane index cannot say where a bar is once
  a folded group is one row. The same is true of the hit, the hover, the
  tooltip, the selection, `clientPointOf` and `positionAt`: they read slots, so
  a strip answers for them without a line of its own.

### Tests

- **4 new browser tests**, all on the new example: two lanes drawn as two
  strips each keeping its own hours; a transport from outside the group
  arriving BELOW the middle of the row, which is the mill's strip and not the
  group's top edge; the overlap marked on the row in the danger tone while a
  quiet hour is not; and a strip hovered (the tooltip names the stop), clicked
  (its whole task gains an outline across the plan, measured before and after),
  with no grip and no bar label anywhere.
- Three of them first failed against a "nothing is painted here" bound of 0.05
  and are now 0.2 with the reason written down: the grid's time ticks run the
  height of the plot behind everything, so a truly empty strip is not an empty
  rectangle. The same thing the hollow-bar test of 02 had to say.
- `findings()` equal folded and unfolded is shown in the example itself - the
  readout is computed from the data and does not change by an entry when the
  hall folds.
- All schedule suites: **289 passed**, 139 skipped. Unit: 192.

### The fifth why page

`why/lane-groups.tsx` - *a folded group keeps every bar its place* - is written
here rather than in 06, where it would have described a feature that did not
exist. It says what survives a fold, why a miniature is a change of scale and
not an arrangement, and what it costs plainly: no appearance, no label, no
rail, no grips, and no summary of any kind.

### Pictures

**2 new**: `lane-groups--the-miniature`, light and dark. 132 baselines now.
Nothing else moved.
