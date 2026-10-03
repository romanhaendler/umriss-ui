import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { CrossGlyph } from "../../lib/glyphs";
import { useWording } from "../../lib/language";
import { mergeRefs } from "../../lib/mergeRefs";
import { VisuallyHidden } from "../VisuallyHidden";
import { rowWidth, stackedWidth, stepperFit } from "./fit";
import type { StepperFit } from "./fit";
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

/** The props of `Stepper`. */
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
/** Where a procedure stands: its steps in order, done, current, upcoming or
    failed. Moving on is yours - `current` is a prop. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, orientation = "horizontal", className, ...rest },
  ref,
) {
  const wording = useWording();
  const listRef = useRef<HTMLOListElement>(null);
  const [fit, setFit] = useState<StepperFit>("row");

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list || orientation === "vertical" || list.clientWidth <= 0) return;
    /* A copy, hidden and out of the flow, every step at its natural width:
       once as a row with each label on one line, once stacked with each step
       at its longest word. The list itself is not touched, so the measuring
       shows nowhere. */
    const copy = list.cloneNode(true) as HTMLOListElement;
    copy.classList.remove(styles.vertical!);
    /* A label may carry ids; the copy must not double them, even for the
       moment it stands. */
    for (const withId of [copy, ...copy.querySelectorAll("[id]")]) withId.removeAttribute("id");
    copy.removeAttribute("data-fit");
    copy.setAttribute("aria-hidden", "true");
    copy.style.cssText = "position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;width:max-content;max-width:none";
    list.after(copy);
    const gap = Number.parseFloat(getComputedStyle(copy).columnGap) || 0;
    const steps = Array.from(copy.children as HTMLCollectionOf<HTMLElement>);
    /* In a row only the label keeps to one line; a description beneath it
       wraps in the room the label leaves. */
    const descriptions = Array.from(copy.querySelectorAll<HTMLElement>(`.${styles.description}`));
    for (const description of descriptions) description.style.display = "none";
    for (const step of steps) step.style.cssText = "flex:none;width:max-content";
    const row = rowWidth(steps.map((step) => step.getBoundingClientRect().width), gap);
    for (const description of descriptions) description.style.display = "";
    copy.setAttribute("data-fit", "stacked");
    for (const step of steps) step.style.width = "min-content";
    const stacked = stackedWidth(
      steps.map((step) => {
        const text = step.querySelector<HTMLElement>(`.${styles.text}`);
        if (text) text.style.width = "min-content";
        return Math.max(step.getBoundingClientRect().width, text?.getBoundingClientRect().width ?? 0);
      }),
      gap,
    );
    copy.remove();
    setFit(stepperFit(list.clientWidth, row, stacked));
  }, [orientation]);

  /* After every commit - other labels are other widths - and on every change
     of the place; it sets the fit only when it changes. The list's width does
     not depend on its fit, so the answer does not flip back and forth. */
  useLayoutEffect(() => measure());

  useEffect(() => {
    const list = listRef.current;
    if (!list || orientation === "vertical") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    /* A web font that arrives late changes the labels' widths and not the
       list's, which the observer would not hear. */
    let live = true;
    void list.ownerDocument.fonts?.ready.then(() => live && measure());
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [measure, orientation]);

  const words: Record<StepState, string | null> = {
    done: wording.stepDone,
    current: null,
    upcoming: wording.stepUpcoming,
    failed: wording.stepFailed,
  };

  return (
    <ol
      ref={mergeRefs(listRef, ref)}
      className={cx(styles.stepper, (orientation === "vertical" || fit === "column") && styles.vertical, className)}
      {...rest}
      data-orientation={orientation}
      data-fit={orientation === "vertical" ? undefined : fit}
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
