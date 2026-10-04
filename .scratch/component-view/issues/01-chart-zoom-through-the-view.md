# 01: Chart: zoom through the view

**What to build:** A chart zooms without a line of state in the application: `XAxis zoomable` turns on the gestures and keys that exist today, `zoomLimits` clamps (default: at most the data's extent, at least three data steps), and the zoomed span is part of the chart's view - handed in through `initialView`, applied whenever it differs in content from the last one, reported whole through `onViewChange`, and on the hook as `domains` and `setDomain(axisId, span | null)`. Two charts handed one shared view zoom together. `onDomainChange` and the controlled `domain` go; `domain` stays configuration and the start of a zoomable axis. The demo gets the page 'Zoom and pan', with the zoom examples moved there.

**Blocked by:** `charts-bound-to-rows` 01 (one seam) and 07 (contract)

**Status:** ready-for-agent

- [ ] Zoom by every gesture and key only where the axis is `zoomable`
- [ ] Zoom stays within `zoomLimits`
- [ ] Two charts in step through the view; handing in what they reported changes nothing; the Active point survives
- [ ] Unknown axis ids in a view fall out
- [ ] Page 'Zoom and pan' with screenshots; ADR-0047's keys statement holds
