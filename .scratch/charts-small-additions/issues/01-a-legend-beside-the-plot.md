# 01 - A legend beside the plot

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/charts-small-additions/spec.md`

## What to build

A dashboard designer writes `<Legend placement="right" />` and gets the names in a column beside the plot;
`"left"` puts the column on the other side.

- **The prop.** `placement` takes `"top" | "bottom" | "left" | "right"`, default `"top"`.
- **The column.** One entry per line, the data key at its end. It is as wide as its longest entry, at most a
  quarter of the chart's width; a longer name wraps under its own text, the chip on its first line. It is as
  tall as the plot; entries that do not fit scroll inside it.
- **The fallback.** Where the chart is narrower than 480 px, a side legend stands above the plot, laid out
  as `top`.
- **Unchanged.** The plot takes what is left of the chart. Toggling, highlight, "Show data", "Show all"'s
  corner rule and the Tab order are as they are with a legend above.
- **The example.** The Legend page's placement example shows a side legend, or a new example beside it does.
  It also shows a chart below the fallback width, or names the fallback in its lead.
- **Docs.** The doc comment of `placement`, the capability record's Legend row, and the changelog under
  "Added".

## Acceptance criteria

- [ ] A jsdom test: a `right` and a `left` legend carry their side's layout; a click on an entry hides its
      series; "Show data" opens from the column.
- [ ] A jsdom test: at a chart width below 480 px, a side legend carries the top layout.
- [ ] A long name wraps and the legend is no wider than a quarter of the chart (visual test in the example).
- [ ] The example's screenshots, light and dark, are new baselines and reviewed; the existing Legend
      screenshots are unchanged.
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
- [ ] `pnpm test:visual:quick charts` passes.
