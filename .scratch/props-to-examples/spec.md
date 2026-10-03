# Spec: Every prop points at the example that shows it

Status: ready-for-agent

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-as-documentation/spec.md` (props tables generated from `src/`, the JSDoc gate), `.scratch/demo-rework/spec.md` (page skeleton, examples from simple to rich), `.scratch/ai-readable-docs/spec.md` (the llms text renders the same tables), ADR-0037 (pages are paths, examples are anchors).
Blocked by: `types-without-holes` (S3) — the rows this spec links must carry their real types first, and S3's definition-block anchors share the page with the prop anchors introduced here.
ADR: none. Nothing here is surprising or hard to reverse; the gate is the only new rule, and it is written down where it fails.
Tickets: `issues/01`–`05`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

A reader on a component page meets a props table and a run of examples, and
nothing connects the two. The row for `variant` says what the prop does; it
does not say which of the six examples above shows it. The reader scrolls,
opens code blocks one by one and searches by eye. That is the complaint in the
brief: *not every parameter is explained with an example* — and where one is,
the reader cannot find it.

The numbers from the audit (`asis_props_types`):

- 810 props stand in 134 tables. 714 of them (88 %) are used in some example
  or scenario of their package, but only 512 (63 %) on their own page — the
  rest are shown on a feature page the row never names.
- **67 props are shown nowhere**: 21 of `TableSnapshot`'s 41 members, `invalid`
  on 13 core form controls, several `Popover` and `Modal` props, `orientation`
  on the chart axes and limit lines, and a tail of single props.
- On the table and schedule demos, most feature pages have **no props table at
  all** (table 15 of 30, schedule 17 of 26). The props such a page is about
  stand in the 20-row `TableProps`, the 41-row `TableSnapshot` or the 28-row
  `ScheduleProps` on another page, unfiltered, without a link back.
- Nothing fails when a new prop arrives without an example. The JSDoc gate
  makes every prop explain itself; no gate makes it show itself.

The research found the same gap everywhere: Highcharts, ECharts and Nivo tie a
demo to an option only because the demo sits in the option's source; React
Aria lets a code block declare the props it teaches; **no library examined
links a table row back to the examples that use it, and none fails the build
when a prop has no example** (`component_api_reference`, `data_library_docs`).

## Solution

The props generator learns, from the examples themselves, which example uses
which prop. Three things follow from that one fact:

1. **Every row says where it is shown.** Under its description a row carries
   "Shown in:" and up to three example titles as links, own page first. A row
   also gets an anchor of its own, `#<Type>-<prop>`, and its name links to it,
   so a prop can be linked from anywhere — from prose, from the search
   (`one-search`), from another package.
2. **Feature pages get the rows they are about.** A page without a props table
   of its own — Sorting, Snapping, Ripple — shows a short table "Props on this
   page": exactly the rows its examples use, each linking to its full row on
   the page where the whole table stands.
3. **A prop without an example fails the build**, unless it is on a short,
   checked-in list of props not yet shown. That list can only shrink: an entry
   that has become shown fails the build as stale, so whoever adds the example
   removes the line.

The first wave of new examples comes with the spec: `invalid` on the 13 form
controls and the 21 unshown `TableSnapshot` members. The list starts at the
33 props that remain.

No example file changes its form. The scan reads what is already there; an
example author writes code and nothing else.

## User Stories

