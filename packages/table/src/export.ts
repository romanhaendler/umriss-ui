/* The export of a table: the filtered set in the visible columns, in the order
   the user sees, with the values and not with their presentation. The writing
   rules belong to asCsv; the language's part of them (separator, decimal mark,
   words for true and false) is built here from the formats and the wording. */

import { separatorsOf } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import { allDays, dayText } from "./model/day";
import { asCsv, asTabbed, plain } from "./model/csv";
import type { CsvColumn, CsvConventions } from "./model/csv";
import { DEV, warnOnce } from "./dev";
import type { Registry, ColumnEntry } from "./registry";
import type { RowGroup } from "./model/grouping";
import type { ExportFormat, ExportSheet, RowKey, TableSnapshot } from "./types";
import { exportCell, exportValue } from "./values";
import type { ExportCell } from "./values";

/** A column's name in a file: under its group, "<group> · <column>". */
const exportLabel = (e: ColumnEntry): string => {
  const label = e.spec.label || e.spec.id;
  return e.spec.heading ? `${e.spec.heading.label} · ${label}` : label;
};

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
export function resetSearchAndFilters(snapshot: TableSnapshot<unknown, RowKey>) {
  snapshot.setSearch("");
  for (const id of Object.keys(snapshot.filter)) snapshot.setFilter(id, null);
}

/** The three conventions the language decides: the decimal mark is the
    formats' (as `NumberInput` reads its own output), the separator
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
function exportColumns(registry: Registry, rows: readonly unknown[]): ColumnEntry[] {
  return visibleColumns(registry).filter((e) => {
    /* A value without a text form and without an export path of its own does not belong in a spreadsheet - a
       column full of "[object Object]" is not one. A column is judged by what it can write: its own
       `exportValue`, a declared format, or any row holding a value with a text form; the cells that have none
       are written empty. */
    const writes = !!e.spec.ownExportValue || e.spec.format !== undefined || rows.some((row) => exportCell(e.read(row)) !== undefined);
    if (DEV && !writes && registry.kindOf(e, rows) === "other") {
      warnOnce(`export-other:${e.spec.id}`, `The column "${e.spec.id}" holds values the export cannot write (objects), so it is left out of the file and the copy. Give it \`exportValue\` to say what it writes.`);
    }
    if (DEV && writes && !e.spec.label) {
      warnOnce(`export-label:${e.spec.id}`, `The column "${e.spec.id}" has no label, so its export header is the id. Give it a \`label\`.`);
    }
    return writes;
  });
}

/** Whether a column writes its dates as the zone's day: what the screen shows (`shownFormat`), so that a column's
    format, not the rows that happen to be exported, decides. */
const writesDays = (registry: Registry, e: ColumnEntry): boolean => {
  const hook = registry.hook;
  return !!hook && !e.spec.ownExportValue && registry.shownFormat(e, hook.rows, hook.formats.timeZone) === "date";
};

/** How a column writes a date: the zone's day for a column of days (`day`; unset: when every date of the column
    is a day), ISO text otherwise - and as ISO text always where the column's own `exportValue` made the value,
    which is written as it comes. */
const dateWriter = (cells: Iterable<unknown>, day: boolean | undefined, own: boolean, timeZone: string | undefined) => {
  const days = !own && (day ?? allDays(cells, timeZone));
  return (cell: ExportCell) => (cell instanceof Date ? (days ? dayText(cell, timeZone) : cell.toISOString()) : cell);
};

const csvColumn = (registry: Registry, e: ColumnEntry, timeZone: string | undefined): CsvColumn<unknown> => {
  const write = dateWriter([], writesDays(registry, e), !!e.spec.ownExportValue, timeZone);
  return {
    id: e.spec.id,
    label: exportLabel(e),
    value: (row) => write(exportCell(e.read(row), e.spec.ownExportValue)),
  };
};

/** The rows of the filtered set in the order the groups show them - a folded group's rows too, no group line.
    Without a grouping, the filtered set as it is. */
const inGroupOrder = (registry: Registry, filtered: readonly unknown[]): readonly unknown[] => {
  const { groups } = registry.projection();
  const leaves = (gs: readonly RowGroup<unknown>[]): unknown[] => gs.flatMap((g) => (g.groups.length ? leaves(g.groups) : g.rows));
  return groups ? leaves(groups) : filtered;
};

