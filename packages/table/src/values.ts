/* What a value is and how it appears without help from the caller.

   The rules of the spec (A column, the table of defaults) as pure calculation:
   is a value absent, what kind is it, what text stands in the cell, what is
   sorted by, what goes into the export, what into the footer. No React -
   formats and wording arrive as parameters, because only a component can read
   the provider.

   At runtime there are no types any more. The kind of a column is therefore
   read off the first value present - the same question the compiler already
   answered at the call site, asked once more, there where it decides alignment
   and sorting. */

import type { Formats, Wording } from "@umriss-ui/core";

/** The names of the standard presentations of a number. */
export type NumberFormat = "percent" | "count" | { decimals: number };
/** The names of the standard presentations of a point in time. */
export type DateFormat = "date" | "time" | "dateTime";
export type Format = NumberFormat | DateFormat;
export type Footer = "sum" | "avg";

/** The kinds the table tells apart. `other` needs a presentation from the
    caller; `empty` means: not a single value present. */
export type ValueKind = "text" | "number" | "date" | "boolean" | "other" | "empty";

/** A value is absent when it is null, undefined or not a number. Null is a
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
      if (format === "percent") return formats.percent(number);
      if (format === "count") return formats.count(number);
      if (typeof format === "object") return formats.number(number, format.decimals);
      return formats.number(number);
    }
    case "date": {
      const date = value as Date;
      if (format === "date") return formats.date(date);
      if (format === "time") return formats.time(date, false);
      return formats.dateTime(date, false);
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

/* The export follows German conventions, and "ja"/"nein" are data there, not a
   label - lower case, the way a spreadsheet filters them. That is why they
   stand here and not in the wording. */
const EXPORT_YES = "ja";
const EXPORT_NO = "nein";

/** What goes into the export: numbers stay numbers, a point in time becomes an
    ISO timestamp, an absent value an empty field. */
export function exportValue(
  value: unknown,
  own?: (value: never) => unknown,
): string | number | undefined {
  if (isAbsent(value)) return undefined;
  if (own) return exportValue(own(value as never));
  switch (kindOf(value)) {
    case "text":
      return value as string;
    case "number":
      return value as number;
    case "date":
      return (value as Date).toISOString();
    case "boolean":
      return value ? EXPORT_YES : EXPORT_NO;
    default:
      return undefined;
  }
}

/** A sum or an average over the filtered set; absent values do not count
    towards it. Without a single value there is neither of the two - null would
    be a claim. */
export function footerValue<Z>(
  rows: readonly Z[],
  read: (row: Z) => unknown,
  footer: Footer,
): number | undefined {
  let total = 0;
  let count = 0;
  for (const row of rows) {
    const value = read(row);
    if (typeof value !== "number" || Number.isNaN(value)) continue;
    total += value;
    count += 1;
  }
  if (count === 0) return undefined;
  return footer === "sum" ? total : total / count;
}

/** The key of a value in a list filter. Values that are present carry a
    prefix, so that no text can hit the key of the absent value. */
export const ABSENT_KEY = "absent";

export const filterKey = (value: unknown): string => {
  if (isAbsent(value)) return ABSENT_KEY;
  if (value instanceof Date) return `value:${value.getTime()}`;
  return `value:${String(value)}`;
};
