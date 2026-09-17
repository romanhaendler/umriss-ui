/* Default number format of the axes and of the tooltip (R-4.1).
   Locale from navigator.language (no hard-wired de-DE), decimal places derived
   from the step, thousands grouping on. Tabular figures are set by the CSS
   through font-variant-numeric. */

import { decimalsForStep } from "./ticks";

let localeCache: string | null = null;

export function chartLocale(): string {
  if (localeCache !== null) return localeCache;
  const nav = typeof navigator === "undefined" ? undefined : navigator.language;
  localeCache = typeof nav === "string" && nav !== "" ? nav : "en-US";
  return localeCache;
}

const formatter = new Map<string, Intl.NumberFormat>();

function formatterFor(digits: number): Intl.NumberFormat {
  const locale = chartLocale();
  const key = `${locale}|${digits}`;
  let f = formatter.get(key);
  if (f === undefined) {
    f = new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      useGrouping: true,
    });
    formatter.set(key, f);
  }
  return f;
}

/** Axis label: the number of places follows the step, so that the column stays
    calm. */
export function formatTick(v: number, step: number): string {
  return formatterFor(Math.min(6, decimalsForStep(step))).format(v);
}

/** Tooltip values: up to 3 places, without padded zeros. */
export function formatValue(v: number): string {
  if (!Number.isFinite(v)) return "–";
  const locale = chartLocale();
  const key = `${locale}|value`;
  let f = formatter.get(key);
  if (f === undefined) {
    f = new Intl.NumberFormat(locale, { maximumFractionDigits: 3, useGrouping: true });
    formatter.set(key, f);
  }
  return f.format(v);
}
