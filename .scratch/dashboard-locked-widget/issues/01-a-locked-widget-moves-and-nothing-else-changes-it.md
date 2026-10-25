# 01 - A locked widget moves, and nothing else changes it

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/scroll-in-a-widget/issues/02-content-taller-than-its-size-scrolls-in-its-widget.md`,
`.scratch/dashboard-small-wishes/issues/05-the-never-lines-in-adr-0032-and-adr-0064.md`
Spec: `.scratch/dashboard-locked-widget/spec.md`

## What to build

The tracer bullet, end to end. An application marks a widget in its view as locked. In the editing mode the
reader can move it like any other but cannot remove it, resize it or change its options, and sees why.

- **The mark.** `DashboardWidget` takes `locked?: boolean`, documented as the application's: the reader can
  move the widget but not resize it, change its options or remove it, and the dashboard never sets or clears
  it. Only `true` locks. The mark is kept through every edit and reported by "Done".
- **The rule, in one place.** The edits a draft applies give the view back unchanged for removing,
  resizing and setting the options of a locked widget, so no step and no undo are left. Moving is not
  refused. `setView` and "Reset" are not refused, and the catalogue never adds a locked widget.
- **The menu** of a locked widget:
  - the place line and the four moves, as today;
  - no size entries, no options entry, no "Remove";
  - in their place, one disabled entry saying that the widget is locked and keeps its size and options.
- **The head** in the editing mode:
  - its name adds "locked" after the place ("Safety, place 2 of 6, locked");
  - beside the size label stands the word for locked, as text;
  - the arrow keys, Home, End and a drag move it as any other.

  Outside the mode nothing shows.
- **The wording.** The new entries go into core's wording, English and German, beside the dashboard's
  others.
- **The example** "A widget every reader keeps" on the dashboard's page: a default view with a locked
  summary among other widgets.
- **README.** One bullet on the lock: what it allows and refuses, that it lives in the view and comes back
  through `initialView`, and that only the application sets it.
- **ADR-0064**:
  - "locking one widget" leaves the *Not yet* list;
  - at the end of "What follows", after the scroll amendment, comes this amendment, dated the day of the
    change:

    > *Amended:* locking one widget is built. The application marks a widget of a view as locked, and the
    > reader can never set or clear the mark. A locked widget cannot be removed, resized or have its options
    > changed, and it moves with the others. It is a place in the sequence like any other, so "earlier",
    > "later", the arrow keys and a drag move it, and it shifts when another widget is moved before it.
    > Keeping its place while the others move past it was not taken: in a sequence a place is "after the
    > one before", a widget that held its place would make "earlier" skip it, and the packing would move it
    > at another width anyway. In the editing mode its head says that it is locked, and its menu has the
    > moves and a line saying why the rest is missing. The lock lives in the view, is stored with it, and
    > "Reset" brings back the default's locks. An application that locks a widget in arrangements readers
    > already kept sets the mark before it hands the kept view over.

- **The demo page's limits** no longer list locking one widget under "Not yet".
- **Changelogs**, under "Added": the dashboard's `locked`, and core's new wording entries.

## Acceptance criteria

- [ ] Unit tests, beside the editing and history tests:
  - a locked widget's menu has the moves and the disabled lock line, and no size, options or "Remove";
  - the arrow keys and the moves move it, and "Done" reports it moved and still locked;
  - its head is named with "locked" in the mode, and with nothing of it outside;
  - the edits give the view back unchanged for removing, resizing and setting options of a locked widget,
    and leave no undo step;
  - "Reset" and `setView` set arrangements with and without locks;
  - a stored `locked` of `"yes"` or `1` does not lock.
- [ ] The drag check moves the locked widget by its head in Chromium and WebKit.
- [ ] The example has a screenshot in the mode, light and dark (new baselines, looked at), and the
      forced-colours and accessibility suites pass on the page.
- [ ] In German the head's name, the visible word and the menu line are German.
- [ ] `pnpm check dashboard`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick dashboard`
      pass, and both `API.md` are regenerated if the gate asks for it.
