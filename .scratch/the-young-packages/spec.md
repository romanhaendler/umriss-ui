# The young packages

Status: ready-for-agent
Release: 0.58.0 (the candidate)

Takes from the map `.scratch/release-1-0/map.md`:
[What of the young packages' surface changes before 1.0](../release-1-0/issues/17-what-of-the-young-packages-surface-changes-before-1-0.md)
(findings `../release-1-0/research/08-the-surface-of-the-three-young-packages.md`, by the letters in brackets).
The mechanism of a rename is ADR-0066; what `1.0.0` promises is ADR-0083.

## Problem Statement

The alarm list and banner take their freshness ages as `freshness` where core and the calculation say
`ages`; `asOf` is a `Date` here, a number there and `null` in places. The dashboard's hook returns
`catalogue()`, a function named like the prop `catalogue`. Nobody has said that a stored `DashboardView`
goes on reading.

## Solution

`ages` and one type for `asOf` in the alarms; `openCatalogue()` in the dashboard's return; and the
documents promise `DashboardView` as the storage format.

## User Stories

1. As a caller, I want `ages` on `AlarmList` and `AlarmBanner`, as on core's and the calculation's parts.
2. As a caller, I want to pass `asOf` as a `Date` or a number everywhere in the alarms.
3. As a caller, I want `openCatalogue()`, so that the function is not named like the prop.
4. As a caller who stores a dashboard's view, I want the promise that it reads after an upgrade.
5. As a caller, I want my old names to work for this minor with a warning that names the new one.

## Implementation Decisions

- **A rename keeps its old name for this minor** (ADR-0066): the old prop, field, type or export is marked
  `@deprecated since 0.58 - use <new>.`, stands last, works exactly as before and warns once in development
  through core's `warnDeprecated*`; where both are given the new one wins. Every caller inside the
  workspace moves in the same ticket, by a script where one rule covers many files. What cannot keep an old
  form stands under "Changed" with its migration line.
- **`freshness` becomes `ages`** on `AlarmList` and `AlarmBanner` (A1).
- **`asOf` takes `Date | number` everywhere**: `AlarmInput` is widened. `null` leaves the alarm components **unless it means something of its own there**: the worker first reads what `null` does today in each place and reports it; if it has a meaning of its own, nothing is changed for `null` and the question goes to the maintainer.
- **`catalogue()` in the hook's return becomes `openCatalogue()`** (D3); the prop `catalogue` stays.
- **`DashboardView` is the supported storage format** (D1): the dashboard's README and the type's doc say that an addition is a minor and that renaming or removing `widgets`, `type` or `size` is a major.
- **Frozen as it stands**: density's defaults (`"regular"` in the calculation, `"compact"` in `AlarmList`), "snooze" in code and "Shelve" on screen, `snooze`'s positional arguments, `hiddenOnly` controlled only, `WidgetType` exported directly and from the hook.

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

- Marking the alarms' model experimental (the table's spec).
- The calculation: nothing changes.
- Removing any old name (that is `1.0.0`).
