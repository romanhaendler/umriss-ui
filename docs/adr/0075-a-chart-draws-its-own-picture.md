# A chart draws its own picture

Status: accepted, supersedes ADR-0032 in its "export" point
Date:   2026-10-26

ADR-0032 put export under "never": "a canvas already exports itself (`toDataURL`)". The shakedown of
24 October 2026 built that *Instead* three times, in a trend, an operator screen and a BI report, and it
failed each time. A chart is two canvases under an HTML layer. The axes, ticks, labels, limit labels and
legend are HTML, so `toDataURL` yields the plotted series on a transparent ground with nothing that says
what they are. Rasterising the DOM in the host needs a foreign library, and the ones that exist put the
DOM into an SVG foreignObject, which cannot use the page's web fonts.

**A chart hands over one PNG of what the reader sees: plot, axes, limits and legend on its own ground, in
the colour scheme in use; never the tooltip, the crosshair, a control or a title.** `useChart` returns
`toPng()`, which resolves to the Blob. The chart draws the picture itself: the series again, by the draw
function the screen uses, and its HTML parts where the browser laid them out, in the page's fonts.

*Consequences:*

- PNG only. An SVG would be a second renderer of every kind, the reason this library has no WebGL.
- No button and no wording: where the picture goes is the application's (ADR-0023's rule, applied).
- The painter knows the chart's own parts, not HTML at large. A part it cannot paint is drawn with plain
  elements, not met with a larger painter.
- A trend in a report is a question of a data-dense application, so the reopening clause of ADR-0032 is
  met. Its other "never" points stand.
