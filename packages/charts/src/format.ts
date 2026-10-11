/* Default number format of the axes and of the tooltip. The locale is the
   chart's wording's (ADR-0031), never the browser's; decimal places derive
   from the step, thousands grouping on. Tabular figures are set by the CSS
   through font-variant-numeric. */

import { decimalsForStep } from "./ticks";

const formatter = new Map<string, Intl.NumberFormat>();

function formatterFor(locale: string, digits: number | "value"): Intl.NumberFormat {
  const key = `${locale}|${digits}`;
  let f = formatter.get(key);
  if (f === undefined) {
    f =
      digits === "value"
        ? new Intl.NumberFormat(locale, { maximumFractionDigits: 3, useGrouping: true })
        : new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: true });
    formatter.set(key, f);
  }
  return f;
}

/** Axis label: the number of places follows the step, so that the column stays
    calm. */
export function formatTick(v: number, step: number, locale: string): string {
  return formatterFor(locale, Math.min(6, decimalsForStep(step))).format(v);
}

/** Tooltip values: up to 3 places, without padded zeros. */
export function formatValue(v: number, locale: string): string {
  return Number.isFinite(v) ? formatterFor(locale, "value").format(v) : "–";
}
