# 04 - Columns are dragged in the ColumnMenu's list

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/root-contract/issues/04-the-table-is-a-composite.md`
Spec: `.scratch/table-small-wishes/spec.md`, "The column drag"

## What to build

A pointer user drags column 12 to the top of the ColumnMenu's list in one gesture, with a mouse, a pen or a
finger. The move buttons stay as they are and remain the keyboard's route.

- **The grip.** Each entry of the column list gets a grip at its inline start:
  - not focusable, and hidden from the accessibility tree;
  - `touch-action: none`, so a finger on it drags and a swipe elsewhere scrolls the list;
  - at least 24 px under a coarse pointer.
- **The drag.** Pointer events on the grip, with the pointer captured.
  - The entry follows the pointer on the vertical axis, and the other entries of its block make room.
  - The drop place is clamped to the entry's pin block, as a move is.
  - A drop calls `setOrder` once. A drop in its own place calls nothing.
  - Escape, a lost capture or a `pointercancel` puts the entry back. While a drag runs, Escape does not close
    the menu.
  - Held within the list's top or bottom edge, the pointer scrolls the list.
  - The others' move uses the motion tokens, so reduced motion turns it off.
  - Focus stays where it was.
- **Keep it in one place.** The drop place from the pointer's position and the entries' boxes is a pure
  function beside the menu, so that it is tested without a browser.
- **No header drag**, and no drag in the grouping section.
- **Docs.** The ColumnMenu page's text says that an entry is dragged by its grip and that the move buttons
  are the keyboard's route. The first example's lead says the same. A phone check by hand is listed in
  `## Comments` when the ticket is done: a finger drags by the grip, and a swipe on a label scrolls the list.

## Acceptance criteria

- [ ] Pure tests of the drop place: within a block, at both ends, clamped at a pin block's edge, and its own
      place.
- [ ] Mounted tests in jsdom with stubbed boxes:
  - a pointer drag of the fourth entry to the first place calls `setOrder` once with the new order, and the
    header follows;
  - a drag past the edge of a pinned block stops at its edge;
  - Escape mid-drag leaves the order alone and the menu open;
  - a drop in its own place calls nothing;
  - the grip is not in the tab order and not in the accessibility tree;
  - the move buttons and their focus after a move are unchanged (`columnMenuFocus.test.tsx` passes
    untouched).
- [ ] A browser test in Chromium and WebKit: a mouse drag of an entry reorders the table's header.
- [ ] A screenshot of the menu mid-drag, in light and dark, looked at before it is accepted. No other
      screenshot moves.
- [ ] Where the 24 px floor check of `.scratch/under-a-finger/` exists, the grip passes it.
- [ ] `pnpm check table`, `pnpm check:site` and `pnpm test:visual:quick table` pass.
- [ ] The changelog notes the drag under Added.
