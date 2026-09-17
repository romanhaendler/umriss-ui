/* The table as text a spreadsheet reads back in.

   Two decisions sit in here, and both are deliberate:

   The function returns text and triggers no download. How the text reaches the
   user - file name, moment, whether a file is made of it at all - only the
   application knows.

   It takes the *filtered* set, not the visible page. That is why it stands
   beside `sum` and not in the presentation: what the user writes out is what
   he filtered, no matter which page he happens to be on. */

import type { Column } from "./tableModel";

/* A semicolon, because the comma is taken as the decimal separator - German
   Excel expects exactly this. CRLF per RFC 4180. */
const SEPARATOR = ";";
const LINE_BREAK = "\r\n";

/* Without a byte order mark German Excel opens UTF-8 as Latin-1 and turns
   every umlaut into two characters. */
const BOM = "﻿";

/** Numbers in German notation: a decimal comma, no thousands groups. A
    thousands dot would be a second separator inside the field - readable
    only by luck. Deliberately without `Intl`: the value is meant to be read
    back exactly, not to look pretty. */
const asNumber = (value: number): string => String(value).replace(".", ",");

/** Quotes only where it is needed. A quotation mark inside the value is
    doubled - otherwise the field ends where it should not. */
const field = (raw: string): string =>
  /[";\r\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;

const cell = <Z,>(row: Z, column: Column<Z>): string => {
  const value = column.value?.(row);
  if (value === undefined || value === null) return "";
  return field(typeof value === "number" ? asNumber(value) : String(value));
};

/**
 * Writes rows and columns as separator-separated text.
 *
 * Columns without a `value` yield a column of empty fields - a selection or
 * trend column does not belong in the export. Whoever passes the visible
 * columns through sifts them beforehand.
 *
 * @param rows    the filtered set - `projection.filtered`, not `projection.visible`
 * @param columns the columns to write, in their order
 */
export function asCsv<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly Column<Z, K>[],
): string {
  const header = columns.map((s) => field(s.label ?? s.id)).join(SEPARATOR);
  const body = rows.map((row) => columns.map((s) => cell(row, s)).join(SEPARATOR));
  return BOM + [header, ...body].join(LINE_BREAK);
}
