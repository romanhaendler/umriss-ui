# 04 - Cursor sync

Status: done
Type: task

Spec: `.scratch/charts-long-series/spec.md` - row 04 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `Chart syncId?: string`. A module-level map in `scene.ts` holds the scenes
  per id. On a hit the scene shares `{ axisId, value }` - the crosshair's pixel
  read back on the primary hit's x axis, so a snapped point and a band under
  the pointer both travel -, and `null` on leave; only a change is sent. A
  receiving scene keeps it and redraws its overlay layer only: a crosshair on
  its x axis of that id or its first, no markers, no tooltip. Its own hover
  wins. The Chart's effect leaves the group on unmount or a new id.
- `drawOverlayLayer` takes `syncPx` beside `hover`.
- Interaction tests (2): hovering the middle of three charts puts a crosshair
  on all three overlays in one page column (±1.5 px) with one visible tooltip,
  and leaving clears all three; a zoom in the top chart relabels the bottom
  one through the shared controlled domain.
- Example `Chart/04-cursor-sync.tsx`: kiln, flue gas and gas flow, three
  charts of 140 px, one `syncId`, one controlled domain, `domain="visible"`,
  `tickCount={4}` so that every label has three figures and the plots begin in
  one column. `data.ts`: `kiln` gained `flue` (derived from the gas reading,
  no extra random draw, so the other kiln pictures stay) and a gas reading
  never below 0. 2 new screenshots.
- Screenshots of the kiln examples fail now and then with the suite's known
  drift (the diffs are antialiasing and tick text, on the left half); not
  renewed.
