# 01 — The resting places, as pure logic

Status: done

Spec: `.scratch/floating-dock/spec.md`

## Scope

`packages/ui/src/components/Dock/platz.ts`. No React, no DOM, no imports from
the component. Three questions and nothing else:

1. **Which place does this pointer position choose?** Given a point and the host
   rectangle, return one of `"oben" | "rechts" | "unten" | "links"`. The
   rectangle is divided into four zones, one per edge; the diagonals are the
   boundaries, so every point inside the rectangle belongs to exactly one zone
   and a point on a diagonal resolves deterministically rather than by accident.
   A point outside the rectangle still yields a place — the nearest edge —
   because a pointer that leaves the host mid-drag must not produce "no place".

2. **Does this place fit?** Given a place, the number of tools and the host
   rectangle, say whether the dock's extent in that orientation fits inside the
   host with its margin. The strip's extent is a function of the tool count, the
   tool size, the grip and the gaps; those measurements are parameters of the
   function, not constants inside it, so the caller passes what the CSS actually
   produced.

3. **Which place does an arrow key choose?** `ArrowUp` → `"oben"`, `ArrowRight`
   → `"rechts"`, `ArrowDown` → `"unten"`, `ArrowLeft` → `"links"`. Absolute, not
   relative to where the dock currently is.

Also here: `istStehend(platz)` — whether a place stands the dock upright — since
both the component and the turn need it and neither should re-derive it.

## Acceptance

- The module imports nothing from React or the DOM and is testable in `jsdom`
  without rendering.
- Unit tests cover: each zone's centre; each diagonal boundary; the four
  corners of the rectangle; points outside the rectangle on each side; the exact
  tool count at which a place stops fitting, and one either side of it; all four
  arrow mappings.
- Expected values in the tests are worked out by hand. No test calls the
  implementation to produce the value it then asserts.
- Every exported function is total: no input inside or outside the rectangle
  produces `undefined`.

## Notes

This exists as a separate module for the reason `TESTS.md` gives for pure logic:
it is the part with real arithmetic in it, and testing arithmetic through a
rendered component and a synthetic pointer is how a boundary bug survives.

Do this first. Tickets 03 and 05 are both written against these three functions,
and neither should carry a private copy of the zone maths.
