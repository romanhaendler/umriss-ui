# Chart export, now that toDataURL fails

Type:   grilling
Status: claimed

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
