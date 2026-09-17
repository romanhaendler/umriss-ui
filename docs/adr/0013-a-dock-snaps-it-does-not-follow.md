# A dock snaps, it does not follow

Status: accepted
Date:   2026-09

Dragging a dock does not move it. The grip follows the pointer, but the dock
itself stays at one of its four resting places and jumps to another the moment
the pointer crosses into that place's zone. There is no state in which the dock
sits at a coordinate. A reader who finds the zone arithmetic and no code that
writes a position will assume the direct-manipulation part is missing; it is
not missing, it was refused.

The reason is that a resting place is a name and not a coordinate, and a
component that lets the dock hang freely during the drag has quietly made it a
coordinate for the duration. Everything that follows from "always at a named
place" then has to be paid for at the end of the gesture instead of never:
what the dock does when the window resizes mid-drag, what happens when the
pointer leaves the host area, what the state is when the drag is cancelled with
Escape, what "half-placed" renders as. Each of those is answerable, and each
answer is a special case that exists only because the dock was allowed to be
somewhere it is not allowed to rest.

The second reason is that the keyboard has to move this thing too, and the
keyboard cannot express direct manipulation. Four arrow keys on the grip are
four resting places. If the pointer worked on coordinates and the keyboard on
names, the component would carry two models of where a dock can be, and the
one with fewer states would be the one nobody tested. Snapping collapses them
into one: both gestures choose a name, and they differ only in how the name is
picked.

Direct manipulation was the alternative, and its case is real — it is what the
hand expects, and the orientation change at the end of it is a small reward.
It was rejected because in the snapping model that same orientation change
happens *during* the gesture, where it stops being a reward and becomes the
instrument: the turn is how the dock tells you which place you have chosen,
while you can still change your mind.

## Consequences

The dock can feel inert if nothing under the hand moves, which is why the grip
tracks the pointer even though the dock does not. That is a deliberate
inconsistency between the part you hold and the thing you are moving, and it is
the price of the model. If it reads as broken rather than as resistance, the fix
is to give the grip more travel or a rubber-band limit — not to let the dock
follow.

A drag produces at most three transitions, however long it lasts and however far
the pointer wanders. Motion work is therefore bounded and can be a real
animation rather than a per-frame layout, which is what makes ADR-0014
affordable.

Cancelling a drag is not a special case, because there is nothing to restore
beyond a name. Escape puts the name back; nothing else moved.
