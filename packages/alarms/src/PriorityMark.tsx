import type { ComponentPropsWithRef } from "react";
import { useWording } from "@umriss-ui/core";
import type { Wording } from "@umriss-ui/core";
import { PRIORITIES } from "./alarmModel";
import type { Availability, LifecycleState, Priority } from "./alarmModel";
import styles from "./PriorityMark.module.css";

/** Props of `PriorityMark`; the rest go to its root `<span>`. */
export interface PriorityMarkProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /** The level, as a shape and its number: 1 a diamond, 2 a triangle, 3 a square, 4 a circle. */
  priority: Priority;
  /** The alarm's lifecycle as the list knows it. The mark of an active, unacknowledged alarm in service flashes at 1 Hz (umriss's choice; no source gives a rate); under reduced motion it carries a steady ring instead. */
  lifecycle?: LifecycleState;
  /** Whether the alarm is in service (the default). Any other availability draws the mark in the neutral tone and keeps its number. */
  availability?: Availability;
}

/** The word of a priority, from the wording. */
export function priorityWord(priority: Priority, wording: Wording): string {
  return [wording.alarmPriorityCritical, wording.alarmPriorityHigh, wording.alarmPriorityMedium, wording.alarmPriorityLow][PRIORITIES.indexOf(priority)]!;
}

/**
 * The mark of an alarm's priority: a filled shape that differs by outline per level, the level's number inside, and a colour from a token per level - so it is told apart in forced colours, in greyscale and by a colour-blind reader.
 * Its name is "Priority 1, critical", from the wording. The flash is a CSS animation on `--u-duration-alarm-flash`; setting that token to `none` turns it off.
 */
export function PriorityMark({ priority, lifecycle, availability = "in-service", className, ref, "aria-label": ariaLabel, ...rest }: PriorityMarkProps) {
  const wording = useWording();
  const level = PRIORITIES.indexOf(priority) + 1;
  const inService = availability === "in-service";
  return (
    <span
      role="img"
      {...rest}
      ref={ref}
      aria-label={ariaLabel ?? wording.alarmPriorityName(level, priorityWord(priority, wording))}
      className={className ? `${styles.mark} ${className}` : styles.mark}
      data-priority={priority}
      data-neutral={inService ? undefined : ""}
      data-flashing={inService && lifecycle === "active-unacknowledged" ? "" : undefined}
    >
      <span className={styles.shape} aria-hidden="true">
        {level}
      </span>
    </span>
  );
}