1. As a developer reading the Button page, I want the `variant` row to name the example that shows the variants, so that I can see the prop in action without opening every code block.
2. As a developer, I want "Shown in" to be a link to the example's anchor, so that one click scrolls me to the running example.
3. As a developer, I want examples on the same page listed before examples on other pages, so that the nearest demonstration comes first.
4. As a developer, I want an example on another page shown with that page's name, so that I know I am about to leave the page.
5. As a developer, I want at most three links and "and N more", so that a prop used everywhere does not bury its own description.
6. As a developer, I want a scenario that uses a prop to count as a demonstration, so that a prop shown only inside a composed screen is still reachable.
7. As a developer, I want every row to have its own anchor, so that I can send a colleague a link to exactly `TableProps-pageSize`.
8. As a developer, I want the prop name to be that link, so that I can copy the address from the row I am looking at.
9. As a developer reading the Sorting page of the table, I want the sorting props listed on that page, so that I do not have to find them in a 20-row table on another page.
10. As a developer, I want each row of that partial table to link to the full row, so that I can see the prop in its whole context.
11. As a developer, I want the partial table to say which full table it is cut from, so that I know where the complete list lives.
12. As a developer reading a page that already has its own table, I want no second partial table, so that the page does not repeat itself.
13. As a developer using a form control, I want an example of `invalid`, so that I see what an invalid field looks like and how it pairs with a field's message.
14. As a developer driving a table from my own controls, I want examples of `setPage`, `setSearch`, `toggleSort`, `setPin`, `setGrouping` and the other snapshot members, so that I can build my own toolbar.
15. As a developer, I want `TableSnapshot` members counted as shown when an example calls them, so that output types are held to the same standard as input props.
16. As a coding agent reading `llms-full.txt`, I want the same "Shown in" line in each table row, so that I can jump from a prop to the example source that uses it.
17. As a search-engine reader of the prerendered page, I want the anchors and links in the static HTML, so that a deep link works before the app starts.
18. As a maintainer adding a prop, I want the build to fail when no example uses it, so that the docs cannot fall behind the code.
19. As a maintainer, I want the failure to list every unshown prop with its type, so that I fix them in one pass and not one per run.
20. As a maintainer, I want an exception list, so that the gate can land before every prop has its example.
21. As a maintainer, I want an entry that has become shown to fail as stale, so that the list shrinks by itself and never hides a fixed gap.
22. As a maintainer, I want an entry naming a prop that no longer exists to fail too, so that the list never carries dead names.
23. As a maintainer, I want the scan to understand types, not text, so that `value` on a Select is never counted for `value` on a Slider.
24. As a maintainer, I want a prop passed through a spread to count only when the spread's type is known to carry it, so that the gate is not fooled by `{...props}`.
25. As a maintainer, I want `children` counted when the component is given JSX children, so that the most common prop is not a false alarm.
26. As a maintainer, I want an inherited row covered by a use of the prop it inherits, so that a prop declared once is shown once.
27. As a maintainer, I want the scan to run in the same step as the JSDoc gate, so that CI catches both in `pnpm typecheck` with no new job.
28. As a maintainer, I want two runs to write the same output byte for byte, so that the generated files never produce noise.
29. As a reader on a phone, I want the "Shown in" line to wrap under the description, so that the table does not grow sideways.
30. As a reader using a screen reader, I want the "Shown in" links to be named by the example title, so that the link text says where it goes.

## Implementation Decisions

**The scan.** It runs inside the props generator, after the tables are read and
before the llms text is written, over the package's example files and scenario
files. It builds one TypeScript program over them — the examples import the
package's own `src` relatively, so the program resolves without path mapping —
and asks the type checker, never a regular expression. A use is recorded for a
documented row when one of these holds:

- a **JSX attribute** on an element whose props type contains the property: the
  attribute's property symbol is resolved through the checker;
- **JSX children** on a component whose props declare `children`: counts as a
  use of `children`;
- a **property in an object literal** (assignment or shorthand) whose
  contextual type contains the property — this covers column definitions,
  options objects, series configs, intents, and anything passed to a hook;
- a **property access** on an expression whose type contains the property — this
  covers output types such as `TableSnapshot` (`table.setPage(2)`) and returned
  handles;
- a **spread attribute** counts only for the properties of the spread
  expression's own declared type, never for "everything the target accepts".

A use is keyed by the **declaration of the property symbol** it resolves to,
not by the table it appears in. A row is covered when some use resolves to the
row's declaration. So an inherited row (`inheritedFrom`) is covered by any use
of the prop it inherits, and two components with a `value` never cover each
other.

**The data.** Each row in the generated props data gains `shownIn`: the
examples and scenarios that use it, each with page id, example id, title and,
for another page, that page's name. Order: examples of the row's own page in
page order, then other pages in outline order, then scenarios. The data stays
generated and unversioned like the rest of the props data.

**The anchors.** Each row carries the id `<Type>-<prop>` (`ButtonProps-variant`,
`TableSnapshot-setPage`). Type names are PascalCase and example ids are
lower-case, so the two anchor kinds cannot collide; the definition-block
anchors of `types-without-holes` use the prefix `type-` and cannot either. The
prop name in the row is a link to its own anchor.

**The row.** Under the description, one line: "Shown in" followed by up to
three links, then "and N more" as plain text when there are more. A link to an
example on the same page is the example's title; on another page it is
"Title (Page)"; a scenario is "Title (Scenarios)". Rendered identically by the
React table and by the Markdown renderer behind the prerendered page and the
llms text — both read the same `shownIn`, so they cannot disagree. A row with
no use shows no line.

