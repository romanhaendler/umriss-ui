/* Column filters (table-filters 03): one interface for the list filter, the
   range filter and an application's filter of its own.

   A filter is bound to a value type, not to a row kind - like `column<P>()` to
   a property. It says three things: whether a value satisfies a condition
   (`matches`), how one chooses it (`Input`) and what it is called in the table
   toolbar (`describe`). Everything else - the panel and its footer, the
   counting, the resetting, the view - belongs to the table, the same for every
   filter.

   The built-in filters go through the same door. What they know beyond that -
   that an absent value is a choice in the list filter, which formats the
   provider writes with - stands in an extension that is not part of the
   interface. */

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Checkbox, DateRangePicker, FormField, NumberInput, useFormats, useWording } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import type { Present } from "./types";
import { asText, ABSENT_KEY, filterKey, isAbsent } from "./values";
import type { Format, ValueKind } from "./values";
import styles from "./Table.module.css";

/* --- The interface ----------------------------------------------------------- */

export interface FilterInputProps<W, B> {
  /** The condition that holds right now; `null` as long as the filter requires nothing. */
  condition: B | null;
  /** Sets the condition; `null` lifts it. */
  setCondition: (condition: B | null) => void;
  /** The values that occur in the rows the pre-filter admits – each one once,
      ordered, without the absent one. */
  values: readonly Present<W>[];
  /** The column whose filter this is. */
  column: { id: string; label: string };
}

export interface ColumnFilter<W, B> {
  /** Whether a value that is present satisfies the condition. Never called for
      an absent value: that satisfies none. */
  matches: (value: Present<W>, condition: B) => boolean;
  /** What stands in the filter's panel. The footer with "reset" and "done" the
      table puts underneath it. */
  Input: ComponentType<FilterInputProps<W, B>>;
  /** The text of the condition in the table toolbar, behind the column's name. */
  describe: (condition: B) => string;
}

/** A filter for columns with values of type `W` and conditions of type `B`.
    The compiler accepts it at every column whose value fits, and rejects it
    otherwise. Create it outside the component, like a preset. */
export function columnFilter<W, B>(definition: ColumnFilter<W, B>): ColumnFilter<W, B> {
  return definition;
}

/* --- What the table does with a filter ------------------------------------------ */

type Filter = ColumnFilter<unknown, unknown>;

/** What a column gets as `filter`. */
export type FilterSpec = "list" | "range" | Filter;

/** What the description of a condition knows about its column. */
export interface FilterEnv {
  formats: Formats;
  wording: Wording;
  format: Format | undefined;
  kind: ValueKind;
}

/** What a built-in filter knows beyond the interface. */
interface BuiltIn<B> {
  /** Whether a condition set from outside is of its kind. */
  isCondition: (condition: unknown) => condition is B;
  /** Whether it requires nothing - it is then lifted instead of set. */
  isEmpty: (condition: B) => boolean;
  /** Whether an absent value matches. */
  absentMatches: (condition: B) => boolean;
  /** `describe`, with the provider's formats and wording. */
  describeIn: (condition: B, env: FilterEnv) => string;
}

const BUILT_IN = new WeakMap<object, BuiltIn<unknown>>();

function builtIn<B>(filter: ColumnFilter<unknown, B>, more: BuiltIn<B>): Filter {
  BUILT_IN.set(filter, more as BuiltIn<unknown>);
  return filter as Filter;
}

export const isBuiltIn = (filter: Filter): boolean => BUILT_IN.has(filter);

/** The filter behind a spec, or none. */
export function filterOf(spec: FilterSpec | undefined): Filter | undefined {
  if (spec === "list") return LIST;
  if (spec === "range") return RANGE;
  return typeof spec === "object" && spec !== null ? spec : undefined;
}

/** `effective` requires something, `empty` requires nothing, `foreign` is not of
    the filter's kind. The table does not look inside a filter of one's own: it
    takes any condition except null. */
