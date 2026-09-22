/* The month grid and the date arithmetic of the pickers. Pure functions without
   React: the seam at which the build-up of the grid, the range band and the
   keyboard step are checked. The week starts on Monday, and all days lie on
   local midnight. */

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
/** The same day `n` months on; the 31st becomes the last day of a shorter month. */
export const shiftMonth = (d: Date, n: number) => {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), lastDay));
};
export const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const dayOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const beforeDay = (a: Date, b: Date) => dayOnly(a).getTime() < dayOnly(b).getTime();

/** Cells per month grid: six weeks, so that the panel height never jumps. */
export const GRID_CELLS = 42;

/**
 * The month grid for a view: 42 consecutive days, beginning on the Monday of
 * the week the first of the month falls into. The day is constructed through
 * the Date constructor and therefore skips no change of daylight saving time.
 */
export function monthGrid(view: Date): Date[] {
  const first = startOfMonth(view);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = addDays(first, -offset);
  return Array.from({ length: GRID_CELLS }, (_, index) => addDays(start, index));
}

export interface BandBounds {
  from: Date | null;
  to: Date | null;
  /** The band comes from the hover preview, not from a settled choice. */
  isPreview: boolean;
}

/**
 * The bounds of the range band. As long as no end is settled, the preview takes
 * over its role. Ranges dragged backwards are silently turned around, so that
 * `from` never lies after `to`.
 */
export function bandBounds(
  rangeFrom: Date | null | undefined,
  rangeTo: Date | null | undefined,
  previewTo: Date | null | undefined,
): BandBounds {
  const effectiveTo = rangeTo ?? previewTo ?? null;
  const isPreview = !rangeTo && !!previewTo;
  if (!rangeFrom || !effectiveTo) return { from: null, to: null, isPreview };
  return beforeDay(effectiveTo, rangeFrom)
    ? { from: effectiveTo, to: rangeFrom, isPreview }
    : { from: rangeFrom, to: effectiveTo, isPreview };
}

const STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

/** The day step for an arrow key; undefined for everything else. */
export const dayStep = (key: string): number | undefined => STEPS[key];

/** Must the view follow the step because it leaves the month? */
export const viewFollows = (next: Date, view: Date) =>
  next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear();
