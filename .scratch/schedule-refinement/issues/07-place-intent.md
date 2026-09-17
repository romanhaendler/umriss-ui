# 07 — Dragging work in: the place intent

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule-refinement/spec.md` (user stories 20–25, 39–43, 49)

## Scope

- Intent `place`; `placing` prop declared by the application during an HTML drag; ghost with findings; drop, leave, Escape.
- `applyIntent` ignores it; `subtaskFromPlace` builds the subtask; `ripple` accepts it.

## Acceptance

- Unit tests for the helpers; browser test dragging from a list in an example, with the ghost's findings and the reported intent.

## Comments

**Delivered.**

- `PlaceIntent` (`kind: "place"`, the caller's `item`, task, lane, times,
  setup, teardown) joins `Intent`. `applyIntent` leaves the data alone for it -
  creating a subtask is the caller's act - and `subtaskFromPlace(intent, id)`
  builds one under the caller's id. `ripple` returns nothing for it, with the
  reason at the site: until the caller has created the subtask and named its
  transports there is no successor to push. `place.test.ts`, 4 cases.
- The drag from outside runs on the platform's drag and drop. The application
  declares what it drags in `placing` (`PlacingItem`) on its own `dragstart`
  and clears it on `dragend`; the browser hands the data over only on the drop,
  so the ghost before it can come from nowhere else. Over a lane the schedule
  accepts the drop, shows the snapped ghost assessed against the data it would
  join, and reports the place intent; off the lanes, on leaving the plot and on
  Escape it reports nothing. Without `"place"` in `intents` no drop is
  accepted at all.
- Example `Intent/04-drag-in` with three waiting orders; browser tests for the
  ghost with its finding and the reported intent, and for a drag that leaves
  the lanes. Playwright drives the real HTML drag, and the ghost is observable
  mid-drag. 131 green.
- **Baselines moved, named here:** `example-intent--demonstration` (both
  themes). Nothing about the demonstration changed: the new example above it
  makes the page longer, so the picture is taken at a different scroll offset
  and the canvas lands on other half pixels. Measured, not assumed - 6171
  pixels, the same count on three repeats, and green again with the new example
  removed. It is the same cause `docs/testing.md` records for the charts'
  pictures, here triggered deterministically.
