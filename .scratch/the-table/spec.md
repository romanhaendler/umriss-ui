# The table

Status: ready-for-agent
Release: 0.58.0 (the candidate)

Takes from the map `.scratch/release-1-0/map.md`:
[What of the table's surface changes before 1.0](../release-1-0/issues/15-what-of-the-tables-surface-changes-before-1-0.md)
(findings `../release-1-0/research/06-the-surface-of-the-table.md`, by the letters in brackets), and for the
alarms' part [What of the young packages' surface changes before 1.0](../release-1-0/issues/17-what-of-the-young-packages-surface-changes-before-1-0.md).
The mechanism of a rename is ADR-0066; what `1.0.0` promises is ADR-0083.

## Problem Statement

The table says "conditions" in its view and its request and "filter" in what the hook returns; it folds
"all" where there are groups and branches; it pins a row header through a prop of its own and a row's
actions through a boolean named like the columns' side; its grouping part is `GroupBy` where the glossary
says group key; `asCsv` stands beside `exportAs(csv)`; the type parameters put the server flag in the
middle; the grid reports `unknown`. The pure model is public and unfinished, and the alarms are built on it.

## Solution

The table's names agree with its view, its request and the glossary; the one way to export and the one way
to pin are left; the grid's reports are typed; the pure model, in the table and in the alarms, is marked
`@experimental` and so exempt from the promise of 1.0.

## User Stories

1. As a caller, I want `t.conditions` beside `TableView.conditions`, so that one word names one thing.
2. As a caller, I want `foldAllGroups` beside `foldAllBranches`, so that I know what folds.
3. As a caller, I want `pin="start"` on the column that names the row instead of a second prop, and `pinned` on `RowActions`.
4. As a caller, I want `GroupKey` as the glossary names it.
5. As a caller, I want `Table<Z, Key>` without naming the server flag.
6. As a caller, I want one way to export, `exportAs(csv)`.
7. As a caller, I want a cell's edit typed as the values a cell can hold.
8. As a caller, I want my old names to work for this minor with a warning that names the new one.
9. As a caller of the pure model or of `alarmModel`, I want to see that it may still change in a minor.

## Implementation Decisions

- **A rename keeps its old name for this minor** (ADR-0066): the old prop, field, type or export is marked
  `@deprecated since 0.58 - use <new>.`, stands last, works exactly as before and warns once in development
  through core's `warnDeprecated*`; where both are given the new one wins. Every caller inside the
  workspace moves in the same ticket, by a script where one rule covers many files. What cannot keep an old
  form stands under "Changed" with its migration line.
- **Conditions** (A1): `t.filter` becomes `t.conditions`; the model's `TableInput.filter` becomes `preFilter`. `setFilter` and `conditionOf` stay.
- **Folding** (A3): `foldAll` / `unfoldAll` become `foldAllGroups` / `unfoldAllGroups`. The view's keys `expanded`, `branches`, `folded` stay: stored views go on reading.
- **Pinning** (A4, A5): `stickyRowHeader` is deprecated; `pin="start"` on the row-header column says it, and for this minor the old prop does the same. `RowActions`' boolean `pin` becomes `pinned`. `stickyHeader` stays.
- **`GroupBy` becomes `GroupKey`** (A2), with `GroupKeyBase` and `GroupKeyComponent`; the hook hands out both names for this minor.
- **`asCsv` is deprecated** (B2): `exportAs(csv)` is the one way; `asCsv` works for this minor and warns.
- **Generics** (B4): `Table<Z, S, Key>` becomes `Table<Z, Key, S>`, the server flag last and defaulted; `ActionProps` the same. No old form: "Changed".
- **The grid's reports are typed** (C1): `CellEdit.value`, `RowSave.changes` and `RowAdd.values` carry `string | number | boolean | Date | null` in place of `unknown`. A narrowing for whoever assigned from them: "Changed".
- **The pure model** (D1): first `searchable`'s default in the model follows the column's, and `OwnAggregate` gives way to `AggregateFunction` (the worker reports whether either changes what a caller of the model gets, and stops if it breaks one outside the model). Then `tableModel` and the types beside it are marked `@experimental`; in the alarms `alarmModel`, `AlarmProjection`, `alarmColumns`, `ALARM_COLUMNS` and `DEFAULT_ORDER`.
- **Frozen as it stands** and written on one page of the demo or README: the three patterns of controlled state (A7 to A10, B1).

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

- Unifying the three patterns of controlled state.
- The alarms' `ages` and `asOf` (the young packages' spec).
- Removing any old name (that is `1.0.0`).
