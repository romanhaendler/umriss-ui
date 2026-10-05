# A chart that is loading says so

Status: ready-for-agent
Date:   2026-10-05
Origin: "Mir fehlt eine Loading-Animation (analog zur Tabelle) in den Charts." In
review, the user said the animation must look genuinely good. Its look is
accepted by eye, after a prototype.

## Problem Statement

A table that is waiting for its rows shows that it is waiting. Before the first
answer, placeholder rows shimmer. Rows already shown dim while the next answer
is on its way (ADR-0042). A chart does neither. An application that fetches a
chart's rows is left with two bad options:

- Render the chart with no rows. The chart then says "No data" (`empty`), which
  is false, and it flickers to the real course a moment later.
- Put its own spinner or core's `Skeleton` in place of the chart. The frame,
  axes and legend then vanish and come back, and every application rebuilds this.

When rows are reloaded over a course already drawn, for a new time range or a
new filter, nothing tells the reader that the course is about to change. The
tooltip goes on offering values that are being replaced.

A copy of the table's shimmer would not be enough either. The table's
placeholders look light because they are small pills with air between them. One
grey sheet over a whole plot area looks heavy. A shimmer sized relative to its
element also runs far faster and wider over a 900 px plot than over a 100 px
cell. The waiting state is the first thing a reader sees of a chart, so it has
to look good.

## Solution

`Chart` takes `loading`, the table's prop under the table's name, with the same
two states.

**Loading with nothing to show.** Where the chart would otherwise say `empty`,
a quiet **silhouette** of the chart that is coming stands in the plot area:

- It is shaped by the chart's registered series kinds: columns for bars, a soft
  wave for a line or an area. The chart knows its series before it has rows, in
  the same way the table shapes its placeholders by its columns.
- One shimmer band of fixed pixel width sweeps across all of the silhouette's
  shapes together, at a calm and constant speed.
- The frame, axes and legend stay where they are, as they do for `empty`. The
  axes leave out their tick labels while the chart waits: before its rows the
  chart has no range, and the [0, 1] it would label means nothing.
- The empty message never shows while loading.
- When the rows arrive, the silhouette fades out and the course fades in.

**Loading over a course already shown.** The course stays. It dims after
`--u-delay-stale`, so that a quick answer never flickers, and it takes no
pointer until the answer is in. When the answer arrives, the course comes back
at once.

In both states the plot carries `aria-busy`, and the silhouette is hidden from
screen readers. With reduced motion the silhouette stands still, with no sweep
and no fades.

How it looks is settled before it is built. A prototype puts two or three
variants side by side in the charts demo, and the user picks one by eye.

## User Stories

