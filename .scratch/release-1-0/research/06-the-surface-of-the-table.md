# 06 - The surface of `@umriss-ui/table`

Research for ticket 06. Candidates only, no decision. Paths are relative to `packages/table/src/` unless stated.
"Breaks" = the fix changes what a caller writes or types (goes to the maintainer). "Costs a major later" = yes if
the shape is frozen at 1.0 and changed afterwards. Sizes S/M/L.

## Read

`API.md` (all), `index.ts`, `types.ts` (all), `rowlessParts.tsx` (props and the parts' heads), `columnGroup.tsx`,
`column.ts`, `toolbarSize.ts`, `model/view.ts`, `model/useTableSelection.ts`, `model/pinning.ts` (head),
`model/tableModel.ts` (types, `tableModel` signature), `model/grouping.ts` (head), `useTable.tsx` (signatures),
`package.json` exports, CHANGELOG (grep for deprecations), `CONTEXT.md` (the table terms: Column, Group key,
Pinned column, Current row, Row draft, All that match, Exceptions, View), core `API.md` (names to compare against).

## Not read

`VerdictColumn.tsx` body, `registry*.ts`, `frame*.ts`, `grid*.ts`, `row*.tsx`, CSS, `export.ts`/`xlsx` source,
`columnFilter.tsx`/`rowFilter.ts` bodies (only their exported names), the demo examples (only listed), tests,
`docs/capabilities.md`, the wording keys the table adds in core, `Table` component props beyond `types.ts`.
Whether a prop's behaviour matches its doc sentence was therefore **not** checked at runtime; the "doc vs
behaviour" findings below are doc-against-type only.

## Already clean

- No deprecated alias is alive in `src`: `ariaLabel`, `footer`, `filter`-as-pre-filter and `FooterFor` were removed
  (CHANGELOG 0.44 and earlier). `grep -i deprecat src` finds nothing live.
- `Column` is deliberately not exported unbound (ADR-0017); the typed-parts-from-hook design is the product.

## Findings

### A. Names

**A1. One thing, three names: a filter's condition.** `TableSnapshot.filter` (`types.ts:903`, "conditions ... by id"),
`TableView.conditions` (`model/view.ts:~22`), `TableRequest.conditions`, `setFilter` / `conditionOf` /
`TableInput.filter` (a *function* at `model/tableModel.ts:67`, unrelated to the record). `t.filter` is a record of
conditions; `TableInput.filter` is a predicate; `TableOptions.preFilter` is a predicate; `CONTEXT.md` calls the
record "conditions". A reader cannot tell `filter` the record from `filter` the column prop (`"list"|"range"|...`,
`types.ts:279`). Later rename costs a major. Smallest change: `t.filter` -> `t.conditions` (matches view and
request), `TableInput.filter` -> `preFilter`/`where`. **Breaks.** S (rename) to M (migration line, demos, alarms).

**A2. `GroupBy` / `GroupByBase` / `GroupByComponent` vs the term Group key.** `CONTEXT.md:969` names the concept
**Group key** and lists "group by" under _Avoid_; the component, its base props and its component type all say
GroupBy (`types.ts:373-380`, `Table.GroupBy`). Costs a major later. Smallest change: `GroupKey`, `GroupKeyBase`,
`GroupKeyComponent`; or change the glossary. **Breaks** (rename route) or S (glossary route). Maintainer picks.

**A3. Open/closed sets with three names and two polarities.** `expanded` (open detail rows, `toggleRow`),
`branches` (open tree branches, `toggleBranch`, `unfoldAllBranches`/`foldAllBranches`), `folded` (closed groups,
`toggleFold`, `foldAll`/`unfoldAll`). Two lists hold what is open, one what is closed; `TableView.branches` keys are
`(string|number)[]` (`view.ts:~34`) not `RowKey`; "fold" is used for groups and for branches (`foldAllBranches`).
Costs a major later (view shape is kept by applications). Smallest change: name by polarity, e.g. `openRows`,
`openBranches`, `foldedGroups`, with `toggle*` following. **Breaks** (and the stored `TableView` shape). M.

**A4. `stickyHeader` / `stickyRowHeader` vs pinning.** `TableProps.stickyRowHeader` is documented as "the same as
`pin="start"` on the row header" (`types.ts:529`) - two ways to say one thing; `CONTEXT.md:943` lists "sticky" under
_Avoid_ for pinned columns. `stickyHeader` (header row staying while the body scrolls vertically) is a different
thing, so the word `sticky` is also overloaded. Costs a major later. Smallest change: drop `stickyRowHeader`
(use `pin="start"` on the row-header column), keep `stickyHeader`. **Breaks.** S.

**A5. `pin` means two types.** `ColumnBase.pin?: "start" | "end"` (`types.ts:233`) vs `RowActionsProps.pin?: boolean`
(`types.ts:470`, default true), and `setPin(column, Pin | null)`. Same word, different value space. Smallest change:
`RowActions pin?: Pin | false` or rename to `sticky`/`pinned`. **Breaks.** S.

**A6. `density` values differ from core's.** Table: `"regular" | "compact"` (`types.ts:536`, default from provider
else `"regular"`); core `Density = "comfortable" | "compact"` (`packages/core/src/lib/provider/index.tsx:26`) with
the doc line "comfortable means regular" (core `API.md` `UmrissProvider.density`). `calculation` also uses
`"regular"`. Same prop name, a translation table between two spellings of the same value. Costs a major later in
whichever package is changed. Smallest change: pick `"comfortable"` or `"regular"` once, in core and all consumers.
**Breaks.** S inside table, M across packages. Needs the core/other-package reviews.

