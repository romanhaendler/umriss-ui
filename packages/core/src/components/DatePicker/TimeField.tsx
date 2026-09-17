import { useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../lib/cx";
import { pad2 } from "./time";
import styles from "./DatePicker.module.css";
import { useWording } from "../../lib/language";

/* ------------------------------------------------------------------ */
/* The time field: two digits, types itself onwards, the arrows count  */
/* ------------------------------------------------------------------ */

export interface TimeFieldProps {
  value: string;
  onValue: (value: string) => void;
  max: number;
  label: string;
  next?: React.RefObject<HTMLInputElement | null>;
  own?: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export function TimeField({ value, onValue, max, label, next, own, disabled = false }: TimeFieldProps) {
  const wording = useWording();
  // The ref mirrors the current value, so that the hold repetition never
  // calculates on stale closures.
  const valueRef = useRef(value);
  /* Intentional: the mirror must already stand during the render, so that the
     hold repetition never calculates on a stale closure (HANDOFF A.5 §2). */
  // eslint-disable-next-line react-hooks/refs
  valueRef.current = value;

  const step = (direction: 1 | -1) => {
    const current = Number.parseInt(valueRef.current, 10) || 0;
    onValue(pad2((current + direction + max + 1) % (max + 1)));
  };

  // Held down: after a short run-up, repeat briskly.
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopHolding = () => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };
  useEffect(() => stopHolding, []);

  const startHolding = (direction: 1 | -1) => {
    step(direction);
    own?.current?.focus();
    const repeat = (delay: number) => {
      holdTimer.current = setTimeout(() => {
        step(direction);
        repeat(Math.max(60, delay * 0.9));
      }, delay);
    };
    repeat(400);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    step(event.key === "ArrowUp" ? 1 : -1);
  };

  return (
    <span className={cx(styles.timeFieldWrap, disabled && styles.timeFieldDisabled)}>
      <input
        ref={own}
        type="text"
        inputMode="numeric"
        maxLength={2}
        aria-label={label}
        disabled={disabled}
        className={styles.timeField}
        value={value}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
          onValue(digits);
          // On to the next field only after the commit - a synchronous change of
          // focus would fire onBlur with a stale value.
          if (digits.length === 2 && next?.current) {
            const target = next.current;
            requestAnimationFrame(() => target.focus());
          }
        }}
        onKeyDown={handleKeyDown}
        onFocus={(event) => event.target.select()}
        onBlur={(event) => {
          // Always clamp the actual content of the field, never the (possibly
          // not yet re-rendered) prop.
          const number = Math.min(max, Number.parseInt(event.currentTarget.value, 10) || 0);
          onValue(pad2(number));
        }}
      />
      <span className={styles.timeStepper}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={wording.timeFieldIncrease(label)}
          disabled={disabled}
          onPointerDown={(event) => {
            event.preventDefault();
            if (event.button !== 0 || disabled) return;
            startHolding(1);
          }}
          onPointerUp={stopHolding}
          onPointerLeave={stopHolding}
          onPointerCancel={stopHolding}
          onContextMenu={(event) => event.preventDefault()}
        >
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
            <path d="M1 5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label={wording.timeFieldDecrease(label)}
          disabled={disabled}
          onPointerDown={(event) => {
            event.preventDefault();
            if (event.button !== 0 || disabled) return;
            startHolding(-1);
          }}
          onPointerUp={stopHolding}
          onPointerLeave={stopHolding}
          onPointerCancel={stopHolding}
          onContextMenu={(event) => event.preventDefault()}
        >
          <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>
    </span>
  );
}
