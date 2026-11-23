# The schedule

Status: ready-for-agent
Release: 0.58.0 (the candidate)

Takes from the map `.scratch/release-1-0/map.md`:
[What of the schedule's surface changes before 1.0](../release-1-0/issues/19-what-of-the-schedules-surface-changes-before-1-0.md)
(findings `../release-1-0/research/07-the-surface-of-the-schedule.md`, by the letters in brackets),
[What of the charts' surface changes before 1.0](../release-1-0/issues/18-what-of-the-charts-surface-changes-before-1-0.md)
(E, the name by type) and
[Which keyboard items of the shakedowns still stand](../release-1-0/issues/21-which-keyboard-items-of-the-shakedowns-still-stand.md).
The mechanism of a rename is ADR-0066; what `1.0.0` promises is ADR-0083.

## Problem Statement

In the schedule `from` and `to` are instants in six types and subtask ids in a dependency. `label` on the
schedule is the function that labels a bar, beside `label` as a text on four parts. `ends` names the marks
at a dependency's ends. The resolved appearance uses other words than the appearances a caller gives. A
schedule requires `aria-label` even beside `aria-labelledby`. A keyboard user can move and stretch a
subtask but cannot change its lead-in or lead-out.

## Solution

A dependency names its `predecessor` and `successor`; the bar's label is `barLabel`; the marks are
`endMarks`; the resolved appearance has one word per appearance; a schedule takes either name; and a
lead-in and a lead-out can be changed by keyboard.

## User Stories

1. As a caller, I want `predecessor` and `successor` on a dependency, so that `from` and `to` are always instants.
2. As a caller, I want `barLabel` on the schedule, so that `label` is always a text.
3. As a caller, I want `endMarks`, so that the name says what is drawn.
4. As a caller, I want `{ provisional, fixed, muted, open }` in the resolved appearance.
5. As a caller, I want `aria-labelledby` alone to name a schedule.
6. As a keyboard user, I want to change a subtask's lead-in and lead-out, as a pointer can.
7. As a caller with stored dependencies, I want `from` and `to` to keep working for this minor.

## Implementation Decisions

- **A rename keeps its old name for this minor** (ADR-0066): the old prop, field, type or export is marked
  `@deprecated since 0.58 - use <new>.`, stands last, works exactly as before and warns once in development
  through core's `warnDeprecated*`; where both are given the new one wins. Every caller inside the
  workspace moves in the same ticket, by a script where one rule covers many files. What cannot keep an old
  form stands under "Changed" with its migration line.
- **`Dependency.from` / `to` become `predecessor` / `successor`** (A1), in the tooltip's dependency too. Data written with `from` / `to` is read for this minor and warns once; everywhere else `from` and `to` stay instants.
- **`ResolvedAppearance` is `{ provisional, fixed, muted, open }`** (A3), one word per member of `SubtaskAppearance`; the old members stay for this minor, deprecated.
- **`Schedule`'s `label` becomes `barLabel`** (A4); `ends` becomes `endMarks` (A5), still `"dot" | "none"`, on `Dependency` and on `Schedule`.
- **A name by type** (charts E): `Schedule` takes `aria-label` or `aria-labelledby`, one of the two; this loosens it.
- **Lead-in and lead-out by keyboard**: a chord on the active subtask reports the existing intents `leadIn` and `leadOut`, in the raster `snap` gives, refused and announced as the pointer's are. The chord follows the keys the schedule already has for moving and stretching (the worker proposes it in the report with the neighbouring chords; the keyboard section of the demo page and the keys' help list it). New wording keys carry the schedule's prefix. Nothing breaks.
- **Written down**: the rule "an id in data and reports, the record in what is handed to a render function or a hit" (A2), and that `snap`'s raster follows the zoom (B2).

## Testing Decisions

- A good test drives the public surface (the hook, the component, the pure function) and reads what a
  caller gets; it does not reach into a module.
- Each rename: a case at the existing unit test of its component or hook that the new name works, the old
  one works and warns once, and the new one wins. Each changed type: a line in the package's
  `*.test-d.tsx` for what compiles and what no longer does.
- `API.md` regenerated (`check:site`) shows the new names, the deprecated ones last, and what is
  experimental under its heading.
- An existing expectation changes only where this spec decides the behaviour changes; the worker lists each.
- The coordinator runs the package's visual suite; nothing a user sees may change unless a ticket says so.

## Out of Scope

- Controlling the subtask of the selection; new forms of `snap`.
- Removing any old name (that is `1.0.0`).
