/* Reading and writing a number in the notation the formats use: which
   character separates thousands and which separates the decimals comes from
   there, measured rather than declared a second time (ADR-0024 moved the
   default from German to English, and a field that cannot read its own output
   is worse than one that writes the wrong comma). Pure functions without React
   - the seam at which NumberInput is tested. */

import { DEFAULT_FORMATS, DEFAULT_SEPARATORS, type Separators } from "../../lib/language/formats";

/**
 * Reads a number in the given notation - the default one where none is given.
 * Spaces and group separators fall away, the decimal separator becomes the
 * dot. An empty string and a lone minus are "no value" and are thereby
 * distinguishable from zero.
 */
export function parseNumber(raw: string, separators: Separators = DEFAULT_SEPARATORS): number | null {
  const cleaned = [...raw]
    .filter((char) => !/\s/.test(char) && (separators.group === "" || char !== separators.group))
    .map((char) => (char === separators.decimal ? "." : char))
    .join("");
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

/** The decimal separator only makes sense where decimal places are allowed. */
export const decimalsAllowed = (decimals?: number) => decimals !== 0;

/**
 * Strikes from a raw input everything the configuration does not permit. The
 * group separator always remains, the decimal separator and the minus only
 * conditionally.
 */
export function filterInput(
  raw: string,
  constraints: NumberConstraints = {},
  separators: Separators = DEFAULT_SEPARATORS,
): string {
  const allowed = new Set([..."0123456789", separators.group]);
  if (decimalsAllowed(constraints.decimals)) allowed.add(separators.decimal);
  if (negativeAllowed(constraints.min)) allowed.add("-");
  allowed.delete("");
  return [...raw].filter((char) => allowed.has(char)).join("");
}

/**
 * Writes a number in the default notation.
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
