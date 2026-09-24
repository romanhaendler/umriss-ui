import { useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../lib/cx";
import {
  bandBounds,
  startOfMonth,
  viewFollows,
  sameDay,
  monthGrid,
  addMonths,
  addDays,
  shiftMonth,
  dayStep,
  beforeDay,
} from "./grid";
import styles from "./DatePicker.module.css";
import { DEFAULT_WORDING, useFormats, useWording } from "../../lib/language";

/* The weekday heads now stand in the wording. This constant remains as a
   pass-through, because it belongs to the public extent of the calendar
   module. */
export const WEEKDAYS = DEFAULT_WORDING.weekdays;

export { monthFormat, longFormat } from "./format";

export { startOfMonth, addDays, addMonths, sameDay, dayOnly } from "./grid";

export interface CalendarProps {
  /** Focuses the active day on mounting (for opened panels). */
  autoFocus?: boolean;
  view: Date;
  onView: (month: Date) => void;
  active: Date;
  onActive: (day: Date) => void;
  value: Date | null;
  onPick: (day: Date) => void;
  /** Range presentation: the chosen start and (where already present) the end. */
  rangeFrom?: Date | null;
  rangeTo?: Date | null;
  /** The preview end while sweeping over, as long as only the start is settled. */
  previewTo?: Date | null;
  /** Reports the day under the pointer (null on leaving the grid). */
  onHoverDay?: (day: Date | null) => void;
  /** Hide the navigation arrows - for chained month pairs. */
  withoutPrevious?: boolean;
  withoutNext?: boolean;
  /** Leave days of the previous/next month empty (two-month view: no day
      twice). */
  withoutOtherMonth?: boolean;
  /** The reference day for the "today" mark. Injectable, so that the grid is
      deterministically checkable; the default is the current day. */
  today?: Date;
}

/** The shared month grid for DatePicker, DateTimePicker and DateRangePicker. */
export function Calendar({
  autoFocus = false,
  view,
  onView,
  active,
  onActive,
  value,
  onPick,
  rangeFrom = null,
  rangeTo = null,
  previewTo = null,
  onHoverDay,
  withoutPrevious = false,
  withoutNext = false,
  withoutOtherMonth = false,
  today,
}: CalendarProps) {
  const wording = useWording();
  const formats = useFormats();
  const gridRef = useRef<HTMLDivElement>(null);

  // Focus into the grid once on opening
  useEffect(() => {
    if (autoFocus) {
      gridRef.current?.querySelector<HTMLButtonElement>('[data-active="true"]')?.focus();
    }
    // Only on mounting: the focus belongs to the opening of the panel, not to a
    // later change of `autoFocus`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The focus follows the active day - but only if it already lies in the grid.
  // Otherwise the calendar would, for example, take the focus away from the time
  // field again.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!grid.contains(document.activeElement)) return;
    grid.querySelector<HTMLButtonElement>('[data-active="true"]')?.focus();
  }, [active]);

  const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = dayStep(event.key);
    if (step !== undefined) {
      event.preventDefault();
      const next = addDays(active, step);
      onActive(next);
      if (viewFollows(next, view)) onView(startOfMonth(next));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPick(active);
    }
  };

  /* Paging takes the active day along. It carries the grid's one tab stop,
     and left behind in the month paged away from it took that stop with it:
     after the arrow buttons, Tab went past the grid. */
  const page = (months: number) => {
    onView(addMonths(view, months));
    onActive(shiftMonth(active, months));
  };

  const days = monthGrid(view);
  const referenceDay = today ?? new Date();

  // A settled end or - as long as only the start is there - the preview.
  const { from: bandFrom, to: bandTo, isPreview } = bandBounds(rangeFrom, rangeTo, previewTo);

  return (
    <>
      <div className={styles.head}>
        {withoutPrevious ? (
          <span className={styles.pageSpacer} aria-hidden="true" />
        ) : (
          <button type="button" className={styles.page} aria-label={wording.previousMonth} onClick={() => page(-1)}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path d="M6.4 1.8 3.2 5l3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <span className={styles.month}>{formats.month(view)}</span>
        {withoutNext ? (
          <span className={styles.pageSpacer} aria-hidden="true" />
        ) : (
          <button type="button" className={styles.page} aria-label={wording.nextMonth} onClick={() => page(1)}>
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path d="M3.6 1.8 6.8 5 3.6 8.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      <div className={styles.weekdays} aria-hidden="true">
        {wording.weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div
        ref={gridRef}
        className={styles.grid}
        onKeyDown={handleGridKeyDown}
        onMouseLeave={onHoverDay ? () => onHoverDay(null) : undefined}
      >
        {days.map((day) => {
          const inMonth = day.getMonth() === view.getMonth();
          if (!inMonth && withoutOtherMonth) {
            return <span key={day.toISOString()} className={styles.dayEmpty} aria-hidden="true" />;
          }
          const isActive = sameDay(day, active) && (inMonth || !withoutOtherMonth);
          const isBandFrom = sameDay(day, bandFrom);
          const isBandTo = sameDay(day, bandTo);
          const isSingle = isBandFrom && isBandTo;
          const inBand =
            !!bandFrom && !!bandTo && !isBandFrom && !isBandTo && beforeDay(bandFrom, day) && beforeDay(day, bandTo);
          const isStartWithoutEnd = !bandTo && sameDay(day, rangeFrom);
          return (
            <button
              key={day.toISOString()}
              type="button"
              tabIndex={isActive ? 0 : -1}
              data-active={isActive || undefined}
              aria-label={formats.dateLong(day)}
              aria-pressed={sameDay(day, value) || isBandFrom || isBandTo || isStartWithoutEnd}
              aria-current={sameDay(day, referenceDay) ? "date" : undefined}
              className={cx(
                styles.day,
                !inMonth && styles.otherMonth,
                sameDay(day, value) && styles.selected,
                sameDay(day, referenceDay) && styles.today,
                inBand && styles.inRange,
                inBand && isPreview && styles.inPreview,
                (isBandFrom || isStartWithoutEnd) && !isSingle && styles.rangeFrom,
                isBandTo && !isSingle && styles.rangeTo,
                isSingle && styles.rangeSingle,
                isBandTo && isPreview && styles.previewEnd,
              )}
              onClick={() => onPick(day)}
              onMouseEnter={onHoverDay ? () => onHoverDay(day) : undefined}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
}
