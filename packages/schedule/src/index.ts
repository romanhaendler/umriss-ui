/* @umriss-ui/schedule - subtasks on lanes over time (ADR-0022, ADR-0023). */

export { Schedule, type ScheduleProps, type ScheduleHandle } from "./Schedule";
export { Lane, Subtasks, Transports, type LaneProps, type SubtasksProps, type TransportsProps } from "./parts";
export type { ScheduleHit, ScheduleInteraction, ScheduleTooltipTarget } from "./scene";

/* The pure modules: the arithmetic a caller runs over its own data - the
   findings as data, and the cascade the schedule never applies itself. */
export { applyIntent, arrival, departure, occupied } from "./model";
export type {
  Intent,
  IntentKind,
  LaneIntent,
  MoveIntent,
  SetupIntent,
  StretchIntent,
  Subtask,
  Task,
  TeardownIntent,
  Transport,
} from "./model";
export { findings, lateTransports, overlaps } from "./findings";
export type { Findings, LateTransport, Overlap } from "./findings";
export { ripple } from "./ripple";
export { snapTime, type SnapRaster } from "./snap";
export { shiftTask } from "./shiftTask";
export type { ZoomLimits } from "./timeAxis";
