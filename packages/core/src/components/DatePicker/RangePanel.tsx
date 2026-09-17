/* The parts both range panels are made of. Pure presentation - what a click
   means is still decided by the respective picker: the DateRangePicker applies
   immediately on the second click, the DateTimeRangePicker jumps into the first
   time field (HANDOFF A.5 §5, this logic stays untouched). */

import { cx } from "../../lib/cx";
import { Calendar } from "./Calendar";
import { addMonths } from "./grid";
import { windowView, calendarPairProps } from "./range";
import type { CalendarPairInput, RangePreset } from "./range";
import styles from "./DatePicker.module.css";
import { useWording } from "../../lib/language";

export interface PresetColumnProps {
  presets: readonly RangePreset[];
  /** Which preset currently corresponds to the chosen time span. */
  isActive: (preset: RangePreset) => boolean;
  /** The caller decides what the preset means - the resolution distinguishes
      the two pickers. */
  onChoose: (preset: RangePreset) => void;
}

export function PresetColumn({ presets, isActive, onChoose }: PresetColumnProps) {
  /* Before the early return, so that the number of hooks does not depend on
     whether there are presets. */
  const wording = useWording();
  if (presets.length === 0) return null;
  return (
    <div className={styles.presetColumn} role="group" aria-label={wording.quickSelect}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          className={cx(styles.preset, isActive(preset) && styles.presetActive)}
          onClick={() => onChoose(preset)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export interface MonthPairProps extends CalendarPairInput {
  /** The left month; the right one follows from it. */
  view: Date;
  onView: (month: Date) => void;
}

/**
 * The two chained months. The right month, the window arithmetic and the shared
 * calendar configuration lie here, so that no caller rebuilds them: only the
 * left month carries the back arrow, only the right one the forward arrow, and
 * both are furnished identically.
 */
export function MonthPair({ view, onView, ...input }: MonthPairProps) {
  const shared = calendarPairProps(input);
  const right = addMonths(view, 1);
  const showMonth = (month: Date) => {
    const next = windowView(view, month);
    if (next) onView(next);
  };
  return (
    <div className={styles.monthPair}>
      <div className={styles.monthColumn}>
        <Calendar autoFocus view={view} onView={showMonth} withoutNext {...shared} />
      </div>
      <div className={styles.monthColumn}>
        <Calendar view={right} onView={showMonth} withoutPrevious {...shared} />
      </div>
    </div>
  );
}
