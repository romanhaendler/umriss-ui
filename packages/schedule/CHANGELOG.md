# Changes to `@umriss-ui/schedule`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository stands in the
repository's journal (`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why whatever changes existing behaviour stands
under a heading "Changed" of its own, no matter which digit rose.

**Release candidates.** The package started as a release candidate under the
tag `next`. With `0.1.0` it is released: the tag is gone, and the interface
moves from here under the rule above.

---

## 0.1.7 – Core 0.8.0: a fold that turns (Sep. 2026)

Needs `@umriss-ui/core` 0.8: it reads core's pressed surfaces and motion tokens; the peer range moves to `^0.8.0`.

### Changed

- **The lane-group fold is core's `AngleGlyph`** – the same chevron, at the
  one stroke width (1.4 instead of 1.5).

- **The fold chevron of a lane group has a surface.** Under the pointer it now
  takes the sunken surface of core's quiet keys, and a stronger one while
  pressed, like the table's expander; it only darkened its type before. Its
  focus is the ring alone - the ring no longer darkens the type as well.

### Fixed

- **The fold chevron of a lane group turns.** Its transition named a curve token
  that does not exist (`--u-ease-standard`), which made the whole declaration
  invalid, so the chevron has always jumped. It now reads `--u-ease-out`.

---

## 0.1.6 – Core 0.7.0 (Sep. 2026)

### Changed

- **A finding in the tooltip reads core's `--u-color-danger-text`** - lighter in
  the dark theme, 4.5:1 on its surface. The peer range moves to
  `@umriss-ui/core` `^0.7.0`.

---

## 0.1.5 – Core 0.6.0 (Sep. 2026)

### Changed

- **The schedule takes `@umriss-ui/core` 0.6.** Nothing in the schedule
  changed; the peer range moves to `^0.6.0`, so that it installs beside
  `@umriss-ui/table` 0.3, which needs core's new wording.

---

## 0.1.4 – Core 0.5.0 (Sep. 2026)

### Changed

- **The schedule takes `@umriss-ui/core` 0.5.** Nothing in the schedule
  changed; the peer range moves to `^0.5.0`, so that it installs beside
  `@umriss-ui/calculation`, which needs core's new wording.
  `@umriss-ui/charts` stays at `^0.4.0`.

---

## 0.1.3 – Core 0.4.0 and charts 0.4.0 (Sep. 2026)

### Changed

- **The schedule takes `@umriss-ui/core` 0.4 and `@umriss-ui/charts` 0.4.**
  The peer ranges move to `^0.4.0`. The schedule places its day and shift
  boundaries with the local offset that charts now exports (`localOffset`);
  its own copy is gone. What it draws is unchanged.

---

## 0.1.2 – Phones, touch and a review (Sep. 2026)

### Changed

- **The lane headers take at most 40 % of the schedule.** `headerWidth` is
  now `min(headerWidth px, 40%)`, so that on a phone the plot keeps the larger
  part.
- **The wheel over the lane headers scrolls the lanes**, as it does over the
  plot; Ctrl or ⌘ there zooms around the plot's first instant.
- **A finger's tap may wander ten pixels** and still select; the mouse keeps
  its three.

### Fixed

- A pinch that ends with one finger still down pans on with that finger,
  instead of doing nothing until it is lifted; a third finger no longer breaks
  the pinch.
- A pan ended by `pointercancel` gives the cursor back.
- A schedule unmounted during a drag stops its auto-pan and the timer of a
  folded group it rested over; before, the auto-pan ran on and kept reporting
  `onDomainChange`.
- A new `calendar` - an inline array counts, being new on every render - under
  a view panned past the old calendar's ends no longer turns the domain into
  NaN and the plot blank.
- A lane or group id containing a space no longer breaks the fold control's
  `aria-controls`.

---

## 0.1.1 – The README catches up (Sep. 2026)

Nothing in the code changed. The README names the online demo, the design
language and the licence, as the other three packages do. The peer ranges are
`^0.3.1` on `@umriss-ui/core` and `@umriss-ui/charts`, released beside it.

---

## 0.1.0 – The first release (Sep. 2026)

No longer a release candidate: the tag `next` is gone, `pnpm add
@umriss-ui/schedule` is the whole install line, and `@umriss-ui/core` and
`@umriss-ui/charts` are released versions too. What the candidate `0.1.0-rc.0`
was is still here; three deliveries stand on top of it, newest first, each with
its own report below.

