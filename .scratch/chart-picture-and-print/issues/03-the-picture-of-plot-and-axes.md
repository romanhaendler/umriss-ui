# 03 - The picture of plot and axes

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-adr-a-chart-draws-its-own-picture.md`
Spec: `.scratch/chart-picture-and-print/spec.md`

## What to build

The tracer bullet. `const { Chart, toPng } = useChart(rows)`; `await toPng()` resolves to a PNG Blob of the
plot and its axes, on the chart's ground, at least twice the chart's CSS pixels. A demo example's button
shows the picture beside the chart.

- **API.** `ChartParts.toPng: () => Promise<Blob>`, no options. It rejects with an `Error` when the chart is
  not bound or has no size. Its doc comment says what the picture holds and what it leaves out, as the spec
  lists them.
- **The painter**, a module of charts' own, in this slice:
  - the ground, from the resolved theme's `colorBg`, over the root's rectangle;
  - the series layer, drawn again by the existing series-layer draw function with the scene's current input,
    at the ratio max(`devicePixelRatio`, 2). The overlay is not drawn;
  - the axes' HTML: axis lines and tick marks as boxes with their background colour; tick labels and axis
    titles as text in their computed font, colour and letter-spacing. A label on two lines stays on two
    lines, and a vertical y title is turned as on screen;
  - positions relative to the root, divided by the root's on-screen scale;
  - the skip list: overlay canvas, tooltip, screen-reader texts, measuring span, "Show all", data key and
    panel, silhouette;
  - `toBlob("image/png")`.
- **Docs.**
  - The README gets a section on the picture, with a download (`<a download>` from an object URL) and the
    clipboard (`ClipboardItem`) in a few lines each.
  - The capability record moves export from "Out" into what the chart does, pointing at the new ADR.
  - A demo example with a "Picture" button and an `<img>` beside the chart.
  - `API.md` regenerated.

## Acceptance criteria

- [ ] A jsdom test with a recording 2D context and a stubbed `toBlob`: the texts painted include the tick
      labels and the axis title, and exclude the tooltip's text and the screen-reader summary.
- [ ] A jsdom test: `toPng()` rejects on an unmounted chart.
- [ ] A visual test (charts-light and charts-dark) clicks the example's button and reads the image in the
      page:
      - its size is twice the root's CSS size at `deviceScaleFactor` 1;
      - a corner holds the resolved ground colour;
      - a tick label's rectangle holds text pixels;
      - with the pointer resting on the plot, the picture holds no crosshair and no tooltip surface.
- [ ] One `toHaveScreenshot` of the image per scheme, tagged `@quick`, looks like the chart beside it.
- [ ] `pnpm check charts`, `pnpm check:site` and `pnpm test:visual:quick charts` pass.
- [ ] The changelog notes `toPng` under "Added".
