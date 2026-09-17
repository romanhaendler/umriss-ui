/* The model of the alarm list: from alarms, their types and an as-of time comes
   the projection - with derived fields, handed to the table's pipeline.

   The library RECEIVES alarms; it GENERATES none. Whoever turns a measured
   value into an alarm decides about bounds, sampling rates, suppression and a
   clock - all of them plant decisions with plant consequences. The tree draws
   the same line when it reports that a branch was opened instead of fetching
   its children (ADR-0009).

   The lifecycle state is ONE field with FOUR values, not two booleans. A pair
   of booleans invites `if (standing)`, and precisely that filter is the error:
   it loses the fleeting alarm - it came, it went, nobody saw it - and that is
   the alarm most worth investigating.

   The model suppresses nothing. It marks floods and chatter; which alarm a human
   sees the plant decides, not a user-interface library. The only removal it
   performs is the fourth position: cleared and acknowledged is done.

   Nothing here reads a clock. The as-of time is a parameter. */

import { DEFAULT_WORDING } from "@umriss-ui/core";
import type { Wording } from "@umriss-ui/core";
import { tableModel } from "../model/tableModel";
import type { Column, SortLevel, TableProjection, TableInput } from "../model/tableModel";

/* --- Priority ----------------------------------------------------------- */

/** Three levels. Not two, because an alarm system orders the urgency of acting
    more finely than a limit does; not seven, because every level above about
    four gets used as a synonym of the one below it.

    This is a DIFFERENT scale from the severity of a limit (which has two), on a
    different object. The mapping between the two is the caller's, in his code,
    where the plant's convention stands. */
export type Priority = "high" | "medium" | "low";

/** From the most urgent to the last - the order of the scale. */
export const PRIORITIES: readonly Priority[] = ["high", "medium", "low"];

/** 0 is the most urgent. Sorted ascending it stands on top. */
export const priorityRank = (priority: Priority): number =>
  PRIORITIES.indexOf(priority);

/* --- Lifecycle state ---------------------------------------------------- */

/** One field, four values. `cleared-unacknowledged` is the fleeting alarm and the
    reason why no pair of booleans stands here. */
export type LifecycleState =
  | "standing-unacknowledged"
  | "standing-acknowledged"
  | "cleared-unacknowledged"
  | "cleared-acknowledged";

export const isStanding = (state: LifecycleState): boolean =>
  state === "standing-unacknowledged" || state === "standing-acknowledged";

export const isAcknowledged = (state: LifecycleState): boolean =>
  state === "standing-acknowledged" || state === "cleared-acknowledged";

/** Cleared and acknowledged: the only position that leaves the list. */
export const isDone = (state: LifecycleState): boolean => state === "cleared-acknowledged";

/** What can happen to an alarm. The caller reports the event; what it means the
    model knows. */
export type Transition = "raised" | "acknowledged" | "cleared";

/**
 * The transition as pure calculation.
 *
 * `raised` always leads to `standing-unacknowledged`, even out of an
 * acknowledged position: a renewed occurrence of the condition is a new
 * event and demands that somebody see it again.
 */
export function nextLifecycleState(state: LifecycleState, transition: Transition): LifecycleState {
  switch (transition) {
    case "raised":
      return "standing-unacknowledged";
    case "acknowledged":
      return isStanding(state) ? "standing-acknowledged" : "cleared-acknowledged";
    case "cleared":
      return isAcknowledged(state) ? "cleared-acknowledged" : "cleared-unacknowledged";
  }
}

/* --- Return band (hysteresis, dead band) -------------------------------- */

/** The triggering bound and the return band of an alarm type.

    With an upper bound the return value lies below it, with a lower one above
    it. That is the dead band: it keeps the value sitting on the bound from
    producing a hundred alarms. */
export interface ReturnBand {
  /** `obere`: the alarm comes when the value rises above the bound.
      `untere`: it comes when the value falls below it. */
  direction: "obere" | "untere";
  /** The bound that triggered the alarm. Stands here so that the condition is
      described completely in one place - for the decision about clearing it is
      expressly not read. */
  limit: number;
  /** The value the reading must come back past before the alarm clears. */
  returnTo: number;
}

