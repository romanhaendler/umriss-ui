# 01 - ADR: a chart draws its own picture

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/chart-picture-and-print/spec.md`
ADR:    ADR-0075, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

The record first: a new ADR under the next free number in `docs/adr/`, with the text below. ADR-0032's
status line names it as superseding the "export" point. The capability record's "Out" entry for export
points at the new ADR until ticket 03 moves export into what the chart does. No source changes.

The decision text:

> **A chart draws its own picture**
>
> Status: accepted, supersedes ADR-0032 in its "export" point
>
> ADR-0032 put export under "never": "a canvas already exports itself (`toDataURL`)". The shakedown of
> 24 October 2026 built that *Instead* three times, in a trend, an operator screen and a BI report, and it
> failed each time. A chart is two canvases under an HTML layer. The axes, ticks, labels, limit labels and
> legend are HTML, so `toDataURL` yields the plotted series on a transparent ground with nothing that says
> what they are. Rasterising the DOM in the host needs a foreign library, and the ones that exist put the
> DOM into an SVG foreignObject, which cannot use the page's web fonts.
>
> **A chart hands over one PNG of what the reader sees: plot, axes, limits and legend on its own ground, in
> the colour scheme in use; never the tooltip, the crosshair, a control or a title.** `useChart` returns
> `toPng()`, which resolves to the Blob. The chart draws the picture itself: the series again, by the draw
> function the screen uses, and its HTML parts where the browser laid them out, in the page's fonts.
>
> *Consequences:*
>
> - PNG only. An SVG would be a second renderer of every kind, the reason this library has no WebGL.
> - No button and no wording: where the picture goes is the application's (ADR-0023's rule, applied).
> - The painter knows the chart's own parts, not HTML at large. A part it cannot paint is drawn with plain
>   elements, not met with a larger painter.
> - A trend in a report is a question of a data-dense application, so the reopening clause of ADR-0032 is
>   met. Its other "never" points stand.

## Acceptance criteria

- [ ] The ADR exists under the next free number, with the text above and the date of writing.
- [ ] ADR-0032's status line names the new ADR.
- [ ] `docs/adr/README.md`'s table lists the new ADR, and ADR-0032's row says "superseded in part by" it.
- [ ] `pnpm check:site` passes.
