/* The export of a table: the filtered set in the visible columns, in the order
   the user sees, with the values and not with their presentation. The writing
   rules (separator, decimal comma, BOM) belong to asCsv. */

import { asCsv } from "./model/csv";
import type { Column } from "./model/tableModel";
import type { Registry, ColumnEntry } from "./registry";
import type { TableSnapshot } from "./types";
import { exportValue } from "./values";

/** The visible columns in the order the user sees - with the sticky row header
    first when it sticks. Screen and export both read here, so that they cannot
    drift apart. */
export function visibleColumns(registry: Registry): ColumnEntry[] {
  const byId = new Map(registry.orderedColumns().map((e) => [e.spec.id, e]));
  const inModelOrder = registry
    .projection()
    .columns.map((s) => byId.get(s.id))
    .filter((e): e is ColumnEntry => e !== undefined);
  return registry.withStickyHeaderFirst(inModelOrder.map((e) => ({ id: e.spec.id, e }))).map(({ e }) => e);
}

/** Clears the search and lifts every condition - and nothing else: the
    pre-filter stays. The button in the toolbar and the one in the empty body do
    the same thing. */
export function resetSearchAndFilters(snapshot: TableSnapshot<unknown>) {
  snapshot.setSearch("");
  for (const id of Object.keys(snapshot.filter)) snapshot.setFilter(id, null);
}

export function csvOf(registry: Registry): string {
  const hook = registry.hook;
  if (!hook) return "";
  const columns = visibleColumns(registry)
    /* A value without a text form and without an export path of its own does
       not belong in a spreadsheet - a column full of "[object Object]" is not
       one. */
    .filter((e) => registry.kindOf(e, hook.rows) !== "other" || e.spec.ownExportValue)
    .map(
      (e): Column<unknown> => ({
        id: e.spec.id,
        label: e.spec.label,
        value: (row) => exportValue(e.read(row), e.spec.ownExportValue),
      }),
    );
  return asCsv(registry.projection().filtered, columns);
}
