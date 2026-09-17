/* The time spans of the range pickers: presets, the day count and the visible
   two-month window. This lies here and not in the DateRangePicker, so that the
   DateTimeRangePicker does not have to reach sideways into a sibling.

   `DateRange` is `{ from, to }` and a `RangePreset` carries a `range`. Those
   names were German - `von`, `bis`, `bereich` - on the argument that they are
   the shape `@umriss-ui/table` reads a chosen span out of (`columnFilter`) and
   that a caller writes its own presets against. That argument said who has to
   move with them, not that they may stay: a field a caller has to type is the
   first place a second language shows, not the last.

   A preset's key is now its wording key (`today`, `last7Days`), so the second
   table that mapped German labels onto those keys is gone. `presetRange`
   switches on the key, and the label comes from the register - which is what
   kept the calculation safe from a renaming in the first place. */

import { DEFAULT_WORDING } from "../../lib/language";
import type { Wording } from "../../lib/language";
import { startOfMonth, dayOnly, addMonths, addDays } from "./grid";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface RangePreset {
  label: string;
  range: () => DateRange;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The number of days in the range, both ends included. It is calculated on day
 * boundaries and rounded, so that the 23 and 25 hour days of the daylight
 * saving change do not shift the result.
 */
export const rangeDays = (from: Date, to: Date): number =>
  Math.round((dayOnly(to).getTime() - dayOnly(from).getTime()) / DAY_MS) + 1;

export const PRESET_LABELS = [
  "today",
  "yesterday",
  "last7Days",
  "last30Days",
  "thisMonth",
  "previousMonth",
  "thisQuarter",
  "thisYear",
] as const;

export type PresetLabel = (typeof PRESET_LABELS)[number];

/**
 * The time span of a preset relative to a reference day. The reference is an
 * argument and not a reading of the clock, so that the presets are checkable.
 */
export function presetRange(label: PresetLabel, reference: Date): DateRange {
  const h = dayOnly(reference);
  switch (label) {
    case "today":
      return { from: h, to: h };
    case "yesterday":
      return { from: addDays(h, -1), to: addDays(h, -1) };
    case "last7Days":
      return { from: addDays(h, -6), to: h };
    case "last30Days":
      return { from: addDays(h, -29), to: h };
    case "thisMonth":
      return { from: new Date(h.getFullYear(), h.getMonth(), 1), to: new Date(h.getFullYear(), h.getMonth() + 1, 0) };
    case "previousMonth":
      return { from: new Date(h.getFullYear(), h.getMonth() - 1, 1), to: new Date(h.getFullYear(), h.getMonth(), 0) };
    case "thisQuarter": {
      const q = Math.floor(h.getMonth() / 3) * 3;
      return { from: new Date(h.getFullYear(), q, 1), to: new Date(h.getFullYear(), q + 3, 0) };
    }
    case "thisYear":
      return { from: new Date(h.getFullYear(), 0, 1), to: new Date(h.getFullYear(), 11, 31) };
  }
}


/** The time spans most often asked for in evaluations. */
export const defaultPresets = (wording: Wording): RangePreset[] =>
  PRESET_LABELS.map((label) => ({
    label: wording.presets[label],
    range: () => presetRange(label, new Date()),
  }));

/** The same time spans with the preset labels. */
export const DEFAULT_PRESETS: RangePreset[] = defaultPresets(DEFAULT_WORDING);

/**
 * The new left-hand view, so that `month` becomes visible in the window
 * [view, view+1]. null means: the window already fits, do not page.
 */
export function windowView(view: Date, month: Date): Date | null {
  const left = startOfMonth(view).getTime();
  const right = startOfMonth(addMonths(view, 1)).getTime();
  const target = startOfMonth(month).getTime();
  if (target === left || target === right) return null;
  return target < left ? startOfMonth(month) : addMonths(startOfMonth(month), -1);
}

/* ------------------------------------------------------------------ */
/* The shared calendar configuration of the two range pickers          */
/* ------------------------------------------------------------------ */

export interface CalendarPairInput {
  active: Date;
  onActive: (day: Date) => void;
  onPick: (day: Date) => void;
  /** The lower band bound; in the draft the start already chosen. */
  bandFrom: Date | null;
  /** The upper band bound; null as long as only the start is settled. */
  bandTo: Date | null;
  /** The preview end while sweeping over, as long as no end is settled. */
  previewTo: Date | null;
  onHoverDay: (day: Date | null) => void;
}

/**
 * The props with which both months of a range panel are furnished. Two
 * decisions both pickers make alike and which therefore stand here: the
 * calendar carries no single value (`value: null` - the band carries the
 * selection), and days from neighbouring months stay empty, so that no day
 * appears twice in the pair.
 */
export function calendarPairProps(input: CalendarPairInput) {
  const { active, onActive, onPick, bandFrom, bandTo, previewTo, onHoverDay } = input;
  return {
    active,
    onActive,
    value: null,
    onPick,
    rangeFrom: bandFrom,
    rangeTo: bandTo,
    previewTo,
    onHoverDay,
    withoutOtherMonth: true,
  } as const;
}
