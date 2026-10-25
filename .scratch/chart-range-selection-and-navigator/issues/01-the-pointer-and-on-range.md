# 01 — The pointer's gesture and `onRange`

Status: ready-for-agent
Type: task
Size: L

Blocked by: none
Spec: decisions R1-R6, R13, R15-R18; user stories 1-4, 8-17
ADR:    ADR-0074, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

A reader marks a stretch with the pointer and the application hears it. On a
zoomable chart, Alt with a drag; where no x axis is zoomable, a plain drag.
While the pointer is down a band covers the stretch (overlay canvas, the
theme's emphasis colour, an outline under forced colours) and the tooltip is
not shown; on release the band goes and `onRange({ axisId, from, to })` is
called once, `from` not after `to`. Nothing is kept.

The decision is written down first: an ADR, numbered with the next free number
at the time, saying a chart reports a range as it reports a hit (ADR-0056) and
keeps none; that the pointer's gesture is Alt on a zoomable chart and a plain
drag elsewhere; that a touch gets no range on a zoomable chart; and that it
does not travel over `syncId`.

`onRange` stands in `ChartOptions` of `useChart` beside `onSelect` and is read
as `onSelect` is, the latest handler when the reader acts (`useChart.tsx`,
`scene.onSelect`). The gesture lives in `scene.ts` beside `pointerDown`, `drag`
and `pointerUp`; `Chart.tsx` already forwards them. Start with the shape of
the type: `from` and `to` are numbers on numeric and time axes (this ticket)
and strings on a category axis (ticket 03) - settle a form in which a numeric
caller needs no cast.

Details the spec fixes: the ends are the pointer's x at press and release,
clamped to the plot (the pointer is captured); a press that travels under 4 px
stays a click and reaches `onSelect`, and a range reports nothing to
`onSelect`; with several x axes the report comes once per axis; without
`onRange` nothing changes and Alt with a drag still pans; Escape and a pointer
cancel report nothing; a non-zoomable chart with `onRange` takes
`touch-action: pan-y`.

## Acceptance

- [ ] ADR written; the ADR index lists it; ADR-0056 and ADR-0047 carry a
      pointer to it only where their text names the range as unbuilt.
- [ ] Mounted: Alt with a drag on a zoomable chart reports once, on release; a
      plain drag still pans and reports nothing; on a chart with no zoomable
      axis a plain drag reports; a drag to the left gives `from` before `to`;
      a release outside the plot reports the edge.
- [ ] Mounted: 3 px is a click and reaches `onSelect`; 5 px reports a range and
      not `onSelect`; Escape and a pointer cancel report nothing; no `onRange`
      leaves every gesture as it was; a new function each render needs no memo.
- [ ] Mounted: two x axes report twice, each with its `axisId`.
- [ ] Type test: the handler's argument; a numeric caller needs no cast.
- [ ] The band is drawn over the plot while the pointer is down and is gone
      after release; the tooltip is not shown meanwhile. Interaction test with
      a real drag and a baseline mid-drag, also under forced colours; the
      screenshots are looked at before they are accepted.
- [ ] Typecheck, the charts' unit tests and the demo smoke test pass.
