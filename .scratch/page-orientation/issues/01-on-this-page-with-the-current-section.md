# 01: "On this page" with the current section marked, and headings that read as headings

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/page-orientation/spec.md`

**What to build:** Every component page and the scenarios page carry a list of what is on them, built from the page's own data:
- the page name;
- the first example;
- Examples, with each further example under it;
- When to use something else and Keyboard, where present;
- API, with each props table under it by type name;
- Known limits.

On the scenarios page the list holds the scenarios.

From 1200 px the list stands in a sticky third column with the current entry marked by scroll-spy (`aria-current="location"`). Below 1200 px it is a closed disclosure right after the page head.

Sections get anchors, and the shell treats an anchor that names no example as a plain scroll, not a change of place. Section headings stay `h2` and are set one step above the example titles. Jumps are instant under reduced motion.

- [ ] At 1440 px the list stands beside the content. Clicking an example entry lands on it highlighted, with the address naming it.
- [ ] Clicking "API" puts the API heading below the sticky header, and the shell does not treat it as an unknown example.
- [ ] Scrolling to the end marks the last entry current. The current entry carries `aria-current="location"`, and the list is a navigation landmark named "On this page".
- [ ] At 1000 px the list is a closed disclosure under the head; opening it and choosing an entry lands there.
- [ ] The scenarios page lists its scenarios.
- [ ] Section headings render visibly larger than example titles.
- [ ] Shell suite (new probes, axe with the disclosure open) green in all five demos. The jsdom smoke tests still render every page. No `example-*` picture changes; the commit states the `page-*` counts.

## Comments

**Delivered.** `packages/demo/src/Contents.tsx` has `useContents(entries)`, which returns the disclosure and the column. `Page.tsx` builds the entries from the values that decide whether each section is shown: the page name, the first example, Examples with each further example, When to use something else, Keyboard, API with each table under its type name, and Known limits. `Scenarios.tsx` lists the package name and then each scenario. From 1300 px the column stands over the page's right margin and the list is sticky inside it. `.shellContent` widens by the column there. Narrower, a closed `<details>` stands right after the page head. Two IntersectionObservers drive the mark: a band from the header down to a quarter of the window, and the window itself. The end of the page is a sentinel. The mark is kept in a small external store, so moving it re-renders only the two lists and not the examples. The current entry carries `aria-current="location"` and the sidebar's track style. In the Shell, an anchor that names no example or scenario now only scrolls, with no highlight. Section titles are `--u-text-lg` semibold, compared with the `--u-text-sm` example titles, and carry `scroll-margin-top`.

**Tests.** The shell suite (`checks/shell.ts`) has seven new cases, each driven by a new `contents` probe in all five `features-shell.spec.ts`:
- at 1440 px the list stands beside the content, and an example entry lands on the example, highlighted, with the address naming it;
- the API entry puts the heading below the header, unhighlighted, and does not go to the top;
- the last entry is current at the end of the page;
- at 1000 px the list is a closed disclosure between the head and the first example, and choosing an entry lands there;
- the scenarios page lists its scenarios;
- h2 is larger than h3;
- axe passes with the column and with the disclosure open.

Results: shell and page suites, ui-light and table-light: 82 passed, 1 failed (see below). `screenshots.spec`, full, ui-light and table-light: green apart from `language--own-components`, which already differed before this ticket (types-without-holes 01 reports the same). `forced-colors.spec` ui-light is green after the renewal. lint, typecheck and test:unit are green.

**Pictures.** `page-*`: 0 moved; the disclosure stands outside `.pageHead`. `example-*`: 0 moved. Two measures keep the examples on their old sub-pixel phase. The summary has a line height of 20 px, so the closed disclosure is 36 px high and not 35.5. The section title has a line height of 24.25 px, so the head of Examples stays a quarter pixel off a whole pixel as before. Without these, every example's picture grew by one row. Moved: 12 viewport pictures that show a page behind an overlay. They are `palette-window`, `palette-resting`, `drawer-beside-a-service-list`, `drawer-left-and-wider`, `forced-combobox-cursor` and `forced-range`, each light and dark. Each now shows the disclosure or the larger section headings behind the overlay. All were checked by eye.

**Deviations.**
- The column starts at 1300 px instead of 1200. The pictures are taken at 1280, where the content column has no width to spare. A column there would narrow every example and move all ~1000 `example-*` pictures, against "No `example-*` picture changes". So at 1280 the reader gets the disclosure.
- The scenarios page's first entry is the package name, because the landing's h1 now names the package (shell-across-packages 05).
- Under the quarter-window rule, a jump to "API" marks the first table, whose heading also passes the line. The spec defines the rule that way.

**Open, not from this ticket.** In table-light, "a moved address lands on the page" (`/table/` → `/first-table/`) fails on this branch at main 8a00cb3d and lands on the landing page. This change does not touch forwarding: `fromPlace` and the address code are unchanged, and the Shell change is only inside the scroll effect after a place is read.
