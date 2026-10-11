/* The export of a table: the filtered set in the visible columns, in the order
   the user sees, with the values and not with their presentation. The writing
   rules belong to asCsv; the language's part of them (separator, decimal mark,
   words for true and false) is built here from the formats and the wording. */

import { separatorsOf } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import { asCsv, asTabbed, plain } from "./model/csv";
import type { CsvColumn, CsvConventions } from "./model/csv";
import type { Registry, ColumnEntry } from "./registry";
import type { TableSnapshot } from "./types";
import { exportValue } from "./values";

/** The visible columns in the order the user sees - with the pinned blocks at
    either end. Screen and export both read here, so that they cannot drift
    apart. */
export function visibleColumns(registry: Registry): ColumnEntry[] {
  const byId = new Map(registry.orderedColumns().map((e) => [e.spec.id, e]));
  const inModelOrder = registry
    .projection()
    .columns.map((s) => byId.get(s.id))
    .filter((e): e is ColumnEntry => e !== undefined);
  return registry.inPinOrder(inModelOrder.map((e) => ({ id: e.spec.id, e }))).map(({ e }) => e);
}

/** Clears the search and lifts every condition - and nothing else: the
    pre-filter stays. The button in the toolbar and the one in the empty body do
    the same thing. */
export function resetSearchAndFilters(snapshot: TableSnapshot<unknown>) {
  snapshot.setSearch("");
  for (const id of Object.keys(snapshot.filter)) snapshot.setFilter(id, null);
}

/** The three conventions the language decides: the decimal mark is the
    formats' (measured, as `NumberInput` reads its own output), the separator
    follows from it - a separator equal to the mark would make the file
    unreadable - and the words for true and false are the wording's, lower
    case (ADR-0061). */
export function conventionsOf(formats: Formats, wording: Wording): CsvConventions {
  const { decimal } = separatorsOf(formats);
  return {
    separator: decimal === "," ? ";" : ",",
    decimal,
    yes: wording.booleanYes.toLocaleLowerCase(),
    no: wording.booleanNo.toLocaleLowerCase(),
  };
}

/** The columns a file or the clipboard holds: the visible ones, in the order
    shown. */
function exportColumns(registry: Registry, rows: readonly unknown[]): CsvColumn<unknown>[] {
  return (
    visibleColumns(registry)
      /* A value without a text form and without an export path of its own does
         not belong in a spreadsheet - a column full of "[object Object]" is not
         one. */
      .filter((e) => registry.kindOf(e, rows) !== "other" || e.spec.ownExportValue)
      .map(
        (e): CsvColumn<unknown> => ({
          id: e.spec.id,
          label: e.spec.label,
          value: (row) => exportValue(e.read(row), e.spec.ownExportValue),
        }),
      )
  );
}

export function csvOf(registry: Registry, levelLabel: string, formats: Formats, wording: Wording): string {
  const hook = registry.hook;
  if (!hook) return "";
  const columns = exportColumns(registry, hook.rows);
  const conventions = conventionsOf(formats, wording);
  /* A tree writes every row of its filtered tree, open or not, with its level
     first: a consumer filtering by level gets a whole level. */
  const { exported, filtered } = registry.projection();
  if (!exported) return asCsv(filtered, columns, conventions);
  const level = new Map(exported.map((e) => [e.node, e.level + 1]));
  const levelColumn: CsvColumn<unknown> = { id: "#level", label: levelLabel, value: (row) => level.get(row) };
  return asCsv(exported.map((e) => e.node), [levelColumn, ...columns], conventions);
}

/** The selected rows within the filtered set, in the export's order - a tree's
    open and closed branches alike, no group line. What lies outside the filter
    stays selected but is not copied. */
export function selectedInOrder(registry: Registry): readonly unknown[] {
  const hook = registry.hook;
  if (!hook) return [];
  const { exported, filtered } = registry.projection();
  const set = exported ? exported.map((e) => e.node) : filtered;
  return hook.selectedRows ?? set.filter((row) => hook.publicSnapshot.selection.isSelected(hook.rowKey(row)));
}

/** What Ctrl+C writes: the selected rows under a header line, tab-separated,
    in the visible columns with the export's values. Empty with no selection. */
export function selectionText(registry: Registry, formats: Formats, wording: Wording): string {
  const hook = registry.hook;
  const rows = selectedInOrder(registry);
  if (!hook || rows.length === 0) return "";
  return asTabbed(rows, exportColumns(registry, hook.rows), conventionsOf(formats, wording));
}

/** One cell as the copy writes it: the export's value in the language's notation. */
export function cellText(entry: ColumnEntry, row: unknown, formats: Formats, wording: Wording): string {
  return valueText(entry, entry.read(row), formats, wording);
}

/** The same for a value that is not (yet) the row's - what an open editor holds. */
export function valueText(entry: ColumnEntry, raw: unknown, formats: Formats, wording: Wording): string {
  const value = exportValue(raw, entry.spec.ownExportValue);
  return value === undefined ? "" : plain(value, conventionsOf(formats, wording));
}
