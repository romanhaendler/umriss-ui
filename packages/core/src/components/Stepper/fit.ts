/* How a horizontal stepper stands in the width it has - measured, not
   guessed. Pure arithmetic over widths the component reads off a hidden copy
   of its list.

   A row needs every label on one line beside its marker, with a short line to
   the next step. Beneath the markers, every step takes an equal share, and the
   share has to hold the longest word of the widest step. Narrower than that -
   five steps on a phone - the steps take a column, as
   `orientation="vertical"` does: a row had run the labels into each other and
   struck them through with the lines. */

export type StepperFit = "row" | "stacked" | "column";

/**
 * @param available the width the list has
 * @param row the list's width with every label on one line (`rowWidth`)
 * @param stacked the list's width with the labels beneath the markers, every
 *   step as wide as the widest one's longest word (`stackedWidth`)
 */
export function stepperFit(available: number, row: number, stacked: number): StepperFit {
  /* No tolerance: a word half a pixel wider than its share breaks. */
  if (available <= 0 || row <= available) return "row";
  return stacked <= available ? "stacked" : "column";
}

/** The width of the list as a row: every step but the last takes an equal
    share, so each takes the widest one's; the last takes its own. */
export function rowWidth(stepWidths: readonly number[], gap: number): number {
  const n = stepWidths.length;
  if (n === 0) return 0;
  const last = stepWidths[n - 1]!;
  return n === 1 ? last : (n - 1) * Math.max(...stepWidths.slice(0, -1)) + last + (n - 1) * gap;
}

/** The width of the stacked list: equal shares, each the widest step's. */
export function stackedWidth(stepWidths: readonly number[], gap: number): number {
  if (stepWidths.length === 0) return 0;
  return stepWidths.length * Math.max(...stepWidths) + (stepWidths.length - 1) * gap;
}
