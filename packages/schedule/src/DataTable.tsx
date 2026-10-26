/* <DataTable> - the plan as a table, on demand.

   A reader who wants a week of work at once should not have to walk it one
   subtask at a time. The part gives the schedule a disclosure key in the
   corner beside the bottom band, and the key opens a plain table of what the
   plot shows: one row per subtask whose occupied interval touches the span in
   view, in lane order, every instant and duration written as the tooltip
   writes it - with the date the tooltip leaves out.

   It lies over the lane headers and the plot (the bands stay, since they show
   the span it lists); while it is open they are hidden from the eye, from a
   screen reader and from the tab order (Schedule.tsx), so there is one
   picture of the plan at a time. */

import { useId, useSyncExternalStore, type ReactNode } from "react";
import { useFormats, useWording } from "@umriss-ui/core";
import { useDataTable } from "./context";
import { occupied } from "./model";
import { useDuration } from "./ScheduleTooltip";
import { timeText } from "./timeAxis";
import styles from "./Schedule.module.css";

/** The plan as a table, on demand: a key beside the bottom time band opens a
    table of the subtasks in view - lane, task, subtask, from and to with
    their dates, duration and findings in words. For a reader who wants every
    value at once. Place it inside a `Schedule`; it takes no props and renders
    nothing outside one. */
export function DataTable(): ReactNode {
  const id = useId();
  const scene = useDataTable(id);
  const formats = useFormats();
  const wording = useWording();
  const duration = useDuration();
  const snapshot = useSyncExternalStore(
    scene?.subscribe ?? NO_SUBSCRIBE,
    scene?.getSnapshot ?? (() => null),
    scene?.getServerSnapshot ?? (() => null),
  );
  if (scene === null) return null;
  const open = snapshot?.dataTable?.open === true;

  // Written anew on each render - the data, the view - and only while open.
  let table: ReactNode = null;
  if (open && snapshot !== null) {
    const { from: spanFrom, to: spanTo } = snapshot.summary;
    const { data } = scene;
    const instant = (at: number) => `${formats.dateShort(new Date(at))} ${timeText(formats, at)}`;
    const laneOrder = new Map(data.lanes.map((lane, index) => [lane.id, index] as const));
    const rows = data.subtasks
      .filter((subtask) => {
        const own = occupied(subtask);
        return laneOrder.has(subtask.lane) && own.to >= spanFrom && own.from <= spanTo;
      })
      .sort((a, b) => (laneOrder.get(a.lane) as number) - (laneOrder.get(b.lane) as number) || a.from - b.from);
    table = (
      <table className={styles.dataTable}>
        <caption>{wording.scheduleTableCaption(instant(spanFrom), instant(spanTo))}</caption>
        <thead>
          <tr>
            {[
              wording.scheduleColumnLane,
              wording.scheduleColumnTask,
              wording.scheduleColumnSubtask,
              wording.scheduleColumnFrom,
              wording.scheduleColumnTo,
              wording.scheduleColumnDuration,
              wording.scheduleColumnFindings,
            ].map((head) => (
              <th key={head} scope="col">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((subtask) => {
            const target = data.tooltipTargetFor({ kind: "subtask", subtask, part: "main" });
            const found =
              target?.kind !== "subtask"
                ? []
                : [
                    ...target.overlapping.map((other) => wording.scheduleOverlapWith(other.name ?? other.id)),
                    ...target.violatedDependencies.map((violated) => wording.scheduleViolatedBy(duration(violated.shortBy))),
                    ...target.blocked.map((blocked) => wording.scheduleInBlockedTime(blocked.label)),
                  ];
            const length = [
              duration(subtask.to - subtask.from),
              ...((subtask.leadIn ?? 0) > 0 ? [`${wording.scheduleLeadIn} ${duration(subtask.leadIn!)}`] : []),
              ...((subtask.leadOut ?? 0) > 0 ? [`${wording.scheduleLeadOut} ${duration(subtask.leadOut!)}`] : []),
            ].join(", ");
            return (
              <tr key={subtask.id}>
                <td>{data.lanes.find((lane) => lane.id === subtask.lane)?.label}</td>
                <td>{data.tasks.get(subtask.task)?.name ?? subtask.task}</td>
                <th scope="row">{subtask.name ?? subtask.id}</th>
                <td>{instant(subtask.from)}</td>
                <td>{instant(subtask.to)}</td>
                <td>{length}</td>
                <td>{found.join("; ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.dataKey}
        data-schedule-overlay="data key"
        aria-expanded={open}
        // Only while the panel is there to be pointed at.
        aria-controls={open ? id : undefined}
        onClick={() => scene.toggleDataTable()}
      >
        {open ? wording.scheduleHideData : wording.scheduleShowData}
      </button>
      {open && (
        // A tab stop of its own: the panel scrolls, and a keyboard has to be
        // able to scroll it.
        <div id={id} className={styles.dataPanel} tabIndex={0}>
          {table}
        </div>
      )}
    </>
  );
}

const NO_SUBSCRIBE = () => () => {};
