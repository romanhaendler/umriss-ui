/* Reading and writing a number in the notation the formats use: the thousands
   and decimal separators come from there, not declared a second time
   (ADR-0024). Pure functions without React - the seam at which NumberInput is
   tested. */

import { DEFAULT_SEPARATORS, type Separators } from "../../lib/language/formats";

/**
 * A typed "." is the decimal separator wherever "." is not the group
 * separator (fr-CH 1234.5); where it is (German), it stays a group separator.
 * U+2212, the minus several locales write, is the plain "-". Reading and
 * filtering both go through here so that they agree.
 */
const dotAsDecimal = (raw: string, { group, decimal }: Separators): string => {
  const minus = raw.replaceAll("\u2212", "-");
  return group === "." || decimal === "." ? minus : minus.replaceAll(".", decimal);
};

/** The text with spaces and group separators struck and the decimal separator
    a dot; the form `Number` reads. */
const plainOf = (raw: string, separators: Separators): string =>
  [...dotAsDecimal(raw, separators)]
    .filter((char) => !/\s/.test(char) && (separators.group === "" || char !== separators.group))
    .map((char) => (char === separators.decimal ? "." : char))
    .join("");

/**
 * Whether the text can stand as a number in the notation: digits, at most one
 * decimal separator, an optional exponent ("1E-11", which a tiny value is
 * written in), and group separators only between digits of the integer part,
 * never after a leading zero ("0,5" in English is not 5). An empty text and a
 * lone minus can stand: they are "no value".
 */
export function isReadable(raw: string, separators: Separators = DEFAULT_SEPARATORS): boolean {
  /* Where the group separator is itself a space (fr, sv), a space between digits is that separator and
     is judged as one; elsewhere spaces carry no meaning. */
  const text = dotAsDecimal(raw, separators).trim().replace(/\s/g, /^\s$/.test(separators.group) ? separators.group : "");
  const [mantissa = "", exponent, ...more] = text.split(/e/i);
  if (more.length > 0 || (exponent !== undefined && !/^[+-]?\d*$/.test(exponent))) return false;
  const parts = mantissa.split(separators.decimal);
  if (parts.length > 2) return false;
  const [integer = "", fraction = ""] = parts;
  if (!/^\d*$/.test(fraction)) return false;
  const { group } = separators;
  if (group === "" || !integer.includes(group)) return /^-?\d*$/.test(integer);
  const escaped = group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^-?[1-9]\\d*(?:${escaped}\\d+)*$`).test(integer);
}

/**
 * Reads a number in the given notation - the default one where none is given.
 * Spaces and group separators fall away, the decimal separator becomes the
 * dot. An empty string, a lone minus and anything unreadable are "no value"
 * and are thereby distinguishable from zero.
 */
export function parseNumber(raw: string, separators: Separators = DEFAULT_SEPARATORS): number | null {
  const cleaned = plainOf(raw, separators);
  if (cleaned === "" || cleaned === "-" || !isReadable(raw, separators)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export interface NumberConstraints {
  min?: number;
  max?: number;
  /** Decimal places; undefined leaves the value unrounded. */
  decimals?: number;
}

/** `n` times ten to the `k`, exactly: the exponent is moved in the decimal
    text, so that 1.005 is 100.5 at two places and not 100.49999999999999. */
const shift = (n: number, k: number): number => {
  const [mantissa, exponent] = n.toExponential().split("e");
  return Number(`${mantissa}e${Number(exponent) + k}`);
};

/** Rounds half away from zero to `decimals` places as the decimal text reads
    (1.005 -> 1.01, -2.5 -> -3). A precision beyond what a double holds leaves
    the value as it is. */
export function roundTo(value: number, decimals: number): number {
  const scaled = shift(Math.abs(value), decimals);
  if (!Number.isFinite(scaled)) return value;
  return Math.sign(value) * shift(Math.round(scaled), -decimals);
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
  if (decimals !== undefined) result = roundTo(result, decimals);
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
  // "E" and "+" for an exponent: the field reads the "1E-11" it writes for a tiny value.
  for (const char of "eE+") allowed.add(char);
  allowed.delete("");
  return [...dotAsDecimal(raw, separators)].filter((char) => allowed.has(char) || /\s/.test(char)).join("");
}

/** The decimal places a number is written with: 0.25 has two, 1e-7 has seven. */
const placesOf = (n: number): number => {
  const [mantissa = "", exponent = "0"] = n.toExponential().split("e");
  return Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent));
};

/**
 * The next value when counting. The factor multiplies the step size
 * (Shift = tenfold step), not the result. The sum is rounded to the places of
 * its parts (0.2 + 0.1 is 0.3), and with a `min` the steps lie on the grid
 * from it: from a value between two grid points the next one in the
 * direction is reached.
 */
export function stepNumber(base: number, direction: 1 | -1, step: number, factor = 1, min?: number): number {
  const size = step * factor;
  if (min !== undefined && Number.isFinite(min) && size > 0) {
    const position = (base - min) / step;
    const onGrid = Math.abs(position - Math.round(position)) < 1e-9;
    const next = direction === 1 ? Math.floor(position + 1e-9) + 1 : Math.ceil(position - 1e-9) - 1;
    const target = onGrid ? Math.round(position) + direction * factor : next + (direction === 1 ? factor - 1 : 1 - factor);
    return roundTo(min + target * step, Math.max(placesOf(min), placesOf(step)));
  }
  return roundTo(base + direction * size, Math.max(placesOf(base), placesOf(size)));
}
