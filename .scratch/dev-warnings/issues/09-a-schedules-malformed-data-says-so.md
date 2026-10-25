# 09 - A schedule's malformed data says so

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

An application loads lanes and subtasks from two queries. One subtask names a lane that is not there, and
it vanishes without a word (`.scratch/shakedown/schedule.md` 1 and 2). In development the schedule now
says what is wrong with the data, naming the subtask and what to write. The decision comes from the Answer
of the map ticket "The table's and the schedule's single wishes": a DEV warning, never a finding kind. A
finding is a conflict of the plan (CONTEXT, **Overlap**), and these are errors of the data.

- **Schedule's `dev.ts`.** A copy of the table's: the DEV flag by core's rule, `warnOnce` per key, and the
  prefix `@umriss-ui/schedule:`. `.scratch/upgrade-promise/` (03) may create the same module for the
  handle bridge's warning. Whichever lands second adds its line to the module that is there.
- **What warns**, once per cause, keyed by the kind and the id:
  - a subtask whose `to` does not lie after its `from`, including NaN. The warning gives both ends and says
    that a point in time is a **Milestone** *(agent: a zero-length subtask warns too, since it is drawn as
    a hairline)*;
  - a subtask, milestone or blocked time on a lane no `Lane` declares. It names the item and the lane, and
    says to declare the lane;
  - a subtask whose task is not among its layer's `tasks`, which is drawn muted. It names the subtask and
    the task;
  - a dependency whose `from` or `to` names no subtask. It names the dependency and the missing id;
  - an id that stands twice among the subtasks, among the dependencies, or among the lanes. It names the
    id.
- **When.** The check runs where the scene derives its data for a draw, after the parts have registered.
  So a lane declared after its subtasks does not warn. While no lane is declared at all, the lanes are on
  their way, and nothing warns about lanes *(agent)*. An empty `tasks` stays silent too: a plan drawn
  muted on purpose.
- **What does not change.** What is drawn, dropped and counted stays as it is, in development and in
  production. `findings()` and the other pure functions stay silent *(agent)*: they are the application's
  own boundary, called where it checks its data anyway.
- **README.** One sentence under "The smallest schedule that runs", where the data is introduced: malformed data warns in development and is left out in
  production, and an application with imported data checks it where it imports it.

## Acceptance criteria

- [ ] Unit tests through `useSchedule` in jsdom spy on `console.warn`. Each cause above warns once and
      names its item.
- [ ] The same plan, re-rendered, does not warn again.
- [ ] A correct plan stays silent. So do a lane declared after its subtasks, a schedule with no lanes yet,
      and an empty `tasks`.
- [ ] Production is silent: the DEV flag reads `process.env.NODE_ENV` literally, as in the other packages.
- [ ] `pnpm check schedule` passes.
- [ ] The changelog notes the warnings under "Added".
