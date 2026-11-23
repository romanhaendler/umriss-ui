# What of the schedule's surface changes before 1.0

Type:   grilling
Status: resolved

## Question

"The surface of the schedule" returned groups of candidates whose change breaks a caller
(`.scratch/release-1-0/research/07-the-surface-of-the-schedule.md`). For each: before 1.0, or frozen as it
stands, and under which name or shape?

- **`from` / `to`** as ids on a dependency, as times elsewhere, as objects in the tooltip: predecessor and
  successor, as the glossary says?
- **The rule for a field that names another record**: when it holds the id and when the object (`blocked`,
  `dependency`, `subtask`, `task`), and one name for overlaps and blocked time in findings and tooltip.
- **`ResolvedAppearance`'s members**: `dashed` and `hatched`, or what they mean.
- **`label`**: `barLabel` on `Schedule`, and `label` or `name` on the records.
- **A dependency's presentation**: `route`, `attach`, `ends`, and `ends` as a string.
- **A lead-in or lead-out by keyboard**: the one keyboard item of the shakedowns that stands and was never
  declined ("Which keyboard items of the shakedowns still stand"). A new chord and a new kind of intent,
  which breaks an exhaustive `switch` on the intent's `kind`: before 1.0, or declined.
- **Selection**: controlled whole (task and subtask, with a default), or as it stands; in `ScheduleView` or
  not.

Every one breaks a caller, so every one is the maintainer's. The answer is one line per group, shaped for
`/to-spec`. What is not a break (the component props missing from `API.md`, stale doc sentences, the second
`ZoomLimits`) the agent decides. Decided already in "What of the charts' surface changes before 1.0":
`Schedule` takes `aria-label` or `aria-labelledby`, one of the two.

## Answer

The maintainer answered seven questions (2026-11-23). Letters are the findings' sections in
`.scratch/release-1-0/research/07-the-surface-of-the-schedule.md`. All before 1.0; each rename keeps its old
name for one minor (ADR-0066), each break carries its migration line.

**Changes, each a break:**

- **`Dependency.from` / `to` become `predecessor` / `successor`** (A1), in the tooltip's dependency too.
  Everywhere else `from` and `to` stay instants.
- **`ResolvedAppearance` is `{ provisional, fixed, muted, open }`** (A3), one word per member of
  `SubtaskAppearance`.
- **`Schedule`'s `label` becomes `barLabel`** (A4). `label` on `Lane`, `LaneGroup`, `Milestone` and
  `BlockedTime` and `name` on `Task` and `Subtask` stay: a task has a name, what is drawn has a label.
- **`ends` becomes `endMarks`** (A5), still `"dot" | "none"`, on `Dependency` and on `Schedule`. `route` and
  `attach` stay.

**An addition, no break:**

- **A lead-in and a lead-out can be changed by keyboard.** The intent kinds `leadIn` and `leadOut` exist
  already (`packages/schedule/src/model.ts:186,195`); only the chord is missing. The claim in "Which
  keyboard items of the shakedowns still stand" that it needs a new kind was wrong.

**Frozen as it stands:**

- **An id here, the record there** (A2), written down as the rule: in data and reports (records, findings,
  intents) a reference is an id; in what the schedule hands a render function or a hit (the tooltip's
  target, `ScheduleHit`) it is the record.
- **The rest** (A6, B1, B2, B4, B5): only the task of the selection is controlled, and
  `onSelectedTaskChange(task, subtask)` reports the subtask too; `snap`'s four forms and its default
  `"ticks"`, with the sentence that its raster follows the zoom; the tooltip as a prop; `onInteraction`
  holding back the browser's menu; `lag` required.

*(agent)*, no break: the props of `Schedule`, `Lane` and the other parts and the members of the unions in
`API.md`, with the generator; the doc sentences on `children` and the tooltip's kinds (D1, D2); the schedule
re-exports charts' `ZoomLimits` (C1); a named type for a bar's three parts (B6); where `CalendarInput` comes
from (C2).