/** The filtered set in the visible columns as typed cells, with the widths the
    table holds. A tree writes every row of its filtered tree, open or not, with
    its level first: a consumer filtering by level gets a whole level. With
    `given` rows, those instead of the filtered set. */
export function sheetOf(registry: Registry, levelLabel: string, given?: readonly unknown[]): ExportSheet {
  const hook = registry.hook;
  if (!hook) return { columns: [], rows: [] };
  const entries = exportColumns(registry, given ?? hook.rows);
  const { widths } = hook.publicSnapshot;
  const columns: { label: string; width?: number; own?: true; day?: boolean }[] = entries.map((e) => ({
    label: exportLabel(e),
    width: widths[e.spec.id],
    ...(e.spec.ownExportValue && { own: true as const }),
    day: writesDays(registry, e),
  }));
  const cells = (row: unknown) => entries.map((e) => exportCell(e.read(row), e.spec.ownExportValue));
  /* Rows handed in (every match of a server) are written as they are. */
  if (given) return { columns, rows: given.map(cells) };
  const { exported, filtered } = registry.projection();
  if (!exported) return { columns, rows: inGroupOrder(registry, filtered).map(cells) };
  return {
    columns: [{ label: levelLabel }, ...columns],
    rows: exported.map((e) => [e.level + 1, ...cells(e.node)]),
  };
}

/** The CSV: the language's conventions; a column of days as the zone's day,
    other points in time as ISO text. */
export const csv: ExportFormat = {
  extension: "csv",
  mime: "text/csv;charset=utf-8",
  write: (sheet, { formats, wording }) =>
    asCsv(
      sheet.rows,
      sheet.columns.map((c, i): CsvColumn<readonly ExportCell[]> => {
        const write = dateWriter(sheet.rows.map((row) => row[i]), c.day, !!c.own, formats.timeZone);
        return { id: String(i), label: c.label, value: (row) => write(row[i]) };
      }),
      conventionsOf(formats, wording),
    ),
};

/** The selected rows within the filtered set, in the export's order - a tree's
    open and closed branches alike, no group line. What lies outside the filter
    stays selected but is not copied. */
export function selectedInOrder(registry: Registry): readonly unknown[] {
  const hook = registry.hook;
  if (!hook) return [];
  const { exported, filtered } = registry.projection();
  const set = exported ? exported.map((e) => e.node) : inGroupOrder(registry, filtered);
  return hook.selectedRows ?? set.filter((row) => hook.publicSnapshot.selection.isSelected(hook.rowKey(row)));
}

/** What Ctrl+C writes: the selected rows under a header line, tab-separated,
    in the visible columns with the export's values. Empty with no selection. */
export function selectionText(registry: Registry, formats: Formats, wording: Wording): string {
  const hook = registry.hook;
  const rows = selectedInOrder(registry);
  if (!hook || rows.length === 0) return "";
  const columns = exportColumns(registry, hook.rows).map((e) => csvColumn(registry, e, formats.timeZone));
  /* A tree's copy carries the level first, as its export does. */
  const { exported } = registry.projection();
  if (exported) {
    const levels = new Map<unknown, number>(exported.map((e) => [e.node, e.level + 1]));
    columns.unshift({ id: "level", label: wording.levelColumn, value: (row) => levels.get(row) });
  }
  return asTabbed(rows, columns, conventionsOf(formats, wording));
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

/** A name that is safe to give `a.download`: no path, control characters or
    characters Windows refuses, no leading dots, no device name (`CON`, `NUL`,
    `COM1`...). What is left empty or reserved becomes the fallback. */
export function safeFileName(name: string, fallback: string): string {
  const clean = name
    .replace(/[\u0000-\u001f\u007f-\u009f\\/:*?"<>|]/g, "_")
    .replace(/^[.\s]+|[.\s]+$/g, "");
  const stem = clean.split(".")[0]!.toUpperCase();
  return clean === "" || /^(CON|PRN|AUX|NUL|COM\d|LPT\d)$/.test(stem) ? fallback : clean;
}
