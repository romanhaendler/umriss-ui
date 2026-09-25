/* What a bar says besides its colour (schedule-legibility 05).

   A closed list, and a short one: released work against work still being
   planned, work that may move against work that may not, another team's plan,
   and a bar that continues past the view. Each is a pattern or an outline and
   not only a colour, so the statement arrives without relying on colour
   vision.

   Two of them contradict - work cannot be provisional and fixed at once - and
   the rule is written here instead of falling out of the order in which the
   drawing happens to paint: the later one in the list wins, because a list is
   read forwards and the last word on a thing is the one that counts. */

/** The appearances a caller may give a subtask. */
export type SubtaskAppearance = "provisional" | "fixed" | "muted" | "open";

/** What the drawing needs to know, with the contradiction already settled.

    The four names are the ones this module was born with, and they are kept so
    that a caller's code does not change because a picture did. Two of them are
    now named after a drawing they no longer use, and the channel each one
    really owns stands beside it (`sceneDraw.ts`, "ONE CHANNEL PER
    STATEMENT"). */
export interface ResolvedAppearance {
  /** `provisional`: the FILL - none at all, so the surface shows through, with
      a dashed outline in the task colour. Planned, not released. */
  readonly dashed: boolean;
  /** `fixed`: the ENDS - a cap at each end of the main time. Not a hatch any
      more; a hatch now says "not available" of a refused lane, and the name is
      kept only so that this type did not change with the picture. */
  readonly hatched: boolean;
  /** `muted`: the SATURATION - the task colour mixed half into the surface,
      opaque and at full height. Another team's, another crew's. */
  readonly muted: boolean;
  /** `open`: the FADE, where the bar passes the edge of the view. It goes on
      past what is drawn. */
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
