/* An aggregate as it is written, and an absent value as it is shown - shared
   by the footer, the group headers and the folded spans. */

import type { ReactNode } from "react";
import { VisuallyHidden, zoneFields } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import { aggregate } from "./model/grouping";
import type { AggregateColumn } from "./model/grouping";
import type { ColumnEntry } from "./registry";
import { asText, columnKind, isAbsent } from "./values";
import styles from "./Table.module.css";

/* An absent value: visibly a muted dash, read out a word. */
export function Absent({ wording }: { wording: Wording }) {
  return (
    <>
      <span aria-hidden="true" className={styles.absent}>
        —
      </span>
      <VisuallyHidden>{wording.cellAbsentValue}</VisuallyHidden>
    </>
  );
}

/* The sign before a footer aggregate, where the kind has one. A count, a range
   or an aggregate of one's own speaks only through its word. */
const AGGREGATE_SIGN: Partial<Record<string, string>> = { sum: "Σ", avg: "⌀", min: "min", max: "max" };

const aggregateWord = (kind: string, wording: Wording): string =>
  ({
    sum: wording.footerSum,
    avg: wording.footerAverage,
    min: wording.footerMinimum,
    max: wording.footerMaximum,
    range: wording.footerRange,
    count: wording.footerCount,
    distinct: wording.footerDistinct,
  })[kind] ?? wording.footerAggregate;

/* What a column's aggregate comes to over a set of rows, its decimals and
   whether its column is numeric - computed once per set of rows. The key is
   the rows array of the projection (or of a group), which keeps its identity
   until the rows change, so a render that changes nothing reads it back. A
   column whose `value` is another function reads other values from the same
   rows, so the function is part of what is compared. */
interface Summary {
  spec: unknown;
  reader: unknown;
  aligned: boolean | undefined;
  value: unknown;
  places: number;
  numeric: boolean;
}
const summaries = new WeakMap<readonly unknown[], Map<ColumnEntry, Summary>>();

function summaryOf(entry: ColumnEntry, rows: readonly unknown[], known?: { value: unknown }): Summary {
  const spec = entry.spec.aggregate;
  let byEntry = summaries.get(rows);
  if (!byEntry) summaries.set(rows, (byEntry = new Map()));
  const hit = byEntry.get(entry);
  const reader = entry.spec.value;
  const aligned = entry.spec.rightAligned;
  /* A value the group already holds is the aggregate of these same rows, so
     it needs no comparison: what is held for the rows stands for it. */
  if (hit && hit.spec === spec && hit.reader === reader && hit.aligned === aligned) return hit;
  const value = known
    ? known.value
    : aggregate({ id: entry.spec.id, read: entry.read, aggregate: spec as AggregateColumn<unknown>["aggregate"] }, rows);
  let places = 0;
  /* Found whatever the column's format is, so that what is held does not
     depend on a format that may change while the rows stay. */
  if ((spec === "sum" || spec === "avg") && typeof value === "number") {
    for (const row of rows) {
      const read = entry.read(row);
      if (isFiniteNumber(read)) places = Math.max(places, decimalsOf(read));
    }
  }
  const numeric = spec === "count" || spec === "distinct" || (aligned ?? columnKind(rows, entry.read) === "number");
  const made = { spec, reader, aligned, value, places, numeric };
  byEntry.set(entry, made);
  return made;
}

/** What a column's aggregate comes to over rows, written: counts as counts, a
    range from its two ends, the rest in the column's format - and an aggregate
    of one's own through the column's presentation. */
export function AggregateValue({
  entry,
  rows,
  formats,
  wording,
  signed = false,
  known,
  given,
}: {
  entry: ColumnEntry;
  rows: readonly unknown[];
  formats: Formats;
  wording: Wording;
  /** With the sign and the word for the screen reader - the footer. */
  signed?: boolean;
  /** The value the rows' group already holds - not computed again. */
  known?: { value: unknown };
  /** A value computed elsewhere (the server) for rows the table does not hold. */
  given?: { value: unknown };
}) {
  const { aggregate: spec, format, presentation } = entry.spec;
  if (!spec) return null;
  const kind = typeof spec === "function" ? "own" : spec;
  /* A range handed in that is not a pair is read as absent. */
  const handed = kind === "range" && !(Array.isArray(given?.value) && given.value.length === 2) ? undefined : given?.value;
  const { value, places } = given
    ? { value: handed, places: typeof handed === "number" ? decimalsOf(handed) : 0 }
    : summaryOf(entry, rows, known);
  const text = (v: unknown) => asText(v, format, formats, wording);
  let content: ReactNode;
  if (isAbsent(value)) content = <Absent wording={wording} />;
  else if ((kind === "sum" || kind === "avg") && format === undefined && typeof value === "number") {
    /* Computed, so its trailing digits are arithmetic: a sum keeps the
       decimals of its most precise value, an average one more - whole hours
       average to tenths, not to 13.3333333333. A fixed count, so that the
       totals of a column stand aligned on the point. */
    content = formats.number(value, Math.min(10, kind === "avg" && !given ? places + 1 : places));
  }
  else if (kind === "range" && format === "date" && sameYear(value as [unknown, unknown])) {
    /* The year once: "02/10–14/10" says as much as the long form within one
       year, and a group header has no room for the repetition. */
    const [from, to] = value as [Date, Date];
    content = from.getTime() === to.getTime() ? formats.date(from) : wording.rangeFromTo(formats.dateShort(from), formats.dateShort(to));
  }
  else if (kind === "count" || kind === "distinct") content = formats.count(value as number);
  else if (kind === "range") {
    const [from, to] = value as [unknown, unknown];
    content = text(from) === text(to) ? text(from) : wording.rangeFromTo(text(from) ?? "", text(to) ?? "");
  } else if (kind === "own" && presentation) content = (presentation as (w: unknown, z: unknown) => ReactNode)(value, rows[0]);
  else content = text(value);
  const sign = AGGREGATE_SIGN[kind];
  return (
    <>
      {signed && sign && (
        <span aria-hidden="true" className={styles.footerKind}>
          {sign}
        </span>
      )}
      {signed && <VisuallyHidden>{aggregateWord(kind, wording)} </VisuallyHidden>}
      {content}
    </>
  );
}


const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/** The decimals a number carries as written: 0.25 has two, 1234.5 one, 12
    none - read from its exponent form, which also says it for 1e-7. */
const decimalsOf = (n: number): number => {
  const [mantissa = "", exponent = "0"] = n.toExponential().split("e");
  return Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent));
};

const sameYear = ([from, to]: [unknown, unknown]): boolean =>
  from instanceof Date && to instanceof Date && zoneFields(from, undefined).year === zoneFields(to, undefined).year;

/** Whether an aggregate stands right-aligned in tabular figures: counts and
    numbers do, a point in time or a range of them follows its column. */
export function aggregateIsNumeric(entry: ColumnEntry, rows: readonly unknown[], known?: { value: unknown }): boolean {
  if (!entry.spec.aggregate) return false;
  return summaryOf(entry, rows, known).numeric;
}
