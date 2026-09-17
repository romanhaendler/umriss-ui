/* The two calculations of the multi-line field.

   They stand here and not in the body because they are pure: the measuring
   needs a layout, the deciding does not. */

/**
 * How many characters still fit. Without a limit there is nothing to
 * report. Counts the way the browser counts (UTF-16 units, an emoji is
 * two), so that the display and `maxLength` say the same thing.
 *
 * Negative is allowed and intended: a value set from outside does not know
 * `maxLength`, and then the display is meant to show that.
 */
export const remainingChars = (value: string, maxLength: number | undefined): number | undefined =>
  maxLength === undefined ? undefined : maxLength - value.length;

/**
 * The height the field is allowed to take on. Without an upper bound it
 * grows with its content; with one, up to that many rows and then no
 * further.
 *
 * A line height of 0 is treated as "not measurable yet" (the font has not
 * been loaded), because otherwise the field visibly collapsed while
 * loading.
 */
export const clampedHeight = (
  measured: number,
  lineHeight: number,
  maxRows: number | undefined,
): number =>
  !maxRows || !lineHeight ? measured : Math.min(measured, lineHeight * maxRows);
