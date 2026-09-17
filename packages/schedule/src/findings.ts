/* Findings: what the schedule draws and reports and never resolves.

   An overlap is two subtasks covering the same time on one lane, setup and
   teardown included - an overlap that only touches a setup is still one. A late
   transport is one whose duration does not fit between its anchors. Both are
   the point of opening a schedule; packing overlaps into sub-lanes or pushing a
   successor would hide exactly what a planner is looking for (ADR-0023).

   Deliberately free of the DOM and of the scene. Quadratic per lane: a lane
   holds subtasks, not a measurement series, and this runs when the data
   changes, not per frame. */

import { arrival, departure, occupied, type Subtask, type Transport } from "./model";

/** Two subtasks covering the same time on one lane. */
export interface Overlap {
  /** The lane both sit on. */
  readonly lane: string;
  /** The subtask that starts earlier (setup included); on a tie, the one that
      stands first in the data. */
  readonly first: string;
  /** The other one. */
  readonly second: string;
  /** Where the covering begins. */
  readonly from: number;
  /** Where it ends. */
  readonly to: number;
}

/** A transport whose duration does not fit between its anchors. */
export interface LateTransport {
  /** The id of the transport. */
  readonly transport: string;
  /** When it leaves, by its anchor. */
  readonly departure: number;
  /** When it has to have arrived, by its anchor. */
  readonly arrival: number;
  /** How much time is missing: departure plus duration, minus arrival. */
  readonly shortBy: number;
}

/** Both kinds of finding over the same data. */
export interface Findings {
  readonly overlaps: readonly Overlap[];
  readonly lateTransports: readonly LateTransport[];
}

/** Every pair of subtasks that cover each other on a lane. Touching at a
    shared edge is not covering, and a subtask that covers no time covers
    nothing. */
export function overlaps(subtasks: readonly Subtask[]): Overlap[] {
  const found: Overlap[] = [];
  const byLane = new Map<string, { subtask: Subtask; index: number; from: number; to: number }[]>();
  subtasks.forEach((subtask, index) => {
    const { from, to } = occupied(subtask);
    if (!(from < to)) return;
    const lane = byLane.get(subtask.lane) ?? [];
    lane.push({ subtask, index, from, to });
    byLane.set(subtask.lane, lane);
  });
  for (const [lane, entries] of byLane) {
    entries.sort((a, b) => a.from - b.from || a.index - b.index);
    for (let i = 0; i < entries.length; i++) {
      const a = entries[i]!;
      for (let j = i + 1; j < entries.length; j++) {
        const b = entries[j]!;
        if (b.from >= a.to) break;
        found.push({ lane, first: a.subtask.id, second: b.subtask.id, from: b.from, to: Math.min(a.to, b.to) });
      }
    }
  }
  return found;
}

/** For every subtask, how many subtasks EARLIER in the data it covers on its
    lane - the offset it is drawn with, so that both stay visible. Counted only
    backwards, so an offset stays put when a later subtask joins. */
export function overlapDepth(subtasks: readonly Subtask[]): Map<string, number> {
  const depth = new Map<string, number>();
  const seen = new Map<string, { from: number; to: number }[]>();
  for (const subtask of subtasks) {
    const own = occupied(subtask);
    const lane = seen.get(subtask.lane) ?? [];
    let count = 0;
    if (own.from < own.to) {
      for (const other of lane) if (own.from < other.to && other.from < own.to) count++;
      lane.push(own);
    }
    seen.set(subtask.lane, lane);
    depth.set(subtask.id, count);
  }
  return depth;
}

/** Every transport whose successor is to be reached before the predecessor's
    departure plus the transport's duration. A transport naming a subtask that
    is not in the data is passed over: there is nothing to judge. */
export function lateTransports(subtasks: readonly Subtask[], transports: readonly Transport[]): LateTransport[] {
  const byId = new Map(subtasks.map((s) => [s.id, s] as const));
  const found: LateTransport[] = [];
  for (const transport of transports) {
    const from = byId.get(transport.from);
    const to = byId.get(transport.to);
    if (from === undefined || to === undefined) continue;
    const leaves = departure(transport, from);
    const arrives = arrival(transport, to);
    const shortBy = leaves + transport.duration - arrives;
    if (shortBy > 0) found.push({ transport: transport.id, departure: leaves, arrival: arrives, shortBy });
  }
  return found;
}

/** Overlaps and late transports at once. */
export function findings(subtasks: readonly Subtask[], transports: readonly Transport[]): Findings {
  return { overlaps: overlaps(subtasks), lateTransports: lateTransports(subtasks, transports) };
}
