# 03 - Step line

Status: done
Type: task

Spec: `.scratch/charts-essentials/spec.md` - row 03 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `Line step?: boolean` → `LineSeriesConfig.step` → `LineDrawItem.step`;
  compared in `ownFieldsEqual`.
- `drawLine`: with `step` each point first goes horizontally to the next x at
  the held y, then vertically. A gap ends the hold at the gap's x and lifts
  the pen - the same reading as a state band's segment, which runs to the next
  point's x whatever that point holds. Still one path, one stroke.
- Hit: a step line takes `segmentIndex` (the sample at or before the pointer)
  instead of `nearestIndex`; crosshair and marker stay on that sample.
- Tests first: `draw.test.ts` (the path of a step line with a gap),
  `sceneFrame.jsdom.test.ts` (the hit stays at the held sample).
- Example `Line/03-step.tsx` (a furnace set point logged on change, a recipe
  change as a gap, the temperature following), `setPoints` in `demo/data.ts`;
  2 new screenshots. One renewed: `limitline--limits-and-state` dark, which
  failed four runs in a row after the Line page grew above it - text and edge
  drift only in the diff (docs/testing.md, "A picture can move because the
  page grew").
