# Chart export, now that toDataURL fails

Type:   grilling
Status: resolved

## Question

Does a chart export itself as a picture, and if so, what does the picture hold?

ADR-0032 put export under "never" because "a canvas already exports itself". Three personas built that
*Instead* and it failed: axes, ticks, labels, legend and tooltip are DOM, so `toDataURL` yields the plotted
series on a transparent ground (`.scratch/shakedown/charts.md`, `operator-screens.md`, `reports-bi.md`).
Printing to PDF cuts the canvas charts off (`reports-bi.md` 1). The data export holds (CSV from the rows).

- Reverse the "never" for export (an ADR superseding that point of ADR-0032), or keep it and document a
  host recipe that rasterises the DOM.
- If taken: PNG only, or SVG too; what is in the picture (axes, legend, title, limits, the ground colour of
  the theme); a function (`exportImage(chart)`), a prop, or a button in the chart's own menu beside "Show data"?
  No foreign dependency (open-points-roadmap, "What stays").
- Print: charts re-measured on `beforeprint` - here, or with the print stylesheet of roadmap package C (P3)?

## Answer

Decided 2026-10-25 by the agent, under the maintainer's delegation. The two product points are marked
*(agent, product - for review)*; the rest is technical and marked *(agent)*.

- **The "never" for export is reversed** *(agent, product - for review)*. The shakedown proved ADR-0032's
  *Instead* wrong three times: a chart is two canvases under an HTML layer, so `toDataURL` holds the series on
  a transparent ground and nothing that says what they are. A host recipe that rasterises the DOM would need
  a foreign library in every host, and the libraries that do it (foreignObject) lose the page's web fonts,
  Geist included. A trend in a shift report or an incident note is a question of a data-dense application,
  so the reason ADR-0032 itself gives for reopening is met. A new ADR supersedes ADR-0032 in that one point.
- **What umriss promises:** a chart hands over one PNG of what the reader sees *(agent, product - for
  review)*:
  - in it: the plot with grid, series, limit lines and bands; the axes with their ticks, labels, titles and
    breaks; the limits' labels; the legend, with hidden series as the legend shows them; the empty message.
    All of it on the chart's own ground (`--uc-color-bg`), in the colour scheme in use, so a dark screen
    gives a dark picture;
  - not in it: the tooltip, the crosshair and hover markers, the "Show all" button, the data key and its
    table, a focus ring, the text only a screen reader hears, and a title. A chart has no visible title, so
    the host captions the picture where it places it.
- **PNG only** *(agent)*. An SVG would be a second renderer of every series kind, the reason ADR-0032 gives
  against WebGL. A PDF, the clipboard and a download are the host's, one to three lines from the Blob
  (`ClipboardItem`, `<a download>`), shown in the README.
- **A function on `useChart`'s return, not a prop or a button** *(agent)*. `toPng(): Promise<Blob>` stands
  beside `setView` and `toggleSeries`, the hook's other actions. There is no button in the legend beside
  "Show data": the data key is there for readers who cannot see the chart, and an export button would bring
  required wording keys and a placement question for a control the host places better itself
  (components report, the application decides). There are no options. The size is the chart's size on
  screen, since another size is another layout. The pixel ratio is the screen's, but at least 2, so that a
  picture taken on an office monitor stays sharp in a report.
- **How it is drawn** *(agent)*. On a canvas of its own, synchronously apart from the PNG encoding:
  - the series layer is drawn again by the same draw function at the picture's ratio, not copied from the
    screen;
  - every other part is painted where the browser laid it out, in its computed font and colour. The canvas
    uses the page's loaded fonts, which an SVG image does not;
  - the legend's mark chips (encoding by marks) are drawn as images of their own SVG;
  - the two strokes of an axis break, CSS pseudo-elements today, become elements of their own first, so that
    the painter can see them.

  No foreign dependency (open-points-roadmap, "What stays").
- **Print is fixed here, not with roadmap package C** *(agent)*. `reports-bi.md` 1 is a defect of the
  chart's measuring, not a missing stylesheet: no CSS can lay out a canvas again. The chart listens to
  `matchMedia("print")`, and on its change measures its plot and draws one frame synchronously, the HTML
  axes included. Tried 2026-10-25 in Playwright Chromium (`page.pdf()`):
  - the ResizeObserver does not fire for print, and `beforeprint` still sees the screen's layout;
  - inside the media query's change the print layout is measurable, and a synchronous redraw there lands in
    the PDF at the page's width;
  - without it, the shakedown's cut-off is reproduced.

  The picture is not used for print. A synchronous redraw keeps the text as text and needs no raster.
  Proved in Chromium only, since `page.pdf()` is Chromium's; Firefox prints a static clone, and the README
  says what is tested. P3's print stylesheet keeps everything else: controls hidden, page breaks, the other
  packages.
- **Out:**
  - an SVG, a PDF or a picture at another size;
  - a picture of the data table, of the tooltip, or of a schedule (the schedule draws with charts, but its
    own picture waits for a case);
  - a built-in export button;
  - a title or caption in the picture;
  - print in Firefox and Safari, as a promise;
  - the print stylesheet (P3).
- **Costly to reverse:** the picture is. It is a public return of `useChart`, and it supersedes a "never" of
  ADR-0032, which by its own consequences is superseded, not edited. So it gets an ADR, the spec's first
  ticket. The print fix is not: it is a commit message under ADR-0050 (a chart fills its frame, on paper as
  well).
- **Touches:** charts only (source, README, capability record, demo example, unit and visual tests), plus
  the new ADR and ADR-0032's status line. Core, table, schedule, calculation and dashboard do not change.
- **Becomes the spec** `.scratch/chart-picture-and-print/`.
