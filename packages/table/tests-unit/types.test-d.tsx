/* The typing, checked by the compiler (umriss-table 06, 07, 09, 12).

   This file does not run; it is compiled, as part of `typecheck`. Every line
   under `@ts-expect-error` MUST yield an error - if one stops doing so, the
   typecheck fails. That is deliberate: the typing is the product, and a change
   that loosens it must not slip through the check. Derived from the prototype of
   Ticket 01. */

import { Search, column, columnFilter, useTable } from "../src";
import type { ReactNode } from "react";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
  status: "Aktiv" | "Pausiert";
  amount: number;
  price: number | null;
  due: Date;
  urgent: boolean;
  tags: string[];
  customer: { name: string };
}

interface Reading {
  id: string;
  measured: number;
}

declare const orders: Order[];
declare const readings: Reading[];
declare function Badge(props: { tone: "success" | "warning"; children: string }): ReactNode;

export function Columns() {
  const t = useTable(orders, { rowKey: (a) => a.id });
  const { Table: Frame, Column } = t;
  const m = useTable(readings, { rowKey: (z) => z.id });

  const amount = column<{ amount: number }>({ value: "amount", label: "Quantity", aggregate: "sum" });
  const textAmount = column<{ amount: string }>({ value: "amount", label: "Quantity" });
  const twoFields = column<{ amount: number; number: string }, "amount">({ value: "amount", label: "Quantity", aggregate: "sum" });

  return (
    <Frame>
      {/* The row type comes from the rows: a field name is checked. */}
      <Column value="number" label="Order" rowHeader />
      {/* @ts-expect-error mistyped field name */}
      <Column value="numer" label="Order" />

      {/* A value as a function requires an id. */}
      <Column id="customer" value={(a) => a.customer.name} label="Customer" />
      {/* @ts-expect-error computed value without an id */}
      <Column value={(a) => a.customer.name} label="Customer" />

      {/* children gets the type of the field, without the absence. */}
      <Column value="status" label="Status">
        {(status) => <Badge tone={status === "Aktiv" ? "success" : "warning"}>{status}</Badge>}
      </Column>
      <Column value="price" label="Preis">
        {(price) => price.toFixed(2)}
      </Column>
      <Column value="amount" label="Quantity">
        {(value, row) => `${value.toFixed(0)} ${row.number}`}
      </Column>
      {/* @ts-expect-error a renderer calls a number method on text */}
      <Column value="number" label="Number" children={(number) => number.toFixed(2)} />
      {/* @ts-expect-error the same for computed text */}
      <Column id="k" value={(a) => a.customer.name} label="Customer" children={(n) => n.toFixed(2)} />

      {/* Without a text form children is required. */}
      <Column value="tags" label="Tags">
        {(tags) => tags.join(", ")}
      </Column>
      {/* @ts-expect-error an array without a renderer */}
      <Column value="tags" label="Tags" />
      <Column id="kundeObjekt" value={(a) => a.customer} label="Customer">
        {(customer) => customer.name}
      </Column>
      {/* @ts-expect-error a computed object without a renderer */}
      <Column id="kundeObjekt2" value={(a) => a.customer} label="Customer" />
      <Column value="due" label="Due date" />
      <Column value="urgent" label="Eilig" />
      <Column id="text" value={(a) => a.number} label="Text" />

      {/* format by name, checked against the value type. */}
      <Column value="amount" label="Quantity" format="percent" />
      <Column value="amount" label="Quantity" format={{ decimals: 2 }} />
      <Column value="due" label="Due date" format="date" />
      <Column id="netto" value={(a) => a.amount * 0.81} label="Netto" format={{ decimals: 2 }} />
      <Column id="due" value={(a) => a.due} label="Due" format="time" />
      {/* @ts-expect-error a date format on a number */}
      <Column value="amount" label="Quantity" format="date" />
      {/* @ts-expect-error a number format on a date */}
      <Column value="due" label="Due date" format="percent" />
      {/* @ts-expect-error format on text */}
      <Column value="number" label="Number" format="percent" />
      {/* @ts-expect-error a date format on a computed number */}
      <Column id="netto2" value={(a) => a.amount * 0.81} label="Netto" format="date" />

      {/* footer only for numbers. */}
      <Column value="amount" label="Quantity" footer="sum" />
      <Column value="price" label="Preis" footer="avg" />
      <Column id="wert" value={(a) => (a.price === null ? null : a.amount * a.price)} label="Value" footer="sum">
        {(value) => value.toFixed(2)}
      </Column>
      {/* @ts-expect-error a sum on text */}
      <Column value="number" label="Number" footer="sum" />
      {/* @ts-expect-error a sum on a date */}
      <Column value="due" label="Due date" footer="sum" />
      {/* @ts-expect-error a sum on computed text */}
      <Column id="name" value={(a) => a.customer.name} label="Name" footer="sum" />

      {/* aggregate (table-grouping 02): typed by the value. */}
      <Column value="amount" label="Quantity" aggregate="sum" />
      <Column value="price" label="Preis" aggregate="avg" share={false} />
      <Column value="due" label="Due date" aggregate="range" />
      <Column value="due" label="Due date" aggregate="max" format="date" />
      <Column value="number" label="Number" aggregate="distinct" />
      <Column value="status" label="Status" aggregate="count" />
      <Column value="amount" label="Quantity" aggregate={(values, rows) => values.reduce((a, b) => a + b, 0) / rows.length} />
      <Column id="netto3" value={(a) => a.amount * 0.81} label="Netto" aggregate="sum" format={{ decimals: 2 }} />
      <Column id="netto4" value={(a) => a.amount * 0.81} label="Netto" aggregate="max" />
      <Column id="faellig" value={(a) => a.due} label="Due" aggregate="range" format="date" />
      <Column id="kunde2" value={(a) => a.customer.name} label="Customer" aggregate="distinct" />
      <Column id="kunde3" value={(a) => a.customer} label="Customer" aggregate={(values) => values[0]}>
        {(k) => k.name}
      </Column>
      <Column id="rate" value={(a) => a.amount / 100} label="Rate" format="percent" aggregate={(values, rows) => values.reduce((s, v) => s + v, 0) / rows.length} />
      <Column id="dueOwn" value={(a) => a.due} label="Due" format="date" aggregate={(values) => values[0]} />
      {/* @ts-expect-error a sum on text */}
      <Column value="number" label="Number" aggregate="sum" />
      {/* @ts-expect-error a range on numbers */}
      <Column value="amount" label="Quantity" aggregate="range" />
      {/* @ts-expect-error an average of dates */}
      <Column value="due" label="Due date" aggregate="avg" />
      {/* @ts-expect-error a sum on computed text */}
      <Column id="kunde4" value={(a) => a.customer.name} label="Customer" aggregate="sum" />
      {/* @ts-expect-error an aggregate of one's own that returns another type than the value */}
      <Column value="amount" label="Quantity" aggregate={(values) => values.join(", ")} />
      {/* @ts-expect-error aggregate and footer together */}
      <Column value="amount" label="Quantity" aggregate="sum" footer="sum" />

      {/* @ts-expect-error without a label */}
      <Column value="number" />

      {/* Presets: accepted for rows with the property, rejected without, overridable. */}
      <Column {...amount} />
      <Column {...amount} label="Piece" />
      <Column {...twoFields} />
      {/* @ts-expect-error a preset on rows whose amount is text */}
      <m.Column {...textAmount} />
      {/* @ts-expect-error a preset on rows without amount */}
      <m.Column {...amount} />

      {/* @ts-expect-error a renderer for the wrong row type */}
      <Column value="amount" label="Quantity" children={(value: number, row: Reading) => row.measured + value} />

      {/* Wrappers get the table as `of`. */}
      <AmountColumn of={t} />
      {/* @ts-expect-error a wrapper for another row type */}
      <AmountColumn of={m} />

      {/* Paths of one's own for sorting and exporting an object. */}
      <Column id="kundeSortiert" value={(a) => a.customer} label="Customer" sortValue={(k) => k.name} exportValue={(k) => k.name}>
        {(k) => k.name}
      </Column>
      {/* @ts-expect-error sortValue yields an object */}
      <Column id="kundeSortiert2" value={(a) => a.customer} label="Customer" sortValue={(k) => k} children={(k) => k.name} />
    </Frame>
  );
}

