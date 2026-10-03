# Spec: One search across all five packages — pages, examples, props, tokens, words and exports

Status: ready-for-agent

Origin: session of 2–3 Oct 2026. The brief, in the words it was given in:
"Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art,
sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen."
Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes;
this spec rests on `discoverability_interactivity.md`, `asis_site_ux.md` and
`asis_props_types.md`). Roadmap of all sixteen specs:
`.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/command-palette/spec.md` (the palette is the library's own
`CommandPalette`, used daily in the shell, with search by subsequence, rank and
marked hits), `.scratch/demo-consolidation/spec.md` (one shell for five
demos), ADR-0037 (pages are paths).

Blocked by: `props-to-examples` (the per-prop anchors a prop find lands on),
`api-index` (the export anchors), and `theming-and-wording-reference` (the
token and wording-key anchors). The page, scenario and example part does not
wait. It can land first, and each kind of entry joins the index when its spec
has landed.

ADR: none. The one change to the library, an optional field on a palette
Tickets: `issues/01`–`06`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.
candidate, is an addition and is recorded in core's changelog.

---

## Problem Statement

The search in the header is good at what it does and does too little.
`⌘K` opens the library's own palette. It finds pages and examples by title,
across about 180 candidates per demo, by subsequence (`dtp` finds
`DateTimePicker`), with the hit characters marked. It has three limits:

- **It searches one package.** The reader of the table demo cannot find
  `Select`, which lives in core. The reader of the core demo cannot find
  `pageSize`, which lives in the table. Five packages are one product to the
  reader, but they are five search boxes.
- **It searches only titles.** The 810 props, the 145 design tokens, the
  288 wording keys and the 107 hooks and functions are not in it. The audit
  (`asis_props_types.md`) found that a reader who knows the name `TableRef`,
  `--u-color-accent` or `useToast` has nowhere on the site to type it.
