# 05: Dragging by the head

**What to build:** In the editing mode a mouse or pen user takes a widget by its head and drags it; the other widgets make room and a placeholder at the true size shows where it will land; letting go puts it there, Escape puts it back. On a touch screen the dashboard still scrolls by the widgets' bodies. See `spec.md` (Dragging) and prototype 2 on the branch `prototype/dashboard`, whose drag is the behaviour to match.

**Blocked by:** 03

**Status:** done

- [ ] A drag is taken only by a widget's head, outside its menu button, and starts only after the pointer has moved a few pixels; a press without movement stays a click.
- [ ] Only the head prevents touch scrolling; a body in the mode scrolls the page.
- [ ] While dragging, the shown order is the candidate (the widget at each place of the order the drag began with) whose packed picture puts the widget's corner nearest to where it is held - a function of the pointer alone. From prototype 2:

  ```ts
  for (let i = 0; i < from.length; i++) {
    const candidate = moveTo(from, id, i);
    const box = layout(candidate).find(id);
    const d = (box.left - x) ** 2 + (box.top - y) ** 2;
    if (d < least) { least = d; best = candidate; }
  }
  ```

- [ ] The dragged widget follows the pointer above the others; a placeholder at its true size marks the landing place; the others move to their places with a short transition, and without one under reduced motion.
- [ ] Near the top or bottom edge of the window the page scrolls during a drag.
- [ ] Letting go makes one step of the draft, announced like a move from the menu; Escape or a cancelled pointer makes none and is announced as cancelled.
- [ ] In the list form a drag works the same, in one column.
- [ ] Tests: the nearest-place rule as a pure function; browser tests that drag a widget by its head to another place and assert the stored order and the announcement, that Escape restores the order, that a click on the head is no drag, and that a touch on a body scrolls in the mode.
