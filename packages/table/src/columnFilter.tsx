/* Column filters: one interface for the list filter, the
   range filter, the text filter and an application's filter of its own.

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
import { Checkbox, DEFAULT_WORDING, DateRangePicker, FormField, Input, NumberInput, SegmentedControl, Select, useFormats, useWording, zoneDayStart, zoneFields, zoneInstant } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import type { Present, TextCondition, TextOperator, TextTerm } from "./types";
import { asText, ABSENT_KEY, filterKey, isAbsent } from "./values";
import type { Format, ValueKind } from "./values";
import styles from "./Table.module.css";

/* --- The interface ----------------------------------------------------------- */

/** What the `Input` of a filter of one's own receives: the condition, its
    setter, and the values the column holds. */
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

/** A column filter of one's own, as `columnFilter` makes it: when a value
    satisfies a condition, the control that sets it, and its text in the table
    toolbar. Give it to a column's `filter`. */
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
export type FilterSpec = "list" | "range" | "text" | Filter;

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
  absentMatches: (condition: B, formats: Formats) => boolean;
  /** `matches`, with the formats: a day is the zone's day, case is the locale's. */
  matchesIn?: (value: unknown, condition: B, formats: Formats) => boolean;
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
  if (spec === "text") return TEXT;
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

/* The form `JSON.stringify` writes for a `Date`. A day-only "2026-03-17" is not
   it: `Date` reads that as UTC midnight, which is another day in most zones. */