function AmountColumn({ of }: { of: Table<Order> }) {
  const { Column } = of;
  return <Column value="amount" label="Quantity" footer="sum" />;
}

export function Actions() {
  const { Action, RowActions, RowDetail } = useTable(orders, { rowKey: (a) => a.id });
  return (
    <>
      <RowDetail>{(a) => a.number}</RowDetail>
      <RowActions>
        <Action onSelect={(a) => a.number}>Open</Action>
        <Action bulk onSelect={(list) => list.map((a) => a.number)}>
          Archive
        </Action>
        {/* @ts-expect-error a row action handles a list */}
        <Action onSelect={(list) => list.map((a) => a.number)}>Open</Action>
        {/* @ts-expect-error a bulk action handles a row */}
        <Action bulk onSelect={(a) => a.number}>
          Archive
        </Action>
      </RowActions>
    </>
  );
}

export function Grouping() {
  const t = useTable(orders, { rowKey: (a) => a.id, defaultGrouping: ["status", "shift"] });
  const { Table: Frame, Column, GroupBy } = t;
  return (
    <Frame groupable>
      <Column value="due" label="Due" group="month" />
      <Column id="dueWeek" value={(a) => a.due} label="Week" group="week" />
      <Column value="amount" label="Quantity" groupValue={(n) => (n < 100 ? "small" : "large")} groupable />
      {/* @ts-expect-error group on a number */}
      <Column value="amount" label="Quantity" group="month" />
      {/* @ts-expect-error groupValue yields an object */}
      <Column value="amount" label="Quantity" groupValue={(n) => ({ n })} />
      <GroupBy value="status" label="Status" />
      <GroupBy id="shift" value={(a) => (a.due.getHours() < 14 ? "Early" : "Late")} label="Shift" />
      <GroupBy value="due" label="Month" group="month" />
      {/* @ts-expect-error a field the row does not have */}
      <GroupBy value="plant" label="Plant" />
      {/* @ts-expect-error a computed group key without an id */}
      <GroupBy value={(a) => a.number} label="Number" />
      {/* @ts-expect-error a group key over an object */}
      <GroupBy id="customer" value={(a) => a.customer} label="Customer" />
      {/* @ts-expect-error group on text */}
      <GroupBy value="number" label="Number" group="year" />
    </Frame>
  );
}

