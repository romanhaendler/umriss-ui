# @umriss-ui/schedule

The schedule of a plant: **subtasks** on **lanes** over time. One task runs
across several machines in a fixed order, each stop has a main time with a
setup before it and a teardown after it, and between the stops lie
**transports** with durations of their own. The schedule draws all of it, marks
what cannot work — two subtasks on one machine at once, a transport that cannot
arrive in time — and lets a planner move things by hand without ever changing
the plan underneath them.

## Install

```bash
pnpm add @umriss-ui/schedule @umriss-ui/core @umriss-ui/charts
```

Both `@umriss-ui/core` and `@umriss-ui/charts` are **peer dependencies**
(ADR-0022): the schedule takes its styling regime, provider, formats and
wording from core, and its time arithmetic — the affine scale, the time steps,
the operating calendar, the canvas colour resolution — from charts. React 18 or
19 as a peer as well.

## The smallest schedule that runs

```tsx
import { Lane, Schedule, Subtasks, Transports } from "@umriss-ui/schedule";
import type { Subtask, Task, Transport } from "@umriss-ui/schedule";

const at = (h: number, m = 0) => new Date(2026, 2, 17, h, m).getTime();

const tasks: Task[] = [{ id: "a-2041", color: "#2563eb" }];
const subtasks: Subtask[] = [
  { id: "cut", task: "a-2041", lane: "saw", from: at(6), to: at(7), teardown: 10 * 60_000 },
  { id: "mill", task: "a-2041", lane: "mill", from: at(8), to: at(10), setup: 30 * 60_000 },
];
const transports: Transport[] = [{ id: "move", from: "cut", to: "mill", duration: 15 * 60_000 }];

export function Plan() {
  return (
    <Schedule ariaLabel="Plan of Tuesday" initialDomain={[at(5), at(12)]}>
      <Lane id="saw" label="Saw" />
      <Lane id="mill" label="Mill" />
      <Transports data={transports} />
      <Subtasks data={subtasks} tasks={tasks} />
    </Schedule>
  );
}
```

## Editing is controlled

The schedule draws the data it is given and changes none of it (ADR-0023). A
drag shows a **ghost** with the findings the drop would create, and ends in an
**intent** — move, lane, stretch, setup, teardown — reported to the caller:

```tsx
<Schedule
  intents={["move", "lane"]}
  onIntent={(intent) => setSubtasks((all) => all.map((s) => applyIntent(s, intent)))}
  …
>
```

`intents` lists what the application handles; without it the schedule is
read-only. `canMoveTo(subtask, lane)` narrows it: a drag across a lane the
subtask may not go to leaves the ghost where it was allowed and shows a
refusal, and a refused drop reports nothing. A drag near the edge of the plot pans the plot along, and `snap`
takes the tick raster, a step, or a step with an offset - shifts at 06:00,
14:00 and 22:00 are eight hours offset by six.

Dependent subtasks never move by themselves: `ripple` computes the cascade for
the application to apply, or not, and `shiftTask` the moves of a whole order.
`findings`, `overlaps` and `lateTransports` return what the schedule draws as
data.

Work that is not on the plan is dragged in from any list of the application,
with the platform's drag and drop: the application says what it is dragging in
`placing`, the drop reports a `place` intent, and `subtaskFromPlace` builds the
subtask under the application's own id.

## What a bar says

`label` writes a line into every bar, cut off where the bar is too narrow and
left out where nothing would be readable. `appearance` adds what a colour
cannot say - `"provisional"`, `"fixed"`, `"muted"`, `"open"` - and `progress`
draws the share that is done as a rail along the bar. `route`, `anchor` and
`ends` decide how a transport is drawn, per schedule or per transport, without
touching what a finding says.

Each appearance owns exactly **one** property of the drawing, so several on one
bar stay several statements: `"provisional"` the fill (none at all, the surface
shows through), `"fixed"` the ends (a cap inside each), `"muted"` the
saturation (the task colour half mixed into the surface, at full height), and
`"open"` a fade at whichever edge of the view the bar passes. `progress` owns a
rail inside the main time. The faint, outlined fill belongs to a setup and a
teardown and to nothing else.

## Lanes that fold

`<LaneGroup>` puts halls, lines and machine groups over the lanes, to any
depth. A group is structure and never a lane: nothing sits on it, no finding is
reported for it, and no intent names it (ADR-0025).

```tsx
<LaneGroup id="hall-a" label="Hall A">
  <LaneGroup id="turning" label="Turning line">
    <Lane id="lathe-1" label="Lathe 1" />
    <Lane id="lathe-2" label="Lathe 2" />
  </LaneGroup>
  <Lane id="press-1" label="Press 1" />
</LaneGroup>
```

Folded, a group becomes one row showing a **miniature** — every lane in it as a
thin strip, the real work smaller. Transports still arrive at the right strip,
findings are still marked, and a strip can still be hovered and selected:
folding costs a planner detail and never access. `collapsedGroups`,
`defaultCollapsedGroups` and `onCollapsedGroupsChange` put the state in the
application's hands; it is a view state, never an intent.

## Reading and moving

A tooltip on a hovered subtask or transport names the order, the times, setup
and teardown and the findings; `tooltip` replaces its content or switches it
off. `now` draws the present across the lanes. The wheel over the schedule,
lane headers included, scrolls the lanes and releases the page at their end,
Ctrl or ⌘ and a pinch zoom, Shift pans; on a touch screen one finger pans and a
tap selects. The lane headers take at most 40 % of the width, so that on a
phone the plot keeps the larger part;
`onDomainChange` reports the visible span, and a ref handle turns a client
point into a time and a lane and back.

## Where to read on

* The demo: <https://romanhaendler.github.io/umriss-ui/schedule/>, or locally
  `pnpm dev:schedule` (port 4176). It is the documentation — every page shows
  running examples with their source and the props table generated from `src/`.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* The vocabulary — **Task**, **Subtask**, **Setup**, **Teardown**,
  **Transport**, **Late transport**, **Lane header**, **Lane group**,
  **Miniature**, **Intent**, **Ghost** — stands in the workspace's
  `CONTEXT.md`, section "The schedule".
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all four packages share.

## Licence

MIT — see [`LICENSE`](LICENSE).
