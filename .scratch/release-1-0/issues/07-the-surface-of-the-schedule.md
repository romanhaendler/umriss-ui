# The surface of the schedule

Type:   research
Status: resolved

## Question

Review the public surface of `@umriss-ui/schedule` for what should not be frozen as it stands.

Read `packages/schedule/API.md` first (every export, prop, option and return), then the source and the demo examples where a
line raises a question. Look for:

- **Inconsistent names**: the same thing named two ways across components or packages (a prop, a callback,
  a value of a union), and names that disagree with `CONTEXT.md`.
- **Inconsistent shapes**: callbacks that report differently for the same kind of event, controlled and
  uncontrolled pairs that do not follow one pattern, options that are a boolean here and a union there.
- **Loosely typed surface**: `unknown`, `any` or `string` where the caller could be checked.
- **Deprecated aliases and renames still alive**, and anything exported that nothing documents or uses.
- **Defaults** that surprise, and props whose doc sentence and behaviour disagree.

Candidates only, no decision. For each: where (`file:line`), what stands there, whether setting it right
after 1.0 would cost a major, the smallest change, its size (S/M/L). Say what was not read.

Findings: `.scratch/release-1-0/research/07-the-surface-of-the-schedule.md`

## Answer

Findings: `.scratch/release-1-0/research/07-the-surface-of-the-schedule.md`. Doc sentences were checked
against the types, not against behaviour. Not read: the scene internals, `DataTable.tsx`,
`ScheduleTooltip.tsx`, CSS, tests, and all but one folder of examples.

No deprecated alias is alive; `initialView` / `onViewChange` / `setView` and the `scroll*` returns match
charts and the table.

Candidates whose change breaks a caller (decided in "What of the schedule's surface changes before 1.0"):

- **`from` / `to` mean three things**: subtask ids on `Dependency`, times on `Subtask`, the intents and
  `BlockedTime`, `Subtask` objects in the tooltip's dependency. `CONTEXT.md` says predecessor / successor.
- **One field name, an id here and an object there**: `blocked`, `dependency`, `subtask`, `task`; the
  tooltip's `overlapping` and `blocked` beside the findings' `overlaps` and `inBlockedTime`.
- **`ResolvedAppearance` is `{dashed, hatched, muted, open}`**; the source calls the first two old names, and
  the glossary keeps "hatch" for a refused lane.
- **`label` means four things**: a function on `Schedule` (the glossary's Bar label), a node on `Lane`,
  strings on `Milestone` and `BlockedTime`; records elsewhere use `name`.
- **A dependency's `route`, `attach`, `ends`** beside the anchors `leaves` and `arrives`; `ends` is a
  two-state string.
- **Selection is half controlled**: `selectedTask` goes in, `onSelectedTaskChange(task, subtask)` reports a
  subtask that cannot be handed back; no default value, not in `ScheduleView`.

Not a break: `API.md` has no component props at all (no section for `Schedule`, `Lane`, ...; the seven
`*Props` types list no fields; union members are not listed), though all 52 exports are named; stale doc
sentences on `children` and the tooltip's kinds; `ZoomLimits` is declared in the schedule and in charts;
`aria-label` is required even beside `aria-labelledby`.
