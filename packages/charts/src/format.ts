/* Default number format of the axes and of the tooltip. The locale is the
   chart's wording's (ADR-0031), never the browser's; decimal places derive
   from the step, thousands grouping on. Tabular figures are set by the CSS
   through font-variant-numeric. A caller's options format (ADR-0069) is built
   in the same locale, behind the same cache. */

import { decimalsForStep } from "./ticks";

/** The options of `Intl.NumberFormat`, plus `decimals` for a fixed number of
    places (minimum and maximum alike; an Intl digit option given beside it
    wins). The same shape as core's, declared here because the charts import
    nothing. */
export interface NumberOptions extends Intl.NumberFormatOptions {
  decimals?: number;
}

/** A value format: a function, or Intl's options written in the chart's
    wording's locale. */
export type ValueFormat = ((value: number) => string) | NumberOptions;

// TypeScript's lib does not list "negative" yet.
const NEGATIVE = "negative" as "auto";

const formatter = new Map<string, Intl.NumberFormat>();

/** No negative zero: -0.0004 on one place reads "0.0", unless the options set
    `signDisplay`. */
function build(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = formatter.get(key);
  if (f === undefined) {
    f = new Intl.NumberFormat(locale, { signDisplay: NEGATIVE, ...options });
    formatter.set(key, f);
  }
  return f;
}

const DIGITS = ["minimumFractionDigits", "maximumFractionDigits", "minimumSignificantDigits", "maximumSignificantDigits"] as const;

/** Intl's options of a `NumberOptions`. `places` are an axis' default: the
    step's, replaced by any digit option of the caller. */
function intl({ decimals, ...options }: NumberOptions, places?: number): Intl.NumberFormatOptions {
  const fixed = decimals ?? (DIGITS.some((k) => options[k] !== undefined) ? undefined : places);
  return fixed === undefined ? options : { minimumFractionDigits: fixed, maximumFractionDigits: fixed, ...options };
}

/** Options by value: an inline object equal to the last one is the same. */
export function optionsEqual(a: unknown, b: unknown): boolean {
  return typeof a === "object" && typeof b === "object" && a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b);
}

/** A format as a function; options are built in `locale`. */
export function formatFn(format: ValueFormat, locale: string): (value: number) => string {
  if (typeof format === "function") return format;
  const f = build(locale, intl(format));
  return (v) => f.format(v);
}

/** An axis' format at a tick step: the step's places unless the options set
    digits of their own. */
export function tickFn(format: ValueFormat, locale: string, step: number): (value: number) => string {
  if (typeof format === "function") return (v) => format(v);
  const places = decimalsForStep(step);
  // Past six places a tick would read "0.000000": the step is told in scientific notation instead.
  const scientific = places > 6 && format.notation === undefined && !DIGITS.some((k) => format[k] !== undefined);
  const f = build(locale, scientific ? { ...format, notation: "scientific", maximumFractionDigits: 3 } : intl(format, places));
  return (v) => f.format(v);
}

/** Axis label: the number of places follows the step, so that the column stays
    calm. */
export function formatTick(v: number, step: number, locale: string): string {
  return tickFn({ useGrouping: true }, locale, step)(v);
}

/** Tooltip values: up to 3 places, without padded zeros; a value under a thousandth, which three places
    would round to zero, in scientific notation. */
export function formatValue(v: number, locale: string): string {
  if (!Number.isFinite(v)) return "–";
  const small = v !== 0 && Math.abs(v) < 1e-3;
  return build(locale, small ? { notation: "scientific", maximumFractionDigits: 3 } : { maximumFractionDigits: 3, useGrouping: true }).format(v);
}
