# The surface of the table

Type:   research
Status: resolved

## Question

Review the public surface of `@umriss-ui/table` for what should not be frozen as it stands.

Read `packages/table/API.md` first (every export, prop, option and return), then the source and the demo examples where a
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

Findings: `.scratch/release-1-0/research/06-the-surface-of-the-table.md`

## Answer

Findings: `.scratch/release-1-0/research/06-the-surface-of-the-table.md`. Types, the entry file and the model
types were read; no behaviour was run, and `registry`, `frame`, `grid`, `row`, the demos, tests and CSS were
not read. No deprecated alias is alive in `src`.

Candidates whose change breaks a caller (decided in "What of the table's surface changes before 1.0"):

- **A condition has three names**: `t.filter`, `TableView.conditions` / `TableRequest.conditions`, and
  `TableInput.filter`, which is a predicate.
- **Open and closed sets in two polarities**: `expanded` and `branches` list what is open, `folded` what is
  closed; the bulk toggles mix the verbs. All three are stored in `TableView`.
- **Pinning said twice**: `stickyRowHeader` beside `pin="start"`; `RowActionsProps.pin` is a boolean,
  `ColumnBase.pin` a union.
- **`GroupBy`** against the glossary's Group key, which lists "group by" under Avoid; the table's `density`
  is `"regular" | "compact"`, core's `"comfortable" | "compact"`.
- **`Table<Z, S, Key>`** carries the server flag through every table type; `useTable` returns 47 members
  listed by three overlapping types; `asCsv` duplicates `exportAs(csv)`.
- **`unknown` in the grid's reports** (`CellEdit.value`, `RowSave.changes`, `RowAdd.values`): narrowing
  later breaks a guard written against `unknown`.
- **The pure model is public** (`tableModel`, `ModelColumn`, `TableInput`, `TableProjection`, ...), used
  only by `@umriss-ui/alarms`: freeze it or take it back.

Not a break: `API.md` lists neither `exportAs` nor the props of `Table`, `Column` and `Action`, nor the
server-mode and tree options (checked: `exportAs` does not occur in the file), though it says it lists every
export; the table declares a `NumberFormat` of its own beside core's; three patterns of controlled state, none
of them core's `value` / `defaultValue` / `onValueChange`.
