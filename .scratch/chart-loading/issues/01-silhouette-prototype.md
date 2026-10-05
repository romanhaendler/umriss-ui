# 01: Prototype - silhouette variants side by side

Status: needs-info
Type: prototype
Blocked by: None (can start immediately)

Spec: `.scratch/chart-loading/spec.md`

**What to build:** a throwaway page in the charts demo where the user can compare
the chart's loading silhouette in a few variants by eye and pick one. Each
variant shows a bar chart, a line chart and an area chart, all loading and with
nothing to show yet. A loading table stands beside them as the reference for
the motion. Before building the page, check that a pixel-based band can match
the table's look at all: the table's shimmer runs over a percentage of its
cell.

The spec's variants:

- A: a silhouette shaped by series kind, with one shimmer band across all of
  its shapes.
- B: the same shapes plus faint grid strips.
- C: grid strips only, with a soft wave.

The variants differ in shape treatment, band width and speed. The fade from
silhouette to course is shown on a button that "answers".

- [ ] All variants stand on one page, in the light and the dark theme, and with reduced motion (a toggle or a forced media emulation note).
- [ ] Each variant reads its kind from registered series, not from rows; a mixed chart takes the first series' kind.
- [ ] The band's width and speed are in pixels and do not change with the chart's width (shown with one narrow and one wide chart).
- [ ] The user's pick, with any adjustments (band width, speed, colour mix, shapes), is recorded under `## Comments` here, precise enough for 03 to build without asking.
- [ ] The prototype page is deleted after the pick; nothing of it ships.

## Comments

Prototype built (2026-10-05) on the branch `prototype/chart-loading-silhouette`
(commit 57378303). The branch is never to be merged. It is waiting for the
user's pick.

How to view it: `git switch prototype/chart-loading-silhouette`, then
`pnpm dev:charts`, then open `/chart/?variant=A#prototype-loading-silhouette`.

- Switch variants with `?variant=A|B|C`, the floating bar, or ← →.
- `?band=` (px), `?speed=` (px/s) and `?glint=` (0-1) tune the shimmer.
- "As reduced motion" shows the silhouette still. "Answer" and "Load again"
  show the fade out and back.

Presets:

- A: 220 px band at 240 px/s.
- B: 320 px band at 180 px/s.
- C: 160 px band at 300 px/s.

In every variant the shapes are 10 % of the text colour and the glint goes
toward the surface colour at 0.9.

The open check from the ticket, whether a pixel band can match the table's
look: the table's shimmer runs over each pill's own width, so its band is
roughly as wide as one pill. On a narrow chart, a band of about 160-220 px reads
like it. On the wide chart the band crosses at the same speed, so one cycle
takes longer. That is the trade for a speed that does not depend on width.

Seen in building it:

- The SVG gradient has to sit on the band's own coordinates; otherwise the
  band shows only its transparent end.
- In dark mode the glint darkens instead of lightening, as the table's
  skeleton does there.
- The axes show their empty [0, 1] ticks while the chart waits. Whether they
  should be quieter is a question for the pick.
