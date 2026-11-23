# What of the table's surface changes before 1.0

Type:   grilling
Status: resolved
Blocked by: 01

## Question

"The surface of the table" returned seven groups of candidates whose change breaks a caller
(`.scratch/release-1-0/research/06-the-surface-of-the-table.md`, sections A to D). For each: before 1.0, or
frozen as it stands, and under which name or shape?

- A condition's three names (`t.filter`, `conditions`, `TableInput.filter`).
- Open and closed sets (`expanded`, `branches`, `folded`) and their bulk toggles.
- `stickyRowHeader` beside `pin`, and `RowActionsProps.pin` as a boolean.
- `GroupBy` against the glossary, and `density`'s values against core's.
- The hook's return: `Table<Z, S, Key>`, the 47 members, `asCsv`.
- `unknown` in the grid's reports.
- `SearchProps.onValueChange`, which `packages/table/demo/unshown.json` holds back "with the callers'
  migration" to the field contract's names: which name is frozen.
- The pure model: frozen, taken back, or marked by whatever "What 1.0 promises" allows for the unfinished.

Every one breaks a caller, so every one is the maintainer's. The answer is one line per group, shaped for
`/to-spec`. What is not a break (`API.md`'s gaps, the second `NumberFormat`) the agent decides.

## Answer

The maintainer answered nine questions (2026-11-23). Letters are the findings' sections in
`.scratch/release-1-0/research/06-the-surface-of-the-table.md`. All before 1.0; each rename keeps its old
name for one minor (ADR-0066), each break carries its migration line.

**Changes, each a break:**

- **Conditions** (A1): `t.filter` becomes `t.conditions`, as `TableView` and the request already say;
  the model's `TableInput.filter` becomes `preFilter`. `setFilter` and `conditionOf` stay.
- **Folding** (A3): the view's keys `expanded`, `branches`, `folded` stay - the view holds the deviation
  from the resting state, and stored views must go on reading. `foldAll` / `unfoldAll` become
  `foldAllGroups` / `unfoldAllGroups`, beside `foldAllBranches` / `unfoldAllBranches`.
- **Pinning** (A4, A5): `stickyRowHeader` goes; `pin="start"` on the column that names the row says it.
  `RowActions`' boolean `pin` becomes `pinned`. `stickyHeader` stays.
- **`GroupBy` becomes `GroupKey`** (A2), with `GroupKeyBase` and `GroupKeyComponent`, as the glossary says.
- **Generics** (B4): `Table<Z, S, Key>` becomes `Table<Z, Key, S>`, the server flag last and defaulted;
  `ActionProps` the same.
- **`asCsv` goes** (B2): `exportAs(csv)` is the one way. The other members of the return stay.
- **The grid's reports are typed** (C1): `CellEdit.value`, `RowSave.changes` and `RowAdd.values` carry
  `string | number | boolean | Date | null` in place of `unknown`.
- **The pure model is `@experimental` at 1.0** (D1): `tableModel` and the types beside it (ADR-0083).
  Before that *(agent)* `searchable`'s default in the model follows the column's, and `OwnAggregate` gives
  way to `AggregateFunction`. What it means for the alarms' surface is "What of the young packages'
  surface changes before 1.0".

**Frozen as it stands** (A7 to A10, B1): `defaultSort` / `defaultGrouping` / `defaultBranches` beside
`initialView`; `editOptions`; `onCellEdit`, `onRowSave`, `onRowAdd`, `onRowDelete`; `Action.onSelect`; the
three patterns of controlled state, written together on one page instead of unified.

**Density's word** (A6) follows "What of core's surface changes before 1.0".

*(agent)*, no break: `API.md`'s gaps close with the generator; the table uses core's `NumberFormat` if the
two are equal (C5); `RowKey` wherever `string | number` is spelled out (C2); `SearchProps.onValueChange`
stays, it is the field contract's name, and gets an example; `VerdictBase` picks its shared props from
`ColumnBase` (A13); the missing `@default` lines (E3).
