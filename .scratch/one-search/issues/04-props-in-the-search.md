# 04: Props in the search

Status: done
Blocked by: 03 (One index for the site: all five packages from any demo), `props-to-examples` 01 (Every row names the examples that show it)
Spec: `.scratch/one-search/spec.md`

**What to build:** Every documented prop joins the fragment as a `prop` entry. The label is the prop name; the group is `<package> · <Type>` (the props type that declares it, with inherited props once under their declaring type). It lands on the prop's anchor `#<Type>-<prop>`.

- [x] From any demo on the built site, `pageSize` lands on its row in the table's props table.
- [x] `size` shows separate finds for `TableProps`, `ButtonProps` and others, each naming its type and package.
- [x] Every prop entry's anchor exists on its page (the guard stays green).
- [x] Shell suite prop probe green in every demo.

## Comments

**Delivered.** `propEntries` in `packages/demo/src/search.ts` turns the props
tables that a page shows into `prop` entries. Each has the prop's name as its
label, `<package> · <Type>` as its group and
`/<package>/<page>/#<Type>-<prop>` as its address. `renderLlms` collects each
page's `apiSection(...).tables` while it writes the API section. It then
appends the entries beside `searchEntries` and `referenceEntries` (06), so a
find can only point at a row that the page renders. Rules:
- A table shown on several pages (`ToolbarProps` on Toolbar and Toolbar
  controls) is found once, on the first page in outline order.
- A row inherited from a type whose own row is already found
  (`IconButtonProps.size` from `ButtonProps`) is not found twice.
- A row inherited from a type with no table (`MeterProps.unit` from
  `UnitProps` in the fixture) stays under the type where it stands.

The site has 768 props: core 343, charts 158, table 148, schedule 94 and
calculation 25. `site/search.json` is 344 kB with 06's tokens and wording,
against a budget of 500 kB. `size` finds 21 types in core and four in the
table, each with its package and type. `TableProps` has no `size`, so the
ticket's example pair does not exist as written.

**Tests.**
- `tests-unit/search.test.ts`, "the props in the search fragment": every row
  is found once, under its declaring type, at its anchor. Every address lands
  on a `<tr id>` of the prerendered page.
- The built-site guard (`searchFaults`) stays green over all 768 anchors
  (`pnpm build:pages`).
- Shell suite: the new required probe `prop` ("a prop's name finds its row")
  runs in all five demos:
  - core: `role` of PopoverProps, in a folded group, which the jump opens;
  - charts: `padding`;
  - table: `pageSize` of TableOptions;
  - schedule: `laneHeight`;
  - calculation: `metrics`.
- `elsewhere` is now a list. Core's second entry opens `pageSize` at
  `/table/first-table/#TableOptions-pageSize` on the built site. The landing
  check now accepts a props row as well as an example.
- `features-shell` is green in the five light projects.

**Baselines.** None moved, because nothing visible changed.

**Deviations.**
- Only the props tables (a page's `types`) are indexed. The members of the
  "Types on this page" definitions (about 570 more rows, such as
  `TableView.pageSize`) are not. The spec's table names "the props type",
  its count of 810 matches the tables, and the definitions would have cost
  about 60 kB of the budget. Their rows have anchors already, so adding them
  is one more loop over `section.definitions`.
- No changelog entry, because nothing that a caller of a package sees
  changed.
