/* How this product writes numbers, dates and times - in exactly one place.

   The language tag stands once, here. The sets are objects of functions and
   not Intl objects: an application that wants something written differently
   replaces one function.

   **The locale is English, and one set is built per locale** (ADR-0024).
   `formatsFor` builds them; `DEFAULT_FORMATS` is the English set every
   component renders without a provider, and `GERMAN_FORMATS` behind
   `@umriss-ui/core/wording/de` is taken on purpose, beside the German
   wording.

   The clock stays 24-hour, which is why `en-GB` is chosen over `en-US`.

   Formatters are expensive. Each set builds them once when it is created, not
   on every render; the parameterised ones behind a small cache. */

/** Everything the library knows about formatting. */
export interface Formats {
  /** The language tag the set was built in: "en-GB". */
  locale: string;
  /** The IANA name of the time zone instants are written in, or `undefined`
      for the reader's own. */
  timeZone: string | undefined;
  /** The zone's generic name in the set's locale: "Central European Time".
      Empty until the page has hydrated where no zone is named. */
  timeZoneName: (d: Date) => string;
  /** Date as displayed: 17/03/2026 */
  date: (d: Date) => string;
  /** Short form without the year, in the range footer: 17/03 */
  dateShort: (d: Date) => string;
  /** The calendar's month header: March 2026 */
  month: (d: Date) => string;
  /** The month alone, in the calendar head's month list: March */
  monthName: (d: Date) => string;
  /** Accessible name of a calendar cell: Tuesday, 17 March 2026 */
  dateLong: (d: Date) => string;
  /** Time of day, optionally with seconds: 09:05 or 09:05:03 */
  time: (d: Date, withSeconds: boolean) => string;
  /** Date and time together: 17/03/2026, 09:05 */
  dateTime: (d: Date, withSeconds: boolean) => string;
  /** Short form of the UTC offset: GMT+2 */
  offset: (d: Date) => string;
  /**
   * A number in the set's notation. Without a digit count the value stands to
   * the tenth decimal place, and a non-zero value that would read 0 there is
   * written in scientific notation; with one it is padded and rounded to
   * exactly that many places.
   */
  number: (n: number, decimals?: number) => string;
  /**
   * A number written with Intl's own options in the set's locale: a currency,
   * a year without grouping, scientific notation. Pure Intl options - the
   * `decimals` shorthand is expanded by `writeNumber` before it. Like the
   * others it writes no negative zero unless the options set `signDisplay`.
   */
  numberWith: (n: number, options: Intl.NumberFormatOptions) => string;
  /**
   * A count. Kept apart from `number` because it makes a different promise: a
   * count is whole, and Intl's own rounding (at most three decimal places) is
   * right for it and wrong for a measurement.
   */
  count: (n: number) => string;
  /** A share from 0 to 1 as whole per cent: 74 % */
  percent: (share: number) => string;
  /** The ordering of two texts by the set's collation. */
  compareText: (a: string, b: string) => number;
  /** An elapsed duration as a phrase: "3 minutes ago".
      The amount comes in milliseconds, counted back from now. */
  relative: (ms: number) => string;
}

/** Intl's number options, plus `decimals`: the shorthand for the minimum and the
    maximum fraction digits. An Intl digit option given beside it wins. */
export type NumberOptions = Intl.NumberFormatOptions & { decimals?: number };

/** How a number is written: a share, a count, or Intl's options. */
export type NumberFormat = "percent" | "count" | NumberOptions;

/**
 * A number as its format says, through the set's own functions - so an
 * application's replaced `number`, `percent` or `count` is the one called.
 * No format, or an object with only `decimals`, is `number`; every other
 * object is `numberWith`.
 */
export function writeNumber(formats: Formats, n: number, format?: NumberFormat): string {
  if (format === "percent") return formats.percent(n);
  if (format === "count") return formats.count(n);
  if (format === undefined) return formats.number(n);
  const { decimals, ...intl } = format;
  if (Object.keys(intl).length === 0) return formats.number(n, decimals);
  return formats.numberWith(
    n,
    decimals === undefined ? intl : { minimumFractionDigits: decimals, maximumFractionDigits: decimals, ...intl },
  );
}

/* The decimal places `number` writes without a digit count. */
const DEFAULT_PLACES = 10;

/* From coarse to fine; the first step that works out wins. */
const RELATIVE_STEPS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

/** Every format of one locale, built once.

    The options are the product's, not the locale's: two-digit day and month,
    the month written out with its year, a 24-hour clock, per cent without
    decimals. What the locale decides is the order of the parts and the
    separators - 17/03/2026 against 17.03.2026 - and the words of the month,
    the weekday and "3 minutes ago". */
export function formatsFor(locale: string, timeZone?: string): Formats {
  const key = `${locale}|${timeZone ?? ""}`;
  let set = sets.get(key);
  if (!set) {
    set = buildFormats(locale, timeZone);
    sets.set(key, set);
    for (const name of INSTANT_ENTRIES) builtInInstants.add(set[name]);
  }
  return set;
}

/* One set per locale and zone, so that `DEFAULT_FORMATS` and `GERMAN_FORMATS`
   keep their identity and a zone's set is built once. */
const sets = new Map<string, Formats>();

/** Every instant entry `formatsFor` built, whatever its zone. */
export const builtInInstants = /* @__PURE__ */ new WeakSet<object>();

/** The entries that write an instant: a named zone replaces those an
    application left as the built-in set has them. */
export const INSTANT_ENTRIES = ["date", "dateShort", "month", "dateLong", "time", "dateTime", "offset", "timeZoneName"] as const;

