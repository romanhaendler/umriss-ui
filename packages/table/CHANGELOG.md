# Changes to `@umriss-ui/table`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository stands in its journal
(`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers** follow the rule of `@umriss-ui/core` and `@umriss-ui/charts`: the
middle digit rises when something is added, the last one when something is
repaired, and **whatever changes existing behaviour stands under a heading
"Changed" of its own**, no matter which digit rose.

**Names read forwards.** Where an entry describes a name that has since been
renamed, it is named here as it is called today; names that were removed stand
as they stood.

**Release candidates.** `0.2.0-rc.0` is the first version for the registry, under
the tag `next` rather than `latest`: `pnpm add @umriss-ui/table@next @umriss-ui/core`.
`0.1.0` was never published. Where an entry below names a `@umriss-ui/core`
version, it is one of the internal numbers from before core's first publication
as `0.1.0` (see core's changelog).

---

## 0.2.0-rc.0 – Styles that load themselves, and touch nothing else

Delivery report for `.scratch/styles-without-side-effects/spec.md`, the table's
share (ADR-0021).

### Changed

- **No stylesheet imports any more.** `dist/table.js` imports its own
  stylesheet, and `@umriss-ui/core` imports core's. `@umriss-ui/table/styles.css`
  stays exported and is optional.
- **Cascade layers, own elements only.** The table's rules lie in
  `umriss.base` and `umriss.components` and select only its own elements. The
  frame, toolbar, pagination and alarm list carry their text context; sort
  button, filter button and focusable header cell carry the focus ring; the
  scroll containers their scrollbars.
- **Light and dark follow the application's `color-scheme`**, through core's
  tokens.

---

## 0.2.0-rc.0 – One language, one scope

Delivery report for `.scratch/english-and-umriss-ui/spec.md`, the table's share.

- **The package is called `@umriss-ui/table`**, and it takes
  **`@umriss-ui/core`** as its peer — the package that was `@umriss/ui` and now
  lies at `packages/core`. The npm scope moved from `@umriss/*` to
  `@umriss-ui/*`, the org actually secured for this library. Nothing was ever
  published under the old names — all three returned 404 from the registry — so
  there is no alias and no deprecation window, and the version number stays where
  it is. An import line changes from `@umriss/table` to `@umriss-ui/table` and
  from `@umriss/ui` to `@umriss-ui/core`; nothing else about the call changes.
- **Every identifier and every document is English** (ADR-0018, which supersedes
  ADR-0015). The hook is `useTable`, the model `tableModel`, the companion
  `useCompanion`, the alarm model `alarmModel`; `src/kern/` is `src/model/` —
  not `core/`, which would name both the package and this layer, one grep with
  two answers. The long prose headers that carry the design reasoning were
  translated, not shortened.
- **The library ships two wordings, English by default** (ADR-0019). The table
  reads its texts out of the wording of `@umriss-ui/core`, as it always did, so
  its labels are now English by default: the column menu, the search, the export,
  the row actions, the empty state, the conditions in the table toolbar and the
  ratio "43 of 1.204". The German that used to be the default is unchanged and
  ships as the subpath `@umriss-ui/core/wording/de`; one `UmrissProvider` with
  it switches both packages back at once.
- **The formats are still `de-DE`**, so the default renders English words around
  German digits — "43 of 1.204", a date as "17.03.2026". A locale is not a
  language, and changing it is its own decision with its own pass over the
  baselines; ADR-0019 records this rather than hiding it. An application that
  wants otherwise passes `formats` to the `UmrissProvider`, and the table's tests
  prove the cells use it rather than formatters of their own.
- The licence is MIT, and a `LICENSE` file ships in the package.

---

### Changed — the values, not only the names

- **The alarm lifecycle.** `LifecycleState` is `"standing-unacknowledged"`,
  `"standing-acknowledged"`, `"cleared-unacknowledged"`,
  `"cleared-acknowledged"`; `Transition` is `"raised"`, `"acknowledged"`,
  `"cleared"`; `Priority` is `"high"`, `"medium"`, `"low"`. In the DOM,
  `data-zustand` is `data-lifecycle` and `data-prioritaet` is `data-priority`.
- **The limit model's wire format** follows `@umriss-ui/core` and
  `@umriss-ui/charts`: `data-urteil` is `data-verdict`, and `VerdictColumn`
  reads `assessment.verdict` and `assessment.excess`.
- **Freshness** is `"fresh" | "stale" | "lost"`, and the `freshness` prop of
  `AlarmList` takes `{ stale, lost }` instead of `{ alt, abgerissen }`.
  `data-aktualitaet` is `data-freshness`.
- **The `virtual` prop is `{ rowHeight, overscan }`**, not
  `{ zeilenHoehe, puffer }`.

### Fixed

- **Virtualisation never measured a real row.** `useVirtual` in
  `@umriss-ui/core` looked for `[data-zeile]`, which the table does not write —
  its rows carry `data-row`. The measured row height therefore stayed at the
  `rowHeight` passed as a starting point, and the filler rows that hold the
  scrollbar at the right length were sized against it. Two visual tests had been
  failing on this.

## 0.2.0-rc.0 – Column filters that do not shift the table

Delivery report for `.scratch/table-filters/spec.md`.

### Added

- **`columnFilter({ matches, Input, describe })`**: a filter an application
  writes itself — its check, its panel, the text of its condition. It is bound to
  a value type, not to a row kind; the compiler accepts it at a column only if
  that column's value fits. The table shows it, counts it and resets it like any
  other. `matches` is never called for an absent value, and an absent value
  satisfies no condition of its own. The list filter is built with the same
  interface.
- **`filter="range"`**: two bounds on a column, both inclusive, each may stay
  open. Over a number two number fields that take effect while typing — if "from"
  lies behind "to" they are invalid and the condition stays the last valid one —
  and over an instant the range picker. The bounds of an instant are calendar days
  in local time: "to 30.09." includes the whole of 30.09. An absent value never
  fits. The compiler allows `"range"` only on numbers and instants.
- **`t.filter` and `t.setFilter(column, condition | null)`**: read and set
  conditions from outside, for instance out of a tile "3 blocked". Typing happens
  at the field of the row — a list of its values, and for numbers and instants a
  range as well; an id that is no field name takes any condition. A condition
  that does not fit the kind of the filter is passed over with a warning in
  development. A change resets to page one.
- **`conditions` in the view**: `initialView` sets them for the first render,
  without the unfiltered table flashing up; `t.view` reads them back. A condition
  for an unknown column falls out.

### Changed

- **`filterWerte` and `setFilterWerte` are `t.filter` and `t.setFilter`.** The
  condition of a list filter is the chosen values themselves, an absent one as
  `null` — no longer the keys `"wert:…"`.
- **Conditions stand in the table toolbar**, no longer in a row of their own
  between the toolbar and the header. On the left, behind whatever is placed in
  it, stands one tag per condition — a click opens the panel of its filter, the
  cross lifts it — and on the right the ratio "43 of 1.204" in a status a screen
  reader announces, and "Reset". A table with a search or a column filter has a
  table toolbar even where none is placed: it then carries only the conditions,
  the ratio and "Reset"; the number of the selection and its bulk actions belong
  to a toolbar somebody put there. A `Toolbar` standing behind the table with `of`
  registers only after the first frame (`ToolbarProps`).
- **The search no longer appears as a condition.** It still counts, and "Reset"
  empties it.
- **`filter="list"` only on values with a text form.** On an array or an object
  the compiler rejects it; at runtime no filter appeared there even before.
- **The application's filter is called `preFilter`** and is what its name says:
  it determines which rows the table has at all. It never appears as a condition,
  "Reset" leaves it standing, and it never belongs to the view. The ratio "43 of
  1.204" counts only the rows it admits, the list filter offers only their
  values, and a table it leaves empty shows `empty` instead of "Nothing matches
  the search and filters". `filter` remains as the deprecated name for one minor
  version.
- **A change of the pre-filter no longer resets the page.** The page stays
  standing and is clamped to those that exist. Whoever wants to start at page one
  after a change calls `t.setPage(1)`. A pre-filter determines the rows of the
  table; whoever reset on every change of the admitted rows reset on every data
  refresh.

### Fixed

- **The table moved down on the first keystroke** (D1): the strip of active
  filters came into being with the first condition as a row of its own above the
  header and disappeared again when emptied. A browser check now holds that the
  header stays put while searching, filtering and resetting.
- **The search stood there twice** (D2): in its field and as a condition
  "Suche: …" beside it.
- **A condition outlived its column** (D6): when a filtered column left the JSX,
  its choice stayed in the state, went on counting as a restriction in the empty
  state, and took effect again when the column came back. The condition now goes
  with the column. A hidden column is still there and keeps its own.
- **A filter written in the call made the table crash** (D4): `filter: (z) => …`
  yielded "Too many re-renders" on the first render, because a change of its
  identity reset the page while still rendering. The documentation demanded only
  `useCallback`. `preFilter` may stand in the call.
- **The list filter offered values the application's filter excludes** (D5) —
  under a filter by plant, the values of the other plants.
- **Figures and the empty state counted excluded rows** (D3): the ratio named all
  rows, and where the application's filter alone left the table empty it offered
  "reset everything" — which left the table empty.

### Removed

- **The view as search parameters.** `alsSuchparameter`, `ausSuchparametern`,
  `AusSuchparameternOptionen`, `t.suchparameter` and the text form of
  `initialeAnsicht` have gone. The table writes no part of its state into the
  address: what the URLs of an application contain the application decides. What
  remains is the view as an object — `initialView` on the first render, `t.view`
  to read it back — which an application can keep wherever it likes. Whoever
  wants to go on using the address writes the few fields of `TableView` into it
  themselves.

---

## 0.1.0 – A table, declared the way it reads (never published)

Delivery report for `.scratch/umriss-table/spec.md`, tickets 01–13 (ADR-0016,
ADR-0017). The package depends on `@umriss-ui/core` as a peer and imports only
its public entry; it has no runtime dependencies.

`@umriss-ui/core` has no table any more (ticket 14, `@umriss-ui/core` 0.9.0).
Model, export, view, selection and the alarm model stand only here; their
behaviour tests run against this package's demo
(`.scratch/table-demo/spec.md`).

### Fixed before publication

- **The sticky row header sticks where it belongs**, even when every column has a
  `width` and the table is wider than their sum. Until then the table layout
  distributed the excess over the selection and expander cells as well; they grew
  wider than the 34 px the sticky offsets are computed from, and when scrolling
  sideways the row header slid over the expander. Found by the demo's browser
  suite — jsdom knows no layout.
- **The label of a condition in the filter strip** ("Suche", "Status") stands in
  the secondary type rather than the muted one. On the surface of the tag the
  muted type held 4.5:1 in neither theme (3.09:1 light, 3.74:1 dark). Found by
  the demo's accessibility check, which saw a table with a condition at rest for
  the first time.

### Added

- **`useTable(rows, options)`** derives the row kind from the rows and gives out
  the parts that need it: `Table`, `Column`, `VerdictColumn`, `RowDetail`,
  `RowActions`, `Action`. With them the state — filtered and visible rows,
  search, sort levels, page, hidden columns, order, widths, expanded rows, list
  filters, selection —, the view as an object (`view`) and as text
  (`suchparameter`) and `asCsv()`. Options: `rowKey`, `pageSize`, `defaultSort`,
  `filter`, `initialView` (also as text out of the address bar), `virtual`,
  `selection`.
- **A column is an element** with exactly one value — a field name or a function
  with an `id` — and optionally its presentation as `children(value, row)`.
  `children` is not called for an absent value; without `children` the type of
  the value decides text, alignment, sorting and export. `format` chooses a
  standard presentation (`"prozent"`, `"anzahl"`, `{ decimals }`, `"datum"`,
  `"zeit"`, `"datumZeit"`), `footer` sums or averages over the filtered set,
  `rowHeader` names the row, `filter="list"` offers the values that occur,
  `sortValue` and `exportValue` sort and write a value that has no order of its
  own. The compiler rejects a mistyped field name, `footer` on text, a date format
  on a number, and a missing renderer for an array.
- **The table renders its rows itself**: hiding and reordering act on header,
  body and footer at once. Props: `selectable`, `stickyHeader`,
  `stickyRowHeader`, `striped`, `density`, `maxHeight`, `empty`, `loading`,
  `rowProps`, `ariaLabel`.
- **`column<P>(…)`** — a column bound to a property instead of to a row kind, to
  be spread into `Column`.
- **Unbound parts** `Toolbar` (with the bulk actions of the selection), `Search`,
  `ColumnMenu` (show, hide, arrange), `Export` (download or `onExport`),
  `Pagination`; placed inside the table or with `of={t}`.
- **`VerdictColumn`** — a numeric value against a `LimitSet`, with a character, a
  word and the excess; sorted by severity or with `sortBy="value"`.
- **`AlarmList`** and **`alarmModel`**, taken over from `@umriss-ui/core` and
  expressed in the same interface. The props are English here: `view`,
  `selection`, `onAcknowledge`, `asOf`, `freshness`.
- `alsSuchparameter`, `ausSuchparametern`, `useTableSelection` and their types.

### Worth knowing

- **A table pages only when a `Pagination` stands.** Without one it shows the
  whole filtered set; `pageSize` applies as soon as there is a bar.
- The table renders in the browser. Server-side rendering is not foreseen.
- A `Column` out of a different `useTable` call can be placed into a table
  without the compiler objecting — JSX does not check children against their
  parents. In development the table warns.
