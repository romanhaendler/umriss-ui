# 01 — A refusal one can see

Status: done
Type: task

Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 12–19, "The refusal")

## Scope

- `canMoveTo` asked once per real lane when an edit with `lane` begins and at the first `dragOver` of a placing; the answer held for the gesture.
- Refused lanes drawn back and finely hatched; `cursor: not-allowed` and `dropEffect = "none"` over them; the dashed tether from ghost to pointer while `refused`.
- A refused `lane` no longer discards `move`: the intents of the standing ghost are reported. `drop()` of a placing re-asks `canMoveTo`.
- `refusedLanes` in the snapshot's ghost summary. No warning colour anywhere; the reason stays at `.refusal`.

## Acceptance

- Unit test of the refused lanes of a gesture, written first.
- `features-editing`: lanes marked at drag start, cursor, tether, `move` reported after a refused lane change, the same for a placing including `dropEffect`.
- The example `where-it-may-go` gets its pictures renewed (count stated); `CONTEXT.md` **Refusal** widened if the marks need a sentence.

## Comments

### Delivery

- `src/refusal.ts` is the new pure module: `refusedLanes(lanes, subtask, home,
  canMoveTo)`. Written test-first (`tests-unit/refusal.test.ts`, 7 tests) -
  which lanes come back AND how often the rule was asked to say so, because
  "asked once per lane" is half the point of the module.
- The set is carried by the gesture itself (`sceneGestures.ts`), so it cannot
  outlive it. Asked when a `move` takes hold, and at the first `dragOver` of a
  placing.
- Drawing: `drawRefusedLanes` washes the lane with the surface and hatches it
  finely in the muted tone; `drawTether` draws the 1 px dashed line from the
  ghost's nearest edge to the pointer, only while `refused`. `hatch` gained a
  step and a line width - the bar still calls it with the old two until 02
  takes the hatch off the bars.
- The headers say it too: `data-refused` on `[data-lane]`, `.header[data-refused]`
  drawn back. That is what user story 19 asked for in the DOM, beside
  `refusedLanes` in the ghost summary.
- `pointerUp` no longer discards everything: it re-asks and, where the lane is
  now refused, drops the **lane** intent and keeps the **move**. `drop()` of a
  placing re-asks as well.

### The one decision that went back to Roman

The spec asks for `dropEffect = "none"` over a refused lane. Verified in the
browser: the platform then delivers no `drop` event at all, so a release over a
refused lane would place nothing - while the ghost still stood on a lane that
allowed it. That breaks the standing promise of `schedule-refinement` 07 ("the
ghost is the promise of where a drop lands"), which a test names.

Roman's decision: **the ghost stays the promise.** So the drop effect follows
the GHOST and not the pointer - `"none"` exactly when no ghost stands anywhere
and a release would place nothing, `"copy"` otherwise. The refusal is said in
the three channels that cost the gesture nothing: the marked lanes, the cursor
and the tether.

### Tests

- Unit: 7 new, `tests-unit/refusal.test.ts`. Package: 15 files, 138 green.
- `tests-visual/pixels.ts` is new - `painted` and `paintedShare` count paint in
  a rectangle of a plot's canvas, inside the browser. Built here for the
  tether; 02, 03 and 09 need it too.
- `features-editing`: 5 new tests - lanes marked at drag start (attribute AND
  canvas), the cursor over and off a refused lane, the tether measured in the
  strip between the ghost and the refused lane's boundary (a strip nothing else
  paints), `move` reported after a refused lane, and the placing. 25 green.
- All schedule suites: 165 passed, 83 skipped (dark skips the behaviour tests).

### Pictures

**None renewed.** 2 baselines exist for `where-it-may-go`, 68 for the package;
all 68 read and all 68 unchanged. That is right and not an oversight: every
mark this ticket adds lives only while a drag runs, and the baselines are taken
at rest.

`CONTEXT.md` **Refusal** widened: the marks before the pointer arrives, and the
sentence that a refusal costs only what it refuses.
