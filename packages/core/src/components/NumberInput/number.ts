/* German number notation: the dot separates thousands, the comma separates
   decimals. Pure functions without React - the seam at which NumberInput is
   tested. */

import { DEFAULT_FORMATS } from "../../lib/language/formats";

/**
 * Reads German notation. Spaces and thousands dots fall away, the comma
 * becomes the decimal separator. An empty string and a lone minus are
 * "no value" and are thereby distinguishable from zero.
 */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s|\./g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export interface NumberConstraints {
  min?: number;
  max?: number;
  /** Decimal places; undefined leaves the value unrounded. */
  decimals?: number;
}

/**
 * Brings a value inside the permitted constraints and to the required
 * precision. Order: clamp first, then round - the rounding can therefore
 * lift the value half a rounding step beyond the constraint.
 */
export function clampNumber(value: number, constraints: NumberConstraints = {}): number {
  const { min, max, decimals } = constraints;
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  if (decimals !== undefined) {
    const factor = 10 ** decimals;
    result = Math.round(result * factor) / factor;
  }
  return result;
}

/** Negative values are possible as long as no minimum from zero applies. */
export const negativeAllowed = (min?: number) => min === undefined || min < 0;

/** The decimal comma only makes sense where decimal places are allowed. */
export const decimalsAllowed = (decimals?: number) => decimals !== 0;

/**
 * Strikes from a raw input everything the configuration does not permit.
 * Thousands dots always remain, the comma and the minus only conditionally.
 */
export function filterInput(raw: string, constraints: NumberConstraints = {}): string {
  const chars = `0-9.${decimalsAllowed(constraints.decimals) ? "," : ""}${
    negativeAllowed(constraints.min) ? "\\-" : ""
  }`;
  return raw.replace(new RegExp(`[^${chars}]`, "g"), "");
}

/**
 * Writes a number in German notation.
 *
 * The notation itself sits in the language seam, together with the date and
 * percentage formats; what stands here is only the name under which the pure
 * tests know it. This pass-through carries the default; the component reads
 * the notation through `useFormats()` and thereby follows an override made by
 * the application.
 */
export const formatNumber = (value: number, decimals?: number): string =>
  DEFAULT_FORMATS.number(value, decimals);

/**
 * The next value when counting. The factor multiplies the step size
 * (Shift = tenfold step), not the result.
 */
export function stepNumber(base: number, direction: 1 | -1, step: number, factor = 1): number {
  return base + direction * step * factor;
}
