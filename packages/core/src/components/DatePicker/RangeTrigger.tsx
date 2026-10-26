/* The trigger of all four pickers: the field, the glyph and the clearing cross.
   Only the presentation of the value and the glyph distinguish them - one day,
   one instant, two days, two instants - which is why both come in as content and
   everything else lies here.

   At first only the two range pickers used it, and the other two drew the same
   trigger by hand - exactly the drift the popover seam had described. */

import { useId } from "react";
import type { ForwardedRef, HTMLAttributes, ReactNode, RefObject } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import { extentStyle } from "../../lib/extent";
import styles from "./DatePicker.module.css";
import { CrossGlyph } from "../../lib/glyphs";
import { useTimeZoneLabel } from "../../lib/language";
import { VisuallyHidden } from "../VisuallyHidden";

/* The props came in one by one at first - seventeen of them. Three of those were
   bundles that always travel together anyway; named, they read better and the
   interface is markedly narrower. */

export interface TriggerPanel {
  id: string;
  open: boolean;
  onToggle: () => void;
}

/** What the FormField context contributes, if the field sits in one. */
export interface TriggerField {
  id?: string;
  describedBy?: string;
}

export interface TriggerState {
  disabled: boolean;
  invalid: boolean;
  clearable: boolean;
  size: "sm" | "md";
}

export interface RangeTriggerProps {
  /* The refs stay separate: as a bundle React reads them during the render as a
     ref access, and the rest of the package names them the same way (anchorRef,
     focusRef). */
  wrapRef: RefObject<HTMLSpanElement | null>;
  /** The picker's caller's ref and rest go to the button that takes the
      focus; the class and the style dress the wrapper around button and
      cross (principle 1, the field shape). */
  rootRef?: ForwardedRef<HTMLButtonElement>;
  root?: HTMLAttributes<HTMLButtonElement>;
  className?: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  panel: TriggerPanel;
  field?: TriggerField | null;
  state: TriggerState;
  /** The presented value; empty means the placeholder. */
  display: ReactNode;
  /** The glyph on the right in the field - a calendar or a clock. */
  icon: ReactNode;
  hasValue: boolean;
  placeholder: string;
  onClear: () => void;
  /** The label of the clearing cross. */
  ariaLabel: string;
  /** The caller's width in characters (ADR-0041). */
  chars?: number;
  /** The picker's own natural width in characters: its longest value in the
      formats in use, or its placeholder (`naturalChars`). */
  natural: number;
}

/* A day late in a late month, at a late hour: every part that a format may
   or may not pad has two digits here. Its length in the formats in use is the
   longest a value of the picker gets - so a date never ends in an ellipsis
   where the place asks the picker how wide it is, in German or in English. */
const LONGEST = new Date(2026, 11, 28, 23, 58, 58);

/** A picker's natural count of characters: its longest value, read through
    the formats in use (`length`), or its placeholder if that is longer. */
export function naturalChars(length: (sample: Date) => number, placeholder: string): number {
  return Math.max(length(LONGEST), placeholder.length);
}

export function RangeTrigger({
  wrapRef,
  rootRef,
  root,
  className,
  triggerRef,
  panel,
  field,
  state,
  display,
  icon,
  hasValue,
  placeholder,
  onClear,
  ariaLabel,
  chars,
  natural,
}: RangeTriggerProps) {
  const { disabled, invalid, clearable, size } = state;
  const { style, id, onClick, ...rest } = root ?? {};
  const zone = useTimeZoneLabel();
  const zoneId = useId();
  const describedBy = [rest["aria-describedby"] ?? field?.describedBy, zone ? zoneId : undefined].filter(Boolean).join(" ");
  return (
    <span
      ref={wrapRef}
      className={cx(styles.triggerWrap, clearable && styles.triggerWrapClearable, className)}
      /* The width in characters, and the caller's own style over it. */
      style={{ ...extentStyle(chars, { natural }), ...style }}
    >
      <button
        {...rest}
        ref={mergeRefs(triggerRef, rootRef)}
        type="button"
        id={id ?? field?.id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={panel.open}
        aria-controls={panel.open ? panel.id : undefined}
        aria-describedby={describedBy || undefined}
        aria-invalid={invalid || undefined}
        className={cx(
          styles.trigger,
          size === "sm" && styles.sm,
          invalid && styles.invalid,
          clearable && hasValue && !disabled && styles.clearable,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) panel.onToggle();
        }}
      >
        <span className={cx(styles.value, !hasValue && styles.placeholder)}>
          {hasValue ? display : placeholder}
        </span>
        {icon}
      </button>
      {zone && (
        <VisuallyHidden>
          <span id={zoneId}>{zone}</span>
        </VisuallyHidden>
      )}
      {clearable && hasValue && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={ariaLabel}
          className={styles.triggerClear}
          onMouseDown={(event) => event.preventDefault() /* focus stays on the trigger */}
          onClick={onClear}
        >
          <CrossGlyph />
        </button>
      )}
    </span>
  );
}
