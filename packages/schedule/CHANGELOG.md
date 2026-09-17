# Changes to `@umriss-ui/schedule`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository stands in the
repository's journal (`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why whatever changes existing behaviour stands
under a heading "Changed" of its own, no matter which digit rose.

**Release candidates.** The package starts as a release candidate under the tag
`next`: the interface is expected to move before `0.1.0`.

---

## Unreleased – A plan one can read (Sep. 2026)

Delivery report for `.scratch/schedule-legibility/spec.md`, tickets 01–06.
The formats of `@umriss-ui/core` became English in the same delivery
(ADR-0024), which is what the dates and numbers of a schedule follow.

### Added

- **`label`** writes a line into every bar: the order, the article, whatever a
  planner reads first. It is real DOM text, cut off with an ellipsis where the
  bar is too narrow, left out where nothing would be readable, and held at the
  view's edge for a bar that began before it. Its colour follows the brightness
  of the bar's.
- **`route`, `anchor` and `ends`** decide how a transport is drawn: a curve, a
  straight line or orthogonal segments; from the middle of a bar or from the
  edge facing the other stop; with or without a dot at each end. All three are
  options of the schedule and all three are overridable per transport. They
  change the picture and never a finding - `leaves` and `arrives` alone decide
  whether a transport is late.
- **`appearance` and `progress` on a subtask:** `"provisional"` (a dashed
  outline), `"fixed"` (a hatch), `"muted"` (drawn slim), `"open"` (fading where
  it continues past the view), and a share of the work that is done, drawn as a
  rail along the bar. Each is a pattern or an outline and not only a colour, and
  none of them uses the faint fill that means a setup or a teardown.
- **`canMoveTo(subtask, lane)`** narrows where a drag may land. The ghost stays
  on the last lane that was allowed and says "Not this lane"; a refused drop
  reports nothing. It is asked for work dragged in from outside as well. Two
  wording entries come with it.

---

## Unreleased – The schedule in daily use (Sep. 2026)

Delivery report for `.scratch/schedule-refinement/spec.md`, tickets 01–09.
Read **Changed** first: the wheel does something else now.

### Changed

- **The wheel scrolls the lanes** and lets the page scroll on once they are at
  their end. **Ctrl or ⌘ with the wheel, and a pinch, zoom**; a horizontal
  wheel or Shift with a vertical one pans through time. Before this, every
  wheel movement zoomed, which trapped the wheel on a long page and left
  twenty lanes unreachable by it.
- **`onSelectedTaskChange` carries the clicked subtask** as a second argument
  (null for a click on a transport or on nothing), and is called again when
  another subtask of the same task is clicked. A caller that reads only the
  first argument is unaffected.

### Added

- **A tooltip** on a hovered subtask or transport: the order, the stop, its
  times, setup and teardown, the transport's route and duration, and the
  findings on it. `tooltip={false}` switches it off; a function replaces its
  content and receives a `ScheduleTooltipTarget` with the findings.
- **`now`** draws a line across the lanes at the present: `true` follows the
  clock by the minute, an instant fixes it there. Off by default.
- **A drag near the edge of the plot pans the plot along**, faster the closer
  to the edge, so a subtask reaches a time that was not in view in one
  gesture.
- **`snap` takes a raster with an offset** (`{ step, offset }`): shifts at
  06:00, 14:00 and 22:00 are eight hours offset by six. A snapped time that
  would land in time an operating calendar removes moves on to the seam, so an
  intent never asks for a time the plant does not run.
- **`shiftTask(subtasks, task, by)`** returns one move intent per stop of a
  task - the whole order moved, distances kept.
- **The place intent and `placing`:** work that is not on the plan can be
  dragged in from any list, with the platform's drag and drop. The application
  declares what it is dragging in `placing` while it drags; a drop on a lane
  reports `{ kind: "place", item, task, lane, from, to, setup, teardown }`.
  `subtaskFromPlace(intent, id)` builds the subtask, `applyIntent` leaves the
  data alone for it, and `ripple` pushes nothing until the subtask exists.
  Without `"place"` in `intents` no drop is accepted.
- **`onDomainChange`** reports the visible span after the planner pans or
  zooms - for keeping a second schedule, or a chart's time axis, in step. A
  span handed in through `initialDomain` is not reported back.
- **A ref handle** (`ScheduleHandle`): `positionAt(clientX, clientY)`,
  `clientPointOf(time, lane?)`, `visibleDomain()`.

---

## 0.1.0-rc.0 – The schedule (Sep. 2026)

Delivery report for `.scratch/schedule/spec.md` (ADR-0022, ADR-0023). Not yet
published.

### Added

- **`Schedule`** with **`Lane`**, **`Subtasks`** and **`Transports`** declared
  as children. Lane headers at the left as text, a day band above the plot and a
  time band below it that steps from the day down to the quarter hour with the
  zoom. Subtasks drawn with main time, setup and teardown in their task's colour;
  transports as lines from an end to a start, anchored per transport
  (`leaves`, `arrives`). Canvas colours follow `color-scheme`.
- **Findings drawn and never resolved:** an overlap on a lane — setup and
  teardown included — offset and marked; a late transport dashed in the finding
  colour.
- **Pan and zoom:** drag the background in both directions, the wheel and a
  pinch zoom around the pointer, a horizontal wheel pans; `zoomLimits`. An
  operating calendar (`calendar`) cuts removed time out of the axis.
- **Interaction:** `onInteraction` reports click, context menu and hover with
  the hit (subtask and part, transport, lane, nothing), the client point, the
  time and the lane. A click selects the whole task; `selectedTask` and
  `onSelectedTaskChange` control it.
- **Controlled editing:** `intents` and `onIntent` — move, lane, stretch at the
  edges, setup and teardown grips on the selected subtask — with a ghost that
  shows its times and findings while the drag is in flight; Escape cancels.
  `snap`: the tick raster by default, a step, or `false`.
- **The arithmetic:** `findings`, `overlaps`, `lateTransports`, `ripple`,
  `applyIntent`, `snapTime`, `occupied`, `departure`, `arrival`, and the types
  `Task`, `Subtask`, `Transport`, `Intent` and its five kinds.
