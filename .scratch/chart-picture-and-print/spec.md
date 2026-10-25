# A chart hands over its picture, and prints at the page's width

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Chart export, now that toDataURL fails" (its Answer
holds every decision below); findings `.scratch/shakedown/charts.md` (Wishes), `operator-screens.md` (Wishes),
`reports-bi.md` 1 and 9; ADR-0032 (its "export" point is superseded by this spec's first ticket), ADR-0050.

## Problem Statement

A reader who wants a trend in a shift report, an incident note or a slide gets no usable picture of it.

- **`toDataURL` holds only the lines.** ADR-0032 answered export with "a canvas already exports itself". A
  chart is two canvases under an HTML layer, and the axes, ticks, labels, titles, limit labels and legend are
  HTML. The series canvas exports the plotted series on a transparent ground, with nothing that says what
  they are. Three personas built that *Instead* and it failed each time.
- **A host recipe does not hold either.** The libraries that rasterise the DOM put it into an SVG
  foreignObject, and an SVG image cannot use the page's web fonts, Geist included. Each host would also take
  on a foreign dependency for what is one chart's own business.
- **Printing cuts the chart off.** A chart keeps its screen width on paper: a 1216 px canvas on A4 shows two
  of three bars, and a waterfall loses its right edge. The ResizeObserver does not fire for print, and at
  `beforeprint` the page is still laid out for the screen. The output is wrong, not just unstyled.

## Solution

**A chart hands over one PNG of what the reader sees**, and **a chart prints at the width the page gives
it**.

- **The picture.** `useChart`'s return gets `toPng()`, beside `setView` and `toggleSeries`. It resolves to a
  PNG Blob of the chart as it stands, at the chart's size on screen and at least twice its CSS pixels.
  - In it: the plot with grid, series, limit lines and bands; the axes with ticks, labels, titles and breaks;
    the limits' labels; the legend; the empty message. All of it on the chart's own ground, in the colour
    scheme in use.
  - Not in it: the tooltip, the crosshair, the "Show all" button, the data key and its table, focus and hover
    surfaces, the screen-reader texts, and any title.
  - The host places the button and decides what happens to the Blob: download, clipboard, upload. The README
    shows the first two.
- **Print.** When the page goes to print, the chart measures its plot as the print layout gives it and
  draws one frame there and then, its HTML axes included. Afterwards it does the same for the screen.
- **The record.** A new ADR supersedes ADR-0032 in its "export" point. The capability record moves export
  from "Out" to what the chart does.

## User Stories

1. As an operator, I want to save the trend I am looking at as a picture, so that I can put it into the
   shift log.
2. As an engineer writing an incident report, I want the picture to carry the axes, their units and the
   limits, so that the reader of the report can read values off it.
3. As a report author, I want the legend in the picture, so that the series stay told apart outside the
   application.
4. As a reader who relies on marks, not colour, I want the legend's dash, marker and hatch chips in the
   picture, so that a picture of a chart with `encoding="marks"` stays readable without colour.
5. As a report author, I want the picture on the chart's own ground and not transparent, so that it reads
   on any page it is pasted into.
6. As an operator on a dark control-room screen, I want the picture in the scheme I see, so that it matches
   what I reported.
7. As a report author, I want a picture without the tooltip, crosshair or buttons, so that a hover or a zoom
   at the moment of saving does not end up in the report.
8. As a reader who has hidden a series, I want the picture to show the legend as I left it, so that the
   picture says what was shown.
9. As a report author on a 1x office monitor, I want a sharp picture, so that it does not blur in print or
   on a projector.
10. As an application developer, I want one function that resolves to a PNG Blob, so that I can wire it to my
    own button, menu or keyboard shortcut.
11. As an application developer, I want the README to show the download and the clipboard in a few lines, so
    that I do not look up `ClipboardItem` and `<a download>` myself.
12. As an application developer, I want `toPng()` to reject with a reason when the chart is not on screen,
    so that a hidden or unmounted chart fails loudly and does not save an empty picture.
13. As an application developer whose app scales a chart with a CSS transform, I want the picture at the
    chart's own size, so that a zoomed dashboard does not give a skewed picture.
14. As an application developer, I want the picture to need no dependency in my app or in umriss, so that it
    costs nothing to add.
15. As a BI user printing a report page to PDF, I want each chart to fit the page, so that no bar and no
    axis is cut off.
16. As a BI user, I want the printed chart's axes to stand where its marks are, so that the printout can be
    read like the screen.
17. As a BI user, I want the chart back at its screen size after printing, so that printing leaves the page
    as it was.
18. As an application developer, I want the README to say in which browser printing is proved, so that I know
    what is promised.
19. As the maintainer, I want a new ADR to supersede ADR-0032's export point, so that "never" and "Instead"
    stay honest where the shakedown proved them wrong.

## Implementation Decisions

- **API.** `ChartParts` gains `toPng: () => Promise<Blob>`. There are no options. It rejects with an `Error`
  when the chart is not bound or has no size. There are no new wording keys and no new component.
- **Size and ratio.** The picture covers the chart's root, the legend included, at its CSS size. The ratio is
  the larger of `devicePixelRatio` and 2. Positions are read relative to the root and divided by the root's
  on-screen scale, so that a CSS transform on an ancestor does not distort the picture.
- **Drawing.** A module of charts' own paints the picture on a canvas it creates:
  1. it fills the root's rectangle with the resolved theme's ground (`colorBg`);
  2. it draws the series layer again by calling the existing series-layer draw function with the scene's
     current input, on the picture's context at the picture's ratio. Nothing is copied from the screen's
     canvas, and the overlay layer is not drawn;
  3. it walks the root's HTML layer and legend in document order and paints each part where the browser laid
     it out:
     - a box with a visible background colour, with its radius and opacity;
     - a top border, as a line in its style, width and colour (the limit label's mark);
     - each text node, in its element's computed font, colour and letter-spacing. A label on two lines stays
       on two lines, struck-through text is struck through, and a vertical title is turned as on screen;
     - an element's 2D transform (an axis break's skew);
     - the legend's SVG mark chips, each drawn as an image of its own serialised SVG. This is the only
       asynchronous step besides the PNG encoding.
  4. it skips a closed list of parts: the overlay canvas, the tooltip, the screen-reader texts, the measuring
     span, the "Show all" button, the data key and its panel, and the loading silhouette.
  5. it encodes with `toBlob("image/png")`.

  The canvas uses the page's loaded fonts, which is why the HTML layer is painted and not put into an SVG
  foreignObject.
- **The axis break.** Its two strokes are CSS pseudo-elements today, which a painter cannot see. They become
  two elements of their own, with the same look. The screenshots stay unchanged.
- **Print.** The chart's binding effect listens to `matchMedia("print")`. On every change it measures the
  plot, takes that size and runs the scene's frame synchronously instead of on the next animation frame. It
  does so inside React's `flushSync`, so that the HTML axes re-render before the print layout is taken. Only
  a chart whose width follows its host (`width="100%"`, the default) changes; a fixed width stays fixed.
  Printing never uses the picture: the printed chart is drawn, not rastered.
- **ADR.** A new ADR, "A chart draws its own picture", supersedes ADR-0032 in its export point. Its text is
  in this spec's first ticket. ADR-0032's status line names it. The print fix is a commit message under
  ADR-0050.
- **Docs.** Each change carries its own docs:
  - charts' README: how to use the picture, with the download and the clipboard, and that printing is proved
    in Chromium;
  - the capability record: export moves from "Out" into what the chart does;
  - the doc comment of `toPng`, which `API.md` is generated from;
  - one demo example with a button that shows the picture beside the chart.

## Testing Decisions

- A good test here asserts on what a reader gets: the picture's pixels and size, the printed chart's
  geometry, the texts the picture holds. It never asserts on the painter's internal order or on class names
  beyond the chart's own published structure.
- **Unit (jsdom), the existing charts seams.** `renderChart` and `sizePlot` mount a sized chart, and a
  recording 2D context, as in the draw tests, captures what is painted. With `getContext` and `toBlob`
  stubbed:
  - the texts painted include the tick labels, the axis title and the legend names, and exclude the
    tooltip's text, "Show data" and the screen-reader summary;
  - `toPng()` rejects on an unmounted chart.

  A fake `matchMedia("print")` whose change the test fires shows that the canvases take the new size in the
  same task, without waiting for an animation frame.
- **Visual (Playwright, charts-light and charts-dark, Chromium).** The new demo example shows the picture in
  an `<img>`. A test clicks its button, then reads the image's pixels in the page, as the interaction tests
  already read the canvas layers:
  - the size is twice the root's CSS size at `deviceScaleFactor` 1;
  - a corner holds the resolved ground colour, light and dark;
  - a tick label's and a legend name's rectangles hold text pixels;
  - with the pointer resting on the plot, the tooltip's rectangle in the picture holds no tooltip surface.

  One `toHaveScreenshot` of the image per scheme guards the look, tagged `@quick`.
- **Print (Playwright Chromium, `page.pdf()`).** An init script registers its own listener on
  `matchMedia("print")` after the chart's. That listener records, inside the print layout, the plot's width,
  the series canvas's CSS width and the right edge of the last x tick label. The test asserts that the canvas
  equals the plot, the plot is narrower than on screen, and the label lies inside the plot's band. After
  printing, the chart is at its screen width again. This needs no PDF parsing. That the chain holds was
  tried on 2026-10-25: the ResizeObserver does not fire, `beforeprint` sees the screen's layout, and a
  synchronous redraw in the media query's change lands in the PDF.
- Prior art: `tests-unit/draw.test.ts` (recording context), `tests-unit/renderChart.tsx` (sized mount),
  `tests-unit/encoding.jsdom.test.tsx` (a stubbed `matchMedia`), `tests-visual/features-interaction.spec.ts`
  (canvas pixels read in the page).

## Out of Scope

- An SVG, a PDF, a picture at a size other than the screen's, a pixel-ratio option.
- A built-in export button or menu, and wording keys for one.
- A title or caption drawn into the picture.
- A picture of the data table, of the tooltip, or of a schedule.
- Copying to the clipboard or downloading as a function of the library; the README shows the host's lines.
- A promise for print in Firefox and Safari. The listener is the same, but only Chromium is tested.
- The print stylesheet (roadmap package C, P3): hiding controls, page breaks, the other packages.
- Any foreign dependency, in umriss or as a recommended host recipe.

## Further Notes

- The shakedown's `charts.md` lists "print" as held, measured at the screen's width; `reports-bi.md` printed
  to A4 and found the cut-off. The print test prints to A4 for that reason.
- If painting the HTML layer meets a CSS feature of the chart's stylesheet that the rules above do not
  cover, the fix is to draw that part with plain elements, as with the axis break, not to grow the painter
  into a general HTML renderer.
