# A chart reports a range as it reports a hit, and keeps none

Status: accepted
Date:   2026-10

A reader of a long course marks a stretch - "from here to there" - and the rest
of the screen answers: a table shows the alarms of that stretch, a figure sums
it. The chart reports the point under the pointer (ADR-0056) and the span in
view (ADR-0047); it did not report a stretch the reader marked.

**A chart reports a Range and keeps none.** `onRange({ axisId, from, to })`
stands in the options of `useChart` beside `onSelect` and is read as it is: the
latest handler, when the reader acts. It is called once, on release; `from` is
not after `to` whichever way the reader dragged. The chart holds no range, has
no `selectedRange` and draws nothing after the release. To zoom into a range is
to hand it back as the view; what the application does with it is its own.

- **The pointer's gesture is Alt with a drag on a chart with a zoomable x
  axis, and a plain drag where no x axis is zoomable.** On a zoomable chart a
  plain drag pans; a modifier is how one gesture serves two meanings (as
  Highcharts' `zooming.key` does). Without `onRange` nothing changes, and Alt
  with a drag still pans.
- **A press that travels 4 px or less stays a click** and reaches `onSelect`; a
  range reports nothing to `onSelect`.
- **The ends are the pointer's x at press and at release,** clamped to the plot
  (the pointer is captured), as values of the scale, not snapped to a point. With
  several x axes the report comes once per axis, each with its `axisId`.
- **While the pointer is down a band covers the stretch** in the overlay, in
  the first series colour (an outline in the system colour under forced
  colours), and the tooltip is not shown. Escape and a pointer cancel report
  nothing.
- **A touch gets no range on a zoomable chart:** one finger pans. Where no
  axis zooms, the container takes `touch-action: pan-y`, so a horizontal
  finger makes a range and a vertical one scrolls the page.
- **A range does not travel over `syncId`,** which shares the pointer's x and
  the Active point, never a view.

## Rejected

- **A kept range** (a `selectedRange` prop, an edge to drag after release, a
  clear key): the chart would claim to hold a choice that is the application's.
- **A plain drag on a zoomable chart:** it pans already.
- **Reporting on every move:** a table would refilter on every pixel.

## Consequences

`from` and `to` are numbers on numeric and time axes; a category axis reports
the category strings, which widens the type without a cast for a numeric
caller. The keyboard (Space) belongs to the same version and is written with it.
