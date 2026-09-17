# 01 — A refusal one can see

Status: ready-for-agent
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