**A7. `defaultSort`, `defaultGrouping`, `defaultBranches` vs `initialView` and core's `defaultValue`.** In core,
`defaultValue` means "uncontrolled start value" (every control). In the table `default*` means "the application's
default that `view` leaves out" (`types.ts:651-656`), and `initialView` is the start value. A caller coming from core
reads `defaultSort` as an initial sort that the user may leave; here it is the baseline `t.view` omits. Doc is right,
the names mislead. Costs a major later. Smallest change: keep and state it in the guide, or rename
`baseSort`/`baseGrouping`/`baseBranches`. **Breaks** if renamed. S.

**A8. `editOptions` / `EditOptions` stutter, and `options` elsewhere.** `EditOptions<W,Z>` is the type of the props
`edit`, `editOptions`, `validate` (`types.ts:153`), and the member `editOptions` is the list for `edit="select"`
(`types.ts:160`); core's `Select`, `Combobox`, `Radio` call it `options`. Costs a major later. Smallest change:
`editOptions` -> `options` on the column is ambiguous with filter options; maybe `editChoices` or keep. **Breaks**
if renamed. S. Weak candidate; listed for the decision.

**A9. Callback names: four verbs for "the user did X".** `onCellEdit(edit)`, `onRowSave(save)`, `onRowAdd(add)`,
`onRowDelete(remove)` (`types.ts:570-588`) - the parameter names are `edit`, `save`, `add`, `remove` and the types
`CellEdit`, `RowSave`, `RowAdd`, `RowDelete`; `onCurrentRowChange(key,row)`, `onSelectionChange(keys, all)`,
`onViewChange(view)`, `onRequest(request)`, `onBranchOpen(key,row)`, `onExport(content)`. Core's convention is
`on<Thing>Change(value)`. The row-write family is by noun, not by `onRow<Verb>`; `RowAdd` and `RowDelete` carry no
`Key`/`Z` generics symmetrically (`RowAdd` has none, `RowDelete` has both). Smallest change: leave and document, or
align to `onCellEdit/onRowEdit(save)/onRowAdd/onRowDelete`. **Breaks** if renamed. S.

**A10. `Action.onSelect` collides with selection.** `ActionProps.onSelect` (`types.ts:490,499`) is "the action was
triggered"; the table also has `selection`, `onSelectionChange`, `selectable`, `selectMatching`. Core's `MenuItem`
and `BreadcrumbEntry` use `onSelect` too (core `API.md:779`), so it is consistent with core and inconsistent inside
the table. Weak. Leave and note. S.

**A11. `except` vs the glossary's Exceptions; `AllMatching.except` and `TableSelection.except`.** `CONTEXT.md:931`
names **Exceptions** ("_Avoid_: exclusions"); the property is `except`. Fine as a property name; listed for
completeness only. Not a break risk worth taking. S.

**A12. `Pagination` has no `size`.** Search, ColumnMenu, Export and Toolbar take `size?: ToolbarSize`
(`rowlessParts.tsx`); `Pagination` does not (`PaginationProps` = div attributes + `pageSizes` + `className` + `of`).
Not breaking to add later. S, optional.

