import { useId, useMemo, useRef, useState } from "react";
import { Button } from "../Button";
import { Popover } from "../Popover";
import { useFormField } from "../FormField";
import { Calendar, startOfMonth } from "./Calendar";
import { dstChoiceFor, resolveLocalTime, pad2, truncateInstant } from "./time";
import type { DstStatus, DstChoice } from "./time";
import { RangeTrigger } from "./RangeTrigger";
import { TimeField } from "./TimeField";
import styles from "./DatePicker.module.css";
import { useFormats, useWording } from "../../lib/language";

/* The time and daylight-saving logic lies in ./time, the time field in
   ./TimeField. Passed on here so that existing import paths
   ("./DateTimePicker") resolve unchanged. */
export { resolveLocalTime, offsetLabel, pad2 } from "./time";
export type { DstStatus } from "./time";
export { TimeField } from "./TimeField";
export type { TimeFieldProps } from "./TimeField";

/* ------------------------------------------------------------------ */
/* DateTimePicker                                                      */
/* ------------------------------------------------------------------ */

/**
 * The value contract: an exact instant (resolution "instant"), with seconds
 * depending on `withSeconds`. If the entered wall-clock time falls into a
 * change of daylight saving time, the instant handed out can deviate from it: a
 * skipped hour is pushed forward, and for a doubled hour the choice made in the
 * panel applies (the default being the earlier one). A value is reported only
 * with "Apply", "Now" or "Clear", not already on the click on a day.
 */
export interface DateTimePickerProps {
  /** The instant; `null` means none. */
  value: Date | null;
  /** Runs only on completion - "Apply", "Now" or "Clear" - and not already on
      the click on a day: a day without a time would be a half-set value here,
      and a half value is no value. */
  onChange: (date: Date | null) => void;
  /** Show the seconds field (Default: false). */
  withSeconds?: boolean;
  /** What stands in the empty field. */
  placeholder?: string;
  /** Locks the field and the panel. */
  disabled?: boolean;
  /** `sm` for dense forms and table rows, `md` otherwise. */
  size?: "sm" | "md";
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** Shows a cross where a value is set, which fades in on hover/focus and
      clears the value. */
  clearable?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  withSeconds = false,
  placeholder,
  disabled = false,
  size = "md",
  invalid,
  clearable = false,
}: DateTimePickerProps) {
  const field = useFormField();
  const wording = useWording();
  const formats = useFormats();
  const placeholderText = placeholder ?? wording.dateTimePlaceholder;
  const isInvalid = invalid ?? field?.invalid ?? false;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(value ?? new Date()));
  const [active, setActive] = useState<Date>(() => value ?? new Date());
  const [day, setDay] = useState<Date | null>(value);
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  const [second, setSecond] = useState("00");
  const [dstChoice, setDstChoice] = useState<DstChoice>("earlier");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const openPanel = () => {
    const start = value ?? new Date();
    setView(startOfMonth(start));
    setActive(start);
    setDay(value ? start : null);
    setHour(pad2(value ? start.getHours() : 0));
    setMinute(pad2(value ? start.getMinutes() : 0));
    setSecond(pad2(value && withSeconds ? start.getSeconds() : 0));
    /* Not simply "earlier": a value that is the later occurrence of a doubled
       hour must remain so on reopening, otherwise the next "Apply" shifts it by
       an hour. */
    setDstChoice(value ? dstChoiceFor(value) : "earlier");
    setOpen(true);
  };

  const closePanel = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const status: DstStatus | null = useMemo(() => {
    if (!day) return null;
    return resolveLocalTime(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      Math.min(23, Number.parseInt(hour, 10) || 0),
      Math.min(59, Number.parseInt(minute, 10) || 0),
      withSeconds ? Math.min(59, Number.parseInt(second, 10) || 0) : 0,
    );
  }, [day, hour, minute, second, withSeconds]);

  const result: Date | null = useMemo(() => {
    if (!status) return null;
    if (status.kind === "ambiguous") return dstChoice === "earlier" ? status.earlier : status.later;
    return status.date;
  }, [status, dstChoice]);

  const apply = () => {
    if (!result) return;
    onChange(result);
    closePanel();
  };

  /* "Now" is an exact instant and has nothing to resolve. It used to run through
     the wall-clock fields and `resolveLocalTime`, and in the second 02:30 of the
     daylight-saving change the first one came out of that - an hour old before
     anybody had saved (library-audit 02). */
  const now = () => {
    onChange(truncateInstant(new Date(), withSeconds));
    closePanel();
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
        display={value && formats.dateTime(value, withSeconds)}
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
        ariaLabel={wording.dateTimeClear}
      />
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
        anchorRef={triggerRef}
        insideRefs={[wrapRef]}
        role="dialog"
        ariaLabel={wording.dateTimePanel}
        id={panelId}
        className={styles.panel}
      >
          <div ref={panelRef}>
            <Calendar
              autoFocus
              view={view}
              onView={setView}
              active={active}
              onActive={setActive}
              value={day}
              onPick={(chosen) => {
                setDay(chosen);
                setActive(chosen);
                // The choice between two identical wall-clock times holds for
                // exactly one day; another day must be asked afresh.
                setDstChoice("earlier");
                // After choosing the day, straight on to the time.
                requestAnimationFrame(() => hourRef.current?.focus());
              }}
            />

            {/* Enter applies, as in the DateTimeRangePicker: four pickers, one
                way of operating. */}
            <div
              className={styles.timeRow}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  apply();
                }
              }}
            >
              <span className={styles.timeLabel}>{wording.timeOfDay}</span>
              <div className={styles.timeGroup}>
                <TimeField own={hourRef} value={hour} onValue={setHour} max={23} label={wording.hour} next={minuteRef} />
                <span className={styles.timeSeparator}>:</span>
                <TimeField own={minuteRef} value={minute} onValue={setMinute} max={59} label={wording.minute} next={withSeconds ? secondRef : undefined} />
                {withSeconds && (
                  <>
                    <span className={styles.timeSeparator}>:</span>
                    <TimeField own={secondRef} value={second} onValue={setSecond} max={59} label={wording.second} />
                  </>
                )}
              </div>
            </div>

            {status?.kind === "missing" && (
              <p className={styles.dstHint}>
                {wording.timeMissingHint(formats.time(status.date, withSeconds))}
              </p>
            )}

            {status?.kind === "ambiguous" && (
              <div className={styles.dstChoice}>
                <p className={styles.dstHint}>{wording.timeAmbiguousHint}</p>
                <div className={styles.dstButtons}>
                  <Button
                    size="sm"
                    variant={dstChoice === "earlier" ? "primary" : "secondary"}
                    onClick={() => setDstChoice("earlier")}
                  >
                    {wording.timeEarlier(formats.offset(status.earlier))}
                  </Button>
                  <Button
                    size="sm"
                    variant={dstChoice === "later" ? "primary" : "secondary"}
                    onClick={() => setDstChoice("later")}
                  >
                    {wording.timeLater(formats.offset(status.later))}
                  </Button>
                </div>
              </div>
            )}

            <div className={styles.foot}>
              <div className={styles.footLeft}>
                <Button size="sm" variant="ghost" onClick={now}>
                  {wording.now}
                </Button>
                {value && (
                  <Button size="sm" variant="ghost" onClick={() => { onChange(null); closePanel(); }}>
                    {wording.clear}
                  </Button>
                )}
              </div>
              <Button size="sm" variant="primary" disabled={!result} onClick={apply}>
                {wording.apply}
              </Button>
            </div>
          </div>
      </Popover>
    </>
  );
}
