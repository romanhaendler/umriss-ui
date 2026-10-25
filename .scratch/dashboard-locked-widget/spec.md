# A locked widget: it moves with the others, and nothing else changes it

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Calculation, dashboard and operator-screen wishes"
(`.scratch/after-shakedown/issues/24-calculation-dashboard-and-operator-screen-wishes.md`; its Answer holds
every decision below that is not marked *(agent)*: the lock is option (a), set by the application per widget);
findings `.scratch/shakedown/dashboard.md`, the wish "Lock a widget" ("gave up"); ADR-0064.

## Problem Statement

An application cannot keep a widget on a reader's dashboard. A mandatory widget, such as the safety figure a
plant must show on every start screen or the summary a role is measured by, can be removed in the editing
mode like any other. It can also be shrunk to a size that hides what matters, or have its options changed to
show something else.

The only way out today is to put a removed widget back after "Done", which the reader sees as the dashboard
undoing their change. The other way, `allowEdit: false`, locks the whole dashboard and takes the arrangement
away from the reader altogether. ADR-0064 lists "locking one widget" under "not yet", and its only reason was
the order of work.

## Solution

The application marks a widget of a view as locked. The reader can never set or clear the mark.

- **A locked widget cannot be removed, resized or have its options changed.**
- **It moves with the others.** It is a place in the sequence like any other: "earlier", "later", "to the
  start", "to the end", the arrow keys and a drag move it, and it shifts when another widget is moved
  before it. Keeping its place while the others move past it was not taken. In a sequence a place is "after
  the one before", and a widget that held its place would make "earlier" skip it. The packing would move it
  anyway at another width.
- **The editing mode says so.** Its head is named and marked as locked, and its menu offers the moves and a
  line saying why the rest is missing.
- **The lock lives in the view.** It is stored with the arrangement and comes back with it. "Reset" steps to
  the application's default and its locks. An application that locks a widget in arrangements readers
  already kept sets the mark before it hands the kept view over; an example shows the few lines.
- **ADR-0064 is amended.** Locking leaves "not yet", and the amendment says what a lock promises.

## User Stories

1. As an application developer, I want to mark a widget in the default view as locked, so that every reader
   keeps it on their dashboard.
2. As an application developer, I want a locked widget to keep its size, so that a reader cannot shrink a
   figure until its sentence is cut.
3. As an application developer, I want a locked widget to keep its options, so that the safety figure keeps
   showing the safety figure.
4. As an application developer, I want the reader to keep moving a locked widget, so that the reader still
   arranges their own dashboard around what is mandatory.
5. As an application developer, I want no action of the reader's to set or clear a lock, so that the lock is
   the application's word.
6. As an application developer, I want a lock to come back in what `onViewChange` reports, so that I store it
   with the arrangement and get it back through `initialView`.
7. As an application developer, I want an example that puts a mandatory widget, locked, into an arrangement
   a reader kept before I locked it, so that a lock I add in an update reaches every reader.
8. As an application developer, I want a stored value other than `true` to read as not locked, so that a
   malformed value never locks a widget by accident.
9. As an application developer, I want `setView` to set any arrangement, locked widgets included, so that
   the application's own actions are never stopped by a lock.
10. As a reader arranging the dashboard, I want to see which widgets are locked, so that I do not look for a
    "Remove" that is not there.
11. As a reader, I want the menu of a locked widget to say why it has no sizes, options or "Remove", so that
    a missing entry reads as a decision, not as a fault.
12. As a screen reader user, I want a locked widget's head to be named as locked, so that I learn it on the
    head before I open its menu.
13. As a keyboard user, I want the arrow keys, Home and End to move a locked widget as they move any other,
    so that the lock costs me nothing I need.
14. As a reader using a pointer, I want to drag a locked widget by its head, so that the grip works the same
    on every widget.
15. As a reader, I want "Reset" to bring back the application's default with its locks, so that "Reset"
    means what it says.
16. As a reader outside the editing mode, I want a locked widget to look like every other, so that the lock
    matters only while I arrange.
17. As a German reader, I want the lock's words in German, so that the mode reads in one language.
18. As the maintainer, I want the rule enforced where every change of a draft goes through, so that a later
    path, a shortcut or an action of the hook, cannot remove a locked widget either.
19. As the maintainer, I want ADR-0064 to say what a lock promises and why it does not keep its place, so
    that "lock (b)" is answered by the record.

