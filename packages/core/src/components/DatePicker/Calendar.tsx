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
  startOfWeek,
} from "./grid";
import styles from "./DatePicker.module.css";
import { IconButton } from "../Button";
import { Select } from "../Select";
import { dayShown, zoneToday } from "./zoned";
import { NO_BOUNDS, clampDay, monthOutside, outside } from "./bounds";
import type { DayBounds } from "./bounds";
import { DEFAULT_WORDING, useFormats, useWording } from "../../lib/language";

/* A pass-through of the wording's weekday heads; part of the calendar
   module's public extent. */
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
  /** A digit typed on the grid; the grid keeps the key from the page. */
  onDigit?: (digit: string) => void;
  /** The days the picker allows; a day outside is drawn quiet and cannot be picked. */
  bounds?: DayBounds;
}

/* The APG keys beyond the arrows: a month, a year (with Shift), the week's ends. */
function jumpKey(key: string, shift: boolean, active: Date): Date | undefined {
  if (key === "PageUp") return shiftMonth(active, shift ? -12 : -1);
  if (key === "PageDown") return shiftMonth(active, shift ? 12 : 1);
  if (key === "Home") return startOfWeek(active);
  if (key === "End") return addDays(startOfWeek(active), 6);
  return undefined;
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
  onDigit,
  bounds = NO_BOUNDS,
}: CalendarProps) {
  const wording = useWording();
  const formats = useFormats();
  const gridRef = useRef<HTMLDivElement>(null);
  const { timeZone } = formats;

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
      const next = clampDay(addDays(active, step), bounds);
      onActive(next);
      if (viewFollows(next, view)) onView(startOfMonth(next));
      return;
    }
    const jumped = jumpKey(event.key, event.shiftKey, active);
    if (jumped) {
      const moved = clampDay(jumped, bounds);
      event.preventDefault();
      onActive(moved);
      if (viewFollows(moved, view)) onView(startOfMonth(moved));
      return;
    }
    if (onDigit && /^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      onDigit(event.key);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!outside(active, bounds)) onPick(active);
    }
  };

  /* Paging takes the active day along. It carries the grid's one tab stop,
     and left behind in the month paged away from it took that stop with it:
     after the arrow buttons, Tab went past the grid. */
  const page = (months: number) => {
    onView(startOfMonth(clampDay(addMonths(view, months), bounds)));
    onActive(clampDay(shiftMonth(active, months), bounds));
  };

  const year = view.getFullYear();
  const thisYear = (today ?? zoneToday(timeZone)).getFullYear();
  // The years within ±100 of today that the range allows, and always the one in view.
  const firstYear = Math.min(Math.max(thisYear - 100, bounds.min?.getFullYear() ?? -Infinity), year);
  const lastYear = Math.max(Math.min(thisYear + 100, bounds.max?.getFullYear() ?? Infinity), year);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  const days = monthGrid(view);
  const referenceDay = today ?? zoneToday(timeZone);

  // A settled end or - as long as only the start is there - the preview.
  const { from: bandFrom, to: bandTo, isPreview } = bandBounds(rangeFrom, rangeTo, previewTo);

  return (
    <>
      <div className={styles.head}>
        {withoutPrevious ? (
          <span className={styles.pageSpacer} aria-hidden="true" />
        ) : (
          <IconButton size="sm" aria-label={wording.previousMonth} disabled={monthOutside(addMonths(view, -1), bounds)} onClick={() => page(-1)}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              <path d="M6.4 1.8 3.2 5l3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
        )}
        {withoutPrevious ? (
          <span className={styles.month}>{formats.month(dayShown(view, timeZone))}</span>
        ) : (
          <span className={styles.jump}>
            <Select
              size="sm"
              chars={9}
              aria-label={wording.monthSelect}
              value={view.getMonth()}
              onChange={(event) => page(Number(event.target.value) - view.getMonth())}
            >
              {Array.from({ length: 12 }, (_, month) => (
                <option key={month} value={month} disabled={monthOutside(new Date(year, month, 1), bounds) && month !== view.getMonth()}>
                  {formats.monthName(new Date(year, month, 1))}
                </option>
              ))}
            </Select>
            <Select
              size="sm"
              chars={4}
              aria-label={wording.yearSelect}
              value={year}
              onChange={(event) => page((Number(event.target.value) - year) * 12)}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {String(y)}
                </option>
              ))}
            </Select>
          </span>
        )}
        {withoutNext ? (
          <span className={styles.pageSpacer} aria-hidden="true" />
        ) : (
          <IconButton size="sm" aria-label={wording.nextMonth} disabled={monthOutside(addMonths(view, 1), bounds)} onClick={() => page(1)}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              <path d="M3.6 1.8 6.8 5 3.6 8.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
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
          const isOut = outside(day, bounds);
          const isStartWithoutEnd = !bandTo && sameDay(day, rangeFrom);
          return (
            <button
              key={day.toISOString()}
              type="button"
              tabIndex={isActive ? 0 : -1}
              data-active={isActive || undefined}
              aria-label={formats.dateLong(dayShown(day, timeZone))}
              aria-pressed={sameDay(day, value) || isBandFrom || isBandTo || isStartWithoutEnd}
              aria-current={sameDay(day, referenceDay) ? "date" : undefined}
              aria-disabled={isOut || undefined}
              className={cx(
                styles.day,
                !inMonth && styles.otherMonth,
                isOut && styles.outside,
                sameDay(day, value) && styles.selected,
                sameDay(day, referenceDay) && styles.today,
                inBand && styles.inRange,
                inBand && isPreview && styles.inPreview,
                (isBandFrom || isStartWithoutEnd) && !isSingle && styles.rangeFrom,
                isBandTo && !isSingle && styles.rangeTo,
                isSingle && styles.rangeSingle,
                isBandTo && isPreview && styles.previewEnd,
              )}
              onClick={isOut ? undefined : () => onPick(day)}
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
