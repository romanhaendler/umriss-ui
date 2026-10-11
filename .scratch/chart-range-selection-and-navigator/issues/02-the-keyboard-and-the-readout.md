# 02 — The keyboard and the readout

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01
Spec: decisions R7, R10, R19-R21; user stories 18-22

## What to build

A keyboard reaches what the pointer reaches (ADR-0030). On a chart with a
`<Tooltip>` and an `onRange`, Space sets the start at the Active point, the
walk moves it, Space sets the end and `onRange` is called with the Active
point's axis and the two x values, the earlier first. Escape cancels a start
and does not clear the Active point; a second Escape clears it, as today.
Focus leaving the plot cancels. Space twice on one point reports
`from === to`. Shift+Space, and Space with Ctrl, Alt or Cmd, are left alone,
as is every key where `onRange` is not given.

The polite live region says the start and the range, the values in the axis'
own format (`xLabel`, as `visibleRange` does): "Range from {x} started." and
"Range from {a} to {b}." Cancelling says nothing. The summary names the key
(`rangeHelp`) only where `onRange` is given and a tooltip stands, as
`selectHelp` does. Three new required keys in `ChartsWording`, English default
and German (`src/wording/index.ts`, `de.ts`): `rangeStarted`, `rangeMade`,
`rangeHelp`.

Without a `<Tooltip>` the pointer works and the keyboard has no Active point:
the development build warns once (`warnOnce`, as `onSelect` does in
`useChart.tsx`).

Keys live in `scene.key`, which Enter, Escape and `zoomKey` already share; the
order there matters (Escape tests `hover`).

## Acceptance

- [ ] Mounted: Space, walk, Space reports once; the earlier end first; Space
      twice on one point gives `from === to`; Escape cancels the start and the
      Active point stays, the next Escape clears it; blur cancels.
- [ ] Mounted: the live region reads the start and the range in the axis'
      format, and nothing on a cancel; German wording is used under the German
      wording.
- [ ] Mounted: the summary names the key only with both `onRange` and a
      tooltip; no `onRange`, Space does what it did (nothing); Shift+Space and
      modified Space are not taken.
- [ ] Mounted: `onRange` with no tooltip warns once in development and is
      silent in production.
- [ ] The wording table on the Language page lists the three keys (the guard
      over `ChartsWording` stops at a key without a row).
- [ ] Typecheck, the charts' unit tests and the demo smoke test pass.
