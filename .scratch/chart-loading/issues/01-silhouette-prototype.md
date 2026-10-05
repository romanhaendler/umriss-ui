# 01: Prototype - silhouette variants side by side

Status: ready-for-agent
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
