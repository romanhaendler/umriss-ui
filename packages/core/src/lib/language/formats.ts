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

   Formatters are expensive. All of them are built once when the module loads,
   not on every render; the parameterised ones behind a small cache. */

/** Everything the library knows about formatting. */
export interface Formats {
  /** Date as displayed: 17.03.2026 */
  date: (d: Date) => string;
  /** Short form without the year, in the range footer: 17.03. */
  dateShort: (d: Date) => string;
  /** The calendar's month header: März 2026 */
  month: (d: Date) => string;
  /** Accessible name of a calendar cell: Dienstag, 17. März 2026 */
  dateLong: (d: Date) => string;
  /** Time of day, optionally with seconds: 09:05 or 09:05:03 */
  time: (d: Date, withSeconds: boolean) => string;
  /** Date and time together: 17.03.2026, 09:05 */
  dateTime: (d: Date, withSeconds: boolean) => string;
  /** Short form of the UTC offset: GMT+2 */
  offset: (d: Date) => string;
  /**
   * A number in German notation. Without a digit count the value stands to the
   * tenth decimal place; with one it is padded and rounded to exactly that
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
  /** The ordering of two texts by German collation. */
  compareText: (a: string, b: string) => number;
  /** An elapsed duration as a phrase: "vor 3 Minuten".
      The amount comes in milliseconds, counted back from now. */
  relative: (ms: number) => string;
}

const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateShortFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" });

const monthFormat = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });

const dateLongFormat = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/* Two instances, built once rather than anew on every render. */
const timeFormats = {
  without: new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }),
  with: new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
};

const dateTimeFormats = {
  without: new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }),
  with: new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }),
};

/* The offset label is the one place where a formatter does not format but
   decompose: only the zone name is read out of the parts. The daylight-saving
   logic hangs on it (DatePicker/time.ts). */
const offsetFormat = new Intl.DateTimeFormat("de-DE", { timeZoneName: "shortOffset" });

const numberFormats = new Map<number | undefined, Intl.NumberFormat>();

const countFormat = new Intl.NumberFormat("de-DE");

const percentFormat = new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 0 });

const collator = new Intl.Collator("de");

/** The one instance shipped. German, and nothing else. */
const relativeFormat = new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" });

/* From coarse to fine; the first step that works out wins. */
const RELATIVE_STEPS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export const DEFAULT_FORMATS: Formats = {
  date: (d) => dateFormat.format(d),
  dateShort: (d) => dateShortFormat.format(d),
  month: (d) => monthFormat.format(d),
  dateLong: (d) => dateLongFormat.format(d),
  time: (d, withSeconds) => (withSeconds ? timeFormats.with : timeFormats.without).format(d),
  dateTime: (d, withSeconds) =>
    (withSeconds ? dateTimeFormats.with : dateTimeFormats.without).format(d),
  offset: (d) =>
    offsetFormat.formatToParts(d).find((part) => part.type === "timeZoneName")?.value ?? "",
  number: (n, decimals) => {
    let f = numberFormats.get(decimals);
    if (!f) {
      f = new Intl.NumberFormat("de-DE", {
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
    // The coarsest unit that still yields at least one: "vor 2 Stunden" reads
    // better than "vor 137 Minuten", and in a control room the impression of
    // magnitude counts for more than the exact number.
    const sekunden = Math.max(0, Math.round(ms / 1000));
    for (const [einheit, groesse] of RELATIVE_STEPS) {
      if (sekunden >= groesse) {
        return relativeFormat.format(-Math.floor(sekunden / groesse), einheit);
      }
    }
    return relativeFormat.format(-sekunden, "second");
  },
};
