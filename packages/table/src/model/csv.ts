/* The table as text a spreadsheet reads back in.

   The function returns text and triggers no download. How the text reaches the
   user - file name, moment, whether a file is made of it at all - only the
   application knows.

   It takes the *filtered* set, not the visible page. That is why it stands
   beside `sum` and not in the presentation: what the user writes out is what
   he filtered, no matter which page he happens to be on.

   The writing rules that are the language's (separator, decimal mark, the
   words for true and false) arrive as `CsvConventions`; the file knows no
   React and no wording. The byte order mark and CRLF stay the spreadsheet's. */

import type { ModelColumn } from "./tableModel";

/** A column of the text: a model column whose value may also be a boolean,
    which the writer gives its words. */
export interface CsvColumn<Z, K extends string = string> extends Omit<ModelColumn<Z, K>, "value"> {
  value?: (row: Z) => string | number | boolean | null | undefined;
}

/** What the language in use decides about the text. */
export interface CsvConventions {
  separator: string;
  decimal: string;
  yes: string;
  no: string;
}

/** The English set, for a writer called without any. */
export const ENGLISH: CsvConventions = { separator: ",", decimal: ".", yes: "yes", no: "no" };

/* CRLF per RFC 4180. */
const LINE_BREAK = "\r\n";

/* Without a byte order mark German Excel opens UTF-8 as Latin-1 and turns
   every umlaut into two characters. */
const BOM = "﻿";

/** A value as text in the language's notation: the decimal mark in place of the
    point, no thousands groups. A thousands mark would be a second separator
    inside the field - readable only by luck. Deliberately without `Intl`: the
    value is meant to be read back exactly, not to look pretty. */
export const plain = (value: string | number | boolean, c: Pick<CsvConventions, "decimal" | "yes" | "no">): string =>
  typeof value === "number" ? String(value).replace(".", c.decimal) : typeof value === "boolean" ? (value ? c.yes : c.no) : value;

/** Quotes only where it is needed. A quotation mark inside the value is
    doubled - otherwise the field ends where it should not. */
const field = (raw: string, separator: string): string =>
  raw.includes(separator) || /["\r\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;

/* A spreadsheet runs text that starts with one of these, after any whitespace, as a formula. A leading
   apostrophe makes it text again; the file no longer reads back exactly. Only
   text is touched - a number or boolean is written by `plain`, so -3 stays. */
const neutral = (raw: string, guard: boolean): string => (guard && /^\s*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw);

const cell = <Z,>(row: Z, column: CsvColumn<Z>, c: CsvConventions, guard: boolean): string => {
  const value = column.value?.(row);
  if (value === undefined || value === null) return "";
  return field(typeof value === "string" ? neutral(value, guard) : plain(value, c), c.separator);
};

const lines = <Z, K extends string>(
  rows: readonly Z[],
  columns: readonly CsvColumn<Z, K>[],
  c: CsvConventions,
  guard: boolean,
): string[] => [
  columns.map((s) => field(neutral(s.label ?? s.id, guard), c.separator)).join(c.separator),
  ...rows.map((row) => columns.map((s) => cell(row, s, c, guard)).join(c.separator)),
];

/**
 * Writes rows and columns as separator-separated text.
 *
 * Columns without a `value` yield a column of empty fields - a selection or
 * trend column does not belong in the export. Whoever passes the visible
 * columns through sifts them beforehand.
 *
 * @param rows        the filtered set - `projection.filtered`, not `projection.visible`
 * @param columns     the columns to write, in their order
 * @param conventions the language's separator, decimal mark and words for true and false
 */
export function asCsv<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly CsvColumn<Z, K>[],
  conventions: CsvConventions = ENGLISH,
): string {
  return BOM + lines(rows, columns, conventions, true).join(LINE_BREAK);
}

/** The same rows as text for the clipboard: tabs between fields, a line break
    between lines, no byte order mark and no trailing break. A field holding a
    tab, a line break or a quotation mark is quoted, as spreadsheets paste it. */
export function asTabbed<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly CsvColumn<Z, K>[],
  conventions: Omit<CsvConventions, "separator"> = ENGLISH,
): string {
  return lines(rows, columns, { ...conventions, separator: "\t" }, false).join("\n");
}
