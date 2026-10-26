import { useId, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { VisuallyHidden } from "../VisuallyHidden";
import { readTypedDate, sampleDate } from "./typed";
import { Popover } from "../Popover";
import { useFormField } from "../FormField";
import { Calendar, startOfMonth } from "./Calendar";
import { dayStart, gridDay, zoneToday } from "./zoned";
import { ZoneNote, useMidnightWarning } from "./ZoneNote";
import { RangeTrigger, naturalChars } from "./RangeTrigger";
import type { RefProp } from "../../lib/refProp";
import styles from "./DatePicker.module.css";
import { useControlSize } from "../../lib/controlSize";
import { useFormats, useLanguage, useWording } from "../../lib/language";
import { CalendarGlyph } from "../../lib/glyphs";


/**
 * The value contract: every way - the grid, "Today", clearing - hands out
 * midnight in the formats' zone (the reader's, unless the application names
 * one; resolution "day"). There is no path that delivers a time of day along
 * with it.
 */
export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange" | "defaultValue">, RefProp<HTMLButtonElement> {
  /** The day, as a `Date` on midnight in the formats' zone (the reader's, unless the application names one); `null` means none. */
  value: Date | null;
  /** Runs as soon as a day is settled - on a click in the grid, on "Today" and
      on clearing (`null`). Every one of these ways hands out
      midnight in the formats' zone; there is none that delivers a time along with it. */
  onChange: (date: Date | null) => void;
  /** What stands in the empty field. */
  placeholder?: string;
  /** Locks the field and the panel. */
  disabled?: boolean;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** The width in characters - room for the value; the field adds its own
      padding, glyph and cross. Given, the field is that wide wherever it
      stands, and never wider than its place. Without it the field fills its
      place, and where the place asks - in a toolbar or a row - it is as wide
      as its longest value in the formats in use, so a date never truncates. */
  chars?: number;
  /** Shows a cross where a value is set, which fades in on hover/focus and
      clears the value. */
  clearable?: boolean;
}

/** A date selection with a calendar panel; weeks begin on Monday. The panel's
    foot takes a typed date, read in the order the formats in use write one. */
export function DatePicker(
  {
    ref,
    value,
    onChange,
    placeholder,
    disabled = false,
    invalid,
    size: ownSize,
    chars,
    clearable = false,
    className,
    ...rest
  }: DatePickerProps,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const formats = useFormats();
  // The width is measured with the real formats: it is the same on a server and in the browser, even while the instants are still empty.
  const measure = useLanguage().formats;
  const placeholderText = placeholder ?? wording.datePlaceholder;
  const isInvalid = invalid ?? field?.invalid ?? false;
  const { timeZone } = formats;
  useMidnightWarning([value]);
  // The grid works on the zone's calendar days; the value is one of them.
  const day = value && gridDay(value, timeZone);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => startOfMonth(day ?? zoneToday(timeZone)));
  const [active, setActive] = useState<Date>(() => day ?? zoneToday(timeZone));
  const [typed, setTyped] = useState("");
  const [notADate, setNotADate] = useState(false);
  const typedRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  const openPanel = () => {
    const start = day ?? zoneToday(timeZone);
    setView(startOfMonth(start));
    setActive(start);
    setTyped("");
    setNotADate(false);
    setOpen(true);
  };

  const closePanel = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const type = (text: string) => {
    setTyped(text);
    setNotADate(false);
    const date = readTypedDate(text, formats, zoneToday(timeZone));
    if (date) {
      setView(startOfMonth(date));
      setActive(date);
    }
  };

  const choose = (picked: Date) => {
    onChange(dayStart(picked, timeZone));
    closePanel();
  };

  return (
    <>
      <RangeTrigger
        rootRef={ref}
        root={rest}
        className={className}
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
        chars={chars}
        natural={naturalChars((sample) => measure.date(sample).length, placeholderText)}
      />
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
        anchorRef={triggerRef}
        insideRefs={[wrapRef]}
        role="dialog"
        aria-label={wording.datePanel}
        id={panelId}
        className={styles.panel}
      >
          <div>
            <Calendar
              autoFocus
              view={view}
              onView={setView}
              active={active}
              onActive={setActive}
              value={day}
              onPick={choose}
              onDigit={(digit) => {
                type(digit);
                typedRef.current?.focus();
              }}
            />
            <div className={styles.foot}>
              <Input
                ref={typedRef}
                size="sm"
                className={styles.typed}
                aria-label={wording.typeDate}
                placeholder={sampleDate(formats)}
                inputMode="numeric"
                autoComplete="off"
                invalid={notADate}
                value={typed}
                onChange={(event) => type(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  const date = readTypedDate(typed, formats, zoneToday(timeZone));
                  if (date) choose(date);
                  else setNotADate(true);
                }}
              />
              {notADate && (
                <VisuallyHidden>
                  <span role="alert">{wording.notADate}</span>
                </VisuallyHidden>
              )}
              <Button size="sm" variant="ghost" onClick={() => choose(zoneToday(timeZone))}>
                {wording.today}
              </Button>
              <ZoneNote />
              {value && (
                <Button size="sm" variant="ghost" className={styles.hangEnd} onClick={() => { onChange(null); closePanel(); }}>
                  {wording.clear}
                </Button>
              )}
            </div>
          </div>
      </Popover>
    </>
  );
}
