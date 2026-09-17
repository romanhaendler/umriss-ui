import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cx } from "../../lib/cx";
import { Button } from "../Button";
import { Popover } from "../Popover";
import { useFormField } from "../FormField";
import { startOfMonth, sameDay, dayOnly } from "./Calendar";
import { rangeDays, defaultPresets } from "./range";
import { MonthPair, PresetColumn } from "./RangePanel";
import { RangeTrigger } from "./RangeTrigger";
import type { DateRange, RangePreset } from "./range";
import { rangeFromDays } from "./contract";
import styles from "./DatePicker.module.css";
import { useFormats, useWording } from "../../lib/language";

/* The range parts lie in ./range, the formats in ./format. Passed on here so
   that existing import paths still resolve. */
export { rangeDays, DEFAULT_PRESETS } from "./range";
export type { DateRange, RangePreset } from "./range";

/**
 * The value contract: both ends on local midnight (resolution "day"), and `from`
 * never lies after `to` - a range dragged backwards is silently turned around.
 * Both ends count inclusively. There is no error state.
 */
export interface DateRangePickerProps {
  /** The time span, both ends on local midnight and both inclusive; `null`
      means none. */
  value: DateRange | null;
  /** Runs as soon as both ends are settled - after the second click, on a
      preset and on clearing (`null`). Ends dragged backwards swap silently;
      there is no error state to handle. */
  onChange: (range: DateRange | null) => void;
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
   * The quick-select column in the panel. Without a value the default presets;
   * an empty array hides the column.
   */
  presets?: RangePreset[];
}

/**
 * The time span selection - the convenience component of the library.
 *
 * The interaction logic (designed for a minimal number of clicks and zero
 * mis-operation):
 * - The first click sets the start, the second click the end; the panel applies
 *   immediately and closes. No "Apply" click needed.
 * - If the second click lies BEFORE the start, both swap silently - a time span
 *   is never "the wrong way round", there is no error state.
 * - After the first click, sweeping shows the arising range as a preview band,
 *   and the foot line counts the days along live.
 * - The presets on the left choose common time spans with one click; the preset
 *   that currently matches is marked.
 * - Two chained months: paging on the outside, no day appears twice.
 * - The same day clicked twice = a one-day time span.
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  invalid,
  size = "md",
  clearable = false,
  presets,
}: DateRangePickerProps) {
  const field = useFormField();
  const wording = useWording();
  const formats = useFormats();
  const placeholderText = placeholder ?? wording.dateRangePlaceholder;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const presetList = useMemo(() => presets ?? defaultPresets(wording), [presets, wording]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(value?.from ?? new Date()));
  const [active, setActive] = useState<Date>(() => value?.from ?? new Date());
  const [draftFrom, setDraftFrom] = useState<Date | null>(null);
  const [hoverDay, setHoverDay] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const openPanel = () => {
    const start = value?.from ?? new Date();
    setView(startOfMonth(start));
    setActive(start);
    setDraftFrom(null);
    setHoverDay(null);
    setOpen(true);
  };

  const closePanel = (refocus = true) => {
    setOpen(false);
    setDraftFrom(null);
    setHoverDay(null);
    if (refocus) triggerRef.current?.focus();
  };

  const applyRange = (a: Date, b: Date) => {
    onChange(rangeFromDays(a, b, "day", false));
    closePanel();
  };

  const choose = (day: Date) => {
    if (!draftFrom) {
      setDraftFrom(day);
      setActive(day);
      return;
    }
    applyRange(draftFrom, day);
  };

  // The keyboard: the focus follows the active day across both months.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    if (!panel.contains(document.activeElement)) return;
    panel.querySelector<HTMLButtonElement>('[data-active="true"]')?.focus();
  }, [active, open]);

  // The range presentation in the calendar: the settled value OR the running draft.
  const bandFrom = draftFrom ?? value?.from ?? null;
  const bandTo = draftFrom ? null : (value?.to ?? null);
  const previewTo = draftFrom ? hoverDay : null;

  // The foot line: it always says what happens next - or counts along live.
  const footText = (() => {
    if (draftFrom && hoverDay) {
      const [a, b] =
        dayOnly(hoverDay).getTime() < dayOnly(draftFrom).getTime() ? [hoverDay, draftFrom] : [draftFrom, hoverDay];
      const days = rangeDays(a, b);
      return wording.rangePreview(formats.dateShort(a), formats.dateShort(b), days);
    }
    if (draftFrom) return wording.chooseEndDate;
    if (value) {
      const days = rangeDays(value.from, value.to);
      return wording.daysSelected(days);
    }
    return wording.chooseStartDate;
  })();

  const presetIsActive = (preset: RangePreset): boolean => {
    if (!value || draftFrom) return false;
    const range = preset.range();
    return sameDay(range.from, value.from) && sameDay(range.to, value.to);
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
          value && (
            <>
              {formats.date(value.from)}
              <span className={styles.rangeDash}>–</span>
              {formats.date(value.to)}
            </>
          )
        }
        icon={
          <svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true" className={styles.icon}>
            <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M4 9h6M8.2 7.4 10 9l-1.8 1.6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        placeholder={placeholderText}
        onClear={() => {
          onChange(null);
          if (open) closePanel(false);
        }}
        ariaLabel={wording.dateRangeClear}
      />
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
        anchorRef={triggerRef}
        insideRefs={[wrapRef]}
        role="dialog"
        ariaLabel={wording.dateRangePanel}
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
                  applyRange(range.from, range.to);
                }}
              />
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
            </div>
            <div className={styles.foot}>
              <span className={styles.footNote} aria-live="polite">
                {footText}
              </span>
              {value && !draftFrom && (
                <Button size="sm" variant="ghost" onClick={() => { onChange(null); closePanel(); }}>
                  {wording.clear}
                </Button>
              )}
            </div>
          </div>
      </Popover>
    </>
  );
}
