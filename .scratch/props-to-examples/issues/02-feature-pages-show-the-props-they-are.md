# 02: Feature pages show the props they are about

Status: done
Blocked by: 01 (Every row names the examples that show it)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** A page whose outline lists no types but whose examples use documented rows shows a section "Props on this page" where the API section would stand: exactly those rows, grouped by their table in the full table's order, with type, default and description, a sentence naming and linking the full table and its page, and each row name linking to the full row's anchor. No "Shown in" line inside this section. A page with a table of its own gets no partial table. This lands the table's 15 and the schedule's 17 feature pages without tables.

- [x] Sorting, Snapping and Ripple each show "Props on this page" with only the rows their examples use
- [x] Each group is introduced by "From `<Type>` — the full table stands on <Page>." with a link
- [x] Every row name reaches the full row on its home page (page suite: from a table feature page to First table)
- [x] A page with its own table never shows the section; a page whose examples use no documented row shows none
- [x] The section appears identically in the prerendered page, `llms-full.txt` and the demo
- [x] Screenshot baselines of the affected feature pages renewed

## Comments

Delivered: `propsOnPage` in `packages/demo/src/tooling/apiTable.ts`. On a page whose outline lists no types, it gives one table for each full table whose rows the page's examples use (`shownIn` with that page). The tables come in outline order. Each holds only the used rows, in the full table's order and groups. A table model can now carry `cut` (the home page and the sentence "From `<Type>` — the full table stands on <Page>."). Both writers then put that sentence where the heading stood. The rows carry no `id`, and each name links to the full row: `../<home>/#<Type>-<prop>` in HTML, `[`prop`](#/<home>/<Type>-<prop>)` in Markdown. There is no "Shown in" line and no closing sentence. A type named in a cell leads to its table, or else to its definition on the full table's page. `Page.tsx` mounts the section as "Props on this page" (`#props-<page>`) where the API section would stand, and "On this page" lists it. `llms.ts` writes `#### Props on this page` into the full text and the twins, and splices the same HTML into the prerendered page (heading id `props-<page>`). With real data, the section appears on table 15 and schedule 17 pages, and also on charts 3, calculation 3 and core 2 (Installation, Theming): the rule is generic.

Tests:

- `apiTable.test.ts` "Props on this page" checks: only the used rows, grouped, in the full table's order (`onValueChange` after `value`); the intro sentence and its link; names linking to the full rows; no row ids; no "Shown in"; definition links to the home page; nothing on a page with a table or on a page with no use.
- `llms.test.ts` checks the section in the full text and the identical HTML on the prerendered page, and that it is absent on a typed page.
- The page suite (`checks/page.ts`) checks that "On this page" names the section, and that a row name lands on the full row in view. It ran from manual-mode to first-table (table-light) and from appearances to schedule (schedule-light).
- lint, typecheck: green. test:unit: green. The table's `demo-smoke.test.tsx` timed out twice in the full parallel run and passed alone (148/148).
- Playwright, features-page and features-shell in ui-light, table-light and schedule-light: all green after the fix to one test that already failed on main (below). Core's configurator layout test ("beside the stage from 900 px") failed once and passed on its rerun; the Button page has a table of its own, and this change does not touch it.

Baselines moved: none. No screenshot covers the API section (page head, examples and scenarios only), so no "affected feature page" baseline exists to renew.

Deviations:

- Core's `features-page.spec.ts` "a link to a definition previews it…" already failed on main. Since ticket 01, a row's name is a link, so Tab from the variant's type link reaches the size row's name and not its type link. The test now focuses that name and tabs once.
- No CHANGELOG entry, as in ticket 01: only the generated pages and `llms-full.md` gain the section.
