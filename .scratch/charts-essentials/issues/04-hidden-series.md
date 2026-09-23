# 04 - Hidden series and the toggling legend

Status: done
Type: task

Spec: `.scratch/charts-essentials/spec.md` - row 04 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `SeriesBase.hidden?: boolean`; the prop on `Line`, `Area`, `Bar`,
  `Scatter`, `StateBand`, `Matrix`. Compared in `updateSeries`.
- Scene: a hidden series is materialised as before (showing it again costs
  nothing) but gives its extent to no axis (`axisExtent` bindings), is left out
  of `drawItems` - and of the bar groups, so it leaves no empty slot - and of
  the hit test. It keeps its palette place.
- `LegendItem.hidden`; a state entry shared by several bands is hidden only
  when all of them are.
- `Legend onToggle?: (name: string) => void`: with it each entry is a
  `<button type="button" aria-pressed>` calling it with the entry's name;
  without it the entries stay spans. `data-hidden` draws an entry back
  (struck-through name, chip at 0.3 opacity - chosen over dimming the text so
  the text keeps its contrast). Focus ring `var(--u-focus-ring, …)`; own-base
  and accessibility suites green.
- Deviation: not on `ControlChart` - it is a composition, not a series; its
  line and violations carry their own names.
- Tests first: 3 in `scene.test.ts`, 1 in `sceneFrame.jsdom.test.ts`, new
  `legendToggle.jsdom.test.tsx` (3).
- Example `Tooltip/05-toggling-legend.tsx` (furnaces and set point, the set
  point hidden at the start); 2 new screenshots, none renewed - the tooltip
  pages' other pictures fail and pass at random in dark, drift only.