**Feature pages.** A page whose outline entry lists no types, and whose examples
use at least one documented row, gets a section "Props on this page" in the
place where the API section would stand. It holds exactly those rows, grouped
by their table, in the order of the full table, each row with its type, default
and description. A sentence above each group names the full table and links
to it ("From `TableProps` — the full table stands on First table."). Each row
name links to the full row's anchor on its home page. The "Shown in" line is
omitted in this section: the page's own examples are on screen. A page that
has a table of its own gets no partial table, whatever its examples use.

**The gate.** After the scan, every documented row of the package must have at
least one use in that package's examples or scenarios. The exceptions are a
checked-in JSON object per package, beside the demo's outline, mapping
`"Type.prop"` to a reason; the reason for the initial entries is "not shown
yet". The generator fails, listing all offenders at once, in three cases:
a row without a use that is not on the list; an entry on the list whose row now
has a use ("stale — remove it"); an entry whose row does not exist. It fails the
same way the JSDoc gate fails, in the same run, so `pretypecheck` and CI carry
it with no new job.

**First wave of examples, part of this spec.**
- `invalid`: one example "With an error" on each of the 13 pages — Input,
  Textarea, NumberInput, Switch, FileInput, Select, Combobox, MultiSelect,
  DatePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker, and on the
  TreeView page for `TreeSearch`. Each shows the control invalid inside a
  `FormField` with its message, so the pairing is visible.
- `TableSnapshot`: the 21 unshown members are shown on the page whose feature
  they drive — paging, search, sort, column visibility, order and CSV on First
  table ("Controls of your own"); `pinned`, `setPin`, `widths`, `setWidth` on
  Width and pinning; `grouping`, `setGrouping`, `toggleFold` on Grouping;
  `branches`, `toggleBranch`, `unfoldAllBranches`, `foldAllBranches` on Tree
  rows; `expanded`, `toggleRow` on RowDetail.
- The exception list is then created with the 33 rows that remain, and from
  then on can only shrink.

Every new example follows the existing example rules: one file, its own data,
a `title` and a `lead`, runnable as copied.

## Testing Decisions

A good test here asserts what a reader or a maintainer observes — a link on a
row, a failing build with a named prop — never how the scan walks the tree.

- **The tooling unit tests against the fixture package** (prior art: the props
  reader and llms generator tests in the shell's unit tests, each against its
  fixture). New fixture examples cover: a JSX attribute; JSX children; an
  object literal under a contextual type; a property access on an output type;
  a spread whose type carries the prop and one whose type does not; two
  components sharing a prop name, each covering only its own; an inherited row
  covered by its parent's use. Assertions on `shownIn` order and on the three
  gate failures (unshown, stale, unknown), including that all offenders are
  listed in one run.
- **The Markdown renderer test** (prior art: the llms tests): a row with four
  uses renders three links and "and 1 more"; the prerendered page carries the
  row anchor.
- **The page suite in the browser** (prior art: the code switch and copy tests
  run against every demo): clicking a "Shown in" link lands on the example's
  anchor with the example in view; a row's own link puts `#<Type>-<prop>` in the
  address; a table feature page shows "Props on this page" with a link that
  reaches the full row on First table.
- **The built-site guard** in the pages build: every `#<Type>-<prop>` link on
  any prerendered page resolves to an element with that id on its target page.
- **Screenshot baselines** move for every page with a table; they are renewed
  once, in the ticket that renders the line.

## Out of Scope

- A per-prop live control (that is `configurator`, S14, for ten components).
- Rewriting existing examples to cover more props than the first wave.
- Showing props of neighbouring packages that a scenario uses: coverage is
  counted per package, and a scenario's uses count only for its own package.
- Hover previews of an example from the row.
- Grouping of rows, and the new gate classes for defaults and exports (that is
  `props-table-hygiene`, S12, which extends the same gate run).

## Further Notes

- Siblings: `types-without-holes` (S3) blocks this spec; `one-search` (S9)
  indexes the row anchors introduced here; `props-table-hygiene` (S12) extends
  the same gate run and must keep the three failure messages of this one.
- The figures to beat: 67 props shown nowhere, 202 shown only off their own
  page, 32 feature pages without any table.
- Acceptance:
  - every row with a use carries a "Shown in" line and its own anchor, in the
    demo, in the prerendered page and in `llms-full.txt`;
  - every table and schedule feature page that uses documented props shows
    "Props on this page";
  - the build fails on an unshown prop, a stale exception and an unknown
    exception, each tested;
  - the 13 `invalid` examples and the `TableSnapshot` examples exist, and the
    exception list holds 33 entries or fewer.
