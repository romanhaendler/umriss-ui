# @umriss-ui/table

A React data table for data-dense applications, declared the way it reads: columns are JSX elements, typed
against the rows they came from. The hook binds the row kind once and hands back
the `Table` and the `Column` that belong to it, so a column can only name a
field the row actually has.

Filtering, sorting, grouping, tree rows, aggregates, paging, selection, row
detail, row actions, column widths and virtualisation are in the model, not in the markup —
and the model is a pure module with tests of its own.

## Install

```bash
pnpm add @umriss-ui/table @umriss-ui/core
```

`@umriss-ui/core` is a **peer dependency** (ADR-0016): the table reads its
provider, its formats and its wording, and enters it by the public entry only.
React 19 or newer as a peer as well. TypeScript 5.4 or newer (the declarations use `NoInfer`).

The package ships ES2022 syntax; an application that serves older browsers
transpiles it itself.

Every entry begins with `"use client"`, the directive a framework
with Server Components reads to treat a module as client code. A table is declared by its hook,
`useTable`, so the declaration lives in a Client Component file: a Server Component renders that
file and hands it the rows, with its `rowKey` and columns kept there. On a server, and until the
page has hydrated, a date or time is empty, because only the browser knows the reader's zone
([ADR-0067](../../docs/adr/0067-a-server-component-hands-umriss-its-data-and-writes-only-a-calculation.md)). No test runs inside such a framework: the
table is rendered to a string in a test.

## The smallest table that runs

```tsx
import { useTable } from "@umriss-ui/table";

interface Order {
  number: string;
  customer: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120 },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48 },
  { number: "A-2043", customer: "Northworks", quantity: 1250 },
];

export function Orders() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table aria-label="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" />
    </Table>
  );
}
```

What the columns do not say is decided by the value: text on the left, a number
right-aligned in the provider's notation and sortable. `rowHeader` makes the
order number the name of the row — for a screen reader, and for the sticky
column.

The table is a composite (ADR-0068): `ref`, `className`, `style`, `id` and `data-*` reach its outer frame, a `<div>`, and `aria-label`, `aria-labelledby` and `aria-describedby` reach the `<table>`, so give the name there. `Toolbar`, `Pagination`, `Export` and `ColumnMenu` take the attributes and the `ref` of the element they render; `Search` is an `Input` and takes its props.

A table wider than its place scrolls in its own frame, never the page; in a
narrow place - a phone, beside a sidebar - the toolbar and the paging bar wrap
instead of running out of it.

`maxHeight` bounds the scroll area, and a `virtual` table needs a bound to render
only its window. A parent of definite height - a dashboard widget's body, a pane,
a grid cell - is such a bound without it: the table is never taller than the
parent, its toolbar stays in view and its rows scroll. A wrapper between the
two passes the height on with `height: 100%`. Where the parent has no definite
height, nothing changes, and `maxHeight="100%"` there bounds nothing.

## Grouped, in one option

```tsx
const { Table, Column } = useTable(orders, {
  rowKey: (o) => o.number,
  defaultGrouping: ["line", "customer"],
});

<Table aria-label="Orders by line and customer">
  <Column value="customer" label="Customer" />
  <Column value="number" label="Order" rowHeader />
  <Column value="line" label="Line" />
  <Column value="quantity" label="Quantity" aggregate="sum" />
</Table>;
```

Each line gets a group header with its count and its sum under the Quantity
column; the customers stand beside their orders as a span (ADR-0029). Without
`defaultGrouping` the user groups from the column menu. `aggregate` takes `sum`,
`avg`, `min`, `max`, `range`, `count`, `distinct` or a function of one's own, and
is the footer over the filtered set as well.

## Styles

Nothing to import. `dist/table.js` loads its own stylesheet, and
`@umriss-ui/core` — which the table imports — loads core's, with the tokens the
table's styles read. Both touch nothing but their own elements and lie in the
layers `umriss.tokens`, `umriss.base` and `umriss.components`, so an
application's CSS wins and every token can be overridden; light and dark follow
the application's `color-scheme`; fonts are the application's (Geist
recommended). The details stand in the README of `@umriss-ui/core`, under
**Styles**. `@umriss-ui/table/styles.css` stays exported for setups that link
stylesheets by hand.

