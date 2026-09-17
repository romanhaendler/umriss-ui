# 05 — A place that does not fit says so

Status: done

Spec: `.scratch/floating-dock/spec.md`

## Scope

Nine tools lying flat are roughly 360 × 44; standing they are 44 × 360. On a
wide, short host the first fits and the second does not, so the turn can take a
valid dock into an invalid state.

Using the fit predicate from ticket 01: a place the dock does not fit into is
not offered. During a drag, entering that zone does not move the dock — and the
zone shows that it is declining, so the refusal is a statement rather than an
outage. On the keyboard, the arrow toward that place does not move the dock and
does not silently swallow the keystroke.

If the host is resized such that the dock's *current* place no longer fits, the
dock moves to the nearest place that does, and reports it through
`onPlaceChange` like any other change. It does not stay somewhere it does not
fit, and it does not overflow its host.

The refusal's appearance is a small thing and should look like the library:
the material and the edge, not a warning colour. Nothing here is an error — a
wide chart with no room for an upright dock is not a mistake anybody made.

## Acceptance

- On a host too short for the upright form, dragging into the left or right zone
  leaves the dock where it was, and the decline is visible while the pointer is
  in that zone.
- The same place is unreachable by its arrow key, and pressing it is not silent.
- Resizing the host so the current place stops fitting moves the dock and fires
  `onPlaceChange` once.
- The dock never renders outside its host's rectangle.
- No overflow menu, no scrolling strip, no shrinking tools.

## Notes

The rejected alternative was an overflow menu, and it is rejected on structure
rather than effort: it brings an anchor, an open state, a dismissal policy and a
keyboard chain, which means `Popover` and `Menu`, and the dock would then carry
two anatomies. That is the same refusal the command palette's header comment
makes about being a parameterised `Modal`.

Silence was the other alternative and is worse than refusal. A zone that does
nothing and says nothing reads as a broken control, and this component's whole
claim is that it looks considered.