/**
 * Has the value come back far enough for a standing alarm to clear? The value
 * must come back past the return value, not merely past the bound that
 * triggered the alarm - which is why `limit` does not appear in this
 * calculation.
 *
 * The condition of clearing, not that of raising: that a measured value raises
 * an alarm the caller's process layer decides. It lives here because only this
 * module knows what the alarm just was.
 *
 * The return value itself belongs to the return: reaching it is enough.
 */
export const hasReturned = (band: ReturnBand, value: number): boolean =>
  band.direction === "obere" ? value <= band.returnTo : value >= band.returnTo;

/* --- Alarm type and alarm ----------------------------------------------- */

/** The condition that can become true. Not the alarm itself.

    Frequency, chatter and flood are statements about a TYPE over a window and
    cannot be expressed without it. */
export interface AlarmType {
  id: string;
  label: string;
  priority: Priority;
  /** The dead band, when the type has one. */
  returnBand?: ReturnBand;
}

/** One occurrence of a type.

    `lifecycle` is the truth about the position; the two points in time are
    trimmings for the display. The other way round it would be a pair of
    booleans in disguise. */
export interface Alarm {
  id: string;
  /** Id of the alarm type. */
  type: string;
  lifecycle: LifecycleState;
  /** The moment of coming, in milliseconds. */
  raised: number;
  /** The moment of clearing, as long as it stands: none. */
  cleared?: number;
  /** The moment of the acknowledgement, as long as unacknowledged: none. */
  acknowledgedAt?: number;
}

/* --- Window, frequency, flood ------------------------------------------- */

/* The window reaches from `asOf - windowMs` (exclusive) to `asOf` (inclusive):
   the last `windowMs` milliseconds, and whatever lies after the as-of time is
   the future and does not count. */
const inWindow = (time: number, windowMs: number, asOf: number): boolean =>
  time > asOf - windowMs && time <= asOf;

/** How many of the points in time lie within the window. Pure, with the as-of
    time as a parameter. */
export const countInWindow = (
  times: readonly number[],
  windowMs: number,
  asOf: number,
): number => times.reduce((total, time) => total + (inWindow(time, windowMs, asOf) ? 1 : 0), 0);

/** Frequency per alarm type within the window. Grouped by TYPE, not by
    occurrence - a chattering measuring point is one problem, not forty. */
export function frequencyByType(
  alarms: readonly Alarm[],
  windowMs: number,
  asOf: number,
): Map<string, number> {
  const per = new Map<string, number>();
  for (const alarm of alarms) {
    if (!inWindow(alarm.raised, windowMs, asOf)) continue;
    per.set(alarm.type, (per.get(alarm.type) ?? 0) + 1);
  }
  return per;
}

/** From when a type counts as chattering. */
export interface ChatterRule {
  /** Length of the window in milliseconds. */
  windowMs: number;
  /** From how many occurrences within the window. Reaching it is enough. */
  atLeast: number;
}

/** From when a set of alarms is a flood. */
export interface FloodRule {
  windowMs: number;
  /** From how many alarms within the window - across all types, because one
      fault drags nine interlocks with it. Reaching it is enough. */
  atLeast: number;
}

/** A flood that has been detected. A marking, not a suppression: the alarms all
    stay in the list. */
export interface Flood {
  /** Earliest and latest moment of the alarms involved - so that the interface
      can say "forty alarms in 82 seconds". */
  from: number;
  to: number;
  count: number;
  /** Ids of the alarms involved. */
  alarms: readonly string[];
}

/**
 * Is there a flood in the window before the as-of time? Pure calculation over
 * timestamps, with window, threshold and as-of time as parameters.
 */
function smallest(values: readonly number[]): number {
  let m = Number.POSITIVE_INFINITY;
  for (const w of values) if (w < m) m = w;
  return m;
}

function largest(values: readonly number[]): number {
  let m = Number.NEGATIVE_INFINITY;
  for (const w of values) if (w > m) m = w;
  return m;
}

export function detectFlood(
  alarms: readonly Alarm[],
  rule: FloodRule,
  asOf: number,
): Flood | null {
  const involved = alarms.filter((m) => inWindow(m.raised, rule.windowMs, asOf));
  if (involved.length < rule.atLeast) return null;
  const times = involved.map((m) => m.raised);
  return {
    // No spread: a flood is the case with many elements, and an argument list
    // of that size blows the call stack at some point. A loop cannot.
    from: smallest(times),
    to: largest(times),
    count: involved.length,
    alarms: involved.map((m) => m.id),
  };
}

