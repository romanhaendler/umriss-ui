/* How this product writes numbers, dates and times - in exactly one place.

   Before this, the language tag "de-DE" stood in twelve places across five
   modules: in the date formats, in the offset label of the daylight-saving
   change, in the number notation of the NumberInput, in the percentage bar, in
   the counter of the filter bar and in the text sorting of the table. Every new
   component added a thirteenth. Here they stand once.

   Why an object of functions and not the Intl objects themselves: an
   application that wants something written differently replaces one function.
   Otherwise it would have to rebuild an Intl.DateTimeFormat that understands
   the same options - a promise far broader than what the library actually
   needs.

   **The locale is English, and one set is built per locale** (ADR-0024).
   `formatsFor` builds them; `DEFAULT_FORMATS` is the English set every
   component renders without a provider, and `GERMAN_FORMATS` behind
   `@umriss-ui/core/wording/de` is freight a caller takes on purpose, beside
   the German wording. ADR-0019 left this decision open when the wording became
   English - "the locale of the formats is a decision about a different object
   and deserves its own" - and ADR-0024 is that decision.

   The clock stays 24-hour. `en-GB` is chosen over `en-US` for exactly that:
   a plant screen that writes 3 pm where 15:00 was meant is read wrongly once
   and distrusted afterwards.

   Formatters are expensive. Each set builds them once when it is created, not
   on every render; the parameterised ones behind a small cache. */

/** Everything the library knows about formatting. */
export interface Formats {
  /** Date as displayed: 17/03/2026 */
  date: (d: Date) => string;
  /** Short form without the year, in the range footer: 17/03 */
  dateShort: (d: Date) => string;
  /** The calendar's month header: March 2026 */
  month: (d: Date) => string;
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
   * the tenth decimal place; with one it is padded and rounded to exactly that
   * many places.
   */
  number: (n: number, decimals?: number) => string;
  /**
   * A count. Kept apart from `number` because it makes a different promise: a
   * count is whole, and Intl's default (at most three decimal places) is right
   * for it and wrong for a measurement.
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
export function formatsFor(locale: string): Formats {
  const dateFormat = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  const dateShortFormat = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const dateLongFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  /* `hour12: false` and not the locale's habit: the clock is the product's
     decision, and `en-GB` would write "24:00" for midnight without
     `hourCycle`. */
  const clock = { hour: "2-digit", minute: "2-digit", hour12: false, hourCycle: "h23" } as const;
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
  const offsetFormat = new Intl.DateTimeFormat(locale, { timeZoneName: "shortOffset" });
  const numberFormats = new Map<number | undefined, Intl.NumberFormat>();
  const countFormat = new Intl.NumberFormat(locale);
  const percentFormat = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  const collator = new Intl.Collator(locale);
  const relativeFormat = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  return {
    date: (d) => dateFormat.format(d),
    dateShort: (d) => dateShortFormat.format(d),
    month: (d) => monthFormat.format(d),
    dateLong: (d) => dateLongFormat.format(d),
    time: (d, withSeconds) => (withSeconds ? timeFormats.with : timeFormats.without).format(d),
    dateTime: (d, withSeconds) => (withSeconds ? dateTimeFormats.with : dateTimeFormats.without).format(d),
    offset: (d) => offsetFormat.formatToParts(d).find((part) => part.type === "timeZoneName")?.value ?? "",
    number: (n, decimals) => {
      let f = numberFormats.get(decimals);
      if (!f) {
        f = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals ?? 10,
        });
        numberFormats.set(decimals, f);
      }
      return f.format(n);
    },
    count: (n) => countFormat.format(n),
    percent: (share) => percentFormat.format(share),
    compareText: (a, b) => collator.compare(a, b),
    relative: (ms) => {
      // The coarsest unit that still yields at least one: "2 hours ago" reads
      // better than "137 minutes ago", and in a control room the impression of
      // magnitude counts for more than the exact number.
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
export const DEFAULT_FORMATS: Formats = formatsFor("en-GB");

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
    an application may have replaced `number` with anything (ADR-0024 moved the
    default from German to English, which is how this came up). So the
    separators are not declared a second time but measured: one number with one
    decimal place, digits struck out, and what remains is the notation's own
    punctuation. */
export function separatorsOf(formats: Formats): Separators {
  const punctuation = [...formats.number(1234.5, 1).replace(/[\d-]/g, "")];
  const decimal = punctuation[punctuation.length - 1] ?? ".";
  return { group: punctuation.length > 1 ? (punctuation[0] as string) : "", decimal };
}

/** The separators of the default notation. */
export const DEFAULT_SEPARATORS: Separators = separatorsOf(DEFAULT_FORMATS);
