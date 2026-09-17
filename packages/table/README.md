# @umriss-ui/table

The umriss table, declared the way it reads: columns are JSX elements, typed
against the rows they came from. The hook binds the row kind once and hands back
the `Table` and the `Column` that belong to it, so a column can only name a
field the row actually has.

Filtering, sorting, paging, selection, row detail, row actions, column widths
and virtualisation are in the model, not in the markup — and the model is a pure
module with tests of its own.

## Install

```bash
pnpm add @umriss-ui/table@next @umriss-ui/core
```

The fonts are the application's, as for `@umriss-ui/core`: Geist is loaded with
`@fontsource/geist-sans` and `@fontsource/geist-mono`, and without it the tokens
fall back to the system fonts.

The table is a **release candidate**, published under the tag `next` (and, as
long as no released version exists, under `latest` too — npm insists on one); the
core it takes as a peer is the released `@umriss-ui/core`.

`@umriss-ui/core` is a **peer dependency** (ADR-0016): the table reads its
provider, its formats and its wording, and enters it by the public entry only.
React 18 or 19 as a peer as well.

## The smallest table that runs

```tsx
import { useTable } from "@umriss-ui/table";
import "@umriss-ui/core/styles.css";
import "@umriss-ui/table/styles.css";

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

## The stylesheets

```ts
import "@umriss-ui/core/styles.css";
import "@umriss-ui/table/styles.css";
```

Both are needed, and the order is part of the appearance: the core stylesheet
carries the tokens and the base layer the table's own styles read. Neither
package's JavaScript loads CSS of its own, so the application imports both.

## What it can do

* **Columns by composition** (ADR-0017): a value from a field or computed, its
  presentation, defaults per value type, absent values, a footer, a row header.
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
* **Twenty thousand rows** where it has to be: virtualisation, sticky parts and
  column widths that survive a view being restored.

## More

* The demo: <https://romanhaendler.github.io/umriss-ui/table/>, or locally
  `pnpm dev:table` (port 4175). It is the documentation — every page
  shows running examples with their source and the props table generated from
  `src/`.
* [`CHANGELOG.md`](CHANGELOG.md) — what changes for a caller.
* [`../../docs/design-language.md`](../../docs/design-language.md) — the design
  language all three packages share.
* [`../core/README.md`](../core/README.md) — the component library underneath.

## Licence

MIT — see [`LICENSE`](LICENSE).
