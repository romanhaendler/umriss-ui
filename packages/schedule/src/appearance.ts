/* What a bar says besides its colour.

   A closed list, and a short one: released work against work still being
   planned, work that may move against work that may not, another team's plan,
   and a bar that continues past the view. Each is a pattern or an outline and
   not only a colour, so the statement arrives without relying on colour
   vision.

   Two of them contradict - work cannot be provisional and fixed at once: the
   later one in the list wins. */

/** The appearances a caller may give a subtask. */
export type SubtaskAppearance = "provisional" | "fixed" | "muted" | "open";

/** What the drawing needs to know, with the contradiction already settled.

    Two of the field names (`dashed`, `hatched`) are older than the drawing;
    the channel each one owns stands beside it. */
export interface ResolvedAppearance {
  /** `provisional`: the FILL - none at all, so the surface shows through, with
      a dashed outline in the task colour. Planned, not released. */
  readonly dashed: boolean;
  /** `fixed`: the ENDS - a cap at each end of the main time. Not a hatch: a
      hatch says "not available" of a refused lane. The field keeps the name
      `hatched`. */
  readonly hatched: boolean;
  /** `muted`: the SATURATION - the task colour mixed half into the surface,
      opaque and at full height. Another team's, another crew's. */
  readonly muted: boolean;
  /** `open`: the FADE, where the bar passes the edge of the view. It goes on
      past what is drawn. */
  readonly open: boolean;
}

/** Settles a subtask's appearances into what is drawn. `provisional` and
    `fixed` contradict each other; the later one in the list wins.
    @param appearance The subtask's `appearance`, in the order it was given.
    @returns Which of the four channels are on. */
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
