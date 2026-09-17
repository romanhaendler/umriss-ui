# A turn that cannot be a transition

Status: accepted
Date:   2026-09

When a dock moves between a horizontal edge and a vertical one it changes
orientation, and that change is animated by measuring every tool's box before
and after the layout change, inverting the difference as a transform and
playing it back to zero. This is FLIP, it is thirty-odd lines of measurement
and Web Animations, and it sits in a library whose stated rule is that
components consume tokens and CSS does the rest. It looks like
over-engineering. It is the cheapest correct option.

A CSS transition cannot do it. `flex-direction` is a discrete property: there
is no halfway between `row` and `column`, so the strip relaid out in one frame
no matter what duration is declared on it. Animating the container's width and
height instead moves the box but not the tools inside it, which is the part the
eye is actually following.

The obvious rescue is `rotate(90deg)` on the strip. It is wrong in a way that
is worse than a jump: the glyphs rotate with it, so the dock spends the
animation lying on its side and rights itself at the end. A dock that falls
over is the precise opposite of what the orientation change was for.

The remaining alternative was a View Transition, which performs the same
before/after capture in the platform instead of in our code. It was rejected
for two reasons rather than one. It binds a component in a library to a
platform feature the consuming application does not control, and it takes away
the thing we specifically need: the container's shape, each tool's path and the
dock's move to the other edge have to run as one movement with one duration,
because two durations read as two events and this is one event. Owning the
animation is what makes that guarantee sayable.

Motion here is not decoration and does not fall under the library's suspicion
of it. Without the turn the dock teleports, and after a teleport the eye has to
find every tool again. With it, the eye follows them. That is a state change
being explained, which is the one thing motion in this library is for.

## Consequences

The animation must never be where the layout happens. The final position is the
one the browser computes from the new orientation; FLIP only shows the way
there. Under `prefers-reduced-motion` the whole routine is skipped and the dock
simply appears at the new place, and that snap has to be correct on its own —
which is also how it is tested.

Measuring forces a layout read between the two frames. It happens once per
resting-place change, and ADR-0013 caps those at three per drag, so the cost is
bounded by design rather than by hope.

Screenshot baselines photograph resting states only. A frame captured mid-turn
would be a picture of a transform that is on its way to zero, and pinning that
would make the baseline a test of timing.
