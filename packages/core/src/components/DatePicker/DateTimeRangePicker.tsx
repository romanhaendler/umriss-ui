import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "../../lib/cx";
import { Button } from "../Button";
import { Popover } from "../Popover";
import { Checkbox } from "../Checkbox";
import { useFormField } from "../FormField";
import { startOfMonth, sameDay, dayOnly } from "./Calendar";
import { rangeDays, defaultPresets } from "./range";
import { MonthPair, PresetColumn } from "./RangePanel";
import { RangeTrigger } from "./RangeTrigger";
import type { DateRange, RangePreset } from "./range";
import { dstChoiceFor, resolveLocalTime, pad2 } from "./time";
import type { DstStatus, DstChoice } from "./time";
import { TimeField } from "./TimeField";
import { rangeFromDays, order, orderByDay } from "./contract";
import styles from "./DatePicker.module.css";
import { useFormats, useWording } from "../../lib/language";

interface TimeValues {
  hour: string;
  minute: string;
  second: string;
}

const ALL_DAY_START: TimeValues = { hour: "00", minute: "00", second: "00" };
const allDayEnd = (withSeconds: boolean): TimeValues => ({
  hour: "23",
  minute: "59",
  second: withSeconds ? "59" : "00",
});

const isAllDay = (from: Date, to: Date, withSeconds: boolean): boolean =>
  from.getHours() === 0 &&
  from.getMinutes() === 0 &&
  from.getSeconds() === 0 &&
  to.getHours() === 23 &&
  to.getMinutes() === 59 &&
  (withSeconds ? to.getSeconds() === 59 : to.getSeconds() === 0);

const timeValuesOf = (d: Date, withSeconds: boolean): TimeValues => ({
  hour: pad2(d.getHours()),
  minute: pad2(d.getMinutes()),
  second: pad2(withSeconds ? d.getSeconds() : 0),
});

/* Outside the component, because they depend only on their arguments - closed
   over inside the component, the list of memo dependencies hung on a function
   that came into being anew on every render. */
const resolve = (day: Date | null, time: TimeValues, withSeconds: boolean): DstStatus | null => {
  if (!day) return null;
  return resolveLocalTime(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    Math.min(23, Number.parseInt(time.hour, 10) || 0),
    Math.min(59, Number.parseInt(time.minute, 10) || 0),
    withSeconds ? Math.min(59, Number.parseInt(time.second, 10) || 0) : 0,
  );
};

const resolveChoice = (status: DstStatus | null, choice: DstChoice): Date | null => {
  if (!status) return null;
  if (status.kind === "ambiguous") return choice === "earlier" ? status.earlier : status.later;
  return status.date;
};

/**
 * The props resemble the union of DateRangePickerProps and DateTimePickerProps -
 * the promises expressly do NOT.
 *
 * The value contract: exact instants (resolution "instant"), not midnight.
 * `from` never lies after `to`. Presets mean the same days as in the
 * DateRangePicker, but express the end as the last representable moment of the
 * day (23:59 or 23:59:59 depending on `withSeconds`) instead of as midnight. For
 * the daylight-saving change the same reservation holds as for the
 * DateTimePicker, separately per end of the range.
 */
export interface DateTimeRangePickerProps {
  /** The time span with times at both ends; `null` means none. */
  value: DateRange | null;
  /** Runs only on "Apply" and on clearing (`null`), never between the two
      clicks. If the end lies before the start, both swap on applying - there is
      no error state. */
  onChange: (range: DateRange | null) => void;
  /** Show the seconds fields (Default: false). */
  withSeconds?: boolean;
  /** What stands in the empty field. */
  placeholder?: string;
  /** Locks the field and the panel. */
  disabled?: boolean;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** `sm` for dense forms and table rows, `md` otherwise. */
  size?: "sm" | "md";
  /** Shows a cross where a value is set, which fades in on hover/focus and
      clears the value. */
  clearable?: boolean;
  /**
   * The quick-select column in the panel; presets apply for the whole day and
   * close immediately. Without a value the default presets; an empty array
   * hides the column.
   */
  presets?: RangePreset[];
}