function buildFormats(locale: string, timeZone: string | undefined): Formats {
  // An unknown zone throws Intl's RangeError, naming it, in the first formatter.
  const dateFormat = new Intl.DateTimeFormat(locale, { timeZone, day: "2-digit", month: "2-digit", year: "numeric" });
  const dateShortFormat = new Intl.DateTimeFormat(locale, { timeZone, day: "2-digit", month: "2-digit" });
  const monthFormat = new Intl.DateTimeFormat(locale, { timeZone, month: "long", year: "numeric" });
  /* A calendar month, named from a calendar-day Date: no zone applies. */
  const monthNameFormat = new Intl.DateTimeFormat(locale, { month: "long" });
  const dateLongFormat = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  /* `hour12: false` and not the locale's habit: the clock is the product's
     decision, and `en-GB` would write "24:00" for midnight without
     `hourCycle`. */
  const clock = { timeZone, hour: "2-digit", minute: "2-digit", hour12: false, hourCycle: "h23" } as const;
  const timeFormats = {
    without: new Intl.DateTimeFormat(locale, clock),
    with: new Intl.DateTimeFormat(locale, { ...clock, second: "2-digit" }),
  };
  const dateTimeFormats = {
    without: new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", ...clock }),
    with: new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...clock,
      second: "2-digit",
    }),
  };
  /* The offset label is the one place where a formatter does not format but
     decompose: only the zone name is read out of the parts. The
     daylight-saving logic hangs on it (DatePicker/time.ts). */
  const offsetFormat = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "shortOffset" });
  const nameFormat = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "shortGeneric" });
  const numberFormats = new Map<number | undefined, Intl.NumberFormat>();
  /* A negative that rounds to zero reads "0", never "-0". The compiler's Intl
     typings do not list "negative" yet; every engine since 2023 has it. */
  const noNegativeZero = { signDisplay: "negative" } as unknown as Intl.NumberFormatOptions;
  const optionFormats = new Map<string, Intl.NumberFormat>();
  const scientificFormat = new Intl.NumberFormat(locale, { ...noNegativeZero, notation: "scientific", maximumSignificantDigits: 10 });
  const countFormat = new Intl.NumberFormat(locale, noNegativeZero);
  const percentFormat = new Intl.NumberFormat(locale, { ...noNegativeZero, style: "percent", maximumFractionDigits: 0 });
  const collator = new Intl.Collator(locale);
  const relativeFormat = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  return {
    locale,
    timeZone,
    timeZoneName: (d) => nameFormat.formatToParts(d).find((part) => part.type === "timeZoneName")?.value ?? "",
    date: (d) => dateFormat.format(d),
    dateShort: (d) => dateShortFormat.format(d),
    month: (d) => monthFormat.format(d),
    monthName: (d) => monthNameFormat.format(d),
    dateLong: (d) => dateLongFormat.format(d),
    time: (d, withSeconds) => (withSeconds ? timeFormats.with : timeFormats.without).format(d),
    dateTime: (d, withSeconds) => (withSeconds ? dateTimeFormats.with : dateTimeFormats.without).format(d),
    offset: (d) => offsetFormat.formatToParts(d).find((part) => part.type === "timeZoneName")?.value ?? "",
    number: (n, decimals) => {
      // Without a digit count a non-zero value never reads as 0: what the default
      // places would round to zero is written in scientific notation instead.
      if (decimals === undefined && n !== 0 && Math.abs(n) < 0.5 * 10 ** -DEFAULT_PLACES) return scientificFormat.format(n);
      let f = numberFormats.get(decimals);
      if (!f) {
        f = new Intl.NumberFormat(locale, {
          ...noNegativeZero,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals ?? DEFAULT_PLACES,
        });
        numberFormats.set(decimals, f);
      }
      return f.format(n);
    },
    numberWith: (n, options) => {
      const key = JSON.stringify(options);
      let f = optionFormats.get(key);
      if (!f) {
        f = new Intl.NumberFormat(locale, { ...noNegativeZero, ...options });
        optionFormats.set(key, f);
      }
      return f.format(n);
    },
    count: (n) => countFormat.format(n),
    percent: (share) => percentFormat.format(share),
    compareText: (a, b) => collator.compare(a, b),
    relative: (ms) => {
      // The coarsest unit that still yields at least one: "2 hours ago", not
      // "137 minutes ago".
      const seconds = Math.max(0, Math.round(ms / 1000));
      for (const [unit, size] of RELATIVE_STEPS) {
        if (seconds >= size) return relativeFormat.format(-Math.floor(seconds / size), unit);
      }
      return relativeFormat.format(-seconds, "second");
    },
  };
}

/** The instance shipped by default: English notation on a 24-hour clock
    (ADR-0024). German is `GERMAN_FORMATS` in `@umriss-ui/core/wording/de`. */
export const DEFAULT_FORMATS: Formats = /* @__PURE__ */ formatsFor("en-GB");

/** The two characters a notation separates with. */
export interface Separators {
  /** Between thousands: "," in English, "." in German, empty where a notation
      does not group. */
  readonly group: string;
  /** Before the decimals: "." in English, "," in German. */
  readonly decimal: string;
}

/** The separators a set of formats writes, read off the formats themselves.

    A field that formats a number must be able to read its own output back, and
    an application may have replaced `number` with anything. So the
    separators are measured: one number with one decimal place, digits struck
    out, and what remains is the notation's own punctuation. */
export function separatorsOf(formats: Formats): Separators {
  const punctuation = [...formats.number(1234.5, 1).replace(/[\d-]/g, "")];
  const decimal = punctuation[punctuation.length - 1] ?? ".";
  return { group: punctuation.length > 1 ? (punctuation[0] as string) : "", decimal };
}

/** The separators of the default notation. */
export const DEFAULT_SEPARATORS: Separators = /* @__PURE__ */ separatorsOf(DEFAULT_FORMATS);
