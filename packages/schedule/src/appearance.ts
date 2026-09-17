/* What a bar says besides its colour (schedule-legibility 05).

   A closed list, and a short one: released work against work still being
   planned, work that may move against work that may not, another shift's plan,
   and a bar that continues past the view. Each is a pattern or an outline and
   not only a colour, so the statement arrives without relying on colour
   vision.

   Two of them contradict - work cannot be provisional and fixed at once - and
   the rule is written here instead of falling out of the order in which the
   drawing happens to paint: the later one in the list wins, because a list is
   read forwards and the last word on a thing is the one that counts. */

/** The appearances a caller may give a subtask. */
export type SubtaskAppearance = "provisional" | "fixed" | "muted" | "open";

/** What the drawing needs to know, with the contradiction already settled. */
export interface ResolvedAppearance {
  /** A dashed outline: planned, not released. */
  readonly dashed: boolean;
  /** A hatch: fixed, not to be moved. */
  readonly hatched: boolean;
  /** Drawn back: another shift's, another crew's. */
  readonly muted: boolean;
  /** No end edge on the side it continues past. */
  readonly open: boolean;
}

export function resolveAppearance(appearance: readonly SubtaskAppearance[] | undefined): ResolvedAppearance {
  let dashed = false;
  let hatched = false;
  let muted = false;
  let open = false;
  for (const one of appearance ?? []) {
    if (one === "provisional") {
      dashed = true;
      hatched = false;
    } else if (one === "fixed") {
      hatched = true;
      dashed = false;
    } else if (one === "muted") {
      muted = true;
    } else if (one === "open") {
      open = true;
    }
  }
  return { dashed, hatched, muted, open };
}