1. As an application developer, I want to pass `loading` to a chart, so that I can show a fetch in progress without building my own overlay.
2. As an application developer, I want the prop to have the table's name and meaning, so that one mental model covers both packages.
3. As an application developer, I want `loading` on the `Chart` that `useChart` hands out, so that it sits where `empty`, `height` and `ariaLabel` already sit.
4. As an application developer, I want a chart that loads before its first rows to keep its frame, axes and legend, so that nothing on the page jumps when the rows arrive.
5. As an application developer, I want the empty message held back while `loading` is true, so that "No data" never flashes before the first answer.
6. As an application developer, I want my own `empty` held back in the same way, so that a custom message never shows at the wrong moment.
7. As an end user, I want a silhouette where the course will be drawn, so that I can tell data is on its way and not missing.
8. As an end user, I want the silhouette of a bar chart to look like bars and the silhouette of a line chart to look like a line, so that I know what is coming before it arrives.
9. As an end user, I want the silhouette to be light: separate shapes with air between them, faint against the surface, never a grey sheet.
10. As an end user, I want one shimmer to sweep across all of the silhouette's shapes at once, so that the waiting reads as one calm motion and not many separate flickers.
11. As an end user, I want the shimmer's speed and band width to stay the same whatever the chart's width, so that a wide chart does not race and a narrow one does not crawl.
12. As an end user, I want a chart's shimmer and a table's shimmer on the same dashboard to read as the same motion, so that the page waits in one visual language.
13. As an end user, I want the silhouette to fade out and the course to fade in when the rows arrive, so that the change is soft and does not snap.
14. As an end user, I want a course being reloaded to stay visible, so that I keep my bearings while the new one loads.
15. As an end user, I want a course being reloaded to dim only after a short delay, so that a quick answer does not flicker.
16. As an end user, I want a dimmed course to ignore my pointer, so that I never read a tooltip value that is about to be replaced.
17. As an end user, I want a tooltip and crosshair that are open when reloading begins to go away, so that no stale reading stays on screen.
18. As an end user, I want pan, wheel zoom and double-click reset to do nothing on a dimmed course, so that I do not change a view whose data is being replaced.
19. As an end user, I want the legend to stay usable while the chart loads, so that I can still hide or show series. That changes the view, not the data, just as the table's toolbar stays usable.
20. As an end user, I want "Show all" to stay usable while the chart loads, for the same reason.
21. As an end user, I want the course to return at full strength as soon as the answer arrives, so that the new data reads at once.
22. As an end user who prefers reduced motion, I want the silhouette to stand still in a faint grey with no sweep and no fades, as core's `Skeleton` and the table's placeholders do.
23. As a screen reader user, I want the chart marked busy while it loads, so that I know its content is about to change.
24. As a screen reader user, I want the silhouette hidden from me, so that I do not hear empty shapes.
25. As a keyboard user, I want the chart to stay one tab stop while it loads (ADR-0030), so that focus is never lost when loading starts or ends.
26. As a keyboard user, I want a dimmed course to stay walkable with the arrow keys, as the table's stale rows block only the pointer.
27. As an application developer with a dark theme, I want the silhouette mixed from the text colour, as the table's placeholders are, so that it follows the theme without code of its own (R-1.8).
28. As an application developer who loads `@umriss-ui/charts` without core, I want the silhouette, the sweep, the delay and the dimming to work on literal fallbacks, so that charts keep depending on nothing.
29. As an application developer who loads core, I want the chart to take its timing and easing from core's tokens, so that chart and table move in step.
30. As an application developer, I want a chart with `syncId` that is dimmed to stop drawing the shared crosshair, so that it does not point at values being replaced.
31. As an application developer, I want a chart whose series are all gaps, or all hidden, to show the silhouette while it loads, so that the rule stays simple: loading over nothing shows the silhouette, and loading over something dims it.
32. As an application developer, I want a chart that leaves `loading` with still no rows to show the empty message, so that a genuinely empty answer is reported as it is today.
33. As a user of Windows high-contrast mode, I want the silhouette to stay visible under forced colours, so that the waiting state does not vanish.
34. As the owner of the library, I want to choose the silhouette's look from variants seen side by side before it is built, so that what ships is what I find good.
35. As a demo visitor, I want an example of a loading chart on the charts site that shows both states, so that I can see them and copy the pattern.

## Implementation Decisions

- **The prop.** `ChartProps` gets `loading?: boolean`, default `false`. Its
  documentation follows the table's: it shows a silhouette where there is
  nothing, and it keeps and dims what is drawn. The documentation of `empty`
  adds that `empty` is not shown while the chart is loading.
- **Two states, one condition.** The chart already knows whether it has
  anything to show: the layout snapshot's `empty`.
  - Loading over nothing is `loading && empty`. The silhouette stands where the
    empty message would stand.
  - Loading over something is `loading && !empty`. The plot is marked stale.
  - This mirrors the table's `stale = loading && shownLines > 0`.
