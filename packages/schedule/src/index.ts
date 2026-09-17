/* @umriss-ui/schedule - subtasks on lanes over time (ADR-0022, ADR-0023). */

export { Schedule, type ScheduleProps } from "./Schedule";
export { Lane, Subtasks, Transports, type LaneProps, type SubtasksProps, type TransportsProps } from "./parts";
export type { ScheduleHit, ScheduleInteraction } from "./scene";

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
export { snapTime } from "./snap";
export type { ZoomLimits } from "./timeAxis";

/* What `schedule-refinement` added stands at the end, by the workspace's rule
   for new exports - none of these modules brings a stylesheet, so no picture
   could move by their place; the rule is kept anyway, so that nobody has to
   check (as `packages/core/src/index.ts` keeps it for `ContextMenu`). */
export type { ScheduleHandle } from "./Schedule";
export type { ScheduleTooltipTarget, PlacingItem } from "./scene";
export { subtaskFromPlace } from "./model";
export type { PlaceIntent } from "./model";
export { shiftTask } from "./shiftTask";
export type { SnapRaster } from "./snap";
export type { TransportAnchor, TransportEnds, TransportRoute } from "./model";
