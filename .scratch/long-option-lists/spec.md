# Long option lists: a window over thousands of options, and a Combobox that searches with the application

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket 21 "Core's single wishes" (its Answer accepts the
Proposed answer, the row "An async or virtualised Combobox", which holds every decision below that is not
marked *(agent)*); findings `.scratch/shakedown/core.md` (performance: a MultiSelect with 10,000 options
opens in 2.4 s at 4× CPU), `composed-app.md` (2,000 Combobox options in the DOM, 151 ms to open),
`wishes.md` section 3; ADR-0035, ADR-0041, ADR-0043.

## Problem Statement

Choosing one of thousands (assets, tags, customers, cost centres) is the daily case of a data-dense
application, and core's option fields draw every option at once.

- **A MultiSelect with 10,000 options takes 2.4 s to open** at 4× CPU; a Combobox with 2,000 keeps 2,000
  options in the DOM and takes 151 ms. Every keystroke in the search filters and redraws them all.
- **A Combobox cannot ask the server.** It filters the `options` it holds by itself. An application whose
  customers live behind an API must load all of them first, or let the field's own filter fight the
  server's results.
- **Nothing says "loading"** in the list while results are on their way, so an empty list reads as "no
  matches".

`useVirtual` exists, and the table and the TreeView already window their rows with it. The option fields do
not.

## Solution

