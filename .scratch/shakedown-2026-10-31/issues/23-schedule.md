# 23: Schedule, with a lane change by keyboard

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decisions 5 and 7. Sources: README 43; earlier-runs-open schedule.md 3, 5, 7, 8, 9,
P10-11, zoom 2, settle 1, settle 2c.

- [ ] A `domain` of Dates or strings, or `subtasks` that are not an array, warns in DEV and renders without crashing the tree.
- [ ] The tooltip gives date and duration, not times only (year boundary, leap day, the doubled hour).
- [ ] A cut lane name shows in full on hover and focus.
- [ ] Without a `domain`, the first window shows the earliest subtasks, not the empty middle of a wide extent (`view.ts:41-58`); `0` (fit) likewise.
- [ ] A drop reports the subtask's current id, not the one it had when the drag began (`sceneGestures.ts:834`).
- [ ] A dependency without lag is not read as "0 min".
- [ ] On a phone the lane gutter is capped narrower than 40 % (decision 5), the names still readable.
- [ ] Pinch zoom of the page works over the plot.
- [ ] Keyboard: a focused subtask moves to the lane above/below (e.g. Alt+ArrowUp/Down), reported as an intent like a drag (ADR-0023), announced; listed in the keyboard help.
- [ ] `pnpm check schedule`; looked at as a user with the keyboard, 375 px.

## Comments
