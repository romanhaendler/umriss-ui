# @umriss-ui/schedule

A React Gantt-style schedule for data-dense applications — work planned over time: **subtasks** on **lanes** — people, vehicles, rooms or
machines. One task runs across several lanes in a fixed order, each stop has a
main time with a lead-in before it and a lead-out after it, between the stops
lie **dependencies** with lags of their own, and a lane can be **blocked** for
leave or maintenance. The schedule draws all of it, marks what cannot work —
two subtasks on one lane at once, a dependency whose lag does not fit, work in
blocked time — and lets a planner move things by hand without ever changing
the plan underneath them.

## Install

```bash
pnpm add @umriss-ui/schedule @umriss-ui/core @umriss-ui/charts
```

Both `@umriss-ui/core` and `@umriss-ui/charts` are **peer dependencies**
(ADR-0022): the schedule takes its styling regime, provider, formats and
wording from core, and its time arithmetic — the affine scale, the time steps,
the working calendar, the canvas colour resolution — from charts. React 19 or
newer as a peer as well. TypeScript 5.4 or newer (the declarations use `NoInfer`).

The package ships ES2022 syntax; an application that serves older browsers
transpiles it itself.

Every entry begins with `"use client"`, the directive a framework
with Server Components reads to treat a module as client code. A schedule is declared by its hook,
`useSchedule`, so the declaration lives in a Client Component file: a Server Component renders that
file and hands it the rows and subtasks. On a server a schedule gives its labelled frame and empty
canvases; the lanes, the subtasks and the summary arrive on the client after mount, and a date or
time is empty until the page has hydrated, because only the browser knows the reader's zone. No test
runs inside such a framework: the schedule is rendered to a string in a test.

umriss writes no HTML into the document and runs under `require-trusted-types-for 'script'`: every page of the demo is opened under that policy in the visual suite, and an HTML sink in the library fails it.

## The smallest schedule that runs

```tsx
import { useSchedule } from "@umriss-ui/schedule";
import type { Subtask, Task, Dependency } from "@umriss-ui/schedule";

const at = (h: number, m = 0) => new Date(2026, 2, 17, h, m).getTime();

const tasks: Task[] = [{ id: "a-2041", color: "#2563eb" }];
const subtasks: Subtask[] = [
  { id: "cut", task: "a-2041", lane: "saw", from: at(6), to: at(7), leadOut: 10 * 60_000 },
  { id: "mill", task: "a-2041", lane: "mill", from: at(8), to: at(10), leadIn: 30 * 60_000 },
];
const dependencies: Dependency[] = [{ id: "move", from: "cut", to: "mill", lag: 15 * 60_000 }];

export function Plan() {
  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView: { domain: [at(5), at(12)] } });
  return (
    <Schedule aria-label="Plan of Tuesday">
      <Lane id="saw" label="Saw" />
      <Lane id="mill" label="Mill" />
      <Dependencies data={dependencies} />
      <Subtasks data={subtasks} tasks={tasks} />
    </Schedule>
  );
}
```

Malformed data - a subtask that does not end after it starts, an item on a lane no `Lane` declares, a dependency naming no subtask, an id that stands twice - warns in development, once per cause, and is left out in production. An application with imported data checks it where it imports it.

## Editing is controlled

The schedule draws the data it is given and changes none of it (ADR-0023). A
drag shows a **ghost** with the findings the drop would create, and ends in an
**intent** — move, lane, stretch, lead-in, lead-out — reported to the caller:

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
takes the tick raster, a step, or a step with an offset - handovers at 06:00,
14:00 and 22:00 are eight hours offset by six.

Dependent subtasks never move by themselves: `ripple` computes the cascade for
the application to apply, or not, and `shiftTask` the moves of a whole task.
`findings`, `overlaps` and `violatedDependencies` return what the schedule draws as
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
`ends` decide how a dependency is drawn, per schedule or per dependency, without
touching what a finding says.

Each appearance owns exactly **one** property of the drawing, so several on one
bar stay several statements: `"provisional"` the fill (none at all, the surface
shows through), `"fixed"` the ends (a cap inside each), `"muted"` the
saturation (the task colour half mixed into the surface, at full height), and
`"open"` a fade at whichever edge of the view the bar passes. `progress` owns a
rail inside the main time. The faint, outlined fill belongs to a lead-in and a
lead-out and to nothing else.

## Lanes that fold

`<LaneGroup>` puts teams, depots or regions over the lanes, to any
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
thin strip, the real work smaller. Dependencies still arrive at the right strip,
findings are still marked, and a strip can still be hovered and selected:
folding costs a planner detail and never access. Which groups are folded is
part of the schedule's view, never an intent.

## Reading and moving

A tooltip on a hovered subtask or dependency names the order, the times, lead-in
and lead-out and the findings; `tooltip` replaces its content or switches it
off. `now` draws the present across the lanes. The wheel over the schedule,
lane headers included, scrolls the lanes and releases the page at their end,
Ctrl or ⌘ and a pinch zoom, Shift pans; on the focused plot `+` (or `=`) zooms in, `-` zooms out and `0` fits the work, and the live region says the new span; on a touch screen one finger pans, a
tap selects and a long press on a bar grabs it (with `"move"` or `"lane"` in `intents`), and a vertical swipe scrolls the page while all lanes fit (when they
overflow, the lane names scroll the page). The lane headers take at most 40 % of the width, so that on a
phone the plot keeps the larger part; `positionAt` and `clientPointOf`, on what
`useSchedule` hands back, turn a client point into a time and a lane and back.