export function checkCondition(filter: Filter, condition: unknown): "effective" | "empty" | "foreign" {
  if (condition === null || condition === undefined) return "empty";
  const more = BUILT_IN.get(filter);
  if (!more) return "effective";
  if (!more.isCondition(condition)) return "foreign";
  return more.isEmpty(condition) ? "empty" : "effective";
}

/** Whether a value satisfies an effective condition. */
export function satisfies(filter: Filter, value: unknown, condition: unknown): boolean {
  if (isAbsent(value)) return BUILT_IN.get(filter)?.absentMatches(condition) ?? false;
  return filter.matches(value, condition);
}

/** The text of an effective condition, without the column's name. */
export function description(filter: Filter, condition: unknown, env: FilterEnv): string {
  const more = BUILT_IN.get(filter);
  return more ? more.describeIn(condition, env) : filter.describe(condition);
}

/* A number to order by - for numbers and points in time. Text is ordered by the
   provider's comparison. */
const orderValue = (value: unknown): number | undefined =>
  value instanceof Date ? value.getTime() : typeof value === "number" ? value : undefined;

/** Numbers and points in time by their value, everything else by the text it
    shows - with the provider's comparison. The same order for the values of a
    column and for the options the list filter makes of them. */
const byValueOrText =
  (formats: Formats) =>
  (a: { value: unknown; text: string }, b: { value: unknown; text: string }): number => {
    const x = orderValue(a.value);
    const y = orderValue(b.value);
    return x !== undefined && y !== undefined ? x - y : formats.compareText(a.text, b.text);
  };

/** The values of a column in the given rows: each one once, ordered, and
    whether an absent one occurs. Points in time are equal when their time is
    equal; objects only when they are the same. */
export function occurringValues(
  rows: readonly unknown[],
  read: (row: unknown) => unknown,
  formats: Formats,
): { values: readonly unknown[]; absent: boolean } {
  const seen = new Map<unknown, unknown>();
  let absent = false;
  for (const row of rows) {
    const value = read(row);
    if (isAbsent(value)) {
      absent = true;
      continue;
    }
    const key =
      value instanceof Date
        ? `date:${value.getTime()}`
        : typeof value === "object" || typeof value === "function"
          ? value
          : `${typeof value}:${String(value)}`;
    if (!seen.has(key)) seen.set(key, value);
  }
  const values = [...seen.values()]
    .map((value) => ({ value, text: String(value) }))
    .sort(byValueOrText(formats))
    .map(({ value }) => value);
  return { values, absent };
}

/* --- The list filter ------------------------------------------------------------ */

/* Its condition is the chosen values themselves, an absent one as `null`. The
   comparison goes through the filter key - that way a point in time is equal to
   another one with the same time. */
const KEYS = new WeakMap<readonly unknown[], ReadonlySet<string>>();

function keysOf(list: readonly unknown[]): ReadonlySet<string> {
  let set = KEYS.get(list);
  if (!set) {
    set = new Set(list.map(filterKey));
    KEYS.set(list, set);
  }
  return set;
}

const valueText = (value: unknown, env: Omit<FilterEnv, "kind">): string =>
  isAbsent(value)
    ? env.wording.cellAbsentValue
    : (asText(value, env.format, env.formats, env.wording) ?? String(value));

/** What only the table hands a built-in filter. */
export interface BuiltInEnv {
  absentOccurs?: boolean;
  format?: Format;
  kind?: ValueKind;
}