export function Verdicts() {
  const { VerdictColumn } = useTable(orders, { rowKey: (a) => a.id });
  return (
    <>
      <VerdictColumn value="price" label="Preis" limits={{}} />
      <VerdictColumn id="doppelt" value={(a) => a.amount * 2} label="Doppelt" limits={{}} format={{ decimals: 1 }} />
      <VerdictColumn value="price" label="Preis" limits={{}} aggregate="worst" />
      {/* @ts-expect-error a verdict column knows only its worst verdict */}
      <VerdictColumn value="price" label="Preis" limits={{}} aggregate="sum" />
      {/* @ts-expect-error a verdict over text */}
      <VerdictColumn value="number" label="Number" limits={{}} />
    </>
  );
}

export function PreFilter({ plant }: { plant: string }) {
  // A pre-filter may stand in the call, and it gets the row type.
  useTable(orders, { rowKey: (a) => a.id, preFilter: (a) => a.number !== plant });
  // The old name still compiles, for one minor version.
  useTable(orders, { rowKey: (a) => a.id, filter: (a) => a.urgent });
  // @ts-expect-error a field the row does not have
  useTable(orders, { rowKey: (a) => a.id, preFilter: (a) => a.plant === plant });
  return null;
}

const low = columnFilter<number, "low" | "empty">({
  matches: (value, condition) => (condition === "empty" ? value === 0 : value < 20),
  Input: () => null,
  describe: (condition) => condition,
});
const startsWith = columnFilter<string, string>({
  matches: (value, condition) => value.startsWith(condition),
  Input: ({ values }) => values.join(", "),
  describe: (condition) => condition,
});

