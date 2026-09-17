# 03 — The grip: it snaps, it does not follow

Status: done

Spec: `.scratch/floating-dock/spec.md`
ADR: `docs/adr/0013-a-dock-snaps-it-does-not-follow.md`

## Scope

Moving the dock, by pointer and by keyboard.

**Pointer.** `setPointerCapture` on the grip, as `Table.tsx:156` does for column
resize. On every move, ask `platz.ts` which zone the pointer is in; when the
answer changes, change the place. The dock is never rendered at a coordinate —
read ADR-0013 before writing this, because the code that is *not* here is the
point of it.

The grip itself tracks the pointer within a bounded travel, so the hand has
something that follows while the dock stays at named places. That travel is a
token, and it is the knob to turn if the gesture reads as inert.

`pointerup` ends the drag at whatever place is current. Escape during the drag
restores the place the drag started from and releases capture. Losing pointer
capture is treated as `pointerup`, not as a cancel.

**Keyboard.** The grip is a single tab stop, outside the tools' roving
tabindex, with an accessible name saying what it does. The four arrows map to
the four places absolutely, via `platz.ts`. No key moves the dock by a distance.

Both gestures go through the same "set the place" path, controlled or
uncontrolled, and both fire `onPlaceChange`.

## Acceptance

- Dragging from the bottom edge into the right zone leaves the dock at
  `"rechts"`; dragging back leaves it at `"unten"`. The dock is at a named place
  in every frame.
- The grip visibly follows the pointer; the dock does not.
- Escape mid-drag restores the starting place and fires no `onPlaceChange` for
  the round trip beyond what actually changed.
- A pointer that leaves the host area mid-drag still yields a place and never
  leaves the dock unplaced.
- Tab reaches the grip once; the four arrows on it reach all four places from
  any starting place.
- With `place` controlled, neither gesture moves the dock on its own — both
  report and wait.

## Notes

There is no shared drag module with `Table`. The table maps a delta onto a
continuous width; this maps a position onto one of four names. What they share
is `setPointerCapture`, which is a platform call and not a pattern. If a third
drag site appears and it also snaps to names, that is the moment to extract —
not this one.

The grip's tracking is a deliberate inconsistency: the part you hold moves, the
thing you are moving does not. ADR-0013 names it and names the fix if it reads
wrong. The fix is not to let the dock follow.
