import { useId, useRef, useState } from "react";
import { Button } from "../Button";
import { Popover } from "../Popover";
import { useFormField } from "../FormField";
import { Calendar, startOfMonth } from "./Calendar";
import { startOfDay } from "./contract";
import { RangeTrigger } from "./RangeTrigger";
import styles from "./DatePicker.module.css";
import { useFormats, useWording } from "../../lib/language";
import { CalendarGlyph } from "../../lib/glyphs";


/**
 * The value contract: every way - the grid, "Today", clearing - hands out local
 * midnight (resolution "day"). There is no path that delivers a time of day
 * along with it.
 */
export interface DatePickerProps {
  /** The day, as a `Date` on local midnight; `null` means none. */
  value: Date | null;
  /** Runs as soon as a day is settled - on a click in the grid, on "Today", on
      clearing (`null`) and on a valid input. Every one of these ways hands out
      local midnight; there is none that delivers a time along with it. */
  onChange: (date: Date | null) => void;
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
}

/** A date selection with a calendar panel; weeks begin on Monday. */
export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  invalid,
  size = "md",
  clearable = false,
}: DatePickerProps) {
  const field = useFormField();
  const wording = useWording();
  const formats = useFormats();
  const placeholderText = placeholder ?? wording.datePlaceholder;
  const isInvalid = invalid ?? field?.invalid ?? false;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(value ?? new Date()));
  const [active, setActive] = useState<Date>(() => value ?? new Date());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const openPanel = () => {
    const start = value ?? new Date();
    setView(startOfMonth(start));
    setActive(start);
    setOpen(true);
  };

  const closePanel = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (day: Date) => {
    onChange(startOfDay(day));
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
        display={value && formats.date(value)}
        icon={
          <CalendarGlyph className={styles.icon} />
        }
        placeholder={placeholderText}
        onClear={() => {
          onChange(null);
          if (open) closePanel(false);
        }}
        ariaLabel={wording.dateClear}
      />
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
        anchorRef={triggerRef}
        insideRefs={[wrapRef]}
        role="dialog"
        ariaLabel={wording.datePanel}
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
              value={value}
              onPick={choose}
            />
            <div className={styles.foot}>
              <Button size="sm" variant="ghost" onClick={() => choose(new Date())}>
                {wording.today}
              </Button>
              {value && (
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
