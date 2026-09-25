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
      ...target.lateTransports.map((late) => wording.scheduleLateBy(duration(late.shortBy))),
    ];
    return (
      <>
        {lane}
        {`, ${parts.join(", ")}`}
      </>
    );
  }
  const { transport, task, from, to, late } = target;
  return [
    task?.name ?? task?.id ?? transport.id,
    `${wording.scheduleTransport} ${duration(transport.duration)}`,
    wording.scheduleRoute(from?.name ?? transport.from, to?.name ?? transport.to),
    ...(late === undefined ? [] : [wording.scheduleLateBy(duration(late.shortBy))]),
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
        {(subtask.setup ?? 0) > 0 && <span>{`${wording.scheduleSetup} ${duration(subtask.setup!)}`}</span>}
        {(subtask.teardown ?? 0) > 0 && <span>{`${wording.scheduleTeardown} ${duration(subtask.teardown!)}`}</span>}
        {target.overlapping.map((other) => (
          <span key={other.id} className={styles.finding}>
            {wording.scheduleOverlapWith(other.name ?? other.id)}
          </span>
        ))}
        {target.lateTransports.map((late) => (
          <span key={late.transport} className={styles.finding}>
            {wording.scheduleLateBy(duration(late.shortBy))}
          </span>
        ))}
      </>
    );
  }

  const { transport, task, from, to, late } = target;
  return (
    <>
      <span className={styles.tooltipHead}>{task?.name ?? task?.id ?? transport.id}</span>
      <span>{wording.scheduleRoute(from?.name ?? transport.from, to?.name ?? transport.to)}</span>
      <span>{`${wording.scheduleTransport} ${duration(transport.duration)}`}</span>
      {late !== undefined && <span className={styles.finding}>{wording.scheduleLateBy(duration(late.shortBy))}</span>}
    </>
  );
}