- **The silhouette is shaped by series kind** (CONTEXT.md: Series kind). It
  reads the kinds of the registered series, which exist before any row does.
  - Baseline mapping, which the prototype may revise:
    - `bar`, `box`: a handful of rounded columns of varied height standing on
      the baseline.
    - `line`, `area`, `scatter`: one soft, smooth wave across the plot width.
      An area adds a faint fill beneath the wave.
    - `state`, `matrix`, or no series at all: faint horizontal strips at the
      grid lines.
  - A mixed chart takes the kind of the first series in drawing order.
  - The shapes are fixed and decorative. They are the same on every render, so
    nothing jumps, and they are not derived from any data.
  - Every shape stays clear of the frame and of the others: the silhouette is
    shapes with air between them, not a filled area.
- **The shimmer.** One gradient band sweeps across the silhouette's shapes as a
  whole, so that all of them light up as the band passes over them.
  - The band's width and travel are in pixels, not in percentages of the
    element, so the speed is the same at any chart width.
  - Duration and easing come from `--u-duration-shimmer` and `--u-ease-swell`.
  - The prototype tunes the band width and the colour mix against the table's
    placeholders seen side by side, so that the two read as the same motion.
- **Transitions.**
  - From silhouette to course: the silhouette fades out and the series layer
    fades in, at the duration of a fast transition (`--u-duration-fast` with a
    fallback). The silhouette stays mounted until its fade has run.
  - Into stale: the plot dims after `--u-delay-stale` to the table's 0.5
    opacity.
  - Out of stale: the course is back at once, as the table's rows are.
  - Reduced motion: no sweep and no fades. The silhouette stands in a still
    faint grey.
- **Drawing medium.** HTML and CSS over the plot area: the gradient, the
  keyframes and the reduced-motion rule are CSS, as core's skeleton is. The
  silhouette's shapes may be HTML boxes or one inline SVG; the prototype
  decides. It is not drawn on the series canvas, because a canvas would need a
  running animation loop of its own for the sweep.
  - Charts do not import core (CLAUDE.md), so all of this belongs to the charts
    stylesheet.
  - Like the axes, the silhouette appears with the first layout. A prerendered
    page carries `aria-busy`, not the shapes.
- **Stale.** The plot element carries a data attribute for the stale state, as
  the table carries `data-stale`. CSS dims the plot and sets
  `pointer-events: none`. When the stale state begins, the scene ends any
  pointer hover: the tooltip, the crosshair and the shared `syncId` position.
  With pointer events off, no `pointerleave` will arrive to end them. Keys are
  not blocked.
- **What stays live.** The legend, the data-table disclosure and "Show all"
  stand outside the plot element. They are neither dimmed nor disabled.
- **Accessibility.** `aria-busy="true"` goes on the plot element (the `img` or
  `application`, ADR-0030) while `loading` is true, and is absent otherwise. The
  silhouette is `aria-hidden`. There are no new words: the table says nothing
  here either, so `ChartsWording` (ADR-0031) does not change.
- **Forced colours.** The shapes keep a system-colour edge, so that the
  silhouette stays visible. The dimmed course follows the plot's existing
  forced-colours treatment.
- **Tokens (R-1.6, ADR-0021).** New `--uc-*` declarations on `.uc-root` fall
  back onto core's tokens and then onto literals:
  - `--u-delay-stale` → 200ms
  - `--u-duration-shimmer` → 1.6s
  - `--u-ease-swell` → ease-in-out
  - `--u-duration-fast` → the existing fast duration
  - `--u-color-text` → the base of the gradient

  The rules themselves read only `--uc-*`, so the stylesheet guard holds.
- **The look is decided first.** Before the silhouette is built for real, a
  prototype shows two or three variants side by side on a throwaway page in the
  charts demo. Each variant shows a bar chart, a line chart and an area chart,
  with a loading table beside them for comparison. The variants differ in shape
  treatment, band width and speed. The user picks one, and the build follows the
  pick. The variants worth comparing:
  - A: kind-shaped silhouette, with one band across all shapes.
  - B: the same shapes plus faint grid strips.
  - C: grid strips only, with a soft wave.
