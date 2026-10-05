# 03: The silhouette by series kind, with shimmer and fade

Status: ready-for-agent
Type: task
Blocked by: 01, 02

Spec: `.scratch/chart-loading/spec.md`

**What to build:** the variant the user picked in 01, built. A chart that loads
with nothing to show shows a quiet silhouette in its plot area, shaped by its
series kinds. One shimmer band of fixed pixel width sweeps across all of the
silhouette's shapes, and the frame, axes and legend stay. When the rows arrive,
the silhouette fades out and the course fades in. With reduced motion it stands
still. Under forced colours it stays visible.

- [ ] Built to the pick and its adjustments recorded in 01; where this ticket and 01's record disagree, 01's record wins.
- [ ] The silhouette stands where `.uc-empty` would, laid out from the same plot rectangle, `aria-hidden`, shapes with air between them - never a filled sheet.
- [ ] Its kind is read from the registered series: a bar chart's and a line chart's silhouette differ, told apart by an attribute a test can read; a mixed chart takes the first series' kind.
- [ ] Band width and speed in pixels; duration and easing from `--u-duration-shimmer` and `--u-ease-swell` through `--uc-*` fallbacks; the gradient mixed from the text colour, so it follows the theme.
- [ ] Silhouette fades out and the series layer fades in at the fast duration; the silhouette stays mounted until its fade has run. Reduced motion: no sweep, no fades, a still faint grey.
- [ ] Forced colours: the shapes keep a system-colour edge; a case in the forced-colours visual spec.
- [ ] jsdom tests: silhouette present with no rows, absent with rows, present over only gaps or hidden series; gone after `loading` turns off (after its fade, at once under reduced motion). SSR test: a loading chart renders on the server with `aria-busy`.
- [ ] The demo example from 02 shows both states, before the first rows and over drawn rows; one visual case per state with animations off.
- [ ] ADR-0042 or the charts docs name the chart as following the same loading rule. (The changelog entry for `loading` is written at release, `docs/releasing.md` step 1.)
- [ ] The user has looked at the built example in both themes and with reduced motion, and accepted it.