function ListInput({
  condition,
  setCondition,
  values,
  absentOccurs = false,
  format,
}: FilterInputProps<unknown, readonly unknown[]> & BuiltInEnv) {
  const formats = useFormats();
  const wording = useWording();
  const selected = useMemo(() => condition ?? [], [condition]);

  /* What is offered is what occurs in the admitted rows - not only in the
     filtered ones, otherwise an option would vanish the moment one deselects
     it - and in addition what is selected and does not occur: otherwise it
     could no longer be deselected here. */
  const options = useMemo(() => {
    const env = { formats, wording, format };
    const present = values.map((value) => ({ key: filterKey(value), text: valueText(value, env), value }));
    present.sort(byValueOrText(formats));
    const known = new Set(present.map((o) => o.key));
    const foreign = selected
      .filter((value) => !isAbsent(value) && !known.has(filterKey(value)))
      .map((value) => ({ key: filterKey(value), text: valueText(value, env), value }));
    const withoutValue =
      absentOccurs || selected.some(isAbsent)
        ? [{ key: ABSENT_KEY, text: wording.cellAbsentValue, value: null }]
        : [];
    return [...present, ...foreign, ...withoutValue];
  }, [values, selected, absentOccurs, format, formats, wording]);

  const keys = keysOf(selected);
  const toggle = (option: { key: string; value: unknown }) => {
    const next = keys.has(option.key)
      ? selected.filter((value) => filterKey(value) !== option.key)
      : [...selected, option.value];
    setCondition(next.length > 0 ? next : null);
  };

  return (
    <div className={styles.filterContent}>
      {options.map((option) => (
        <Checkbox
          key={option.key}
          label={option.text}
          checked={keys.has(option.key)}
          onChange={() => toggle(option)}
        />
      ))}
    </div>
  );
}

const LIST = builtIn<readonly unknown[]>(
  columnFilter<unknown, readonly unknown[]>({
    matches: (value, condition) => keysOf(condition).has(filterKey(value)),
    Input: ListInput,
    describe: (condition) => condition.map((value) => (isAbsent(value) ? "–" : String(value))).join(", "),
  }),
  {
    isCondition: (condition): condition is readonly unknown[] => Array.isArray(condition),
    isEmpty: (condition) => condition.length === 0,
    absentMatches: (condition) => keysOf(condition).has(ABSENT_KEY),
    /* From three values on the first two and how many more: a condition is one
       line in the table toolbar, not a list. */
    describeIn: (condition, env) => {
      const texts = condition.map((value) => valueText(value, env));
      if (texts.length <= 2) return texts.join(", ");
      const rest = texts.length - 2;
      return `${texts.slice(0, 2).join(", ")} ${env.wording.moreValues(rest, env.formats.count(rest))}`;
    },
  },
);

/* --- The range filter ----------------------------------------------------------- */

/* Its condition is two bounds, both inclusive, each may stay open. An absent
   value never matches: "between 100 and 500" says nothing about an amount
   nobody knows.

   For points in time the bounds are calendar days in local time - `to` 30.09.
   includes the whole day. A value with a time of day is read against these day
   boundaries, and a bound with a time of day counts as its day: otherwise an
   appointment at 23:45 would fall out of a period the user dragged up to that
   day. */

/** The condition of a range filter. */
export interface Range {
  from?: number | Date;
  to?: number | Date;
}

const dayStart = (day: Date): number => new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
const nextDay = (day: Date): number =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

/** The lower bound as a number - for a point in time the start of its day. */
const lowerBound = (bound: number | Date | undefined): number | undefined =>
  isDate(bound) ? dayStart(bound) : isNumber(bound) ? bound : undefined;

/** The upper bound, read exclusively: for a point in time the start of the
    following day, for a number the number itself (then inclusive). */
const upperBound = (bound: number | Date | undefined): { value: number; open: boolean } | undefined =>
  isDate(bound)
    ? { value: nextDay(bound), open: true }
    : isNumber(bound)
      ? { value: bound, open: false }
      : undefined;

const boundText = (bound: number | Date, env: FilterEnv): string =>
  isDate(bound) ? env.formats.date(bound) : (asText(bound, env.format, env.formats, env.wording) ?? String(bound));