- **Demo and site.** The charts demo gets a loading example with a toggle that
  shows both states: before the first rows, and over rows already drawn. The
  prop appears on the `Chart` reference page in the way the site lists props
  (ADR-0044, ADR-0046). Add an entry to charts' `CHANGELOG.md`.
- **No new ADR.** This carries ADR-0042's loading rule over to the chart: keep
  what is shown, dim after the delay, and show placeholders only where nothing
  is kept. A sentence in ADR-0042, or in the charts docs, names the chart as
  following the same rule.

## Testing Decisions

- **The look is accepted by eye, not by a test.** The user's pick of a
  prototype variant, and a final look at the built example in both themes and
  with reduced motion, are the acceptance for how the silhouette looks. No test
  asserts the shapes' geometry, the band width or any timing.
- **One seam for behaviour: the `Chart` that `useChart` hands out, observed
  through its DOM.** `emptyState.jsdom.test.tsx` already works at this seam: it
  renders through `useChart`, gives `.uc-plot` a size by mocking
  `getBoundingClientRect`, waits one animation frame, then reads classes and
  attributes. The tests touch no scene internals and no canvas pixels.
- The tests describe external behaviour only:
  - Loading with no rows: the silhouette is present and `aria-hidden`, there is
    no `.uc-empty`, the axes are present, and the plot has `aria-busy="true"`.
  - A bar chart's silhouette differs from a line chart's: there is a
    distinguishing attribute for the kind it shows. This is the only check on
    shape.
  - Loading with rows: there is no silhouette and no `.uc-empty`, the plot has
    the stale attribute, and it has `aria-busy="true"`.
  - Loading over only gaps or only hidden series: the silhouette shows.
  - A custom `empty` is not shown while the chart is loading.
  - After `loading` turns off with rows: no stale attribute and no `aria-busy`.
    The silhouette is gone once its fade has ended, or at once under reduced
    motion.
  - After `loading` turns off without rows: `.uc-empty` says "No data".
  - A tooltip that is open when loading begins is gone. Prior art:
    `tooltipFormat.jsdom.test.tsx`, `readout.jsdom.test.tsx`.
  - The arrow keys still move the readout on a stale chart. Prior art:
    `keyboard.jsdom.test.tsx`.
- `styleGuard.test.ts` covers the new CSS unchanged. The SSR test
  (`ssr.test.tsx`) gains one case: a loading chart renders on the server with
  `aria-busy`.
- In `tests-visual`, the demo example gets one case per state with animations
  off, as the existing visual specs have them, and the forced-colours spec gets
  a case for the silhouette. These guard the chosen look against regressions.
  They do not judge it.
- Prior art for the behaviour as a whole: the table's `serverMode.test.tsx`,
  "Server mode - loading (M2)", which covers `aria-busy`, `data-stale` and the
  placeholders before the first answer.

## Out of Scope

- A progress value or a percentage. Like the table's placeholders, the
  silhouette does not say how far loading has come.
- A silhouette derived from data: previous rows, the expected range or a cached
  course. The shapes are decorative and fixed.
- A silhouette per series in a mixed chart.
- A loading word, or a live announcement when loading ends.
- Loading per series or per axis: `loading` belongs to the whole chart.
- Streaming or appending rows while loading.
- Changing the table's shimmer to a pixel-based band. If the prototype shows
  that the table's shimmer should change to match, that is a separate ticket.
- `@umriss-ui/schedule`. Its own loading state, if it wants one, is a separate
  spec, even though it draws through charts.
- Dimming the open data table (`DataTable`). It shows what the chart shows, and
  it is a reading view the reader opened on purpose.

## Further Notes

- The table keeps its column widths while loading over a server page. A chart
  has a fixed height and measures its width from the host, so nothing needs to
  be held: the frame keeps its size by construction.
- ADR-0035 (data-dense applications) supports a chart that is honest about
  stale data. A dashboard tile and a chart that refresh side by side should
  agree on what "reloading" looks like.
