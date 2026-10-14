# A dashboard a user arranges is built: a sequence of widgets at named sizes on columns that never change in number

Status: accepted, supersedes ADR-0060 in one point (a dashboard a user arranges)
Date:   2026-10

ADR-0060 put a dashboard its reader arranges under "never": dragging, resizing,
collision, responsive rules and a stored layout were a product of their own,
and an application wanting one was sent to a layout library around umriss
components. Two things turned that around. The product of its own is the
argument for a package of its own, not against building it. And the way out
ADR-0060 offered does not give its reader what a dashboard is used for: the
leading grid libraries store coordinates per breakpoint, so an arrangement
comes out differently on another screen and does not come back when the window
widens; they cannot move a widget by keyboard in October 2026; and they know
nothing of density, tokens or wording. The research behind this decision is
`docs/research/user-dashboards-2026-10/`, its synthesis `report.md`; two
throwaway prototypes are in `.scratch/dashboard/`.

**`@umriss-ui/dashboard` shows widgets that the reader arranges. The arrangement
is a sequence, each widget at one of the sizes its type declares, packed in
order on a grid of twelve columns that never change in number; below the width
at which a column is too narrow to read, the same sequence is a list. The
reader edits it in a mode, as a draft that is kept or discarded as a whole.
The arrangement is the dashboard's View: the application keeps it and supplies
the one a reader starts from.**

## What follows

- **A sequence, never coordinates.** One stored arrangement is right at every
  width, there is no collision to resolve, the list form is the sequence
  itself, and the keyboard has "earlier" and "later". Both leading libraries
  added a sequence mode after years of requests to rearrange "like iOS home
  screen" icons. The phones are no precedent for it: since iOS 18 they place
  freely, because a phone never meets another width.
- **Twelve columns, fixed, under a maximum width.** A widget keeps its
  neighbours on every screen, which is what a reader remembers. Twelve gives
  halves, thirds, quarters and sixths; the reader never sees the number,
  because they choose sizes by name. The maximum width is a token.
- **Drawn as stored.** A widget that does not fit its row starts the next one,
  and the room it leaves stays free until the reader fills it. Dense packing
  moves widgets nobody touched and puts the drawn order out of step with the
  reading order. A heading across the full width is an ordinary widget type
  and the reader's means of structure.
- **Named sizes.** The library has one closed vocabulary of size names; each
  widget type declares the ones it offers, with the span each takes, and a
  default. A larger size shows more of the same thing, and a widget's content
  is told its size. The height follows the size, never the content.
- **Editing is a mode and a draft.** Outside the mode the dashboard stands
  still and its widgets work. In it, every change (order, size, options,
  adding, removing, reset to the default) is a step that can be undone and
  redone; "Done" reports the whole arrangement once, "Cancel" restores it, and
  the application is told while a draft is open so it can warn before leaving.
- **Every action without a drag.** Each widget's head carries one menu: move to
  the start, earlier, later, to the end, the sizes, its options, remove. The
  head is the grip for a pointer and takes the arrow keys; every change is
  announced. This, not the drag, is what makes the dashboard usable by
  keyboard, screen reader and touch.
- **The library draws the whole of it.** The editing bar and the catalogue
  ship with their wording; the hook hands out the same actions for an
  application that places them itself.
- **Declared like the table and the charts.** A hook takes the default, the
  reader's arrangement and `onViewChange`, and returns `Dashboard` and the
  part a widget type is declared with (ADR-0017, ADR-0048). A widget type is
  JSX: its sizes, its default options, its content for a size, and the form
  for its options, which the dashboard opens from the widget's menu.
- **The application governs.** It keeps the arrangement, supplies the default
  per role, decides whether the reader may edit at all, and holds as many
  dashboards as it wants. Reading a kept arrangement is lenient: a widget of
  a type that is gone falls out, a size its type no longer offers falls back
  to the type's default. A widget's frame outlives its content, so a widget
  that fails can still be removed.
- **Depends on `@umriss-ui/core` only**, and on nothing foreign. What stands in
  a widget - a chart, a table, a calculation - is the application's.

## Not yet, and never

- *Not yet:* sections that wrap as a whole (the arrangement is an object, so
  a level of groups can join it without breaking what was kept); dragging from
  the catalogue to a chosen place; a height that follows the content in the
  list form; hiding a widget that has nothing to show; locking one widget.
- *Never:* stacks of widgets that share one place. They hide all but one value
  at a time, as the carousel does (ADR-0032).

## Considered Options

- **Coordinates with a layout per breakpoint**, the leading libraries' model.
  The arrangement is different on every screen and the derived layouts drift
  from the one the reader made.
- **Columns that follow the width.** Every width wraps the sequence
  differently and moves what stands beside what; the prototype measured 4 of
  15 neighbours kept at 1920 px.
- **Sections as the unit that wraps**, Home Assistant's answer. It uses a wide
  monitor better and is the likely next step, which is why the format leaves
  room for it; it brings a second level to arrange and its own gaps.
- **Changes taking effect at once**, as on the phones. Without an undo per
  step, a mistake after ten good moves costs eleven, and the application would
  write once per move.
- **A layout library around umriss components**, ADR-0060's way out. See above.

## Consequences

- A seventh package; CLAUDE.md and `docs/README.md` name it once it exists.
- ADR-0060 keeps its other two points: validation is never, time zones not yet.
- The things the research could not settle - making room while dragging or
  only marking the place, what up and down mean on the keyboard, whether free
  room reads as a fault - are settled by the first readers who use it, not by
  another document.
