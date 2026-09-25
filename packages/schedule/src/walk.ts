/* The keyboard's walk (schedule-a11y, ADR-0030): where the **Active subtask**
   goes next. Pure, so the keys can be tested without a canvas; the scene turns
   the answer into the hover the pointer would have made.

   The walk goes over ROWS as the plot lays them out (`rows.ts`): a lane's own
   row, or the one row a folded **Lane group** became - its work is walked
   there as one line, since that is what a planner sees of it. A group's head
   holds no work and is passed over, and so is a row with nothing on it: a key
   that lands on nothing is a key that seems broken.

   It walks the whole row, not only the part in view: the scene brings the
   subtask into view, as a drag near the edge pans along. A walk held inside
   the view would leave a keyboard with no way to the rest of the plan
   (ADR-0033). */

import { rowAt, type Rows } from "./rows";
import type { Subtask, Transport } from "./model";

export type WalkMove = "next" | "previous" | "up" | "down" | "first" | "last" | "pageNext" | "pagePrevious";

/** The rows the walk goes over, top to bottom, each with its work in time
    order - by the start of the main time, then its end. Empty rows are left
    out. */
export function walkRows(rows: Rows, subtasks: readonly Subtask[]): Subtask[][] {
  const byRow = new Map<number, Subtask[]>();
  for (const subtask of subtasks) {
    const slot = rows.slots.get(subtask.lane);
    const row = slot === undefined ? null : rowAt(rows, slot.top);
    if (row === null) continue;
    const index = rows.rows.indexOf(row);
    byRow.set(index, [...(byRow.get(index) ?? []), subtask]);
  }
  return [...byRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, work]) => work.sort((a, b) => a.from - b.from || a.to - b.to));
}

/** How far a subtask's main time lies from an instant: zero inside it. */
const distance = (subtask: Subtask, time: number) =>
  time < subtask.from ? subtask.from - time : time > subtask.to ? time - subtask.to : 0;

/** Where a key takes the active subtask, from the one with id `from` (null, or
    an id no longer walked: from nowhere). `view` is the visible span in wall
    time: coming from nowhere, the walk starts at the first subtask in it on
    the topmost row that has one, and PageUp/PageDown jump a tenth of it. At an
    end the walk stays. Null only where there is nothing to walk at all. */
export function stepSubtask(
  rows: readonly (readonly Subtask[])[],
  from: string | null,
  move: WalkMove,
  view: readonly [number, number],
): Subtask | null {
  let r = -1;
  let i = -1;
  for (let k = 0; k < rows.length && from !== null && r < 0; k++) {
    i = rows[k]!.findIndex((s) => s.id === from);
    if (i >= 0) r = k;
  }
  if (r < 0) {
    for (const row of rows) {
      const inView = row.find((s) => s.to > view[0] && s.from < view[1]);
      if (inView !== undefined) return inView;
    }
    return rows[0]?.[0] ?? null;
  }
  const row = rows[r]!;
  const at = row[i]!;
  const tenth = (view[1] - view[0]) / 10;
  switch (move) {
    case "next":
      return row[i + 1] ?? at;
    case "previous":
      return row[i - 1] ?? at;
    case "first":
      return row[0]!;
    case "last":
      return row[row.length - 1]!;
    case "pageNext":
      return row.find((s, k) => k > i && s.from >= at.from + tenth) ?? row[row.length - 1]!;
    case "pagePrevious":
      for (let k = i - 1; k >= 0; k--) if (row[k]!.from <= at.from - tenth) return row[k]!;
      return row[0]!;
    case "up":
    case "down": {
      const other = rows[move === "up" ? r - 1 : r + 1];
      if (other === undefined) return at;
      /* Nearest to the middle of the main time; of two as near, the earlier. */
      const middle = (at.from + at.to) / 2;
      return other.reduce((best, s) => (distance(s, middle) < distance(best, middle) ? s : best));
    }
  }
}

/** What the keyboard stands on: a subtask, or a transport reached from one. */
export type Active = { readonly kind: "subtask"; readonly id: string } | { readonly kind: "transport"; readonly id: string };

/** Along a transport (`]` out, `[` back): from a subtask out along the transport
    that leaves it, or back along the one that arrives at it; from a transport
    on to the subtask it reaches, or back to the one it left. A task's route is
    walked stop by stop this way, the line between two stops included. Where
    there is none to follow, it stays.

    Of several transports leaving one subtask, the first the caller listed is
    taken. ponytail: a split to two successors is walked one way only; a key to
    cycle between them is the upgrade if a plant ever splits a part. */
export function alongTransport(
  transports: readonly Transport[],
  subtasks: ReadonlyMap<string, Subtask>,
  at: Active,
  direction: "out" | "back",
): Active {
  if (at.kind === "transport") {
    const transport = transports.find((t) => t.id === at.id);
    const end = transport === undefined ? undefined : direction === "out" ? transport.to : transport.from;
    return end !== undefined && subtasks.has(end) ? { kind: "subtask", id: end } : at;
  }
  const transport = transports.find(
    (t) => (direction === "out" ? t.from : t.to) === at.id && subtasks.has(direction === "out" ? t.to : t.from),
  );
  return transport === undefined ? at : { kind: "transport", id: transport.id };
}
