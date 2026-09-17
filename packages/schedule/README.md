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
pnpm add @umriss-ui/schedule@next @umriss-ui/core @umriss-ui/charts@next
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
read-only. Dependent subtasks never move by themselves: `ripple` computes the
cascade for the application to apply, or not. `findings`, `overlaps` and
`lateTransports` return what the schedule draws as data.

## Where to read on

* The demo — `pnpm dev:schedule` (port 4176) — is the documentation: every page
  shows running examples with their source and the props generated from `src/`.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* The vocabulary — **Task**, **Subtask**, **Setup**, **Teardown**,
  **Transport**, **Late transport**, **Lane header**, **Intent**, **Ghost** —
  stands in the workspace's `CONTEXT.md`, section "The schedule".