## Implementation Decisions

- **The mark.** `DashboardWidget` gets `locked?: boolean`, documented as set by the application. The reader
  can move the widget but cannot resize it, change its options or remove it, and the dashboard never sets
  or clears the mark.
  - *(agent)*: only `true` locks. Any other stored value reads as not locked, with no reading step of its
    own.
  - The mark is kept through every edit and reported with the rest of the arrangement.
- **Enforced at the edits.** The changes a draft applies already leave a view unchanged when they change
  nothing, and a change that changes nothing is no step. *(agent)*: removing, resizing and setting the
  options of a locked widget are such changes. So every path that goes through the draft is refused in one
  place, and no undo step is left behind. Moving is not refused.
  - `setView` and "Reset" are the application's and are never refused.
  - The catalogue never adds a locked widget.
- **The menu.** *(agent)*: a locked widget's menu has the place line and the four moves as today. The size
  entries, the options entry and "Remove" are left out. In their place stands one disabled entry, as the
  place line is one, saying that the widget is locked and keeps its size and options. Disabled entries for
  each missing action were rejected: four lines that cannot be chosen are noise in a menu read aloud.
- **The head.** *(agent)*: in the editing mode the head's name adds "locked" after the place ("Safety, place
  2 of 6, locked"), and beside the size label stands the visible word for locked, which forced colours draw
  as text. A glyph was rejected: it would need a name of its own, and a word is read the same by every
  reader. Outside the mode nothing shows.
- **The heading widget** can be locked like any other. Its text then stays, as options do.
- **The wording.** The new words are core's wording entries in English and German, beside the dashboard's
  others. An application's partial wording keeps working.
- **ADR-0064** gets the amendment given in ticket 01, at the end of "What follows", and "locking one widget"
  leaves its *Not yet* list. The dashboard's demo page lists it no longer under "Not yet". There is no new
  ADR.
- **README.** One bullet: what a lock does, that it lives in the view, and that the application sets it.
- **The kept arrangement.** No merge of locks from `defaultView` into `initialView` by the library. The
  stored value is the application's (ADR-0064), and only the application knows whether a widget missing
  from a kept view was removed before the lock or must come back. The example shows the application's few
  lines for it.

## Testing Decisions

- A good test here does what a reader does: it opens a widget's menu, presses an arrow key on a head, drags,
  presses "Done". It asserts on menu entries, names, the order of the regions and what `onViewChange`
  receives. It never asserts on class names or the module's state.
- **Unit tests**, beside the editing and history tests:
  - a locked widget's menu has the moves and the disabled lock line, and no size, options or "Remove";
  - the arrow keys and the moves move it, and "Done" reports it moved and still locked;
  - its head is named with "locked" in the mode, and outside the mode nothing names it so;
  - the edits refuse it directly: removing, resizing and setting options of a locked widget give the view
    back unchanged, and moving it does not;
  - "Reset" and `setView` set arrangements with and without locks;
  - a stored `locked` of `"yes"` or `1` does not lock.
- **Visual:** the example's screenshot in the mode (a new baseline, looked at, light and dark), the
  forced-colours suite on the page, and the existing drag check, extended by one drag of the locked widget.
- Prior art: the dashboard's editing tests (menu entries by role and name), its history tests (a step that
  changes nothing is none), `features-drag` for the pointer, and the stored-arrangement harness.

## Out of Scope

- Option (b), a widget that keeps its place while others move past it.
- A lock the reader sets, or a lock per action (only "cannot remove", only "cannot resize").
- A lock on a widget type for all its widgets: the application marks the widgets it means.
- A library merge of locks from `defaultView` into a kept arrangement.
- Hiding a widget, which stays the application's (`.scratch/dashboard-small-wishes/`).
- `allowEdit: false`, which stays the lock of the whole dashboard and does not change.

## Further Notes

- Ticket 01 waits on `.scratch/scroll-in-a-widget/` 02, which also amends ADR-0064 at the end of "What
  follows" and edits the README. It also waits on `.scratch/dashboard-small-wishes/` 05, which edits the same
  "not yet" line of ADR-0064 and of the demo page.
- The dashboard's focus defects (focus after "Edit", "Done", "Reset" and "Cancel") and the size entries'
  role are a triage of their own. They change the same menu; whichever lands second keeps the other's
  entries.
- The term is **Locked widget**: a widget the application keeps on the dashboard at its size and with its
  options, which the reader can only move.
