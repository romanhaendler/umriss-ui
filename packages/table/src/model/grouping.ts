/* The grouping pipeline (table-grouping 01): from the sorted filtered set to row
   groups, their aggregates, their order, and the lines a page shows.

   It comes after the sort and before the page: the rows arrive in the order the
   sort levels gave them, and a group keeps that order among its rows. Pure
   calculation, like tableModel - no React, no formats; the text comparison
   arrives as a parameter. The form of a group follows its level and nothing
   else (ADR-0029). */

import { DEFAULT_FORMATS } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import { filterKey, isAbsent } from "../values";
import type { SortLevel } from "./tableModel";

/** One level of the grouping: what a row is grouped by on it. */
export interface GroupLevel<Z> {
  id: string;
  /** The grouping value - the column's value, or what `groupValue` or a date
      period made of it. Absent values form one group of their own. */
  value: (row: Z) => unknown;
  /** Where the groups of a key of one's own stand: by the smallest of this
      over their rows. Bands of a number are named "Small", "Large" and
      must not stand in the alphabet's order. */
  order?: (row: Z) => unknown;
}

/** The built-in aggregates. `range` is for points in time: the earliest and
    the latest. */
export type AggregateKind = "sum" | "avg" | "min" | "max" | "range" | "count" | "distinct";

/** An aggregate of one's own: the values present and the group's rows. */
export type OwnAggregate<Z = never> = (values: readonly unknown[], rows: readonly Z[]) => unknown;

/** A column that carries an aggregate, as the pipeline needs it. */
export interface AggregateColumn<Z> {
  id: string;
  read: (row: Z) => unknown;
  aggregate: AggregateKind | OwnAggregate<Z>;
}

const numeric = (value: unknown): number | undefined =>
  value instanceof Date ? value.getTime() : typeof value === "number" && !Number.isNaN(value) ? value : undefined;

/**
 * What a column's values come to over a set of rows. Absent values count
 * towards nothing; without a single value present a built-in has no result -
 * null would be a claim. Always over rows, never over other aggregates: that
 * is what keeps an average of averages from being written.
 */
export function aggregate<Z>(spec: AggregateColumn<Z>, rows: readonly Z[]): unknown {
  const values = rows.map(spec.read).filter((v) => !isAbsent(v) && !(v instanceof Date && Number.isNaN(v.getTime())));
  const kind = spec.aggregate;
  if (typeof kind === "function") return kind(values, rows);
  if (kind === "count") return values.length;
  if (kind === "distinct") return new Set(values.map(filterKey)).size;
  const present = values.filter((v) => numeric(v) !== undefined);
  if (present.length === 0) return undefined;
  const numbers = present.map((v) => numeric(v)!);
  const dates = present[0] instanceof Date;
  const at = (n: number) => (dates ? new Date(n) : n);
  switch (kind) {
    case "sum":
      return numbers.reduce((a, b) => a + b, 0);
    case "avg":
      return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    case "min":
      return at(Math.min(...numbers));
    case "max":
      return at(Math.max(...numbers));
    case "range":
      return [at(Math.min(...numbers)), at(Math.max(...numbers))];
  }
}

/** A grouping has at most this many levels - as there are at most three sort
    levels; beyond them a table no longer reads. */
export const MOST_LEVELS = 3;

export interface GroupingInput<Z> {
  /** The levels, the outermost first - at most three. */
  levels: readonly GroupLevel<Z>[];
  /** The collation of text keys; the provider's, where there is one. */
  compareText?: (a: string, b: string) => number;
  /** The table's sort levels. A level on a grouped column turns the order of
      its groups; the rows within a group arrive sorted already. */
  sort?: readonly SortLevel[];
  /** The columns that carry an aggregate; every group computes each of them. */
  aggregates?: readonly AggregateColumn<Z>[];
}

/** The rows of the filtered set that share one grouping value on one level. */
export interface RowGroup<Z> {
  /** Identifies the group across renders and in the view: the keys of its
      path, outermost first. */
  path: string;
  /** The grouping value; `undefined` for the group of absent values. */
  value: unknown;
  /** 0 is the outermost level. */
  level: number;
  rows: Z[];
  /** The groups of the next level; empty on the innermost. */
  groups: RowGroup<Z>[];
  /** Per column id, what its aggregate comes to over this group's rows. */
  aggregates: Record<string, unknown>;
}

const comparable = (value: unknown): string | number | undefined => {
  if (isAbsent(value)) return undefined;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value;
  return String(value);
};