`DataTable`, which `useSchedule` hands back, is opt-in: placed inside the
`Schedule`, it adds a Show data key beside the bottom time band. The key opens a
table over the lanes and the plot, one row per subtask whose time, lead-in and
lead-out included, touches the span in view, in lane order, with the lane,
task, subtask, from and to with their dates, the duration and the findings in
words - a reader walks it with a screen reader's table keys instead of one
subtask at a time. Without the part nothing changes.

## Its size

The width is the host's. Without `height`, a schedule fills its frame - a stretched grid cell, a card the
grid stretches, a container of definite height - and never goes below 400 px, which is also its height in
a frame without one: alone in a block it is 400 px however many lanes it holds, and the lanes beyond the
plot scroll inside it (ADR-0050). A number stays a fixed height. A different floor goes through `style`'s
`minHeight`, and `style` wins over the schedule's own sizing. A wrapper of your own between the frame and
the schedule passes the height on with `height: 100%`.

## The view

The schedule holds its own view (ADR-0047): the span in view and the folded
groups. `useSchedule({ initialView, onViewChange })` takes a start, read once, and
reports what the planner does, always the whole view; two schedules keep in
step by sending each other what they report through `setView`, which is not
reported in turn. Without a span the schedule shows the extent of its subtasks.
`view`, `setView`, `setDomain`, `toggleGroup`, `foldAll` and `unfoldAll` stand on what the
hook hands back. `setDomain(span)` zooms to a span of two instants; `setDomain(null)` fits the work.

The schedule is a composite: its `ref`, `className`, `style`, `id` and `data-*` reach the root `<div>`;
`aria-label` (required) and `aria-labelledby` name the figure and the plot, and your `aria-describedby`
is joined to the plot's summary.

## Blocked time

`<BlockedTimes data={…} />` takes the time a lane is not available — leave,
maintenance — as plain data, `{ id, lane, from, to, label? }`. It is drawn
hatched behind the work; a subtask that covers some of it is a finding
(`inBlockedTime`, and the third argument of `findings`), and a drag does not
put work into it.

## Milestones

`<Milestones data={…} />` takes points in time on a lane — a handover, a
release — as plain data, `{ id, lane, at, label? }`. Each is drawn as a diamond
on its lane above the work, in the text ink; there is no tone and no size. It
is read-only: it is not dragged, reports no intent and is no finding. The
pointer's tooltip names it by label (or id) and time; the keys walk to it in
time order among the work of its lane, and the live region reads its lane,
label and time.

## The plant's time zone

The schedule follows the `timeZone` of core's formats (`<LanguageProvider formats={{ timeZone: "Europe/Berlin" }}>`);
it takes no prop of its own. The fine band reads the zone's hours, the day band holds the zone's days, "today"
is the zone's, and the now line, an instant, does not move. A `snap` raster is laid on the zone's time: eight
hours offset by six snap to 06:00, 14:00 and 22:00 there on both sides of a clock change (`snapTime(time,
raster, timeZone?)` takes the zone as its last argument). A time inside the hour a clock change doubles carries
its offset (`02:30 GMT+1`), in the band, the tooltip, the ghost and the summary. Where the reader's zone is
another, the zone's name stands once above the lane headers and in the plot's description (core's
`useTimeZoneLabel`); without a named zone, nothing changes.

## Not yet

What the schedule does not do today, and waits for a caller who needs it (what
it never does stands in ADR-0032).

* **Stacked overlap** — overlapping subtasks packed into sub-lanes on request;
  today an overlap is always drawn offset, as the finding it is.
* **Dependencies across tasks** — a dependency joins two subtasks of one task.

Done from this list: **blocked time** per lane and **milestones**.

## Where to read on

* The demo, in a checkout: `pnpm dev:schedule` (port 4176). It is the documentation — every page shows
  running examples with their source and the props table generated from `src/`,
  each prop linked to the examples that show it. An API index lists every
  export, one search finds across all five packages, and the header switches
  the examples to German.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* **For a coding agent**: `docs/llms-full.md` inside the installed package —
  the demo as one Markdown file, pinned to the installed version: every page
  with its examples' source, its props tables and why it is built as it is,
  and an index of every export with its comment and its declaration. The running documentation of a version is opened as [the repository README describes](https://github.com/romanhaendler/umriss-ui#see-it-running): check out the tag `<package>-v<version>`, then `pnpm start`.
* The vocabulary — **Task**, **Subtask**, **Lead-in**, **Lead-out**,
  **Dependency**, **Violated dependency**, **Blocked time**, **Milestone**, **Lane header**, **Lane group**,
  **Miniature**, **Intent**, **Ghost** — stands in the workspace's
  `CONTEXT.md`, section "The schedule".
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all five packages share.

## Testing

Tested under Vitest 5 and Jest 30 on jsdom. A schedule draws with core and charts, so it needs the
runner lines and the setup file of [`@umriss-ui/core`'s Testing section](../core/README.md#testing)
and the setup file of [`@umriss-ui/charts`'](../charts/README.md#testing), one file after the other
in your `umriss.setup.js`. `check:dist` runs a test of the installed schedule (a lane with a bar)
with exactly those files.

## Licence

MIT — see [`LICENSE`](LICENSE).