- **It knows only our words.** A reader from MUI types "snackbar", from AG
  Grid "frozen", from Bootstrap "chip". The page ledes are meant to carry
  synonyms once ("synonyms once" is the lede's own rule), but the palette
  matches only names and rubric names, so the synonyms are never searched.

The research's first-ranked recommendation for a static site was Pagefind,
which indexes the built HTML. The gap analysis turned it down for this site.
The data for a better search already exists, structured, in every demo's
generated pages and props. The palette is an exhibit of the library as much
as a tool, and it is the one place in the repository a component is used
every day. A second search engine beside it would make the shell less of a
proof, not more.

## Solution

**One index for the whole site, searched by the palette that is already
there.**

- Every demo's build writes a search fragment for its package: pages,
  scenarios, examples, props, tokens, wording keys and exports, each with the
  address it lands on.
- The pages build merges the five fragments into one index at the site root.
- The palette searches the own package at once, without waiting. On first
  opening it fetches the site index once and adds the four other packages.
- A find in the own package jumps in place, as today. A find in another
  package opens that page.
- The library's palette learns one thing: a candidate may carry
  **keywords**. These are words searched after the name and the group,
  never marked and never shown. Through them the ledes' synonyms and the
  wording's texts in both languages become findable.

## User Stories

1. As a reader in the table demo, I want to find `Select` by typing it, so that I do not need to know it lives in another package.
2. As a reader in any demo, I want to type a prop name such as `pageSize` and land on that prop's row, so that I reach the answer without opening pages to look.
3. As a reader, I want a prop find to show which component and package it belongs to, so that I can tell `TableProps.size` from `ButtonProps.size`.
4. As a reader styling an application, I want to type `--u-accent` and find the token `--u-color-accent`, so that I can look up its value in light and dark.
5. As a reader translating an application, I want to type a wording key and land on its row, so that I see its English and German text.
6. As a reader who sees an English string on screen, I want to type the string itself (say "No matches") and find the wording key behind it, so that I know what to override.
7. As a German reader, I want to type a German text from the screen and find its key, so that the search works in the language I see.
8. As a reader, I want to type `useToast` or `controlLimits` and land on its signature in the API index, so that hooks and functions are as findable as components.
9. As a reader coming from MUI, I want "snackbar" to find `Toast`, so that my vocabulary from another library works.
10. As a reader coming from AG Grid, I want "frozen" to find the table's Width and pinning page, so that I do not need to learn our word before I can search for it.
11. As a reader, I want results grouped under their package and page, so that I can see at a glance where each one comes from.
12. As a reader, I want the current package's results first when matches are equally good, so that the search favours where I am.
13. As a reader, I want a page above its examples, an example above a prop, and a prop above a token or a wording key for the same match, so that the broad answer comes first.
14. As a reader, I want a match in a name to beat a match in a group, and a match in a group to beat a match in keywords, so that typing a component's name always shows that component first.
15. As a reader, I want the search to open as fast as today, so that a wider index costs me nothing.
16. As a reader opening the palette for the first time, I want my own package's pages ready immediately while the rest loads, so that I never face an empty window.
17. As a reader, I want a find in my own package to jump without a reload and highlight its target, as today, so that nothing gets slower.
18. As a reader, I want a find in another package to open that package's page at the right anchor, so that a cross-package find lands as precisely as a local one.
19. As a reader with a slow or failed connection, I want the palette to keep working with my own package, so that a missing index never breaks the search.
20. As a developer running one demo with `pnpm dev:table`, I want the palette to search that package fully (props, tokens, words, exports), so that development matches the site except for the other packages.
21. As a keyboard user, I want `⌘K`, `Ctrl+K` and `/` to keep opening the palette, so that nothing I learned changes.
22. As a screen reader user, I want the palette to announce how many finds there are, as it does today, so that a much larger index stays usable by ear.
23. As a reader, I want the search field to say what it searches, so that I know props and tokens are in it.
24. As a reader, I want marked characters only where my query matched a name, so that a keyword find does not show a misleading mark.
25. As a library user, I want `CommandPalette` candidates to accept keywords, so that my own application's palette can find synonyms too.
26. As a library user, I want keywords to be optional and to change nothing when absent, so that my existing palette behaves as before.
27. As a maintainer, I want the index built from the same generated data as the pages and the agent text, so that the search can never find something the site does not show.
28. As a maintainer, I want the build to fail when a search entry points at an anchor that does not exist, so that no find lands on nothing.
29. As a maintainer, I want the build to fail when the merged index grows past its size budget, so that the first open stays fast.
30. As a maintainer, I want common names from other libraries checked against our ledes once, so that the synonyms the search relies on are there.

## Implementation Decisions

### The index

- **One entry shape for every kind.** Each entry has:
  - an **address**: a site-relative path with an optional anchor, such as
    `/table/width-and-pinning/` or `/core/select/#clear-the-choice`;
  - a **label**: what is searched first and shown;
  - a **group**: the package and the page or rubric it stands under, shown as
    the palette's heading and searched second;
  - a **kind**: `page`, `scenario`, `example`, `export`, `prop`, `token` or
    `wording`;
  - optional **keywords**, searched third.
- **What each kind holds:**

  | Kind | Label | Group | Keywords | Lands on |
  |---|---|---|---|---|
  | page | page name | `<package> · <rubric>` | the lede | the page |
  | scenario | scenario title | `<package> · Scenarios` | — | the scenario's anchor on the package's front |
  | example | example title | `<package> · <page>` | the example's lead | the example's anchor |
  | export | export name | `<package> · API index` | — | its entry in the API index |
  | prop | prop name | `<package> · <Type>` (the props type, e.g. `table · TableOptions`) | — | the prop's anchor (`#<Type>-<prop>`) |
  | token | token name | `<package> · Theming` | — | the token's row |
  | wording | wording key | `<package> · Language` | its English and German text | the key's row |

  `<package>` is the short name (`core`, `charts`, `table`, `schedule`,
  `calculation`), as in the package switcher.
- **Props are listed per props type**, not per component, because the same
  prop name in two types answers two questions. A prop inherited from a
  library type appears once, under the type that declares it.
- **Built in the same generator run** that writes a demo's generated pages
  and props, from the same data, into the demo's generated output as its
  search fragment. The demo's build ships the fragment beside its `llms.txt`.
  The pages build merges the five fragments into one `search.json` at the
  site root.
- **The build checks every address:** each entry's path is a page in the
  sitemap, and its anchor is one the prerendered page carries. The check
  runs over the fragments at merge time and fails the pages build with the
  offending entries listed. An entry whose kind has not landed yet (for
  example props before `props-to-examples`) is simply not emitted.
- **Size budget:** the merged index stays under 500 kB uncompressed, checked
  by the pages build. At today's counts (about 133 pages, 22 scenarios, 400
  examples, 810 props, 145 tokens, 288 keys and 107 exports, with ledes,
  leads and both wordings as keywords) it is expected near half of that.

### The palette in the shell

- **Two sources, one list.**
  - The own package's fragment is a lazily loaded part of the demo's bundle:
    requested when the palette first opens, cached for the session, and
    present in development and in a demo served alone.
  - The site index is fetched once, on first opening, from the site root
    (the directory above the demo's base). It is skipped entirely when the
    demo's base has no parent, as under the dev server.
  - Entries of the own package in the site index are ignored, so nothing
    appears twice.
  - Until the own fragment arrives, the candidates are today's (pages,
    scenarios and examples from the outline), so the window is never empty.
  - If the site index cannot be fetched or read, the palette goes on with the
    own package and says nothing. A missing remote half is not an error the
    reader can act on.
- **Choosing:**
  - An entry whose address lies under the demo's own base becomes a place
    and moves in the app with the jump and highlight the shell already has.
  - Any other address is a full navigation to it.
- **Ranking:**
  - The palette's searcher already sorts name finds before group finds.
    Keyword finds become a third tier behind both.
  - Inside a tier, the shell sets each candidate's weight from its kind:
    page, then scenario, example, export, prop, token, wording.
  - A small extra weight goes to entries of the own package. It is large
    enough to decide a tie, never large enough to lift a weaker kind over a
    stronger one.
  - The weights are constants in the shell, named after the kinds.
