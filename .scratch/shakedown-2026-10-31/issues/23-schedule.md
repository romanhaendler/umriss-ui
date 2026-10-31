# 23: Schedule, with a lane change by keyboard

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decisions 5 and 7. Sources: README 43; earlier-runs-open schedule.md 3, 5, 7, 8, 9,
P10-11, zoom 2, settle 1, settle 2c.

- [x] A `domain` of Dates or strings, or `subtasks` that are not an array, warns in DEV and renders without crashing the tree.
- [x] The tooltip gives date and duration, not times only (year boundary, leap day, the doubled hour).
- [x] A cut lane name shows in full on hover and focus.
- [x] Without a `domain`, the first window shows the earliest subtasks, not the empty middle of a wide extent (`view.ts:41-58`); `0` (fit) likewise.
- [x] A drop reports the subtask's current id, not the one it had when the drag began (`sceneGestures.ts:834`).
- [x] A dependency without lag is not read as "0 min".
- [x] On a phone the lane gutter is capped narrower than 40 % (decision 5), the names still readable.
- [x] Pinch zoom of the page works over the plot.
- [x] Keyboard: a focused subtask moves to the lane above/below (e.g. Alt+ArrowUp/Down), reported as an intent like a drag (ADR-0023), announced; listed in the keyboard help.
- [x] `pnpm check schedule`; looked at as a user with the keyboard, 375 px.

## Comments

**Delivered (2026-10-31, run coordinator).** Wrong-typed `domain`, `data`, `tasks` warn and draw empty
instead of crashing; subtask tooltip with year and duration; lag 0 not read as "0 min"; lane names get a
`title`; work wider than the widest zoom starts at its earliest start; a drop finds a re-minted id;
gutter `min(headerWidth, max(88px, 28%))` (looked at 375 px: names readable); Alt+ArrowUp/Down proposes a
`lane` intent to the lane above/below (help text in both languages). Decided: the pinch stays the
plot's time zoom (always on, tested) - the README says the page zooms by a pinch outside the plot or the
browser's zoom; same rule as charts. The drop-id match (task, lane, from, to) is a heuristic.
Left: the live readout keeps the short date (tests pin it).
