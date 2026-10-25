# 02 - A chart prints at the page's width

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/chart-picture-and-print/spec.md`

## What to build

Printing a page with a chart gives the chart at the width the printed page leaves it, with its axes where
its marks are. After printing, the chart is back at its screen width.

- **The listener.** The chart's binding effect listens to `matchMedia("print")`. On every change it measures
  the plot, takes that size and runs the scene's frame synchronously instead of on the next animation frame.
  It does so inside `flushSync`, so that the HTML axes render before the print layout is taken. It removes
  the listener on unbind. A chart with a fixed `width` stays at it.
- **Why the media query and not `beforeprint`.** Tried in Playwright Chromium: the ResizeObserver does not
  fire for print, `beforeprint` still sees the screen's layout, and inside the media query's change the
  print layout is measurable. A synchronous redraw there lands in the PDF.
- **Docs.** Charts' README says that a chart follows the printed page, proved in Chromium. Hiding controls and
  page breaks stay with the print stylesheet (roadmap P3).

## Acceptance criteria

- [ ] A jsdom unit test with a fake `matchMedia("print")` fires its change: the series canvas takes the new
      plot size in the same task, without an animation frame.
- [ ] A visual test prints a demo page with a full-width chart to A4 with `page.pdf()`. An init-script
      listener registered after the chart's records the following inside the print layout: the series
      canvas's CSS width equals the plot's width; the plot is narrower than on screen; the last x tick
      label's right edge lies inside the plot's band.
- [ ] After `page.pdf()` the chart has its screen width again.
- [ ] Without the listener, the visual test fails (the canvas keeps its screen width).
- [ ] `pnpm check charts` and `pnpm check:site` pass.
- [ ] The changelog notes the print fix under "Fixed".
