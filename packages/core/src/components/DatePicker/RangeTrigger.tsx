/* The trigger of all four pickers: the field, the glyph and the clearing cross.
   Only the presentation of the value and the glyph distinguish them - one day,
   one instant, two days, two instants - which is why both come in as content and
   everything else lies here.

   At first only the two range pickers used it, and the other two drew the same
   trigger by hand - exactly the drift the popover seam had described
   (library-audit 02). */

import type { ForwardedRef, HTMLAttributes, ReactNode, RefObject } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import styles from "./DatePicker.module.css";
import { CrossGlyph } from "../../lib/glyphs";

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
  /** The picker's caller's ref, class and rest: they go to the wrapper around
      button and cross, the field's outermost element (P1 of
      core-passthrough). The field id from `FormField` stays on the button. */
  rootRef?: ForwardedRef<HTMLSpanElement>;
  root?: HTMLAttributes<HTMLSpanElement>;
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
}: RangeTriggerProps) {
  const { disabled, invalid, clearable, size } = state;
  return (
    <span ref={mergeRefs(wrapRef, rootRef)} className={cx(styles.triggerWrap, className)} {...root}>
      <button
        ref={triggerRef}
        type="button"
        id={field?.id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={panel.open}
        aria-controls={panel.open ? panel.id : undefined}
        aria-describedby={field?.describedBy}
        aria-invalid={invalid || undefined}
        className={cx(styles.trigger, size === "sm" && styles.sm, invalid && styles.invalid)}
        onClick={panel.onToggle}
      >
        <span className={cx(styles.value, !hasValue && styles.placeholder)}>
          {hasValue ? display : placeholder}
        </span>
        {icon}
      </button>
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