const JSON_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const revived = (value: unknown): unknown => {
  if (typeof value !== "string" || !JSON_DATE.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};

/** A condition that went through JSON, read back: a bound of a range is a
    `Date` again whatever the column, a value of a list only where the column's
    values are points in time. Anything else, and a filter of one's own, stays
    as it is. */
export function reviveCondition(filter: Filter, condition: unknown, kind: ValueKind): unknown {
  if (filter === RANGE && typeof condition === "object" && condition !== null && !Array.isArray(condition)) {
    return Object.fromEntries(Object.entries(condition).map(([name, bound]) => [name, revived(bound)]));
  }
  if (filter === LIST && kind === "date" && Array.isArray(condition)) return condition.map(revived);
  return condition;
}

/** Whether a value satisfies an effective condition. */
export function satisfies(filter: Filter, value: unknown, condition: unknown, formats: Formats): boolean {
  const more = BUILT_IN.get(filter);
  if (isAbsent(value)) return more?.absentMatches(condition, formats) ?? false;
  return more?.matchesIn ? more.matchesIn(value, condition, formats) : filter.matches(value, condition);
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

const LIST = /* @__PURE__ */ builtIn<readonly unknown[]>(
  /* @__PURE__ */ columnFilter<unknown, readonly unknown[]>({
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

const dayStart = (day: Date, timeZone?: string): number => zoneDayStart(day, timeZone).getTime();
const nextDay = (day: Date, timeZone?: string): number => {
  const { year, month, day: d } = zoneFields(day, timeZone);
  return zoneInstant({ year, month, day: d + 1 }, timeZone).getTime();
};

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

/** The lower bound as a number - for a point in time the start of its day. */
const lowerBound = (bound: number | Date | undefined, timeZone?: string): number | undefined =>
  isDate(bound) ? dayStart(bound, timeZone) : isNumber(bound) ? bound : undefined;

/** The upper bound, read exclusively: for a point in time the start of the
    following day, for a number the number itself (then inclusive). */
const upperBound = (bound: number | Date | undefined, timeZone?: string): { value: number; open: boolean } | undefined =>
  isDate(bound)
    ? { value: nextDay(bound, timeZone), open: true }
    : isNumber(bound)
      ? { value: bound, open: false }
      : undefined;

function rangeMatches(value: unknown, condition: Range, timeZone: string | undefined): boolean {
  const number = isDate(value) ? value.getTime() : isNumber(value) ? value : undefined;
  if (number === undefined) return false;
  const from = lowerBound(condition.from, timeZone);
  const to = upperBound(condition.to, timeZone);
  if (from !== undefined && number < from) return false;
  if (to !== undefined && (to.open ? number >= to.value : number > to.value)) return false;
  return true;
}

const boundText = (bound: number | Date, env: FilterEnv): string =>
  isDate(bound) ? env.formats.date(bound) : (asText(bound, env.format, env.formats, env.wording) ?? String(bound));

function NumberRangeInput({ condition, setCondition, format }: FilterInputProps<unknown, Range> & BuiltInEnv) {
  const wording = useWording();
  /* A column whose format writes no grouping reads "2024" in its fields too. */
  const grouping = !(typeof format === "object" && format.useGrouping === false);
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
        <NumberInput size="sm" grouping={grouping} value={from} invalid={invalid} onChange={(value) => change("from", value)} />
      </FormField>
      <FormField label={wording.filterTo} error={invalid ? wording.rangeInvalid : undefined}>
        <NumberInput size="sm" grouping={grouping} value={to} onChange={(value) => change("to", value)} />
      </FormField>
    </div>
  );
}

function PeriodInput({ condition, setCondition }: FilterInputProps<unknown, Range>) {
  /* The picker's two-click logic stays as it is: it reports the period after the second click, and only then does
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

const RANGE = /* @__PURE__ */ builtIn<Range>(
  /* @__PURE__ */ columnFilter<unknown, Range>({
    matches: (value, condition) => rangeMatches(value, condition, undefined),
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
    matchesIn: (value, condition, formats) => rangeMatches(value, condition, formats.timeZone),
    describeIn: (condition, env) => {
      const { from, to } = condition;
      if (from !== undefined && to !== undefined) {
        /* Two days of the same year name it once: "01.09.–30.09.2026". */
        const zone = env.formats.timeZone;
        const oneYear = isDate(from) && isDate(to) && zoneFields(from, zone).year === zoneFields(to, zone).year;
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

/* --- The text filter ------------------------------------------------------------- */

/* Its condition is one or two terms and how they join. A term that needs a
   value and has none requires nothing and is left out; an absent text counts
   as "": it satisfies "is empty" and "does not contain", like any empty one.
   Case is the locale's: both sides are lowered with the formats' locale. */

type Join = NonNullable<TextCondition["join"]>;

/* Each operator once: its label and how it compares a text with a term's
   value, both already lowered. */
const OPERATORS: Record<TextOperator, { label: (wording: Wording) => string; test: (text: string, value: string) => boolean }> = {
  contains: { label: (w) => w.textContains, test: (a, b) => a.includes(b) },
  notContains: { label: (w) => w.textNotContains, test: (a, b) => !a.includes(b) },
  startsWith: { label: (w) => w.textStartsWith, test: (a, b) => a.startsWith(b) },
  endsWith: { label: (w) => w.textEndsWith, test: (a, b) => a.endsWith(b) },
  equals: { label: (w) => w.textEquals, test: (a, b) => a === b },
  isEmpty: { label: (w) => w.textIsEmpty, test: (a) => a === "" },
};
const OPERATOR_NAMES = Object.keys(OPERATORS) as TextOperator[];

const isTerm = (term: unknown): term is TextTerm =>
  typeof term === "object" &&
  term !== null &&
  OPERATOR_NAMES.includes((term as TextTerm).operator) &&
  ((term as TextTerm).value === undefined || typeof (term as TextTerm).value === "string");

/** Whether a term requires something. */
const isFilled = (term: TextTerm): boolean => term.operator === "isEmpty" || (term.value ?? "") !== "";

const filledTerms = (condition: TextCondition): TextTerm[] => condition.terms.filter(isFilled);

function termMatches(text: string, term: TextTerm, locale: string | undefined): boolean {
  return OPERATORS[term.operator].test(text.toLocaleLowerCase(locale), (term.value ?? "").toLocaleLowerCase(locale));
}

function textMatches(value: unknown, condition: TextCondition, locale: string | undefined): boolean {
  const text = isAbsent(value) ? "" : String(value);
  const results = filledTerms(condition).map((term) => termMatches(text, term, locale));
  return condition.join === "or" ? results.some(Boolean) : results.every(Boolean);
}

/** The condition a pair of terms makes: only the terms that require something,
    the join only for two; `null` when nothing is required. */
function canonicalCondition(terms: readonly TextTerm[], join: Join): TextCondition | null {
  const used = terms.filter(isFilled).map((term): TextTerm => (term.operator === "isEmpty" ? { operator: term.operator } : term));
  if (used.length === 0) return null;
  return used.length === 1 ? { terms: [used[0]!] } : { join, terms: [used[0]!, used[1]!] };
}

/** The condition's text in the toolbar, in the given wording. */
function describeText(condition: TextCondition, wording: Wording): string {
  return filledTerms(condition)
    .map((term) => {
      const label = OPERATORS[term.operator].label(wording);
      return term.operator === "isEmpty" ? label : wording.textTerm(label, term.value ?? "");
    })
    .join(` ${condition.join === "or" ? wording.textOr : wording.textAnd} `);
}

const EMPTY_TERM: TextTerm = { operator: "contains", value: "" };

const panelDraftOf = (condition: TextCondition | null) => ({
  terms: [condition?.terms[0] ?? EMPTY_TERM, condition?.terms[1] ?? EMPTY_TERM] as const,
  join: condition?.join ?? "and",
});

/* What two conditions are compared by: the effective form, keys in one order. */
const canonicalKey = (condition: TextCondition | null): string => {
  const { terms, join } = panelDraftOf(condition);
  return JSON.stringify(canonicalCondition(terms, join));
};

function TextInput({ condition, setCondition }: FilterInputProps<unknown, TextCondition>) {
  const wording = useWording();
  /* The draft keeps what the condition leaves out - the operator of a term
     whose value is still empty. It follows the condition when that changes from
     outside: reset, a chip, a view. */
  const [draft, setDraft] = useState(() => panelDraftOf(condition));
  let shown = draft;
  if (canonicalKey({ join: draft.join, terms: draft.terms }) !== canonicalKey(condition)) {
    shown = panelDraftOf(condition);
    setDraft(shown);
  }
  const change = (index: 0 | 1, term: TextTerm) => {
    const terms = [index === 0 ? term : shown.terms[0], index === 1 ? term : shown.terms[1]] as const;
    setDraft({ ...shown, terms });
    setCondition(canonicalCondition(terms, shown.join));
  };
  const join = (value: Join) => {
    setDraft({ ...shown, join: value });
    setCondition(canonicalCondition(shown.terms, value));
  };

  const row = (index: 0 | 1) => {
    const term = shown.terms[index];
    return (
      <div className={styles.textTerm}>
        <Select
          size="sm"
          aria-label={wording.filterOperator}
          value={term.operator}
          onChange={(event) => change(index, { ...term, operator: event.target.value as TextOperator })}
        >
          {OPERATOR_NAMES.map((operator) => (
            <option key={operator} value={operator}>
              {OPERATORS[operator].label(wording)}
            </option>
          ))}
        </Select>
        {term.operator !== "isEmpty" && (
          <Input size="sm" aria-label={wording.filterValue} value={term.value ?? ""} onChange={(event) => change(index, { ...term, value: event.target.value })} />
        )}
      </div>
    );
  };

  return (
    <div className={styles.textFields}>
      {row(0)}
      <SegmentedControl
        size="sm"
        aria-label={wording.filterJoin}
        value={shown.join}
        options={[
          { value: "and", label: wording.textAnd },
          { value: "or", label: wording.textOr },
        ]}
        onChange={join}
      />
      {row(1)}
    </div>
  );
}

const TEXT = /* @__PURE__ */ builtIn<TextCondition>(
  /* @__PURE__ */ columnFilter<unknown, TextCondition>({
    matches: (value, condition) => textMatches(value, condition, undefined),
    Input: TextInput,
    describe: (condition) => describeText(condition, DEFAULT_WORDING),
  }),
  {
    isCondition: (condition): condition is TextCondition =>
      typeof condition === "object" &&
      condition !== null &&
      (!("join" in condition) || condition.join === "and" || condition.join === "or") &&
      "terms" in condition &&
      Array.isArray(condition.terms) &&
      condition.terms.length >= 1 &&
      condition.terms.length <= 2 &&
      condition.terms.every(isTerm),
    isEmpty: (condition) => filledTerms(condition).length === 0,
    absentMatches: (condition, formats) => textMatches("", condition, formats.locale),
    matchesIn: (value, condition, formats) => textMatches(value, condition, formats.locale),
    describeIn: (condition, env) => describeText(condition, env.wording),
  },
);