**A13. `ColumnBase` vs `VerdictBase` copy the same ten props** (`label`, `align`, `width`, `flex`, `minWidth`,
`resizable`, `pin`, `aggregate`, `aggregateLabel`, `format`) with separate doc text (`types.ts:199-243` vs
`406-443`); `VerdictBase` lacks `sortable`, `searchable`, `groupable`, `rowHeader`, `numeric`, `valuePaths` and
types `filter?: never`. Drift risk, not a break. S: `VerdictBase extends Pick<ColumnBase, ...>`. The `Computed`
type also repeats `aggregateLabel` (`types.ts:297`), which `AggregateOptions` already holds.

### B. Shapes

**B1. Controlled/uncontrolled pairs do not follow core's pattern.** Core: `value` + `defaultValue` +
`onValueChange`. Table: view = `initialView` (read once) + `onViewChange` (whole view) + `setView`; selection =
`selection` (a *hook object*, `TableSelection`) + `onSelectionChange`; current row = `currentRow` + `onCurrentRowChange`
(controlled only, no default); page/sort/search have no controlled form at all (`t.setPage`, `t.setSearch`). Each is
defensible (ADR-0047 on views), but three different patterns sit in one hook. Costs a major later to unify. Smallest
change: document the three on one page, and decide whether `view` gets a controlled `view` option. Unifying
**breaks**. L; documenting S.

**B2. `useTable` return is a 47-member bag with three overlapping types.** `Table<Z,S,Key>` extends
`TableSnapshot` (`types.ts:979`); `TableRef` is `TableSnapshot` minus two members plus `Table: unknown`
(`types.ts:971`). `API.md` lists them as three types with the same field list. Every member is now semver. Candidates
to trim before freezing: `autoSizeColumns`, `foldAll`/`unfoldAll`/`foldAllBranches`/`unfoldAllBranches` (four
bulk toggles), `framed`, `virtual`, `server`, `request`, `asCsv` (= `exportAs(csv)`, says so at `types.ts:948`),
`selectionAsText`. Adding later is free; removing costs a major. Smallest change: remove `asCsv` or keep as the one
documented shortcut; decide on the rest. **Breaks** if removed. M.

**B3. Same name, different type on `useTable` option vs return.** `TableOptions.virtual: boolean | {overscan}`
(`types.ts:682`) vs `Table.virtual: boolean` (`types.ts:955`); `TableOptions.pageSize` (the rows per page option) vs
`Table.pageSize` (rows per page *now*, may be the fitted count); `setPageSize(number | "fit")` vs
`TableView.pageSize?: number`. Not wrong, but the doc sentences carry the difference. S (docs) / **breaks** if renamed.

**B4. Generic parameter order is not uniform.** `Table<Z, S, Key>` and `ActionProps<Z, S, Key>`; `TableProps<Z, Key>`,
`TableOptions<Z, Key>`, `TableSnapshot<Z, Key>`, `CellEdit<Z, Key>`. `S` (server flag) leaks into every type that
names a table. Costs a major later (callers write `Table<Row, true, number>`). Smallest change: put `Key` second
everywhere and make `S` last/optional, or hide `S` behind two named types (`AutomaticTable`, `ServerTable`).
**Breaks** (type-level). M.

**B5. Boolean here, union there.** `TableProps.editMode: "cell" | "row"` but `grid: boolean` with
`selectable`, `striped`, `loading`, `stickyHeader` booleans; `groupable: false` at table level vs a boolean column
`groupable` default by type; `Search.grow: boolean`, `Toolbar.size`. The two that look like modes -
`grid` + `editMode` - could be `mode: "table" | "grid" | "grid-row-edit"`; no break today, an extension later could
break. Smallest change: none now; note that `editMode` only has meaning with `grid`. S.

**B6. Server mode as a discriminated union via `?: never` members.** `AutomaticMode` lists nine `?: never`
members (`types.ts:715-723`) so that each option errors in the other mode; `server?: false` is optional on one side
and `server: true` required on the other. Works, error messages are poor, and adding an option later needs both
sides edited. Not a break. M to replace; probably leave.

**B7. `TableRequest` is required-all while `TableView` is optional-all; `TableRequest.grouping`/`folded` required but
`requestKey` still guards `grouping ?? []`** (`model/view.ts`, `requestKey`). Harmless, a leftover defensive default.
S.

### C. Loose typing

