# 02 - A long MultiSelect draws only what is in view

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-a-long-listbox-draws-only-what-is-in-view.md`,
`.scratch/date-jump-and-typed-entry/issues/05-the-keyboard-a-finger-gets.md`,
`.scratch/root-contract/issues/03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`
Spec: `.scratch/long-option-lists/spec.md`

## What to build

A MultiSelect with 10,000 assets opens at once, where it takes 2.4 s at 4× CPU today (`core.md`). The
ticket waits for 01, whose threshold and windowed list it follows, and for two tickets that rework the same
component: the date-jump spec's 05 (the panel focuses its first option when a touch opens it) and the root
contract's 03 (the MultiSelect's ref and pass-through).

- **The window.** Above the threshold of 01, the list of checkboxes draws only the options in view through
  `useVirtual`, with presentational filler rows. Its list is not the shared listbox, so it windows by itself
  with the same hook and constant.
- **The keys** move a focused index rather than walk the drawn elements: ArrowDown, ArrowUp, Home and End
  move it, the window brings it into view, and the focus follows once it is drawn. ArrowUp on the first
  option still returns to the search; ArrowDown and Enter in the search still behave as today. The focused
  option is always drawn.
- **A touch opening** (05) focuses the first enabled option of the whole list, drawn by then.
- **Unchanged.** "Select all", "Select none" and "Invert", the scope switch and the count act on the filtered
  options. The checkboxes carry no `aria-setsize` or `aria-posinset`, which ARIA does not allow on a
  checkbox; the count the panel announces stands for it. Tab leaves the list after the drawn options.
- **The MultiSelect page** gains an example with a few thousand generated options.

## Acceptance criteria

- [ ] jsdom tests with 10,000 options: the panel opens with far fewer than 10,000 checkboxes in the DOM; End
      focuses the last option; Home focuses the first; ArrowUp on the first returns to the search; "Select
      all" with a search term ticks every match, drawn or not.
- [ ] A jsdom test: a touch opening focuses the first enabled option in a windowed list.
- [ ] A jsdom test: 500 options are all drawn.
- [ ] A `@quick` check in core: the example opens with fewer than 100 checkboxes in the DOM.
- [ ] The existing MultiSelect tests pass unchanged.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass.
- [ ] Core's changelog lists the window under "Changed".