export function ColumnFilters() {
  const t = useTable(orders, { rowKey: (a) => a.id });
  const { Table: Frame, Column } = t;

  /* Conditions from outside, typed at the field. */
  t.setFilter("status", ["Aktiv"]);
  t.setFilter("price", [12, null]);
  t.setFilter("due", [new Date()]);
  t.setFilter("amount", { from: 100, to: 500 });
  t.setFilter("due", { to: new Date() });
  t.setFilter("status", null);
  // An id that is not a field takes any condition - including that of a filter of one's own.
  t.setFilter("stock", "low");
  // @ts-expect-error a value the field does not have
  t.setFilter("status", ["Gibtsnicht"]);
  // @ts-expect-error text in a number field
  t.setFilter("amount", ["viel"]);
  // @ts-expect-error a range on a text field
  t.setFilter("number", { from: "A", to: "B" });
  // @ts-expect-error a date range on a number field
  t.setFilter("amount", { from: new Date() });

  return (
    <Frame>
      <Column value="status" label="Status" filter="list" />
      <Column value="due" label="Due date" filter="list" />
      <Column value="amount" label="Quantity" filter={low} />
      <Column value="price" label="Preis" filter={low} />
      <Column id="stock" value={(a) => a.amount * 2} label="Doppelt" filter={low} />
      <Column value="number" label="Number" filter={startsWith} />
      {/* @ts-expect-error a number filter on text */}
      <Column value="number" label="Number" filter={low} />
      {/* @ts-expect-error a number filter on computed text */}
      <Column id="kname" value={(a) => a.customer.name} label="Customer" filter={low} />
      {/* @ts-expect-error a list filter needs values with a text form */}
      <Column value="tags" label="Tags" filter="list" children={(tags) => tags.join(", ")} />
    </Frame>
  );
}

/* A part with `of` still accepts the table, although setFilter is typed at its row type. */
export function WithRef() {
  const t = useTable(orders, { rowKey: (a) => a.id });
  return <Search of={t} />;
}

export function RangeFilters() {
  const { Table: Frame, Column } = useTable(orders, { rowKey: (a) => a.id });
  return (
    <Frame>
      <Column value="amount" label="Quantity" filter="range" />
      <Column value="price" label="Preis" filter="range" />
      <Column value="due" label="Due date" filter="range" />
      <Column id="netto" value={(a) => a.amount * 0.81} label="Netto" filter="range" />
      {/* On a computed column the two names do not check the value type
          (types.ts): a filter of one's own still does. */}
      <Column id="line" value={(a) => a.customer.name} label="Line" filter="list" />
      {/* @ts-expect-error a range over text */}
      <Column value="number" label="Number" filter="range" />
      {/* @ts-expect-error a range over a boolean */}
      <Column value="urgent" label="Eilig" filter="range" />
    </Frame>
  );
}

/* Editing in grid mode (table-grid-mode 03): the core field fits the value. */
export function Editing() {
  const { Table: Frame, Column } = useTable(orders, { rowKey: (a) => a.id });
  return (
    <Frame grid onCellEdit={(edit) => edit.row.number}>
      <Column value="number" label="Order" edit="text" validate={(value) => (value?.startsWith("A") ? undefined : "An order starts with A")} />
      <Column value="amount" label="Quantity" edit="number" validate={(value, row) => (value !== null && value > row.amount * 2 ? "Too many" : null)} />
      <Column value="price" label="Preis" edit="number" />
      <Column value="due" label="Due date" edit="date" />
      <Column value="status" label="Status" edit="select" editOptions={["Aktiv", "Pausiert"]} />
      <Column value="customer" label="Customer" edit={({ value, onChange }) => <input value={value?.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} />}>
        {(c) => c.name}
      </Column>
      {/* @ts-expect-error a number field for text */}
      <Column value="number" label="Order" edit="number" />
      {/* @ts-expect-error a text field for a point in time */}
      <Column value="due" label="Due date" edit="text" />
      {/* @ts-expect-error an option that is no status */}
      <Column value="status" label="Status" edit="select" editOptions={["Aktiv", "Stopped"]} />
    </Frame>
  );
}
