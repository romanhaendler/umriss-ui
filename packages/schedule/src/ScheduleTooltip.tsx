/* The tooltip's default content: what a planner reads off a bar or a line
   without clicking - the order, the stop, the times, the parts, the findings.
   Every word from the wording and every number from the formats of
   @umriss-ui/core, so one provider switches it with everything else. */

import type { ReactNode } from "react";
import { MINUTE } from "@umriss-ui/charts";
import { useFormats, useWording } from "@umriss-ui/core";
import type { ScheduleTooltipTarget } from "./scene";
import styles from "./Schedule.module.css";

/** A duration in hours and minutes, from the wording. */
function useDuration(): (ms: number) => string {
  const wording = useWording();
  return (ms) => {
    const minutes = Math.round(ms / MINUTE);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return [hours > 0 ? wording.hoursShort(hours) : "", rest > 0 || hours === 0 ? wording.minutesShort(rest) : ""].filter(Boolean).join(" ");
  };
}

/** What the live region reads after the keys rest (schedule-a11y S4): the
    lane, the task and the subtask, the day and the times, and every finding
    by its name - the findings are spoken, never only coloured. The lane's
    label is the header's own node, so an application's label is read as it
    is shown. */
export function ScheduleReadout({ target, lane }: { target: ScheduleTooltipTarget; lane: ReactNode }): ReactNode {
  const formats = useFormats();
  const wording = useWording();
  const duration = useDuration();
  const time = (instant: number) => formats.time(new Date(instant), false);
  if (target.kind === "subtask") {
    const { subtask, task } = target;
    const parts = [
      task?.name ?? subtask.task,
      subtask.name ?? subtask.id,
      `${formats.dateShort(new Date(subtask.from))} ${wording.scheduleGhostTimes(time(subtask.from), time(subtask.to))}`,
      ...target.overlapping.map((other) => wording.scheduleOverlapWith(other.name ?? other.id)),
      ...target.violatedDependencies.map((violated) => wording.scheduleViolatedBy(duration(violated.shortBy))),
      ...target.blocked.map((blocked) => wording.scheduleInBlockedTime(blocked.label)),
    ];
    return (
      <>
        {lane}
        {`, ${parts.join(", ")}`}
      </>
    );
  }
  const { dependency, task, from, to, violated } = target;
  return [
    task?.name ?? task?.id ?? dependency.id,
    `${wording.scheduleDependency} ${duration(dependency.lag)}`,
    wording.scheduleRoute(from?.name ?? dependency.from, to?.name ?? dependency.to),
    ...(violated === undefined ? [] : [wording.scheduleViolatedBy(duration(violated.shortBy))]),
  ].join(", ");
}

export function ScheduleTooltipContent({ target }: { target: ScheduleTooltipTarget }): ReactNode {
  const formats = useFormats();
  const wording = useWording();
  const time = (instant: number) => formats.time(new Date(instant), false);
  const duration = useDuration();

  if (target.kind === "subtask") {
    const { subtask, task } = target;
    return (
      <>
        <span className={styles.tooltipHead}>{task?.name ?? subtask.task}</span>
        <span>{subtask.name ?? subtask.id}</span>
        <span className={styles.tooltipTimes}>{wording.scheduleGhostTimes(time(subtask.from), time(subtask.to))}</span>
        {(subtask.leadIn ?? 0) > 0 && <span>{`${wording.scheduleLeadIn} ${duration(subtask.leadIn!)}`}</span>}
        {(subtask.leadOut ?? 0) > 0 && <span>{`${wording.scheduleLeadOut} ${duration(subtask.leadOut!)}`}</span>}
        {target.overlapping.map((other) => (
          <span key={other.id} className={styles.finding}>
            {wording.scheduleOverlapWith(other.name ?? other.id)}
          </span>
        ))}
        {target.violatedDependencies.map((violated) => (
          <span key={violated.dependency} className={styles.finding}>
            {wording.scheduleViolatedBy(duration(violated.shortBy))}
          </span>
        ))}
        {target.blocked.map((blocked) => (
          <span key={blocked.id} className={styles.finding}>
            {wording.scheduleInBlockedTime(blocked.label)}
          </span>
        ))}
      </>
    );
  }

  const { dependency, task, from, to, violated } = target;
  return (
    <>
      <span className={styles.tooltipHead}>{task?.name ?? task?.id ?? dependency.id}</span>
      <span>{wording.scheduleRoute(from?.name ?? dependency.from, to?.name ?? dependency.to)}</span>
      <span>{`${wording.scheduleDependency} ${duration(dependency.lag)}`}</span>
      {violated !== undefined && <span className={styles.finding}>{wording.scheduleViolatedBy(duration(violated.shortBy))}</span>}
    </>
  );
}