## What it can do

* **Columns by composition** (ADR-0017): a value from a field or computed, its
  presentation, defaults per value type, absent values, aggregates, a row header.
* **Grouping** (ADR-0029): by a column or by a value that is none, up to three
  levels, switched on with one option or chosen by the user in the column menu.
  The outer level is a group header carrying every aggregate under its column;
  the innermost of several is a span beside its rows. Groups fold into a
  summary, select as a whole, page and virtualise.
* **Tree rows**: `childRows` turns the rows into the roots of a hierarchy of
  any number of levels, uneven as the application holds it - an organisation,
  regions and places, cost centres. Every level sorts on its own, a search
  shows a match with the rows above it, the footer sums the top level, the
  export writes the level, and a leaf's detail opens from its own fold.
* **Restricting a column**: the values that occur, two bounds, or a filter the
  application writes itself — plus conditions set from outside and read back.
  A view survives JSON: the dates of a stored condition come back as `Date`s.
* **Restricting by the whole row**: a row filter asks any question of a row
  ("overdue" = past its window and not delivered) through a control of the
  application's own, and counts, resets and travels in the view like any
  other condition.
* **Rows that hold still** (ADR-0042): every line - head, row, group header,
  placeholder, footer - is one row pitch tall in every browser, a value stays
  on its line and shows whole in a tip, and a page keeps its height over a
  short last page, a search, a filter, a grouping and a reload.
* **Around the table**: toolbar, search, column menu, export, paging — each
  usable inside the table toolbar or anywhere else on the page with `of`, and
  one `size` for the whole bar that a control of one's own can match.
* **A time zone named in the formats** (core's Time zone): the dates, the day
  groups and the date filter follow it, and the head of a `"date"`, `"time"` or
  `"dateTime"` column names it, in muted text, where the reader's own is another.
* **Export and copy follow the language** (ADR-0061): the CSV takes its decimal
  mark from the formats, yes/no from the wording and its separator from the
  mark - English gets commas and a point, `@umriss-ui/core/wording/de` the file
  it always had. A column of days is written as `YYYY-MM-DD`, any other
  point in time as ISO text with its offset. Under a named time zone the day is
  the zone's, and a day is a date at the zone's midnight; the ISO text stays
  the instant, the same for every reader. Ctrl or Cmd with C copies the selected rows as tab-separated
  text (in grid mode with no selection, the Active cell), says so in a live
  region, and `selectionAsText()` hands the same text to a button of one's own.
* **An Excel file** (ADR-0073): `import { xlsx } from "@umriss-ui/table/xlsx"` and
  `<Export format={xlsx} />` write one sheet - a header line, numbers, dates,
  booleans and text as what they are, and the table's column widths - the rows
  and columns of the CSV, dates as the wall clock of the formats' time zone (the reader's local time without one). No styling, no
  formulas, no group rows, no compression (a file is about the size of its XML,
  so 100,000 rows of ten columns are tens of megabytes). A sheet over 1,048,576
  rows or 16,384 columns throws a `RangeError`; a text over 32,767 characters is
  cut. A text stays a text: `=1+1` opens as those characters, a leading zero
  stays. `label` lets a CSV and an Excel button stand side by side, `onExport`
  gets the bytes (`Uint8Array`), and `snapshot.exportAs(xlsx)` hands them to
  code. An application that never imports the subpath does not bundle the
  writer (about 4 kB gzipped). To read the file back, open it in a spreadsheet
  or unzip it: it is a ZIP of XML parts.
* **On a row**: a detail row that stays open across a change of filter, row
  actions that stay quiet until the row is meant, and a bulk action that always
  receives a list.
* **For monitoring**: `VerdictColumn` reads a measured value against a
  limit set. The library generates no alarms.