function NumberRangeInput({ condition, setCondition }: FilterInputProps<unknown, Range>) {
  const wording = useWording();
  /* The draft stands only as long as it is invalid: what holds stands in the
     condition, and that stays the last valid one. */
  const [draft, setDraft] = useState<{ from: number | null; to: number | null } | null>(null);
  const invalid = draft !== null;
  const from = draft ? draft.from : (isNumber(condition?.from) ? condition.from : null);
  const to = draft ? draft.to : (isNumber(condition?.to) ? condition.to : null);

  const change = (field: "from" | "to", value: number | null) => {
    const next = { from, to, [field]: value };
    if (next.from !== null && next.to !== null && next.from > next.to) {
      setDraft(next);
      return;
    }
    setDraft(null);
    if (next.from === null && next.to === null) {
      setCondition(null);
      return;
    }
    setCondition({
      ...(next.from !== null ? { from: next.from } : {}),
      ...(next.to !== null ? { to: next.to } : {}),
    });
  };

  return (
    <div className={styles.rangeFields}>
      <FormField label={wording.filterFrom}>
        <NumberInput size="sm" value={from} invalid={invalid} onChange={(value) => change("from", value)} />
      </FormField>
      <FormField label={wording.filterTo} error={invalid ? wording.rangeInvalid : undefined}>
        <NumberInput size="sm" value={to} onChange={(value) => change("to", value)} />
      </FormField>
    </div>
  );
}

function PeriodInput({ condition, setCondition }: FilterInputProps<unknown, Range>) {
  /* The picker's two-click logic stays as it is (@umriss-ui/core HANDOFF
     A.5 §5): it reports the period after the second click, and only then does
     the condition stand. */
  const period = isDate(condition?.from) && isDate(condition?.to) ? { from: condition.from, to: condition.to } : null;
  return (
    <div className={styles.rangePeriod}>
      <DateRangePicker
        size="sm"
        clearable
        value={period}
        onChange={(next) => setCondition(next ? { from: next.from, to: next.to } : null)}
      />
    </div>
  );
}

function RangeInput(props: FilterInputProps<unknown, Range> & BuiltInEnv) {
  return props.kind === "date" ? <PeriodInput {...props} /> : <NumberRangeInput {...props} />;
}

const RANGE = builtIn<Range>(
  columnFilter<unknown, Range>({
    matches: (value, condition) => {
      const number = isDate(value) ? value.getTime() : isNumber(value) ? value : undefined;
      if (number === undefined) return false;
      const from = lowerBound(condition.from);
      const to = upperBound(condition.to);
      if (from !== undefined && number < from) return false;
      if (to !== undefined && (to.open ? number >= to.value : number > to.value)) return false;
      return true;
    },
    Input: RangeInput,
    describe: (condition) =>
      [condition.from, condition.to].map((bound) => (bound === undefined ? "" : String(bound))).join("–"),
  }),
  {
    isCondition: (condition): condition is Range => {
      if (typeof condition !== "object" || condition === null || Array.isArray(condition) || condition instanceof Date) {
        return false;
      }
      const entries = Object.entries(condition);
      return entries.every(
        ([name, value]) =>
          (name === "from" || name === "to") && (value === undefined || isNumber(value) || isDate(value)),
      );
    },
    isEmpty: (condition) => condition.from === undefined && condition.to === undefined,
    absentMatches: () => false,
    describeIn: (condition, env) => {
      const { from, to } = condition;
      if (from !== undefined && to !== undefined) {
        /* Two days of the same year name it once: "01.09.–30.09.2026". */
        const oneYear = isDate(from) && isDate(to) && from.getFullYear() === to.getFullYear();
        return env.wording.rangeFromTo(
          oneYear ? env.formats.dateShort(from as Date) : boundText(from, env),
          boundText(to, env),
        );
      }
      if (from !== undefined) return env.wording.rangeFrom(boundText(from, env));
      return to === undefined ? "" : env.wording.rangeTo(boundText(to, env));
    },
  },
);
