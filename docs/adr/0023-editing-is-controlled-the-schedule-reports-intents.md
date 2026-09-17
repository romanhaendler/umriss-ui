# Editing is controlled: the schedule reports intents

Status: accepted
Date:   2026-09

The schedule draws the subtasks and transports it is given and changes none of
them. Every editing interaction — moving a subtask, stretching its main time,
changing a setup or teardown, putting it on another lane — runs as a drag with
a **Ghost** and ends in an **Intent**: a description of the change, reported
to the caller. The data moves only if the caller moves it. The ghost is
assessed like data while the drag is in flight, so an overlap or late
transport the drop would create is visible before the drop, not after it.

Dependent subtasks never move by themselves. The cascade — push every
successor whose transport no longer fits — ships as a pure function beside the
component, for the caller to run over its own data. It is arithmetic the
package can offer; it is not behaviour the package may have.

## Considered Options

**The schedule owns its state and edits it.** Rejected: the application is the
owner of scheduling data everywhere else — a chart receives `data`, a table
receives rows and hands back a **View** — and a second copy inside the
component is the copy that goes stale. Editing that commits locally and
notifies afterwards forces every caller to reconcile.

**Auto-ripple in the package**, the planning-tool default: dragging a subtask
drags its successors. Rejected because whether a successor may move is a plant
decision — a fixed shift, a booked crew, a frozen order — that a drawing
package cannot know. What it can know is the arithmetic, so the arithmetic is
what ships.

**Optimistic commit** — apply the change, let the caller veto. Rejected: a
veto after the fact needs an undo picture, and every disagreement between
package and application shows on screen as a flicker.

## Consequences

The editing API is a list of intent names. A caller that handles none has a
read-only schedule — that is a feature, not a degraded mode. Every future
editing capability is a new intent, never a new internal state.

Snapping is configurable and defaults to the tick raster; it shapes the ghost
and therefore the intent, never the stored data.
