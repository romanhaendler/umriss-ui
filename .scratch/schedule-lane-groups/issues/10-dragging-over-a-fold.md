# 10 — Dragging over a fold

Status: done
Type: task

Blocked by: 01, 09
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 33, 34)

## Scope

- A miniature is no drop target; 600 ms of rest over one opens it for the gesture through a transient open set in the scene; the set is dropped when the gesture ends, by drop, Escape or leaving.
- The caller's list is untouched and `onCollapsedGroupsChange` is not called. The same for a placing.
- The refused lanes of 01 are laid out again when rows change mid-gesture.

## Acceptance

- Unit: the transient set. Browser: rest opens, drop lands on a lane inside and reports `lane` with the real lane id, the group is folded again afterwards, no state callback fired; Escape closes as well.
- The timer is given to the scene like `now`, so the test does not wait.

## Comments

### Delivery

- **A miniature is no drop target.** `SceneView.dropLaneIdAt` answers only for
  a row that really is a lane; the gestures use it wherever they ask "where
  would this land". Hover, the tooltip and selection go on reading a strip
  through `laneIdAt` - they cost nothing if they are a pixel out, and a DROP
  aimed at three pixels of a machine's whole day would be a guess.
- **Resting opens it for the gesture.** The timer starts when the pointer
  arrives over a folded group and is thrown away when it leaves, so crossing
  one on the way somewhere else does not open it. What opens is
  `SceneView.openForGesture`, a set the scene holds; `effectiveCollapsed` in
  `rows.ts` takes the caller's list and that set and gives back what is folded
  for the DRAWING.
- **The caller's list is never touched and nothing is reported.** The
  application did not fold anything - a planner reached into a drawer and let
  it shut. Every end of a gesture lets go: the drop, `pointerUp`, Escape,
  a pointer cancel and a placing that leaves the plot.
- **The refused lanes of 01 needed nothing.** The held set is lane ids, and the
  lanes do not change when the rows do; `drawRefusedLanes` reads slots on every
  frame, so the marks follow the new layout by themselves. Worth saying because
  it was a real risk: had the set held positions, springing open would have put
  every mark a row out.

### One thing done differently from the ticket

> The timer is given to the scene like `now`, so the test does not wait.

Not done. The delay is a constant (`SPRING_OPEN_AFTER`, 600 ms) and the browser
tests wait for it with `expect.poll`. Adding a prop for it would put a
600-millisecond animation delay into the public surface of `<Schedule>` to save
four tests about two seconds each, and no user story asks for one. If the wait
becomes a cost, `page.clock.install()` fast-forwards timers without any API
changing; that is the cheaper door and it is still open.

### Tests

- **Unit, 4**: the caller's set goes in unchanged and comes out unchanged; a
  set with nothing held open is given back as-is; a group that was not folded
  anyway changes nothing; and the layout with a group held open is the layout
  of an open group, with real lanes to drop on.
- **Browser, 4**: resting opens the hall and its lanes appear; the drop lands
  on the real lane inside and the hall folds again by itself, with the
  example's own state - which is `onCollapsedGroupsChange` straight into
  `useState` - unchanged; Escape closes it too; and crossing the group without
  resting leaves it shut.
- All schedule suites: **293 passed**, 143 skipped. Unit: 196.

### Pictures

**None renewed.** The example of 09 gained intents and a readout, so its two
baselines were re-rendered; nothing else moved.