function compareKeys(a: unknown, b: unknown, compareText: (a: string, b: string) => number): number {
  const ca = comparable(a);
  const cb = comparable(b);
  if (ca === undefined || cb === undefined) return ca === cb ? 0 : ca === undefined ? 1 : -1;
  return typeof ca === "number" && typeof cb === "number" ? ca - cb : compareText(String(ca), String(cb));
}

export function groupRows<Z>(rows: readonly Z[], input: GroupingInput<Z>): RowGroup<Z>[] {
  const compareText = input.compareText ?? DEFAULT_FORMATS.compareText;

  const divide = (rows: readonly Z[], level: number, parent: readonly string[]): RowGroup<Z>[] => {
    const keys = new Map<RowGroup<Z>, string[]>();
    const spec = input.levels[level];
    if (!spec) return [];
    const byKey = new Map<string, RowGroup<Z>>();
    for (const row of rows) {
      const value = spec.value(row);
      const key = filterKey(value);
      let group = byKey.get(key);
      if (!group) {
        group = {
          path: JSON.stringify([...parent, key]),
          value: isAbsent(value) ? undefined : value,
          level,
          rows: [],
          groups: [],
          aggregates: {},
        };
        byKey.set(key, group);
        keys.set(group, [...parent, key]);
      }
      group.rows.push(row);
    }
    for (const group of byKey.values()) {
      for (const agg of input.aggregates ?? []) group.aggregates[agg.id] = aggregate(agg, group.rows);
    }
    /* The first sort level that speaks about this level decides: one on the
       grouped column orders by the grouping value, one on a column with an
       aggregate by the aggregate. Without one the groups stand ascending. */
    const decisive = input.sort?.find(
      (s) => s.column === spec.id || input.aggregates?.some((a) => a.id === s.column),
    );
    const direction = decisive?.direction === "desc" ? -1 : 1;
    const byAggregate = decisive !== undefined && decisive.column !== spec.id ? decisive.column : undefined;
    const smallest = (group: RowGroup<Z>): unknown => {
      let best: unknown;
      for (const row of group.rows) {
        const value = spec.order!(row);
        if (comparable(value) === undefined) continue;
        if (best === undefined || compareKeys(value, best, compareText) < 0) best = value;
      }
      return best;
    };
    const sortKey = (group: RowGroup<Z>): unknown => {
      if (byAggregate === undefined) return spec.order ? smallest(group) : group.value;
      const value = group.aggregates[byAggregate];
      return Array.isArray(value) ? value[0] : value;
    };
    /* Absence is decided before the direction, as in tableModel: an absent
       group or aggregate stands last either way. */
    const groups = [...byKey.values()].sort((a, b) => {
      if (a.value === undefined || b.value === undefined) return compareKeys(a.value, b.value, compareText);
      const ka = sortKey(a);
      const kb = sortKey(b);
      const order = compareKeys(ka, kb, compareText);
      return comparable(ka) === undefined || comparable(kb) === undefined ? order : order * direction;
    });
    for (const group of groups) {
      group.groups = divide(group.rows, level + 1, keys.get(group)!);
    }
    return groups;
  };

  return divide(rows, 0, []);
}

/** The paths of `folded` that still name a group - a fold outlives neither its
    group nor a change of grouping, as a view's unknown column falls out. */
export function livePaths<Z>(groups: readonly RowGroup<Z>[], folded: readonly string[]): string[] {
  const all = new Set<string>();
  const walk = (groups: readonly RowGroup<Z>[]) => {
    for (const group of groups) {
      all.add(group.path);
      walk(group.groups);
    }
  };
  walk(groups);
  return folded.filter((path) => all.has(path));
}

/* --- Date periods ----------------------------------------------------------------- */

export type DatePeriod = "day" | "week" | "month" | "year";

/** A point in time brought to the start of its day, ISO week (Monday), month
    or year - in local time, as the formats show it. */
export const periodStart =
  (kind: DatePeriod) =>
  (value: unknown): Date | undefined => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return undefined;
    const y = value.getFullYear();
    const m = value.getMonth();
    const d = value.getDate();
    if (kind === "year") return new Date(y, 0, 1);
    if (kind === "month") return new Date(y, m, 1);
    if (kind === "week") return new Date(y, m, d - ((value.getDay() + 6) % 7));
    return new Date(y, m, d);
  };

/** ISO week number of a Monday-started week. */
export function isoWeek(date: Date): { week: number; year: number } {
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 86_400_000 / 7 - ((firstThursday.getDay() + 6) % 7 - 3) / 7);
  return { week, year: thursday.getFullYear() };
}

