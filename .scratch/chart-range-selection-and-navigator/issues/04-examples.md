# 04 — Examples

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02, 03
Spec: decisions R5, R7, R12; user stories 12-14, 18, 24

## What to build

Two examples, each beginning with the chart, rows written out as an API would
deliver them (the rule of ADR-0052's examples):

- **"Mark a range"** on the Zoom and pan page
  (`packages/charts/demo/examples/Zoom-and-pan/`): a zoomable time axis over a
  course, `onRange` set, the range shown below the chart in the example's own
  `useState`, and a button that hands it back as `initialView` - the one line
  that zooms into it. The lead names Alt with a drag and Space.
- **"Mark a range of bars"** on the Bar page: a category axis that does not
  zoom, a plain drag, `from` and `to` shown as the category names.

Both run as copied (the own-data check). The prop tables' "Shown in" rows and
`demo/unshown.json` follow from the new `ChartOptions` entry; the Zoom and pan
page's Keyboard section in `demo/outline.ts` gains Space and Alt with a drag.

## Acceptance

- [ ] Both examples run as copied; the own-data check passes.
- [ ] The completeness guard over the props (`shownIn.test.ts`) passes with
      `onRange` shown and no stale `unshown.json` entry.
- [ ] Screenshot baselines for both, looked at before they are accepted.
- [ ] The Keyboard section of the Zoom and pan page names Space and Alt-drag.
- [ ] The demo smoke test and the accessibility check pass.
