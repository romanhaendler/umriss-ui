/* @umriss-ui/schedule - subtasks on lanes over time (ADR-0022, ADR-0023). */

export type { ScheduleProps } from "./Schedule";
export type { LaneProps, SubtasksProps, DependenciesProps } from "./parts";
export type { ScheduleHit, ScheduleInteraction } from "./scene";

/* The pure modules: the arithmetic a caller runs over its own data - the
   findings as data, and the cascade the schedule never applies itself. */
export { applyIntent, arrival, departure, occupied } from "./model";
export type {
  Intent,
  IntentKind,
  LaneIntent,
  MoveIntent,
  LeadInIntent,
  StretchIntent,
  Subtask,
  Task,
  LeadOutIntent,
  Dependency,
} from "./model";
export { findings, violatedDependencies, overlaps } from "./findings";
export type { Findings, ViolatedDependency, Overlap } from "./findings";
export { ripple } from "./ripple";
export { snapTime } from "./snap";
export type { ZoomLimits } from "./timeAxis";

/* Further exports stand at the end, by the workspace's rule for new exports -
   none of these modules brings a stylesheet, so no picture could move by their
   place. */
export type { ScheduleHandle } from "./Schedule";
export type { ScheduleTooltipTarget, PlacingItem } from "./scene";
export { subtaskFromPlace } from "./model";
export type { PlaceIntent } from "./model";
export { shiftTask } from "./shiftTask";
export type { SnapRaster } from "./snap";
export type { DependencyAttachment, DependencyEnds, DependencyRoute } from "./model";
export { resolveAppearance } from "./appearance";
export type { ResolvedAppearance, SubtaskAppearance } from "./appearance";

/* The lane groups (ADR-0025). */
export type { LaneGroupProps } from "./parts";

/* Blocked time per lane. */
export type { BlockedTimesProps } from "./parts";
export type { BlockedTime } from "./model";
export { inBlockedTime } from "./findings";
export type { InBlockedTime } from "./findings";

/* A point in time on a lane. */
export type { MilestonesProps } from "./parts";
export type { Milestone } from "./model";

/* The schedule's view (ADR-0047). */
export type { ScheduleView } from "./view";

/* `useSchedule`, last: it brings the schedule's stylesheet, the only one here,
   so its place moves no other one. */
export { useSchedule, type ScheduleParts, type ScheduleOptions } from "./useSchedule";
