import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { CrossGlyph } from "../../lib/glyphs";
import { useWording } from "../../lib/language";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Stepper.module.css";

/** One step of a procedure. */
export interface StepperStep {
  /** What the step is called - a verb for what happens in it. */
  label: ReactNode;
  /** A line beneath the label - how long the step takes, what it needs. */
  description?: ReactNode;
  /** The step failed. It says so whether it is behind the current step or is
      the current one: a failed step is not done. */
  failed?: boolean;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  /** The steps in the order they are walked. */
  steps: readonly StepperStep[];
  /** The index of the step being worked on. The steps before it are done,
      the ones after it upcoming; past the last step, every step is done. */
  current: number;
  /** `horizontal` in a row, `vertical` in a column for steps with longer
      descriptions. Default: `horizontal` */
  orientation?: "horizontal" | "vertical";
}

type StepState = "done" | "current" | "upcoming" | "failed";

const stateOf = (step: StepperStep, index: number, current: number): StepState =>
  step.failed ? "failed" : index < current ? "done" : index === current ? "current" : "upcoming";

/* Where a procedure stands - a recipe's phases, a changeover's steps. An
   ordered list, the current step `aria-current="step"`, and every other step's
   state a word a screen reader says beside its label: the marker's number,
   tick or cross and its colour say the same to the eye, and neither alone
   carries it (ISA-101). Moving on is the caller's: `current` is a prop, and
   the stepper has no key of its own. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, orientation = "horizontal", className, ...rest },
  ref,
) {
  const wording = useWording();
  const words: Record<StepState, string | null> = {
    done: wording.stepDone,
    current: null,
    upcoming: wording.stepUpcoming,
    failed: wording.stepFailed,
  };

  return (
    <ol
      ref={ref}
      className={cx(styles.stepper, orientation === "vertical" && styles.vertical, className)}
      data-orientation={orientation}
      {...rest}
    >
      {steps.map((step, index) => {
        const state = stateOf(step, index, current);
        const word = words[state];
        return (
          <li
            key={index}
            className={cx(styles.step, styles[state])}
            data-state={state}
            aria-current={index === current ? "step" : undefined}
          >
            <span className={styles.marker} aria-hidden="true">
              {state === "done" ? (
                /* The toast's tick, at the marker's size. */
                <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
                  <path
                    d="M2.2 5.3 4.2 7.3l3.6-4.1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : state === "failed" ? (
                <CrossGlyph size={8} />
              ) : (
                index + 1
              )}
            </span>
            <span className={styles.text}>
              <span className={styles.label}>
                {step.label}
                {word && <VisuallyHidden>, {word}</VisuallyHidden>}
              </span>
              {step.description && <span className={styles.description}>{step.description}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
});
