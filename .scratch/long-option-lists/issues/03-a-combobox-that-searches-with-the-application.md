# 03 - A Combobox that searches with the application

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-a-long-listbox-draws-only-what-is-in-view.md`,
`.scratch/root-contract/issues/03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`,
`.scratch/under-a-finger/issues/08-the-palette-and-the-on-screen-keyboard.md`
Spec: `.scratch/long-option-lists/spec.md`

## What to build

An application whose customers live behind an API finds them with a Combobox: the field reports what is
typed, the application fetches, and the field shows the results as given. The ticket waits for 01, which
reworks the same listbox, and for two tickets that edit the Combobox's input: the root contract's 03 and
under-a-finger's 08 (its `enterkeyhint` and `autocomplete`).

- **`onSearch?: (text: string) => void`** runs on every change of the typed text, the clearing cross's
  included (with `""`), and not on opening or closing.
- **`filter?: boolean`**, default `true`. With `false`, the field filters nothing: the options are shown as
  given, in their order, and the active option resets to the first when they change while the panel is open.
- **`loading?: boolean`**: while set, the list shows the wording's existing "Loading" line where it would
  show its empty text, and the listbox is `aria-busy`. Options given while loading stay above the line.
- **The count.** With `filter={false}`, the count is announced when the options or `loading` change while
  the panel is open, not on the keystroke. Loading that ends with nothing says the empty text.
- **The chosen label.** The field remembers the label of the current value from the last `options` that held
  it, so a later search that replaces the options does not empty the field. The value stays controlled. An
  initial `value` must stand among the first `options`; the doc comment says so.
- **The example** on the Combobox page: a customer search against a simulated server with a delay, a
  debounce, an `AbortController` that cancels the stale request, `loading` while a request runs, and a line
  for a failed request. Its lead says that debounce and cancel are the application's.
- Regenerate `API.md`.

## Acceptance criteria

- [ ] jsdom tests:
  - [ ] typing "ac" calls `onSearch` with "a" and then "ac"; the clearing cross calls it with `""`;
  - [ ] with `filter={false}`, an option that does not contain the typed text is shown and can be chosen;
  - [ ] `loading` shows "Loading" and sets `aria-busy` on the listbox;
  - [ ] the count is announced after new options arrive, and not at the keystroke before;
  - [ ] after choosing a customer and replacing `options` with results that lack it, the field still shows
        the customer's name.
- [ ] Without the three props, every existing Combobox test passes unchanged.
- [ ] A server returning 5,000 matches is windowed by 01's list (one jsdom test).
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass; the example's screenshots
      are new baselines, reviewed in both themes.
- [ ] Core's changelog lists `onSearch`, `filter` and `loading` under "Added".