/* --- Acknowledging ------------------------------------------------------ */

/** How many of the named alarms an acknowledgement would actually change. The
    same condition as `acknowledge`, so that the number the interface names
    beforehand and what happens afterwards cannot drift apart. */
export function countAcknowledgeable(
  alarms: readonly Alarm[],
  ids: Iterable<string>,
): number {
  const set = new Set(ids);
  return alarms.reduce(
    (total, m) => total + (set.has(m.id) && !isAcknowledged(m.lifecycle) ? 1 : 0),
    0,
  );
}

export interface Acknowledgement {
  alarms: Alarm[];
  /** How many alarms the acknowledgement actually changed. Acknowledging twice
      yields the same set but not the same number - which is why it stands
      here. */
  count: number;
}

/** Acknowledges the named alarms at the named time. Unknown ids are passed
    over, what is already acknowledged stays as it is. */
export function acknowledge(
  alarms: readonly Alarm[],
  ids: Iterable<string>,
  time: number,
): Acknowledgement {
  const set = new Set(ids);
  let count = 0;
  const next = alarms.map((m) => {
    if (!set.has(m.id) || isAcknowledged(m.lifecycle)) return m;
    count += 1;
    return { ...m, lifecycle: nextLifecycleState(m.lifecycle, "acknowledged"), acknowledgedAt: time };
  });
  return { alarms: next, count };
}

/* --- The row ------------------------------------------------------------ */

/** An alarm with everything the list and the order need to know about it.
    Derived, never stored. */
export interface AlarmRow {
  /** Id of the alarm - the key for selection and acknowledgement. */
  id: string;
  alarm: Alarm;
  type: AlarmType;
  lifecycle: LifecycleState;
  priority: Priority;
  /** 0 is the most urgent. For the sort. */
  rank: number;
  /** Since the coming, from the as-of time passed in. */
  age: number;
  /** How long the condition was true - until the clearing, otherwise until the
      as-of time. Not the same thing as the age. */
  duration: number;
  /** Occurrences of this TYPE within the window; without a chatter rule: all of
      them up to the as-of time. */
  frequency: number;
  /** The TYPE chatters. A marking on each of its rows. */
  chatters: boolean;
  /** This alarm belongs to the flood that was detected. */
  inFlood: boolean;
}

/** Ids of the columns that are sorted, searched and ordered in. */
export type AlarmColumn =
  | "type"
  | "lifecycle"
  | "priority"
  | "acknowledgement"
  | "raised"
  | "age"
  | "frequency";

/**
 * The columns of the alarm model, labelled from a wording.
 *
 * Described only for the pipeline - how a value is read and compared - not for
 * presentation. The cells stay the caller's, exactly as with the table. The
 * label, though, lands in the column menu and the CSV header row, and that is
 * why it comes from the wording: the module is pure and can read no context, so
 * it is given one - like `standardPresets`.
 */
export const alarmColumns = (wording: Wording): readonly Column<AlarmRow, AlarmColumn>[] => [
  {
    id: "type",
    label: wording.columnAlarm,
    value: (row) => row.type.label,
    searchable: true,
    hideable: false,
  },
  { id: "lifecycle", label: wording.columnLifecycleState, value: (row) => row.lifecycle, searchable: true },
  { id: "priority", label: wording.columnPriority, value: (row) => row.rank },
  /* A column of its own instead of a glance at the lifecycle state: the second
     level of the order asks only about the acknowledgement and expressly not
     about whether the alarm is still standing. Otherwise the fleeting alarm
     falls back down again. */
  { id: "acknowledgement", label: wording.columnAcknowledgement, value: (row) => (isAcknowledged(row.lifecycle) ? 1 : 0) },
  { id: "raised", label: wording.columnRaised, value: (row) => row.alarm.raised },
  { id: "age", label: wording.columnAge, value: (row) => row.age },
  { id: "frequency", label: wording.columnFrequency, value: (row) => row.frequency },
];