/** A period's name, as its group shows it: the day's date, "Week 42, 2026",
    the month, the year. Formats and wording arrive as parameters - only a
    component can read the provider. */
export function periodText(period: DatePeriod, start: Date, formats: Formats, wording: Wording): string {
  if (period === "year") return String(start.getFullYear());
  if (period === "month") return formats.month(start);
  if (period === "week") {
    const { week, year } = isoWeek(start);
    return wording.calendarWeek(week, year);
  }
  return formats.date(start);
}

/* --- Lines ------------------------------------------------------------------- */

/** One line of a grouped table. A header heads a group of an outer level; a row
    of the innermost level stands in its span; a folded span is one line. */
export type Line<Z> =
  | {
      kind: "header";
      group: RowGroup<Z>;
      /** The headers around it. */
      parents: readonly RowGroup<Z>[];
      /** Repeated at the top of a page that begins inside the group. */
      continued: boolean;
    }
  | {
      kind: "row";
      row: Z;
      parents: readonly RowGroup<Z>[];
      /** The span the row stands in - the innermost group, when there are
          several levels; a single level has no span, its rows stand under
          their group header. */
      span: RowGroup<Z> | undefined;
      /** The span shows its value on this line: the group's first row, or the
          first of a page that begins inside it. */
      first: boolean;
      continued: boolean;
    }
  | { kind: "folded"; group: RowGroup<Z>; parents: readonly RowGroup<Z>[] };

/**
 * The lines of the groups for a set of folded paths. The form of a group
 * follows its level (ADR-0029): the outermost is always a header, carrying
 * every aggregate; below it, the innermost of several levels is a span, every
 * other a header. A group of one row is a group like any other.
 */
export function linesOf<Z>(groups: readonly RowGroup<Z>[], folded: ReadonlySet<string>): Line<Z>[] {
  const lines: Line<Z>[] = [];
  const walk = (groups: readonly RowGroup<Z>[], parents: readonly RowGroup<Z>[]) => {
    for (const group of groups) {
      const shut = folded.has(group.path);
      if (group.groups.length === 0 && group.level === 0) {
        /* A single level: the header, and its rows plain beneath it. */
        lines.push({ kind: "header", group, parents, continued: false });
        if (!shut) {
          for (const row of group.rows) lines.push({ kind: "row", row, parents: [group], span: undefined, first: false, continued: false });
        }
      } else if (group.groups.length > 0) {
        lines.push({ kind: "header", group, parents, continued: false });
        if (!shut) walk(group.groups, [...parents, group]);
      } else if (shut) {
        lines.push({ kind: "folded", group, parents });
      } else {
        group.rows.forEach((row, i) => lines.push({ kind: "row", row, parents, span: group, first: i === 0, continued: false }));
      }
    }
  };
  walk(groups, []);
  return lines;
}

/**
 * One page of lines. A page counts lines - headers and rows alike; a page that
 * begins inside a group repeats its headers above it, uncounted and marked
 * continued, and its first row shows the span's value again. A size of zero
 * is one page holding everything.
 */
export function pageLines<Z>(
  lines: readonly Line<Z>[],
  page: number,
  size: number,
): { lines: Line<Z>[]; page: number; pageCount: number } {
  const per = size > 0 ? size : lines.length || 1;
  const pageCount = Math.max(1, Math.ceil(lines.length / per));
  const current = Math.min(Math.max(1, page), pageCount);
  const slice = lines.slice((current - 1) * per, current * per);
  return { lines: withContinuation(slice), page: current, pageCount };
}

/** The rows among lines - what a page or a window of lines holds. */
export const rowsOf = <Z,>(lines: readonly Line<Z>[]): Z[] => lines.flatMap((l) => (l.kind === "row" ? [l.row] : []));

/**
 * A run of lines cut out of the middle - a page, a virtual window - with what
 * it begins inside of: the group headers of its first line, uncounted and marked
 * continued, and the span's value again on its first row.
 */
export function withContinuation<Z>(slice: readonly Line<Z>[]): Line<Z>[] {
  const head = slice[0];
  if (!head) return [...slice];
  const repeated: Line<Z>[] = head.parents.map((group, i) => ({
    kind: "header",
    group,
    parents: head.parents.slice(0, i),
    continued: true,
  }));
  const first: Line<Z> = head.kind === "row" && head.span && !head.first ? { ...head, first: true, continued: true } : head;
  return [...repeated, first, ...slice.slice(1)];
}
