# From the open points to work: what is left

Status: ready-for-agent
Date:   2026-10-11, cut to the unbuilt rest 2026-11-23
Origin: the scan of the workspace against comparable libraries on 10 Oct 2026 and a grilling over everything
that was still open. The facts it stood on are in `docs/research/open-points-2026-10/`.

Packages A and B of this roadmap are built and released (the table's server mode, copy, XLSX, the CSV by
language, the chart range, print, the avatar, groups from the server, dependencies across tasks). What
stays are the pieces nobody has built. Each is additive: a new part, kind or optional prop. Each gets a
spec of its own before it is built.

## Decisions that still bind

| # | Question | Decision |
| --- | --- | --- |
| C5 | The navigator | Its own piece, with its own grilling: `.scratch/chart-navigator/spec.md`. |
| C6 | The set of chart kinds | Open, by the same test as before: a kind is added when it answers a question no kind there answers better, and each gets an ADR saying which question. |
| C7 | Which kinds | Horizontal bars first (a ranking with long names). Sankey with a case of its own (what flows where). A bullet graph, in core beside `Meter`. A treemap later. |
| C8 | Foreign renderers | Still none. Opening means the library builds more kinds, not that others build them in. |
| P1 | Saved views | A part that lists named views, changes between them and offers "save this view"; where they are kept is the application's, through callbacks (ADR-0047). |
| P2 | Utilisation | A line under the plan on the same time axis, drawn from the occupancy the schedule already computes (ADR-0026). |
| P5 | Timeline | A vertical list of events with their instant, text and state, in core, not a chart. Its spec says how it differs from `AlarmList` and `Stepper`. |
| X5 | Form validation, a dashboard a user arranges | Never; both go where a reader looks for "not, or not yet?". |

## What is left, in this order

Line colour by limit (a limit's own `color` exists; whether more was meant is open) · horizontal bars ·
stacked overlap in the schedule · the navigator · the timeline · the utilisation line · saved views · and,
when their case is there, a Sankey and a bullet graph.

## What stays as it was decided

- **No foreign runtime dependency.** No package has one.
- **Components report, the application decides** (ADR-0023).
- **Pivot, cell ranges, undo, a Gantt engine** stay out (ADR-0032).