/**
 * A time span with times at both ends - the same interaction logic as the
 * DateRangePicker, extended by times, without sacrificing the lightness:
 * - Two clicks set the days (backwards allowed, the ends swap silently), after
 *   which the focus jumps straight into the first time field: type 0800, slide
 *   on, type 1700, Enter - done.
 * - "All day" (the default with an empty value) sets 00:00-23:59 and turns the
 *   whole thing back into the two-click selection: after the second click the
 *   focus lies on "Apply", and Enter completes it.
 * - The foot line counts along live: days during the selection of days, the
 *   exact duration as soon as both times are settled.
 * - If the end lies in time before the start, both swap on applying - there is
 *   no error state.
 * - Missing and doubled hours of the daylight-saving change are recognised per
 *   end and treated honestly, as in the DateTimePicker.
 */
export function DateTimeRangePicker({
  value,
  onChange,
  withSeconds = false,
  placeholder,
  disabled = false,
  invalid,
  size = "md",
  clearable = false,
  presets,
}: DateTimeRangePickerProps) {
  const field = useFormField();
  const wording = useWording();
  const formats = useFormats();
  const placeholderText = placeholder ?? wording.dateRangePlaceholder;
  const isInvalid = invalid ?? field?.invalid ?? false;
  /* Out of the wording as in the DateRangePicker - the constant knew only
     German, and an overridden label reached only one of the two pickers. */
  const presetList = useMemo(() => presets ?? defaultPresets(wording), [presets, wording]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(value?.from ?? new Date()));
  const [active, setActive] = useState<Date>(() => value?.from ?? new Date());
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [hoverDay, setHoverDay] = useState<Date | null>(null);
  const [timeFrom, setTimeFrom] = useState<TimeValues>(ALL_DAY_START);
  const [timeTo, setTimeTo] = useState<TimeValues>(() => allDayEnd(withSeconds));
  const [allDay, setAllDay] = useState(true);
  const [choiceFrom, setChoiceFrom] = useState<DstChoice>("earlier");
  const [choiceTo, setChoiceTo] = useState<DstChoice>("earlier");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fromHourRef = useRef<HTMLInputElement>(null);
  const fromMinuteRef = useRef<HTMLInputElement>(null);
  const fromSecondRef = useRef<HTMLInputElement>(null);
  const toHourRef = useRef<HTMLInputElement>(null);
  const toMinuteRef = useRef<HTMLInputElement>(null);
  const toSecondRef = useRef<HTMLInputElement>(null);
  const applyRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const openPanel = () => {
    const start = value?.from ?? new Date();
    setView(startOfMonth(start));
    setActive(start);
    setDateFrom(value ? dayOnly(value.from) : null);
    setDateTo(value ? dayOnly(value.to) : null);
    setTimeFrom(value ? timeValuesOf(value.from, withSeconds) : ALL_DAY_START);
    setTimeTo(value ? timeValuesOf(value.to, withSeconds) : allDayEnd(withSeconds));
    setAllDay(value ? isAllDay(value.from, value.to, withSeconds) : true);
    // A value keeps its occurrence on reopening, per end.
    setChoiceFrom(value ? dstChoiceFor(value.from) : "earlier");
    setChoiceTo(value ? dstChoiceFor(value.to) : "earlier");
    setHoverDay(null);
    setOpen(true);
  };

  const closePanel = (refocus = true) => {
    setOpen(false);
    setHoverDay(null);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (day: Date) => {
    if (!dateFrom || dateTo) {
      // Begin a new selection (even if a complete range already stands).
      setDateFrom(day);
      setDateTo(null);
      setActive(day);
      return;
    }
    // The second click: apply in order, then straight on to the time or - for
    // the whole day - to the Apply button.
    const [from, to] = orderByDay(dateFrom, day);
    setDateFrom(dayOnly(from));
    setDateTo(dayOnly(to));
    setActive(day);
    // The choice between two identical wall-clock times holds per day.
    setChoiceFrom("earlier");
    setChoiceTo("earlier");
    requestAnimationFrame(() => {
      if (allDay) {
        applyRef.current?.focus();
      } else {
        fromHourRef.current?.focus();
      }
    });
  };

  // The keyboard: the focus follows the active day across both months - but only
  // as long as the focus lies in the calendar (not in time fields).
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focus = document.activeElement;
    if (!focus || !panel.contains(focus)) return;
    if (focus instanceof HTMLInputElement || focus === applyRef.current) return;
    panel.querySelector<HTMLButtonElement>('[data-active="true"]')?.focus();
  }, [active, open]);

  const effectiveFrom: TimeValues = allDay ? ALL_DAY_START : timeFrom;
  /* Memoised: `allDayEnd` builds a new object on every call, and the memo below
     it would therefore run anew on every render. */
  const effectiveToTime = useMemo(
    () => (allDay ? allDayEnd(withSeconds) : timeTo),
    [allDay, withSeconds, timeTo],
  );

  const statusFrom = useMemo(() => resolve(dateFrom, effectiveFrom, withSeconds), [dateFrom, effectiveFrom, withSeconds]);
  const statusTo = useMemo(() => resolve(dateTo, effectiveToTime, withSeconds), [dateTo, effectiveToTime, withSeconds]);

  const resultFrom = useMemo(() => resolveChoice(statusFrom, choiceFrom), [statusFrom, choiceFrom]);
  const resultTo = useMemo(() => resolveChoice(statusTo, choiceTo), [statusTo, choiceTo]);

  const apply = () => {
    if (!resultFrom || !resultTo) return;
    // Never "the wrong way round": if the end lies before the start, both swap.
    const [from, to] = order(resultFrom, resultTo);
    onChange({ from, to });
    closePanel();
  };

  // The range presentation in the calendar
  const bandFrom = dateFrom;
  const bandTo = dateTo;
  const previewTo = dateFrom && !dateTo ? hoverDay : null;

  const durationText = (): string => {
    if (!resultFrom || !resultTo) return "";
    if (allDay && dateFrom && dateTo) {
      const days = rangeDays(dateFrom, dateTo);
      return wording.daysAllDay(days);
    }
    const ms = Math.abs(resultTo.getTime() - resultFrom.getTime());
    const minutes = Math.round(ms / 60_000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const min = minutes % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(wording.days(days));
    if (hours > 0) parts.push(wording.hoursShort(hours));
    if (min > 0 || parts.length === 0) parts.push(wording.minutesShort(min));
    return wording.duration(parts);
  };

  const footText = (() => {
    if (!dateFrom) return wording.chooseStartDate;
    if (!dateTo) {
      if (hoverDay) {
        const [a, b] =
          dayOnly(hoverDay).getTime() < dayOnly(dateFrom).getTime() ? [hoverDay, dateFrom] : [dateFrom, hoverDay];
        const days = rangeDays(a, b);
        return wording.rangePreview(formats.dateShort(a), formats.dateShort(b), days);
      }
      return wording.chooseEndDate;
    }
    return durationText();
  })();

  const presetIsActive = (preset: RangePreset): boolean => {
    if (!dateFrom || !dateTo || !allDay) return false;
    const range = preset.range();
    return sameDay(range.from, dateFrom) && sameDay(range.to, dateTo);
  };


  const timeRow = (
    side: "from" | "to",
    date: Date | null,
    time: TimeValues,
    setTime: (t: TimeValues) => void,
    refs: [React.RefObject<HTMLInputElement | null>, React.RefObject<HTMLInputElement | null>, React.RefObject<HTMLInputElement | null>],
    nextRow?: React.RefObject<HTMLInputElement | null>,
  ) => {
    const [hourRef, minuteRef, secondRef] = refs;
    return (
      <div className={styles.timeHalf}>
        <span className={styles.timeHalfHead}>
          <span className={styles.timeLabel}>{side === "from" ? wording.sideFrom : wording.sideTo}</span>
          <span className={cx(styles.timeDate, !date && styles.placeholder)}>
            {date ? formats.dateShort(date) : "–"}
          </span>
        </span>
        <div className={styles.timeGroup}>
          <TimeField
            own={hourRef}
            value={time.hour}
            onValue={(v) => setTime({ ...time, hour: v })}
            max={23}
            label={side === "from" ? wording.startHour : wording.endHour}
            next={minuteRef}
            disabled={allDay}
          />
          <span className={styles.timeSeparator}>:</span>
          <TimeField
            own={minuteRef}
            value={time.minute}
            onValue={(v) => setTime({ ...time, minute: v })}
            max={59}
            label={side === "from" ? wording.startMinute : wording.endMinute}
            next={withSeconds ? secondRef : nextRow}
            disabled={allDay}
          />
          {withSeconds && (
            <>
              <span className={styles.timeSeparator}>:</span>
              <TimeField
                own={secondRef}
                value={time.second}
                onValue={(v) => setTime({ ...time, second: v })}
                max={59}
                label={side === "from" ? wording.startSecond : wording.endSecond}
                next={nextRow}
                disabled={allDay}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const dstHint = (side: string, status: DstStatus | null, choice: DstChoice, setChoice: (c: DstChoice) => void) => {
    if (!status || status.kind === "ok") return null;
    if (status.kind === "missing") {
      return (
        <p className={styles.dstHint}>
          {wording.timeMissingHintSide(side, formats.time(status.date, withSeconds))}
        </p>
      );
    }
    return (
      <div className={styles.dstChoice}>
        <p className={styles.dstHint}>{wording.timeAmbiguousHintSide(side)}</p>
        <div className={styles.dstButtons}>
          <Button size="sm" variant={choice === "earlier" ? "primary" : "secondary"} onClick={() => setChoice("earlier")}>
            {wording.timeEarlier(formats.offset(status.earlier))}
          </Button>
          <Button size="sm" variant={choice === "later" ? "primary" : "secondary"} onClick={() => setChoice("later")}>
            {wording.timeLater(formats.offset(status.later))}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <RangeTrigger
        wrapRef={wrapRef}
        triggerRef={triggerRef}
        panel={{ id: panelId, open, onToggle: () => (open ? setOpen(false) : openPanel()) }}
        field={field}
        state={{ disabled, invalid: isInvalid, clearable, size }}
        hasValue={!!value}
        display={
          value &&
          (sameDay(value.from, value.to) ? (
            <>
              {formats.date(value.from)}, {formats.time(value.from, withSeconds)}
              <span className={styles.rangeDash}>–</span>
              {formats.time(value.to, withSeconds)}
            </>
          ) : (
            <>
              {formats.date(value.from)}, {formats.time(value.from, withSeconds)}
              <span className={styles.rangeDash}>–</span>
              {formats.date(value.to)}, {formats.time(value.to, withSeconds)}
            </>
          ))
        }
        icon={
          <svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true" className={styles.icon}>
            <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 4v3.2l2.2 1.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        placeholder={placeholderText}
        onClear={() => {
          onChange(null);
          if (open) closePanel(false);
        }}
        ariaLabel={wording.dateTimeRangeClear}
      />
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
        anchorRef={triggerRef}
        insideRefs={[wrapRef]}
        role="dialog"
        ariaLabel={wording.dateTimeRangePanel}
        id={panelId}
        className={cx(styles.panel, styles.rangePanel)}
      >
          <div ref={panelRef}>
            <div className={styles.rangeBody}>
              <PresetColumn
                presets={presetList}
                isActive={presetIsActive}
                onChoose={(preset) => {
                  const range = preset.range();
                  onChange(rangeFromDays(range.from, range.to, "instant", withSeconds));
                  closePanel();
                }}
              />
              <div className={styles.rangeRight}>
                <MonthPair
                  view={view}
                  onView={setView}
                  active={active}
                  onActive={setActive}
                  onPick={choose}
                  bandFrom={bandFrom}
                  bandTo={bandTo}
                  previewTo={previewTo}
                  onHoverDay={setHoverDay}
                />
                <div
                  className={styles.timeRangeRow}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      apply();
                    }
                  }}
                >
                  {timeRow("from", dateFrom, timeFrom, setTimeFrom, [fromHourRef, fromMinuteRef, fromSecondRef], toHourRef)}
                  {timeRow("to", dateTo, timeTo, setTimeTo, [toHourRef, toMinuteRef, toSecondRef])}
                </div>
                {dstHint(wording.sideFrom, statusFrom, choiceFrom, setChoiceFrom)}
                {dstHint(wording.sideTo, statusTo, choiceTo, setChoiceTo)}
              </div>
            </div>
            <div className={styles.foot}>
              {/* No FormFieldBoundary of its own: the popover already resets the
                  context in the panel. */}
              <Checkbox
                id={`${panelId}-allday`}
                label={wording.allDay}
                checked={allDay}
                onChange={(event) => {
                  const on = event.target.checked;
                  setAllDay(on);
                  // Off: straight into the first time field. On: the time fields
                  // are disabled - the focus then goes to Apply, so that Enter
                  // gets through.
                  requestAnimationFrame(() => {
                    if (!on) fromHourRef.current?.focus();
                    else if (dateFrom && dateTo) applyRef.current?.focus();
                  });
                }}
              />
              <span className={cx(styles.footNote, styles.footNoteRight)} aria-live="polite">
                {footText}
              </span>
              <div className={styles.footLeft}>
                {value && (
                  <Button size="sm" variant="ghost" onClick={() => { onChange(null); closePanel(); }}>
                    {wording.clear}
                  </Button>
                )}
                <Button
                  ref={applyRef}
                  size="sm"
                  variant="primary"
                  disabled={!resultFrom || !resultTo}
                  onClick={apply}
                >
                  {wording.apply}
                </Button>
              </div>
            </div>
          </div>
      </Popover>
    </>
  );
}
