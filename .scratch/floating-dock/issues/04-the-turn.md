# 04 — The turn, as FLIP

Status: done

Spec: `.scratch/floating-dock/spec.md`
ADR: `docs/adr/0014-a-turn-that-cannot-be-a-transition.md`

## Scope

The orientation change when the dock moves between a lying place and a standing
one, and the travel when it moves between two places of the same orientation.

FLIP, in this order: measure every tool's box and the container's; set the new
place and let the browser lay it out; measure again; apply the inverted
difference as a `transform`; play it to zero with the Web Animations API.

One duration for everything that moves — container shape, each tool's slot, and
the dock's travel to the other edge — because two durations read as two events
and this is one. `--u-duration-medium`, `--u-ease-out`.

Glyphs stay upright. Nothing rotates.

Under `prefers-reduced-motion` the routine is skipped entirely: the dock is
simply at the new place. The animation must never be where the layout is
decided — the final position is the one the browser computed, and FLIP only
shows the way there.

A place change that arrives while an animation is running cancels it and starts
from the current visual state, so that three changes during one drag do not
queue into three sequential animations.

## Acceptance

- Bottom → right turns the strip upright with every glyph upright throughout.
- The end state is pixel-identical to what the same `place` renders with motion
  disabled. This is the test that keeps the animation out of the layout.
- Under `prefers-reduced-motion` no animation runs and the layout is still
  correct.
- Three place changes during one drag produce one continuous movement, not three
  queued ones.
- No `rotate()` anywhere in the component.
- The measurement happens once per place change, not per frame.

## Notes

Read ADR-0014 first. This ticket ships measurement code where a reader expects a
CSS transition, and the three rejected alternatives — transitioning
`flex-direction`, rotating the strip, and a View Transition — are all more
obvious than what is being asked for. The ADR is what stops the next person
"simplifying" it back into one of them.

The bounded cost of this is not incidental: ADR-0013 caps a drag at three place
changes, which is what makes a real animation affordable instead of a per-frame
relayout.