The numbers keep their meaning from here: the middle digit rises when something
is added, the last one when something is repaired, and whatever changes
existing behaviour stands under a heading "Changed" of its own. As long as the
first digit is `0`, no number promises compatibility.

---

## Lanes that fold, and one language for the bars (Sep. 2026)

Delivery report for `.scratch/schedule-lane-groups/spec.md`, tickets 01–11.

### Added

- **`<LaneGroup id label>`** puts structure over the lanes — halls, lines,
  machine groups, to any depth. It is declared by composition, so a group reads
  in JSX as it reads in the plant, and a lane never names its group.

  A group is **never a lane** (ADR-0025). Nothing sits on it: a subtask names a
  machine, a finding belongs to a machine, `canMoveTo` is asked about a machine
  and every intent names one. Folding a group changes none of it.

  ```tsx
  <Schedule …>
    <LaneGroup id="hall-a" label="Hall A">
      <LaneGroup id="turning" label="Turning line">
        <Lane id="lathe-1" label="Lathe 1" />
        <Lane id="lathe-2" label="Lathe 2" />
      </LaneGroup>
      <Lane id="press-1" label="Press 1" />
    </LaneGroup>
    <Lane id="paint" label="Paint shop" />
  </Schedule>
  ```
- **`collapsedGroups`, `defaultCollapsedGroups` and `onCollapsedGroupsChange`**
  say which groups are folded — controlled, with an uncontrolled default: the
  shape `selectedTask` has. It is **not an intent**. Folding says what is on
  screen and nothing about the plan, so a caller that applies every intent it
  receives will never find a fold among them.
- **A folded group shows a miniature**: every lane in it as a thin strip, at a
  smaller scale, with its work in the tasks' own colours. Transports arrive at
  a strip, a finding inside a fold is marked on the strip and on the row, and a
  strip can be hovered, tooltipped and selected. A strip carries no appearance,
  no bar label, no progress rail and no grips — that is what unfolding is for.
- **The header of a group** carries a chevron button with `aria-expanded` and
  `aria-controls`, the group's label and how many lanes it holds; children
  indent one step per level. It is the first thing the schedule puts into the
  tab order, and it has a focus ring of its own. Two wording entries in English
  and in `@umriss-ui/core/wording/de`, plus the lane count.
- **A drag held over a folded group opens it** after a moment, so work can be
  moved into a group without preparing the view first. It closes again when the
  drag ends, and the caller's list is never written to — the application did
  not fold anything, and hears nothing.

### Changed

- **Every appearance is drawn differently.** The words a caller writes are
  unchanged and so is `resolveAppearance`; the picture is not. Each statement
  now owns exactly one property of the drawing, so that several on one bar stay
  several statements:
  - `"provisional"` is **hollow** - no fill at all, the surface shows through,
    with its dashed outline in the task colour at full weight. It used to be a
    45-per-cent fill, which read as a setup; empty is not faint.
  - `"fixed"` carries a **cap at each end** of the main time, three pixels, in
    the colour the bar's label takes, set just inside the end. The hatch across
    its face is gone: it lay under the label, and it was the loudest mark in
    the picture for the calmest statement.
  - `"muted"` is at **full height** in the task colour mixed half into the
    surface, opaque and without an outline. It used to be drawn at half height,
    which read as a different kind of thing and cost it its label.
  - `"open"` **fades at whichever edge of the view** the bar passes, left as
    well as right. A bar that began before the view used to say nothing at all.
- **A `progress` rail** lies within the main time and above the bar's lower
  edge. It measures the work, so it stops where the main time does.
- **A hatch now means one thing only**: a lane a drag may not put its work on.
  It is no longer a mark on any bar.
- **A refused lane is visible before it is met.** The lanes `canMoveTo` turns
  down are marked from the first frame of a drag - drawn back and hatched, and
  their headers with them (`[data-lane][data-refused]`, to style beside the
  schedule). Over one of them the cursor says no and a hairline ties the ghost
  to the pointer it is not following.
- **A refused lane no longer costs the whole gesture.** A drop after one still
  reports the move in time; only the lane change is dropped. `canMoveTo` is
  asked once per lane when a drag takes hold, and again at the drop.
- **`ScheduleHandle` answers for a folded lane** with its strip:
  `clientPointOf` and `positionAt` read the place a lane is actually drawn, so
  a caller's own marks keep pointing at the work when a group folds.

---

## A plan one can read (Sep. 2026)

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

## The schedule in daily use (Sep. 2026)

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