- **Words in the shell's palette:**
  - placeholder "Search pages, examples, props, tokens …"
  - field "Search umriss-ui"
  - panel "Jump anywhere in umriss-ui"
  - list "Found"

  These stay set through the language seam the shell already uses for its
  palette.
- **Keys:** `⌘K`, `Ctrl+K` and `/` as today. The header's search button
  label follows the placeholder.
- **No front-page search.** The front page (`site-front-page`) links into the
  demos and carries no palette.

### The one change to the library

- **`CommandPaletteItem` gains `keywords`,** an optional list of strings.
  They are searched only when the name and the group did not match, and only
  for queries of three characters or more. They match as a contiguous,
  case-insensitive substring, not as a subsequence: a subsequence over
  sixty words of prose matches almost anything. A keyword find carries no
  marked characters and ranks behind every name and group find. Without
  keywords the palette behaves exactly as before.
- **The searcher** (core's search module) gains this third tier. Its
  existing two tiers and their order are untouched.
- **The CommandPalette page** gets an example that uses keywords (synonyms
  of a command). Core's changelog records the addition as a minor change.

### Synonyms in the ledes

- A list of names other libraries use is checked against the ledes once, and
  missing synonyms are added within the lede's "synonyms once" rule:
  - snackbar, notification → Toast
  - dialog → Modal
  - sheet, side panel → Drawer
  - popup → Popover
  - chip → Tag
  - KPI → Stat
  - gauge → Meter
  - placeholder → Skeleton
  - collapsible, disclosure → Accordion
  - resizable panes → Splitter
  - autocomplete, typeahead → Combobox
  - pager → Pagination
  - frozen, sticky columns → Width and pinning
  - Gantt → First schedule
  - KPI tree → Calculation

  The list stands in this spec, not in code. It is a one-time pass, not a
  mechanism.

## Testing Decisions

- **What a good test is here:** it types what a reader types and checks where
  the reader lands. The index's internal shape is checked only where a broken
  shape would send a reader to nothing.
- **Seam 1, core's unit tests of the searcher and the palette** (prior art:
  the command palette's searcher tests and its behaviour test):
  - A keyword find ranks behind every name find and every group find.
  - Keywords are not searched below three characters.
  - A keyword matches as a substring and not as a subsequence.
  - A keyword find carries no marks.
  - Candidates without keywords rank exactly as before (the existing tests
    stay unchanged and green).
- **Seam 2, the tooling unit tests** (prior art: the generator tests against
  the fixture package):
  - The fixture package's fragment holds one entry per page, example, prop,
    token, wording key and export, with the addresses the pages carry.
  - Merging two fragments keeps both.
  - An entry pointing at a missing anchor is reported.
- **Seam 3, the built-site guard:** every entry of the merged index resolves
  to a sitemap page and an anchor on it, and the index is under its budget.
- **Seam 4, the shell suite**, with new probes per demo:
  - A prop name lands on its row.
  - A token lands on its row (core).
  - A German wording text lands on its key (core).
  - A synonym ("snackbar" in core, "frozen" in table) finds its page.
  - On the built site, a page of another package is found and opened at the
    right address (run against the site build, as the search-visibility
    checks are).
  - In a single demo the own package is fully searchable.
  - The existing palette tests (resting state, subsequence, the pointer) stay
    green with the larger index.
- **No timing test.** The budget check stands in for speed. If the index
  grows past about 5,000 entries, a cap on the rendered finds is the upgrade,
  not a test that measures milliseconds.

## Out of Scope

- **Pagefind or any other full-text engine,** and full-text search over the
  prose of the pages. Pagefind becomes worth its dependency only when someone
  asks for prose search. That would be a new spec.
- **Search on the front page.**
- **Hosted search (Algolia DocSearch) and "Ask AI".**
- **Searching inside example source code.**
- **A history or "recent" list in the palette.** The library deliberately
  keeps no memory. Weights are how an application would express recency.
- **Filtering by package with a control.** The group names already carry
  the package, and typing it narrows the results.

## Further Notes

- **Siblings:**
  - `props-to-examples` gives props their anchors.
  - `api-index` gives exports theirs.
  - `theming-and-wording-reference` gives tokens and wording keys theirs.
  - `shell-across-packages` provides the package short names and the package
    switcher this spec's group names mirror.
  - `pages-as-markdown` is the agents' route to the same content. The search
    is the human one.
- **Numbers this rests on:**
  - About 180 candidates per demo today.
  - 810 props, 145 tokens, 288 wording keys, 16 hooks and 91 functions on
    the site after the siblings land.
  - None of them findable today.

**Acceptance:**
- [ ] In every demo the palette finds pages, scenarios and examples of all
      five packages on the built site, and of the own package under
      `pnpm dev:<package>`.
- [ ] `pageSize`, `--u-accent`, `useToast`, a German wording text, "snackbar"
      and "frozen" each find the right target from any demo.
- [ ] A find in another package opens that page at its anchor; a find in the
      own package jumps in place.
- [ ] `CommandPaletteItem.keywords` exists, is documented with an example,
      and leaves palettes without keywords unchanged.
- [ ] The pages build fails on a dangling search entry and on an index over
      budget.