/** The columns with the default labels - for callers without a wording. */
export const ALARM_COLUMNS: readonly Column<AlarmRow, AlarmColumn>[] = alarmColumns(DEFAULT_WORDING);

/** Priority, then acknowledgement, then time - the worst first, not the newest.
    As levels of the existing multi-level sort, so that a caller replaces one
    value instead of fighting against a hard-wired comparison. */
export const DEFAULT_ORDER: readonly SortLevel<AlarmColumn>[] = [
  { column: "priority", direction: "asc" },
  { column: "acknowledgement", direction: "asc" },
  { column: "raised", direction: "desc" },
];

/* --- The model ---------------------------------------------------------- */

export interface AlarmInput {
  alarms: readonly Alarm[];
  /** The catalogue of conditions. An alarm whose type is missing is not thrown
      away. */
  types: readonly AlarmType[];
  /** Milliseconds. The age and every window hang on it; nothing reads a
      clock. */
  asOf: number;
  /** Without it `frequency` counts every occurrence up to the as-of time and
      `chatters` stays false. */
  chatter?: ChatterRule;
  /** Without it no flood is detected and nothing is marked. */
  flood?: FloodRule;
  /** Show the alarms that are done as well (cleared and acknowledged).
      Default: no - that is the only removal the model performs. */
  keepDone?: boolean;
  /** The columns of the projection; without a statement `ALARM_COLUMNS`.
      Whoever changes the label in the column menu or the CSV header row passes
      `alarmColumns(wording)`. */
  columns?: readonly Column<AlarmRow, AlarmColumn>[];
}

export interface AlarmProjection extends TableProjection<AlarmRow, AlarmColumn> {
  /** The flood that was detected, when a rule was given and it applies. A
      marking beside the complete list, not a replacement for it. */
  flood: Flood | null;
  /** Standing and unacknowledged within the filtered set - the number for the
      polite screen reader. From the filtered set, not from the visible page,
      like every figure in this house. */
  standingUnacknowledged: number;
}

/** For an alarm without an entry in the catalogue. Classified high: an alarm
    whose condition we do not know must not slide downwards. */
const unknownType = (id: string): AlarmType => ({
  id,
  label: id,
  priority: "high",
});

/**
 * Alarms, types and an as-of time become rows with derived fields and are then
 * handed through the table's pipeline: filter -> sort -> page. Everything the
 * table guarantees still holds.
 *
 * `input.sort` without a statement means the default order; expressly `null`
 * means input order.
 */
export function alarmModel(
  input: AlarmInput,
  state: TableInput<AlarmRow, AlarmColumn> = {},
): AlarmProjection {
  const {
    alarms,
    types,
    asOf,
    chatter,
    flood,
    keepDone = false,
    columns = ALARM_COLUMNS,
  } = input;

  const catalogue = new Map(types.map((type) => [type.id, type]));
  const frequency = frequencyByType(alarms, chatter?.windowMs ?? Infinity, asOf);
  const detectedFlood = flood ? detectFlood(alarms, flood, asOf) : null;
  const inFlood = new Set(detectedFlood?.alarms ?? []);

  const rows: AlarmRow[] = alarms
    .filter((alarm) => keepDone || !isDone(alarm.lifecycle))
    .map((alarm) => {
      const type = catalogue.get(alarm.type) ?? unknownType(alarm.type);
      const count = frequency.get(alarm.type) ?? 0;
      return {
        id: alarm.id,
        alarm,
        type,
        lifecycle: alarm.lifecycle,
        priority: type.priority,
        rank: priorityRank(type.priority),
        age: asOf - alarm.raised,
        duration: (alarm.cleared ?? asOf) - alarm.raised,
        frequency: count,
        chatters: chatter !== undefined && count >= chatter.atLeast,
        inFlood: inFlood.has(alarm.id),
      };
    });

  const projection = tableModel(rows, columns, {
    ...state,
    sort: state.sort === undefined ? DEFAULT_ORDER : state.sort,
  });

  return {
    ...projection,
    flood: detectedFlood,
    standingUnacknowledged: projection.filtered.reduce(
      (total, row) => total + (row.lifecycle === "standing-unacknowledged" ? 1 : 0),
      0,
    ),
  };
}
