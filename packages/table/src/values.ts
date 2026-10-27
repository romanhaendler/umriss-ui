/* What a value is and how it appears without help from the caller.

   The rules of the spec (A column, the table of defaults) as pure calculation:
   is a value absent, what kind is it, what text stands in the cell, what is
   sorted by, what goes into the export. No React -
   formats and wording arrive as parameters, because only a component can read
   the provider.

   At runtime there are no types any more. The kind of a column is therefore
   read off the first value present - the same question the compiler already
   answered at the call site, asked once more, there where it decides alignment
   and sorting. */

import { writeNumber } from "@umriss-ui/core";
import type { Formats, NumberFormat, Wording } from "@umriss-ui/core";

/** The names of the standard presentations of a point in time, with the English
    text of 17 March 2026 at 09:05:03 for each:
    - `"date"`: "17/03/2026"
    - `"time"`: "09:05"
    - `"dateTime"`: "17/03/2026, 09:05"
    - `"timeWithSeconds"`: "09:05:03"
    - `"dateTimeWithSeconds"`: "17/03/2026, 09:05:03"
    German formats write the same with "17.03.2026". */
export type DateFormat = "date" | "time" | "dateTime" | "timeWithSeconds" | "dateTimeWithSeconds";
export type Format = NumberFormat | DateFormat;

const DATE_FORMATS: ReadonlySet<unknown> = new Set<unknown>(["date", "time", "dateTime", "timeWithSeconds", "dateTimeWithSeconds"]);
/** Whether a format names a point in time. */
export const isDateFormat = (format: unknown): format is DateFormat => DATE_FORMATS.has(format);

/** The kinds the table tells apart. `other` needs a presentation from the
    caller; `empty` means: not a single value present. */
export type ValueKind = "text" | "number" | "date" | "boolean" | "other" | "empty";

/** A value is absent when it is null, undefined or not a number. Zero is a
    value, and so is the empty string. */
export const isAbsent = (value: unknown): value is null | undefined =>
  value === null || value === undefined || (typeof value === "number" && Number.isNaN(value));

export function kindOf(value: unknown): ValueKind {
  if (isAbsent(value)) return "empty";
  if (typeof value === "string") return "text";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "empty" : "date";
  return "other";
}

/** The kind of a column: that of the first value present. */
export function columnKind<Z>(rows: readonly Z[], read: (row: Z) => unknown): ValueKind {
  for (const row of rows) {
    const kind = kindOf(read(row));
    if (kind !== "empty") return kind;
  }
  return "empty";
}

/** Right-aligned with tabular figures - for numbers, or where the caller says
    so. */
export const isRightAligned = (kind: ValueKind, numeric: boolean | undefined): boolean =>
  numeric ?? kind === "number";

/**
 * The text a cell shows without `children`, or null for a kind that cannot
 * show itself as text. An absent value never arrives here.
 */
export function asText(
  value: unknown,
  format: Format | undefined,
  formats: Formats,
  wording: Wording,
): string | null {
  switch (kindOf(value)) {
    case "text":
      return value as string;
    case "number": {
      const number = value as number;
      // A date name on a number writes as no format does.
      const own = isDateFormat(format) ? undefined : format;
      return writeNumber(formats, number, own);
    }
    case "date": {
      // The one mapping from a date format's name to its text; every writer of a date column reads it here.
      const date = value as Date;
      switch (format) {
        case "date":
          return formats.date(date);
        case "time":
          return formats.time(date, false);
        case "timeWithSeconds":
          return formats.time(date, true);
        case "dateTimeWithSeconds":
          return formats.dateTime(date, true);
        default:
          return formats.dateTime(date, false);
      }
    }
    case "boolean":
      return value ? wording.booleanYes : wording.booleanNo;
    default:
      return null;
  }
}

/** What is sorted by. Absent stays absent - the model puts it at the end in
    both directions. False before true. */
export function sortValue(
  value: unknown,
  own?: (value: never) => unknown,
): string | number | undefined {
  if (isAbsent(value)) return undefined;
  if (own) return sortValue(own(value as never));
  switch (kindOf(value)) {
    case "text":
      return value as string;
    case "number":
      return value as number;
    case "date":
      return (value as Date).getTime();
    case "boolean":
      return value ? 1 : 0;
    default:
      return undefined;
  }
}

/** What a spreadsheet cell holds: numbers, booleans and points in time stay
    what they are, an absent value is `undefined`. */
export type ExportCell = string | number | boolean | Date | undefined;

/** What goes into the export, typed: the value itself - a date stays a `Date` -
    for a format that writes types. */
export function exportCell(value: unknown, own?: (value: never) => unknown): ExportCell {
  if (isAbsent(value)) return undefined;
  if (own) return exportCell(own(value as never));
  switch (kindOf(value)) {
    case "text":
    case "number":
    case "boolean":
    case "date":
      return value as ExportCell;
    default:
      return undefined;
  }
}

/** What goes into text - the copy and the CSV: numbers and booleans stay what
    they are - the writer gives them the language's notation (`model/csv.ts`) -
    a point in time becomes an ISO timestamp, an absent value an empty field. */
export function exportValue(
  value: unknown,
  own?: (value: never) => unknown,
): string | number | boolean | undefined {
  const cell = exportCell(value, own);
  return cell instanceof Date ? cell.toISOString() : cell;
}

/** The key of a value in a list filter. Values that are present carry a
    prefix, so that no text can hit the key of the absent value. */
export const ABSENT_KEY = "absent";

export const filterKey = (value: unknown): string => {
  if (isAbsent(value)) return ABSENT_KEY;
  if (value instanceof Date) return `value:${value.getTime()}`;
  return `value:${String(value)}`;
};