- **A window over long lists.** Above 500 options *(agent)*, the shared listbox (the Combobox's list, and
  the Select's own list under a pointer and the keys) and the MultiSelect's list draw only the options in
  view, through `useVirtual`. A drawn option of the listbox carries its position in the whole list.
- **The async Combobox.** The Combobox reports what is typed (`onSearch`), shows a loading line
  (`loading`), and with `filter={false}` shows its options as given, in their order. Debouncing and
  cancelling stay the application's; an example shows both.

## User Stories

1. As a planner choosing one asset of 10,000 in a MultiSelect, I want the panel to open at once, so that a
   long list costs no waiting.
2. As a clerk choosing one cost centre of 5,000 in a Combobox, I want each keystroke to update the list
   without a stall, so that typing stays fluid.
3. As a keyboard user, I want the arrow keys, Home and End to reach every option of a long list, so that the
   window is invisible to me.
4. As a screen-reader user, I want to hear an option's position in the whole list ("12 of 5,000"), so that a
   drawn window does not make the list sound short.
5. As a pointer user, I want the scrollbar to show the length of the whole list, so that I can scroll to its
   end.
6. As a MultiSelect user, I want "Select all", "Select none" and "Invert" to act on every filtered option,
   drawn or not, so that the window changes nothing I do.
7. As a user of a short list, I want it to behave exactly as today, so that find-in-page and my tests still
   see every option.
8. As an application developer whose customers live behind an API, I want the Combobox to report each typed
   text, so that I fetch the matches myself.
9. As that developer, I want `filter={false}` to show my results as I give them, so that the field does not
   filter again what the server already ranked.
10. As a user waiting for results, I want the list to say "Loading", so that I do not read an empty list as
    "no matches".
11. As a screen-reader user, I want the count announced once the results arrive, not at the keystroke, so
    that I hear the number that is true.
12. As a user who picked a customer, I want the field to keep showing that customer's name after the next
    search replaced the options, so that my choice does not seem to vanish.
13. As an application developer, I want an example with a debounce and a cancelled stale request, so that I
    copy the part that is mine to write.
14. As the maintainer, I want the window to keep `aria-activedescendant` on an option that is drawn, so that
    no assistive technology is pointed at an element that does not exist.

## Implementation Decisions

- **No ADR.** Both parts are additive; each is a commit message and a changelog entry.
- **The threshold** *(agent)*: a list of more than 500 options is windowed; up to 500, every option is drawn
  as today. Measured: 2,000 options took 151 ms in the Combobox, 10,000 took 2.4 s in the MultiSelect at
  4× CPU, so 500 stays near a frame or two even there. It is one internal constant shared by both lists,
  not a prop.
- **`useVirtual` stays as it is** *(agent)*. The windowed list is a component of its own that mounts inside
  the panel with its scroll element, so the hook's mount-time measuring finds the list. The filler rows are
  presentational, and the drawn options carry the attribute the hook measures a row by.
- **The listbox's window** (Combobox, and the Select's own list):
  - The active option is always drawn *(agent)*: the window is widened to hold it, so
    `aria-activedescendant` never names a missing element. The active option is scrolled into view through
    the hook's `showRow`, not by finding its element.
  - Each drawn option carries `aria-setsize` (the list's length) and `aria-posinset` (its place, from 1).
  - A grouped list (the Select's optgroups) is drawn whole *(agent)*: the window covers a flat list only.
    A Select with thousands of grouped options is not a case the audience has shown.
  - The options keep their single line with an ellipsis, so the row height is one.
- **The MultiSelect's window.**
  - Its list is a group of checkboxes with real focus, not the shared listbox, so it windows by itself
    through the same hook and the same threshold.
  - The keys move a focused index rather than walk the drawn elements: ArrowUp, ArrowDown, Home and End
    move it, the window brings it into view, and the focus follows once it is drawn. The focused option is
    always drawn.
  - The checkboxes carry no `aria-setsize` or `aria-posinset` *(agent)*: ARIA does not allow them on a
    checkbox. The count the panel already announces stands for it.
  - Tab leaves the list after the drawn options, as it leaves after the last one today; the arrow keys and
    the search are the way through a long list *(agent)*.
  - "Select all", "Select none" and "Invert", the scope switch and the count act on the filtered options, as
    today; none of them reads the DOM.
- **The async Combobox.**
  - `onSearch?: (text: string) => void` runs on every change of the typed text, the clearing cross's
    included (with `""`). It does not run on opening or closing.
  - `filter?: boolean`, default `true`. With `false`, the field filters nothing: the options are shown as
    given, in their order, and the active option resets to the first when they change while the panel is
    open.
  - `loading?: boolean`: while set, the list shows the wording's existing "Loading" line, where it would
    show its empty text, and the listbox is `aria-busy`. Options given while loading stay shown above the
    line.
  - With `filter={false}`, the count is announced when the options or `loading` change while the panel is
    open, not on the keystroke; the existing count announcement is reused, and it says the empty text once
    loading ends with nothing.
  - **The chosen label** *(agent)*: the field remembers the label of the current value from the last
    `options` that held it, so that a later search that replaces the options does not empty the field. The
    value stays controlled; an initial `value` must stand among the first `options`, and the doc comment
    says so.
  - Debounce, cancelling a stale request, and an error from the server are the application's. The example
    shows a debounce and an `AbortController` against a simulated server, and a line for a failed request.
- **The window and the async list combine**: a server that returns 5,000 matches is windowed like any list.

## Testing Decisions

- A good test here does what a user does and asserts what they see or what the application receives: the
  options by their role, name and position, the value handed to `onChange`, the text passed to `onSearch`,
  what is announced. It never asserts on class names or internal state.
- **The window**: jsdom unit tests beside the Combobox's, the Select's listbox and the MultiSelect's tests,
  with the scroll area's height stubbed (prior art: the table's unit tests of a virtual table, the table's
  virtual feature test and core's tree feature test in a browser, and `virtual.test.ts` for the
  arithmetic). With 10,000 options, far
  fewer than 10,000 options are in the DOM; End makes the last option active and drawn, with
  `aria-posinset` 10,000 and `aria-setsize` 10,000; typing filters and the window follows; with 500 options
  every option is drawn.
- **A real browser**: a `@quick` check in core opens a MultiSelect and a Combobox of 10,000 options and
  asserts that the panel is open and its option count in the DOM is below 100. Timing is not asserted; the
  count stands for it.
- **The async Combobox**: jsdom unit tests: typing calls `onSearch` with each text; `filter={false}` shows
  options that do not match the text; `loading` shows the line and `aria-busy`; the count is announced after
  the options change, not before; a chosen value keeps its label after `options` are replaced.
- The existing Combobox, Select, MultiSelect and listbox announcement tests stay green unchanged; they all
  use short lists.

## Out of Scope

- Groups and custom option rendering in the Combobox (the Answer does not propose them).
- A debounce, a cache or a request inside the Combobox.
- An async MultiSelect, and an async Select.
- Windowing a grouped list.
- A `virtual` prop or a threshold prop.
- Infinite loading (fetching more as the list scrolls).
- `ref.focus()` on Combobox and MultiSelect: `.scratch/root-contract/` 03.

## Further Notes

- The Select's native `<select>` still holds every option under a finger, where the platform draws it
  (ADR-0043); only its own list under a pointer and the keys is windowed.
- A screen reader's browse mode reads only the drawn options of a windowed list. The positions and the
  announced count say how long the list is; the search is the way in.
- If 500 turns out too low or too high on a real screen, the constant moves; that is a commit, not an API
  change.