**C1. `unknown` where the column's value type is known to the library.**
- `CellEdit.value: unknown` (`types.ts:174`), `RowSave.changes: Record<string, unknown>` (`:182`),
  `RowAdd.values: Record<string, unknown>` (`:188`): the doc spells the type per `edit` kind ("text for text, a
  number or null ...") - a union by column kind that is not in the type. At 1.0 every caller writes a cast or a
  guard. Narrowing later **breaks** a caller's code that assumed `unknown`. Smallest change: `value: string | number |
  boolean | Date | null` (the five editors' results), or `CellEdit<Z, K>` discriminated by column. S (union) / L
  (per-column).
- `TableView.conditions` and `t.filter: Record<string, unknown>` (`types.ts:903`, `view.ts`): a condition is
  `ListCondition | RangeCondition | TextCondition | custom`. A union of the three built-ins plus `unknown` gains
  nothing; the honest fix is documenting that it is JSON. S (docs).
- `ServerGroup.path: readonly unknown[]` and `totals?: Record<string, unknown>`, `TableOptions.totals`, `filterOptions`
  returns `readonly unknown[]` (`types.ts:732-737, 789, 807`). `Display` values are the column's types, which the hook
  does not see (ADR-0017). Accept; document. S.
- `GroupLevel.value`/`order` return `unknown`; `AggregateColumn.read`, `OwnAggregate` args `unknown`
  (`model/grouping.ts:25-38`) - these are the pure-model types, see D1.
- `rowFilters?: readonly RowFilter<Z, any>[]` and `FilterFor ... ColumnFilter<..., any>` with eslint disables
  (`types.ts:86, 669`): an `any` in the surface. Inference cannot do better without existential types; accept, or
  `unknown` with a variance cast. S, not breaking.

**C2. `TableSelection<T extends string | number>` but `RowKey = string | number`.** Same set spelled twice
(`model/useTableSelection.ts`, `types.ts:26`); `TableView.branches` is also `(string|number)[]`. S: use `RowKey`
everywhere. Not breaking.

**C3. `string` where the caller could be checked.** `ColumnBase.label: string` is fine. `TableRequest.folded`,
`toggleFold(path: string)`: a group path as a string made by `groupPath(...)` - the string is opaque by design.
`setOrder(order: readonly string[])`, `toggleColumn(column: string)`, `toggleSort(column: string)`, `setPin(column: string)`,
`setWidth(column: string)`, `focusCell(key, column: string)`: column ids are untyped because columns live in JSX
(ADR-0017). `GroupingId<Z> = Field<Z> | (string & {})` suggests but does not check. Accept as the cost of the design;
state it once. S (docs).

**C4. `ValuePaths` result types disagree.** `sortValue`/`exportValue` return `string | number | Absent` but
`groupValue` returns `string | number | boolean | Date | Absent` (`types.ts:249-254`); `ModelColumn.value` returns
`string | number | null | undefined` (no Date/boolean) though a date column sorts. Widening later is not a break,
narrowing is. S: widen `sortValue`/`exportValue` to `Date | boolean` or document why not.

**C5. `Field<Z> = Extract<keyof Z, string>` and `Computed`, `Line`, `Pin`, `Present`, `Absent`, `Displayable`,
`Presentation`, `Absent`** are exported with very general names from a package that also re-exports types of core's
neighbourhood. Core exports its own `NumberFormat` (core `API.md:227`) and the table exports a type `NumberFormat`
with "the same shape as core's" (`types.ts:19-21`): two types, one name, structurally equal, drift risk. Costs a
major later to rename or remove. Smallest change: re-export core's `NumberFormat` (or add `"percent"|"count"` to core
and alias). **Breaks** only if the shapes differ; if identical, a type alias swap is not a break. S.

### D. What is exported and what nothing documents or uses

**D1. The pure-model surface is public and large.** `tableModel` + `TableProjection`, `TableInput`, `ModelColumn`,
`TreeInput`, `AggregateColumn`, `AggregateKind`, `OwnAggregate`, `GroupLevel`, `RowGroup`, `Line`, `DatePeriod`
(`index.ts:83-98`). Only `@umriss-ui/alarms` uses it (`packages/alarms/src/alarmModel.ts:24-25`, ADR-0078) and two
demo examples (`demo/examples/Aggregate/07,10`). `OwnAggregate<Z>` (`values: unknown[]`) duplicates `AggregateFunction<W,Z>`
(typed) for the same idea. `ModelColumn.searchable` defaults to `false` where `ColumnBase.searchable` defaults to
`true` for text; `ModelColumn.resizable` and `hideable` have no `ColumnBase` counterpart (`hideable` is absent from
`ColumnBase`; the row header is "never hideable"). Freezing means the alarms package and any caller can rely on every
field. Smallest change: decide whether `tableModel` is "public, frozen" or "exported for alarms, `@internal`";
if public, fix the defaults' disagreement. Removing later **breaks** `alarms`. M (decision + doc), S per default.

**D2. `API.md` is missing public surface.** (a) `exportAs` is not in the `Table` returns list (it is a *method
signature*, `types.ts:950`, so the generator skips it); `asCsv` is listed. (b) The `Table` component's props
(`TableProps`, ~20 props), `Column`/`VerdictColumn`/`Action`/`RowDetail`/`RowActions`/`GroupBy` props and the whole
server-mode option set (`server`, `rowCount`, `onRequest`, `answers`, `error`, `totals`, `groups`, `matchCount`,
`filterOptions`, `exportRows`) and tree options (`childRows`, `onBranchOpen`, `defaultBranches`) are not in the
`useTable` options table at all (only the common branch is) - the file says "every export, props, options and
returns" (`CLAUDE.md`). `Table` is also not under "Components". A reader following the rule "read API.md before claiming
absence" would conclude server mode and grid editing do not exist. Not a break; a gate gap. M (generator).

**D3. `TableSnapshot` and `TableRef` exported next to `Table`**: `TableSnapshot` is "what everything outside the
columns reads" and is what `of` is resolved against; callers name `TableRef` for a wrapper. Whether `TableSnapshot`
should be public at all is open (no part takes it). S to un-export; **breaks** only an importer.

**D4. Exports nothing in the repo imports** (by grep over the packages' sources and demo; not exhaustive): `Line`,
`RowGroup`, `GroupLevel`, `AggregateColumn`, `ModelColumn` beyond alarms, `IsDisplayable`, `NumberField`, `Computed`,
`ColumnPreset`'s second param, `GroupFor`, `FormatFor`, `FilterFor`, `AggregateFor`, `EditFor` - they exist "so that
a props table's names can be imported" (`index.ts:65-90`). That is a deliberate rule (ADR-0044), but it makes every
helper conditional type semver. Smallest change: keep, and state in the 1.0 ADR that helper types are covered only
as far as their instantiations are. S (policy).

**D5. Tiny things.** `csv` is a lowercase constant with a very general name next to `xlsx` in the subpath
(`@umriss-ui/table/xlsx`); `column()` the preset helper and `ModelColumn`'s internal `column()` helper
(`model/tableModel.ts:53`, not exported) share a name; `useTableSelection` takes the ids and is the only hook besides
`useTable`. S, leave.

### E. Defaults that surprise, doc vs type

**E1. `Toolbar.size` defaults to `"sm"` but `Search`, `ColumnMenu`, `Export` default to *the toolbar's* size**
(`types`/`rowlessParts.tsx:Toolbar({ size = "sm" })`). Documented, consistent, but means a `ToolbarProps.size` default
cannot be "inherited". Fine. S/none.

**E2. `ColumnBase.numeric` and `align`.** `numeric` "right-aligned with tabular figures, default decided by the first
value present" (`types.ts:208-210`); `align` default is `"end"` for a numeric column. A default that depends on the
first row's value changes when the rows change (empty -> filled, loading -> loaded). A column with a null first value
and number later may flip alignment. Candidate default surprise; fixing = default from the field type is not possible
(types are erased), so: require `numeric` or document. Behaviour not read. Costs a major later only if the default
changes. S (docs) / M.

**E3. `resizable` is `false` by default on `Column` (no `@default` stated), `ModelColumn.resizable` states
`@default false`.** Add the `@default` line. S.

**E4. `pageSize` default 10 but in a framed table "the whole lines the frame leaves"** - the option is only the start
value (`types.ts:646-650`); the *effective* default depends on the parent. Documented in the sentence. S.

**E5. `preFilter` "may stand in the call; a change leaves the page standing"** vs `initialView` "read once": two
options on one hook with opposite change semantics (live vs read-once) with no naming cue. Documented. S.

## Ranking for the decision tickets (would a later fix cost a major?)

Must decide before 1.0 (a fix breaks callers later): A1, A2, A3, A4, A5, A6, B1, B2, B4, C1 (`CellEdit.value`),
D1 (is `tableModel` public).
Free to fix after 1.0 (additive or doc): A12, A13, B7, C2, D2, D3 (adding), E3, E5.
Needs another review first: A6 (core, calculation), C5 (core's `NumberFormat`), D1 (alarms).
