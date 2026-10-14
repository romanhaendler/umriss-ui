# 03: The editing mode and the menu on every widget

**What to build:** A reader presses "Edit", sees unmistakably that the dashboard is now being edited, and arranges it without a drag: every widget's head carries one menu that moves the widget to the start, earlier, later or to the end, chooses its size by name and removes it; with the head focused, the arrow keys, Home and End move it. Every change is announced. "Done" keeps the changes and tells the application once, with the whole arrangement; "Cancel" puts everything back. The application can forbid editing and is told while a draft is open. See `spec.md` (The editing mode, The menu, Keyboard, Announcements, Locked) and ADR-0064.

**Blocked by:** 01

**Status:** done

- [ ] The library draws a bar with "Edit"; in the mode it shows a label for the mode, "Cancel" and "Done". The mode is shown by at least two signs, and the widgets' bodies are inert in it.
- [ ] Every change in the mode is a step of a draft; outside the mode nothing can be changed.
- [ ] "Done" calls `onViewChange` once with the whole view if anything changed, and not at all if nothing did; "Cancel" leaves without calling it and shows the arrangement as it was before "Edit".
- [ ] The application is told when a draft opens and when it closes.
- [ ] With editing not allowed, no bar is drawn and the mode cannot be entered.
- [ ] In the mode every widget's head has a menu button named after the widget. Its menu says "place n of m" and offers move to start, earlier, later and to end (disabled where meaningless), the type's sizes (only if it has more than one) ordered by area, each with its share of the width and the current one marked, and remove. After an action, focus returns to the menu button.
- [ ] Removing asks no question.
- [ ] In the mode a widget's head is a tab stop named "<title>, place n of m"; all four arrow keys move it one place earlier or later, Home and End to the start and the end.
- [ ] Every move, resize, removal, "Done" and "Cancel" is announced through core's `announce()`: the widget's name and, for a move, its old and new place.
- [ ] The hook hands out whether the mode is on and the actions edit, done and cancel, so an application can put "Edit" in its own page header.
- [ ] All new strings are `Wording` entries in English and German.
- [ ] Tests through the hook in jsdom: entering and leaving, every menu action and its announcement, the keyboard moves, one report per "Done", none for "Cancel" or an unchanged "Done", the draft-open callback, the locked dashboard. The accessibility suite passes with the mode on.
