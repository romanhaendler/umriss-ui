# @umriss-ui/table

The umriss table, declared the way it reads: columns are JSX elements, typed
against the rows they came from. The hook binds the row kind once and hands back
the `Table` and the `Column` that belong to it, so a column can only name a
field the row actually has.

Filtering, sorting, grouping, aggregates, paging, selection, row detail, row
actions, column widths and virtualisation are in the model, not in the markup —
and the model is a pure module with tests of its own.

## Install

```bash
pnpm add @umriss-ui/table @umriss-ui/core
```

`@umriss-ui/core` is a **peer dependency** (ADR-0016): the table reads its
provider, its formats and its wording, and enters it by the public entry only.
React 18 or 19 as a peer as well.

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
    <Table ariaLabel="Orders">
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

A table wider than its place scrolls in its own frame, never the page; on a
phone the toolbar and the paging bar wrap instead of running out of it.

## Grouped, in one option

```tsx
const { Table, Column } = useTable(orders, {
  rowKey: (o) => o.number,
  defaultGrouping: ["line", "customer"],
});

<Table ariaLabel="Orders by line and customer">
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
is the footer over the filtered set as well — it used to be called `footer`,
and the old name still works for this version.

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
* **Restricting a column**: the values that occur, two bounds, or a filter the
  application writes itself — plus conditions set from outside and read back.
* **Around the table**: toolbar, search, column menu, export, paging — each
  usable inside the table toolbar or anywhere else on the page with `of`.
* **On a row**: a detail row that stays open across a change of filter, row
  actions that stay quiet until the row is meant, and a bulk action that always
  receives a list.
* **For producing plants**: `VerdictColumn` reads a measured value against a
  limit set, and `AlarmList` shows alarms with a lifecycle — standing or
  cleared, acknowledged or not. The library generates no alarms (ADR-0009).
* **A million rows on a server**: in manual mode the rows are one page a server
  answered; the table reports the view - search, conditions, sort, page -
  once per change and shows placeholders over the previous page while the
  next is on its way.
* **Twenty thousand rows** where it has to be: virtualisation, sticky parts,
  columns pinned to either side and column widths that survive a view being
  restored.
* **A grid, on request** (ADR-0034): `<Table grid>` is one tab stop whose
  Active cell the arrows walk, and a column with `edit` is edited in place -
  with the core field for its value, a `validate` that keeps a wrong draft
  open, and `onCellEdit` reporting what the application applies. Without
  `grid` the table stays a native table.

## More

* The demo: <https://romanhaendler.github.io/umriss-ui/table/>, or locally
  `pnpm dev:table` (port 4175). It is the documentation — every page
  shows running examples with their source and the props table generated from
  `src/`.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* **For a coding agent**: `docs/llms-full.md` inside the installed package —
  the demo as one Markdown file, pinned to the installed version: every page
  with its examples' source, its props tables and why it is built as it is,
  and the declaration of every other export. Online, for the latest version:
  <https://romanhaendler.github.io/umriss-ui/table/llms.txt>.
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all five packages share.
* [`../core/README.md`](../core/README.md) — the component library underneath.

## Licence

MIT — see [`LICENSE`](LICENSE).
