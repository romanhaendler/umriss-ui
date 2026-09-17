# 09 — Vocabulary and documents

Status: done
Type: task

Blocked by: 02–08
Spec: `.scratch/schedule-refinement/spec.md` (user story 56, "Vocabulary", "Documents")

## Scope

- `CONTEXT.md`: **Grip** widened; **Now line**, **Place** added.
- Changelogs (schedule: Changed for wheel and selection), testing document, journal, README.

## Acceptance

- Lint and the document references hold.

## Comments

**Delivered.** `CONTEXT.md`: **Grip** widened to the part of a component a drag
takes hold of, with the dock's one and the schedule's two named at it; **Place**
and **Now line** added; **Ghost** now mentions the drag from outside. The
schedule's changelog leads with **Changed** (the wheel, the selection callback)
before the eight additions; core's unreleased entry names all nine wording
entries. `docs/testing.md`: the new unit subjects, the two feature rows, three
pure modules, the context menu's position in the browser - and a paragraph on a
picture moving because the page grew, which is the finding of ticket 07. The
schedule's README gained a "Reading and moving" section. `docs/journal.md` has
the delivery entry.

**Review follow-up** (two-axis review after 09):

- **Standards:** the exports `schedule-refinement` added were filed in place in
  `src/index.ts`; they now stand at its end with the note the rule asks for.
  `MINUTE` comes from charts instead of a literal in three places, the lane
  height's default from `DEFAULT_LANE_HEIGHT` instead of three copies, the
  tooltip's target from `SceneData` (it is derived from the data, so it is the
  data's to derive), the lanes' bottom from the view instead of a second
  derivation, and `SceneView.pan` compares two numbers instead of two strings.
  The misplaced banner in `sceneGestures.ts` sits where its members are.
- **Spec:** auto-pan now carries a drag from outside as well (a native drag
  stops sending events when it holds still, so the frame loop is what carries
  it); the tooltip is placed from its measured size and clamped into the plot,
  and stays hidden until it is placed; a pure scroll through the lanes no
  longer reports a span that did not change; `Schedule/07-tooltip` shows the
  default tooltip, and `Schedule/05-interactions` the reported selection.
  Escape during a drag from outside and auto-pan while dragging in are tested.
  Four deviations are recorded at the foot of the spec.
- **Baselines moved, named here:** `example-schedule--interactions` (the
  example shows the reported selection now) and `example-schedule--now-line`
  (the new tooltip example above it moves it to another scroll offset - the
  cause `docs/testing.md` records), both themes.
- **Left as it is:** the demo's stale-counter bug the standards review found in
  `Intent/04-drag-in` is fixed (one functional update); `scheduleOverlapWith`
  and `scheduleLateBy` stay beside `scheduleOverlap` and
  `scheduleLateTransport` - a label and a sentence are two texts, and a
  translator needs both.
