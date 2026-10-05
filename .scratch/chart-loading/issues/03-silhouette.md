# 03: The silhouette by series kind, with shimmer and fade

Status: needs-info
Type: task
Blocked by: 01, 02

Spec: `.scratch/chart-loading/spec.md`

**What to build:** the variant the user picked in 01, built. A chart that loads
with nothing to show shows a quiet silhouette in its plot area, shaped by its
series kinds. One shimmer band of fixed pixel width sweeps across all of the
silhouette's shapes, and the frame, axes and legend stay. When the rows arrive,
the silhouette fades out and the course fades in. With reduced motion it stands
still. Under forced colours it stays visible.

- [x] Built to the pick and its adjustments recorded in 01; where this ticket and 01's record disagree, 01's record wins.
- [x] While the chart waits, the axes keep their lines and titles but show no tick labels (the user's pick in 01).
- [x] The silhouette stands where `.uc-empty` would, laid out from the same plot rectangle, `aria-hidden`, shapes with air between them - never a filled sheet.
- [x] Its kind is read from the registered series: a bar chart's and a line chart's silhouette differ, told apart by an attribute a test can read; a mixed chart takes the first series' kind.
- [x] Band width and speed in pixels; duration and easing from `--u-duration-shimmer` and `--u-ease-swell` through `--uc-*` fallbacks; the gradient mixed from the text colour, so it follows the theme.
- [x] Silhouette fades out and the series layer fades in at the fast duration; the silhouette stays mounted until its fade has run. Reduced motion: no sweep, no fades, a still faint grey.
- [x] Forced colours: the shapes keep a system-colour edge; a case in the forced-colours visual spec.
- [x] jsdom tests: silhouette present with no rows, absent with rows, present over only gaps or hidden series; gone after `loading` turns off (after its fade, at once under reduced motion). SSR test: a loading chart renders on the server with `aria-busy`.
- [x] The demo example from 02 shows both states, before the first rows and over drawn rows; one visual case per state with animations off.
- [x] ADR-0042 or the charts docs name the chart as following the same loading rule. (The changelog entry for `loading` is written at release, `docs/releasing.md` step 1.)
- [ ] The user has looked at the built example in both themes and with reduced motion, and accepted it.

## Comments

Built (2026-10-05). It waits only for the user's look at the built example.

- `Silhouette.tsx` holds the shapes and `useSilhouette(scene)`. The layout
  snapshot carries `silhouette`: the first series' kind while the chart waits,
  null otherwise. When the answer is laid out, the silhouette stays for its
  fade while the course fades in (`data-arriving`). Under reduced motion it
  goes at once.
- The geometry is the prototype's variant A, unchanged.
- The band runs at a speed in px/s, not core's `--u-duration-shimmer`. That is
  the user's pick, and it is recorded in the module.
- The fades take `--u-duration-medium`.
- Where they differ from the ticket:
  - Forced colours fill the shapes with `GrayText` instead of giving them an
    edge. A fill reads more clearly than an outline around the box, which is
    what the prototype had.
  - While the chart waits, the tick marks go along with their labels. A mark
    without a number would raise a question.
- Known limit, older than this ticket: the layout keeps room for the labels
  "0" and "1". When "250" arrives, the y band widens by a few pixels and the
  plot gives way during the fade. Avoiding that would need labels nobody knows
  yet.
- Tests:
  - jsdom: shape by kind, gaps and hidden series, no silhouette over a course
    or without loading, ticks gone and back, the fade and its end, reduced
    motion.
  - SSR: a loading chart is `aria-busy` from the server on.
  - Visual: the example with the silhouette, the course being reloaded
    (dimmed), and the silhouette under forced colours.
- ADR-0042 names the chart as following the same rule, and with ADR-0032 says
  that neither the sweep nor the fade animates the data. `docs/testing.md`
  counts five forced-colours examples.
- The changelog entry for `loading` comes at release.
