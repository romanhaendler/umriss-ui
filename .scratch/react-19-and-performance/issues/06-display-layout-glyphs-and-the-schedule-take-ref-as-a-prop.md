# 06 - Display, layout, the glyphs and the schedule take `ref` as a prop

Status: ready-for-agent
Type: task
Size: M

Blocked by: 03
Spec: `.scratch/react-19-and-performance/spec.md`, "The floor"; user stories 3, 4, 5

## What to build

The pattern of ticket 03, applied to what is left.

In core, thirty wrappers: `Alert`, `Badge`, `Card` with its header and body,
`Meter`, `Sparkline`, `Divider`, `EmptyState`, `Stack`, `Grid`, `ProgressBar`,
`Skeleton`, `Spinner`, `Stat`, `Tag`, `TagGroup`, `Text`, `Heading`, `Link`,
`VisuallyHidden`, and the nine glyphs.

In the schedule, two: the component `useSchedule` hands out, whose ref is a
`ScheduleHandle` and not an element. The handle keeps arriving through `ref`;
this ticket adds the type test for a handle.

Nothing but the wrapper and the type changes.

## Acceptance

- [ ] No `forwardRef` remains in the source of core or of the schedule.
- [ ] Each of core's thirty passes the pass-through guard at the root it had.
- [ ] `ref` is in each props table and in the `API.md` of both packages.
- [ ] The schedule's existing test that renders it with a ref passes
      unchanged; a type test for the handle.
- [ ] No screenshot moves.
- [ ] `pnpm check core`, `pnpm check schedule` and `pnpm check:site` pass.
