/* The type parameters of `Table` and `ActionProps` stand in the order row, key,
   server flag, the flag last and defaulted, and the grid's reports carry the
   values a cell can hold. Compiled by `typecheck`; the lines under
   `@ts-expect-error` must yield an error. */

import { useTable } from "../src";
import type { ActionProps, AggregateColumn, AggregateFunction, CellEdit, OwnAggregate, RowAdd, RowSave, Table } from "../src";

interface Pump {
  id: number;
  name: string;
}

declare const pumps: Pump[];

/* The new order: the key second, the flag last. */
export function Hooks() {
  const automatic: Table<Pump, number> = useTable(pumps, { rowKey: (p) => p.id });
  const server: Table<Pump, number, true> = useTable(pumps, { rowKey: (p) => p.id, server: true, rowCount: 0, onRequest: () => {} });
  return [automatic, server];
}

/* The old order is no longer a type. */
// @ts-expect-error the flag no longer stands second: `false` is not a row key
export type Old = Table<Pump, false, number>;

export const automaticBulk: ActionProps<Pump, number> = { bulk: true, children: "Open", onSelect: (rows: Pump[]) => rows };
// @ts-expect-error the flag no longer stands second
export type OldAction = ActionProps<Pump, true, number>;

/* What a cell can hold is what the grid reports. */
type Held = string | number | boolean | Date | null;
export const edit = (e: CellEdit<Pump, number>): Held => e.value;
export const save = (s: RowSave<Pump, number>): Held | undefined => s.changes["name"];
export const add = (a: RowAdd): Held | undefined => a.values["name"];

/* The model's own aggregate is the column's `AggregateFunction`; the old name is the same type. */
export const own: AggregateColumn<Pump>["aggregate"] = ((values: readonly unknown[], rows: readonly Pump[]) => values.length + rows.length) satisfies AggregateFunction<unknown, Pump>;
export const old: OwnAggregate<Pump> = own as AggregateFunction<unknown, Pump>;
