# 06 - A tab list that scrolls within its width

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

A tab list with more tabs than room scrolls sideways within its own width, at every width and with every
pointer. The page no longer grows sideways, and every tab can be reached.

- **The scroll.** The tab list scrolls horizontally, with no visible scrollbar. The ink indicator moves
  with the scroll.
- **The selected tab in view.** On selection and on mount, the selected tab is brought into view by setting
  the list's own scroll position, never by an API that also scrolls the page. Keyboard focus moving along
  the tabs keeps the focused tab in view.
- **A list that fits is unchanged**, to the pixel.

## Acceptance criteria

- [ ] A feature test at 375 px with the many-tabs example asserts that:
      - the document is no wider than the window;
      - the last tab can be tapped (`hasTouch`) and selected;
      - after selection it stands fully inside the list;
      - the page's scroll position did not change.
- [ ] Arrow keys walk to the last tab and it stands in view.
- [ ] Existing Tabs screenshots are unchanged.
- [ ] `pnpm check core` and `pnpm test:visual:quick core` pass.
