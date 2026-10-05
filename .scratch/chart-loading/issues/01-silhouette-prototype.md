# 01: Prototype - silhouette variants side by side

Status: resolved
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

- [x] All variants stand on one page, in the light and the dark theme, and with reduced motion (a toggle or a forced media emulation note).
- [x] Each variant reads its kind from registered series, not from rows; a mixed chart takes the first series' kind.
- [x] The band's width and speed are in pixels and do not change with the chart's width (shown with one narrow and one wide chart).
- [x] The user's pick, with any adjustments (band width, speed, colour mix, shapes), is recorded under `## Comments` here, precise enough for 03 to build without asking.
- [x] The prototype page is deleted after the pick; nothing of it ships.

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

## Answer

The user picked (2026-10-05) by eye, in both themes and with reduced motion,
and accepted every recommendation as it stood.

**Variant A, at its preset.** Ticket 03 builds exactly this:

- Shapes by series kind, with the first series in drawing order deciding:
  - `bar` and `box`: rounded columns standing on the baseline.
    - Count: `clamp(round(width / 34), 6, 18)`.
    - Width: `min(step * 0.6, 36)` px, radius 4.
    - Heights from a fixed pattern of 0.42 to 0.9 of 86 % of the height.
  - `line` and `scatter`: one soft wave, a 4 px stroke with round caps,
    `y = h * (0.5 + 0.17 sin(2π · 1.15t + 0.6) + 0.06 sin(2π · 3.1t))`.
  - `area`: the same wave, with a fill beneath it at 0.4.
  - `state`, `matrix` and no series: strips at 1/4, 1/2, 3/4 and the
    baseline.
- 6 px of air on every side of the plot area.
- The shapes are 10 % of the text colour.
- The band is 220 px wide and runs at 240 px/s. It sweeps 80 % of a cycle and
  rests for 20 %, eased with `--u-ease-swell`. Its middle reaches the surface
  colour at 0.9, so it darkens in dark mode, as the table's skeleton does.
- Leaving: the silhouette fades out and the series layer fades in, both in
  240 ms with `--u-ease-out`.
- Reduced motion: no sweep, no fades.
- **New:** while the chart waits, the axes keep their lines and titles but not
  their tick labels. The [0, 1] a chart has before its rows means nothing.

The losing variants B and C, and the switcher, stay on the branch
`prototype/chart-loading-silhouette`.