* **A million rows on a server**: in server mode (`server: true`, `rowCount`)
  the rows are one page a server answered; the table reports the request -
  search, conditions, sort, page, page size - through `onRequest` once per
  change and keeps the previous page, dimmed, while the next is on its way.
  Typing in `Search` is reported after a pause of 300 ms without a keystroke
  (the field and `t.search` take each letter at once); Enter, an emptied field,
  `setSearch` and any other change of the request report at once.
  `Export` writes the page; with `exportRows(request)` it writes every match
  instead, in the table's own columns. The application caps and refuses: the
  table asks for what the request names, and a rejection's message shows beside
  the button. `answers` names the request the rows answer, so a late answer
  leaves the table loading and is never shown as current; `error` shows the
  application's message in place of the rows, with "Try again"; with a full page
  ticked the table offers all that match, and a bulk action then receives
  `{ request, except }` instead of rows (the one type a caller may have to
  answer); `totals` fill the footer over every match. What stays the
  application's: the cap on an export, the sums and the clearing of `error`.
  Groups from the server are the next piece, with a spec of their own.
* **Twenty thousand rows** where it has to be: virtualisation, sticky parts,
  columns pinned to either side and column widths that survive a view being
  restored.
* **A selection the application hears** (`onSelectionChange`): `useTable`
  calls it with the selected keys after each change - a tick, "select all", a
  shift-click range, a clear, `selection.toggle()` - from an effect, never at
  mount or during render, so `onSelectionChange: setKeys` cannot loop. It works
  with the table's own selection, with one handed in as `selection`, and in
  server mode (there, under "all that match", `selection.allMatching` and
  `selection.except` tell the rest).
* **Rows that change every second** (`tests-unit/rowsThatKeepArriving.test.tsx`):
  `rows` may be a new array each second - values move, a row appears, one goes.
  The sort stays and the rows stand in its order; a row keeps its place in the
  markup by its `rowKey`; the selection holds by key (the count follows the rows
  there are, and a key whose row is gone waits in the set and ticks again if the
  row returns; an application that holds the selection outside, with
  `useTableSelection`, stores `allMatching` and `except` with the keys - in
  server mode a change of search or conditions clears them through `clear()`);
  an open Row draft stays open with what was typed and shows its
  other fields as they were when it opened, and closes only when its row is gone
  from `rows`; the Active cell stays on its row by key when a re-sort moves it,
  and where its row is gone the cell now at its index takes over; the scroll
  position and a `virtual` window stay on the same rows. Real scroll and focus
  under the row motion are not proved (a browser case is open); nor are grouping
  and tree rows.
* **A grid, on request** (ADR-0034, ADR-0036): `<Table grid>` is one tab stop
  whose Active cell the arrows walk, and a column with `edit` is edited in
  place from the first click - with the core field for its value, a `validate`
  that keeps a wrong draft open, and `onCellEdit` reporting what the
  application applies. `editMode="row"` edits a whole row as one draft, saved
  on purpose (`onRowSave`); `onRowAdd` and `onRowDelete` add and delete rows
  by the table's own buttons. Without `grid` the table stays a native table.

## More

* The demo, in a checkout: `pnpm dev:table` (port 4175). It is the documentation — one page per
  feature, each with running examples and their source, and the props tables
  generated from `src/` where a page documents a type, each prop linked to the
  examples that show it. An API index lists every export, one search finds
  across all five packages, and the header switches the examples to German.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* **For a coding agent**: `docs/llms-full.md` inside the installed package —
  the demo as one Markdown file, pinned to the installed version: every page
  with its examples' source, its props tables and why it is built as it is,
  and an index of every export with its comment and its declaration. The running documentation of a version is opened as [the repository README describes](https://github.com/romanhaendler/umriss-ui#see-it-running): check out the tag `<package>-v<version>`, then `pnpm start`.
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all five packages share.
* [`../core/README.md`](../core/README.md) — the component library underneath.

## Testing

Tested under Vitest 5 and Jest 30 on jsdom. The runner lines and the setup file are in
[`@umriss-ui/core`'s Testing section](../core/README.md#testing); `check:dist` runs a test of the
installed table (a column sorted) with exactly those files.

## Licence

MIT — see [`LICENSE`](LICENSE).
