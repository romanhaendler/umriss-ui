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

**Release candidates.** `0.2.0-rc.0` and `0.2.0-rc.1` were the two versions on
the registry, under the tag `next`. With `0.2.0` that is over:
`pnpm add @umriss-ui/table @umriss-ui/core` is the whole install line. `0.1.0`
was never published. Where an entry below names a `@umriss-ui/core` version, it
is one of the internal numbers from before core's first publication as `0.1.0`
(see core's changelog).

---

## Unreleased

Needs the `@umriss-ui/core` that carries the availability wording and the
column menu's pin keys (its own "Unreleased" section).

### Added

- **`docs/llms-full.md`**, the package's documentation as one Markdown file for
  a coding agent, in the npm package and pinned to its version: every demo page
  with its import line, its examples' source, its props tables and why it is
  built as it is, and the declaration of every other export. The same text
  stands online as <https://romanhaendler.github.io/umriss-ui/table/llms-full.txt>,
  with an index of the pages beside it (`llms.txt`).
- **Availability, the second field beside the lifecycle** (ISA-18.2's special
  states): `availability?: "in-service" | "shelved" | "suppressed-by-design" |
  "out-of-service"` on `Alarm`, never merged into the four lifecycle values.
  Without a statement an alarm is in service, so existing alarms read as
  before. A shelved alarm carries `shelf: { until, by }` - and cannot be
  written without it.
- **Four pure transitions**, one alarm in and one out, performed by the
  application: `shelve(alarm, until, by)`, `unshelve`, `takeOutOfService`,
  `returnToService`. One that does not apply returns the same object. A shelf
  never overwrites out of service or suppressed by design, and taking out of
  service never overwrites suppressed by design - the plant's logic owns it.
- **`availabilityAt(alarm, asOf)`**: a shelf that has reached its end is in
  service again at the as-of time - by the model's clock, not by a timer.
  `AlarmRow.availability` carries that value.
- **`isHiddenFromOperation`, `AVAILABILITIES`, the types `Availability` and
  `Shelf`**, and on the projection **`hiddenFromOperation`**: how many of the
  filtered set are hidden. The model still removes nothing.
- **An `availability` column** in `alarmColumns` / `ALARM_COLUMNS` (its label
  from `wording.columnAvailability`), valued by rank like the priority.
- **`<AlarmList>` shows what is hidden from operation**: the row stays,
  drawn neutrally - no edge, the priority a word without its colour, the type
  muted - with its availability as a word before its lifecycle ("Shelved until
  11:10 by M. Keller"). The bar counts them ("Hidden from operation: 3").
- **`hiddenOnly` and `onHiddenOnlyChange` on `<AlarmList>`**: with the
  handler the count becomes a switch for the view; the application filters
  with the table's own `filter` and `isHiddenFromOperation`. The switch stays
  while the view is on, even at zero.
- **Any column can be pinned**: `pin="start"` or `pin="end"` on a `Column` or
  a `VerdictColumn` keeps it in view while the table scrolls sideways, in a
  block before or after every other column. The selection and the expander
  stick with the start block (and a group span with them), the row actions
  with the end block; a group header's label and aggregates stick in their
  blocks, and virtual rows pin like any other. A shadow on a block's inner
  edge shows only while content lies under it.
- **`t.pinned` and `t.setPin(column, "start" | "end" | null)`**, and
  **`pinned` in the view**: the user's choice, whole, once it deviates from
  what the columns declare (`{}` when every declared pin was undone). A view
  handed in as `initialView` restores it.
- **The column menu pins**: two keys per column, "Pin to start" and "Pin to
  end"; the key of the side a column is pinned to stands in the accent and
  reads "Unpin". The focus stays on the key that was pressed while the entry
  moves to its block.

### Changed

- **`stickyRowHeader` is `pin="start"` on the row header.** It looks as
  before; the difference is that the row header can now be unpinned (with
  `setPin`) and share its block with other pinned columns. The sticky offsets
  are measured from the head row instead of assumed from the 34 px of a
  control cell, so a control cell that grows no longer slides under the row
  header.
- **In the column menu a column moves only inside its block** (start, the
  unpinned ones, end). Before, only the sticky row header was held in place.

- **`DEFAULT_ORDER` begins with availability**: in service above hidden, then
  priority, acknowledgement and time as before. Only alarms with an
  availability of their own move.
- **`standingUnacknowledged` counts only alarms in service.** The live figure
  calls somebody over; it must not call them to a shelved alarm.
- **A done alarm's row (`keepDone`) is muted as it always claimed to be.**
  Its colour stood on the row, and the table's cells set their own; it now
  stands on the cells.
- **`Alarm` is a type, no longer an interface** - the union with the shelf
  needs it. `Partial<Alarm>` spread into an `Alarm` no longer compiles; name
  the fields you mean (`Pick<Alarm, "cleared" | "acknowledgedAt">`).

### Fixed

- **A group header whose first column carries an aggregate keeps its
  aggregates under their columns.** Grouped by one level, its label stood in a
  cell over no column, which a browser counts as one, and every aggregate
  stood a column too far right. The label now takes the first column's place
  in the header; its sum stays in the footer.

---

## 0.3.3 – Depth work on the table (Sep. 2026)

Needs `@umriss-ui/core` 0.9: it reads `--u-tracking-figures`; the peer range moves to `^0.9.0`.

### Changed

- **Every head reads the same way: label, arrow, funnel.** A numeric head
  mirrored that order, so its arrow and funnel stood before the label - and
  its funnel beside the funnel of the column before. The group now keeps the
  order in every column and stands flush right in a numeric one, ending where
  the figures end.
- **A selected row carries core's `--u-color-accent-subtle`**, a step deeper
  under the pointer. Before, only the checkbox said a row was selected.
- **The head follows `density="compact"`.** Its padding shrank with the rows'
  and it stood half again as tall as a row below it.
- **The head is 1 to 3 px lower in every table**: the sort key sits at the top
  of its cell instead of on the baseline of its label.

### Fixed

- **A numeric head's label stands on the line of its neighbours'**; it stood
  1.13 px higher.
- **A focused virtual row shows its ring all round.** The sticky selection and
  row-header cells painted over it; the cells now draw it themselves.
- **A loading placeholder stands where its value will**: right in a numeric
  column.

---

## 0.3.2 – Core 0.8.0: the canon of states (Sep. 2026)

Needs `@umriss-ui/core` 0.8: it reads core's pressed surfaces and motion tokens; the peer range moves to `^0.8.0`.

### Changed

- **Pressed and disabled follow core's canon of interaction states.** The
  filter key, the fold and the row expander, the column menu's move keys and
  the grouping options sink while pressed. A disabled move key or grouping
  option dims to half opacity with the not-allowed cursor; the move key was
  dimmed twice (opacity and muted type), the grouping option only repainted.

- **The sort arrow turns as a path.** Its half turn ran on the 120 ms of a
  hover; it now reads core's `--u-transition-path` (140 ms), like the fold
  chevrons beside it. Hover and colour changes run on core's own curve since
  `--u-transition` carries it.
- **The glyphs keep core's one stroke width** (1.4 per 10 units): the sort
  arrow, the sortable indicator, the column reordering's arrows and the group
  fold are a shade lighter, the fold drawn in the nominal box. The row
  expander is core's `AngleGlyph`. The sort arrow and indicator are now
  `aria-hidden` themselves, not only through their container.

---

## 0.3.1 – The focus survives a fold (Sep. 2026)

### Fixed

- **The focus survives a fold.** When a fold hides the element that holds the
  focus - a row's checkbox, a cell, a row action, the fold of an inner group -
  the focus goes to the fold of the nearest group that still stands for it: its
  folded line or its header. Before, it fell to the page whenever it was not on
  the fold that was pressed. This holds for `toggleFold`, `foldAll`, the tag
  menu's "Fold all" and Alt-click or Alt+arrow on a sibling's fold; a focus
  outside the folded group stays where it is.

### Changed

- **Danger as type reads core's `--u-color-danger-text`**: the verdict glyph
  and excess of `VerdictColumn` and the lost freshness of `AlarmList` - lighter
  in the dark theme, 4.5:1 on every surface. Needs `@umriss-ui/core` 0.7.

---

## 0.3.0 – Grouping (Sep. 2026)

### Added

- **Grouping.** `defaultGrouping` on `useTable` groups by up to three columns or
  group keys, the outermost first; without it, the user groups from the column
  menu's new "Grouping" section. The outermost level is a group header with the
  value, the count and every aggregate under its column; the innermost of several
  levels is a span - the grouping column first, its value once beside its rows
  (ADR-0029). Groups fold (one by one, all siblings with Alt, everything from the
  grouping's tag in the table toolbar), select as a whole across pages, page as
  lines with their headers repeated as "continued", virtualise with sticky
  headers, and make the table a `treegrid` for assistive technology.
- **`<GroupBy>`**, a group key: a value to group by that is no column - no cell,
  no export, no entry among the columns.
- **`groupValue`** beside `sortValue` and `exportValue`, **`group="day" | "week" |
  "month" | "year"`** for points in time, **`groupable`** on a column and on the
  table.
- **`aggregate`** on a column: `sum`, `avg`, `min`, `max`, `range`, `count`,
  `distinct`, or a function of one's own whose result runs through the column's
  presentation - in the footer over the filtered set, in a group's header over
  its rows, always from the rows and never from other aggregates.
  `aggregate="worst"` on `VerdictColumn`. `share` switches off the share bar
  under the first sum of a group header.
- **The view** carries `grouping` and `folded`; the snapshot carries `grouping`,
  `setGrouping`, `folded`, `toggleFold`, `foldAll` and `unfoldAll`.

### Changed

- **Every table can be grouped by its users** where a `ColumnMenu` stands: the
  menu gains the "Grouping" section. `groupable={false}` on the table takes it
  away.
- **`footer` is called `aggregate` now.** The old name keeps working for this
  minor version and says so once in development; it goes with the next one.
- **A point-in-time aggregate follows its column's alignment**, and a range
  within one year names the year once.
- Needs `@umriss-ui/core` 0.6 for the grouping's wording.

---

## 0.2.4 – Core 0.5.0 (Sep. 2026)

### Changed

- **The table takes `@umriss-ui/core` 0.5.** Nothing in the table changed; the
  peer range moves to `^0.5.0`, so that it installs beside
  `@umriss-ui/calculation`, which needs core's new wording.

---

## 0.2.3 – Core 0.4.0 (Sep. 2026)

### Changed

- **The table takes `@umriss-ui/core` 0.4.** Nothing in the table changed; the
  peer range moves to `^0.4.0`, whose focus is a crisp two-pixel accent edge
  (see core's changelog) - the table's rows and cells show it.

---

## 0.2.2 – Phones, touch and a review (Sep. 2026)

### Fixed

- **A table no longer widens the page.** A cell's hidden "No value" for the
  screen reader was positioned against the page rather than the scroll area and
  pushed it wider — on a phone the page zoomed out to 758 px. The scroll area
  now holds it.
- **Toolbar and pagination bar wrap on narrow screens** instead of running out
  of the frame.
- **The width grip can be hit with a finger**: on a coarse pointer it is 16 px
  wide and faintly visible, since there is no hover to reveal it.
- **"Fit to content" fits a widened column back down.** A double click on the
  grip (or Alt+Home) measured the cells at the width they had, and a cell is
  never narrower than that — a column dragged wide only ever grew. It now
  measures without that width.
- **A virtualised table counts its rows fully for a screen reader**: the header
  row carries `aria-rowindex="1"`, and a footer row counts towards
  `aria-rowcount` and says where it stands.
- **A loading table says so**: `aria-busy` while `loading` is set.
- **The alarm list's table has a name**, the list's heading ("Alarms").
- **Export keeps its download address alive for a moment** instead of revoking
  it straight after the click — some browsers (Safari among them) fetch it only
  afterwards and got no file.
- The doc comments of `Search` and `Export` named the German defaults; they name
  the English ones now.

---

## 0.2.1 – The README catches up (Sep. 2026)

Nothing in the code changed. The README that shipped with `0.2.0` still called
the table a release candidate under the tag `next`; that paragraph is gone. The
peer range on `@umriss-ui/core` is `^0.3.1`, the core released beside it.

---

## 0.2.0 – The first release (Sep. 2026)

No longer a release candidate: the tag `next` is gone and
`pnpm add @umriss-ui/table @umriss-ui/core` is the whole install line.

**Nothing in the package changed for it.** The source of `0.2.0` is the source
of `0.2.0-rc.1`, line for line. What moved is outside it: `@umriss-ui/core`
released `0.3.0`, and the candidate on the registry peers on `^0.2.0` — so an
application taking both would have been told they do not fit. They do; the
range was simply older than the core beside it. Released together with
`@umriss-ui/core` 0.3.0, `@umriss-ui/charts` 0.3.0 and `@umriss-ui/schedule`
0.1.0, and peering on `^0.3.0`.

---

## 0.2.0-rc.1 – Styles that load themselves, and touch nothing else (Sep. 2026)

Delivery report for `.scratch/styles-without-side-effects/spec.md`, the table's
share (ADR-0021). It takes `@umriss-ui/core` `0.2.0` as its peer: the table's
styles read the tokens that `@umriss-ui/core` now loads by itself.

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
