# 05: Drive a table from controls of your own

Status: done
Blocked by: 03 (A prop without an example fails the build)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** Examples for the 21 unshown `TableSnapshot` members, each on the page whose feature it drives: paging, search, sort, column visibility, order and CSV on First table ("Controls of your own"); `pinned`, `setPin`, `widths`, `setWidth` on Width and pinning; `grouping`, `setGrouping`, `toggleFold` on Grouping; `branches`, `toggleBranch`, `unfoldAllBranches`, `foldAllBranches` on Tree rows; `expanded`, `toggleRow` on RowDetail. The 21 entries leave the table's exception list; with ticket 04 done, the five lists together hold 33 entries or fewer.

- [x] Every `TableSnapshot` member has a use in some table example, and the gate passes without its 21 entries
- [x] Each new example follows the example rules (one file, own data, title, lead) and passes the own-data check
- [ ] The five exception lists together hold at most 33 entries (not reachable: see the report)
- [x] Screenshot baselines exist for the new examples

## Comments

Delivered: six new examples, each one file with its own data, a title and a lead. Together they use all 33 `TableSnapshot` members that `packages/table/demo/unshown.json` listed. That is the ticket's 21 plus the twelve that ticket 03 found also unshown: `rows`, `page`, `pageCount`, `pageSize`, `filter`, `folded`, `virtual`, `rowCount`, `manual`, and the rest of paging, sort and search. All 33 entries are gone from the list, and table's list now holds 13 rows.

- First table, "Search and page from a header of your own": a search field and a range pager ("1–5 of 12 ‹ ›", "Show all") in a card header. The pager is written as an application part over `of: TableRef`. It reads `page`, `pageSize`, `pageCount`, `rowCount` and `rows`, calls `setPage`, `setPageSize` and `setSearch`, and stands aside when `virtual` is set. The lead says it plainly: the table pages only while a `Pagination` stands in it. Without one, `page` is always 1.
- First table, "Sort, arrange and export from controls of your own": a sort select and a direction button (`sort`, `toggleSort`), and a checkbox and a "move left" button per column (`hidden`, `toggleColumn`, `order`, `setOrder`). It also has a "Copy as CSV" part over `TableRef` that reads `asCsv`, and its label reads `manual` (in manual mode it copies only the page).
- Width and pinning, "Pin and size from controls of your own": a switch and a width button (`pinned`, `setPin`, `widths`, `setWidth`).
- Grouping, "Group and fold from controls of your own": a group-by select (`grouping`, `setGrouping`) and "Fold finished tours" (`folded`, `toggleFold`).
- Tree rows, "Open branches from controls of your own": "Open all" and "Close all" (`unfoldAllBranches`, `foldAllBranches`), plus a warning that opens the branches above its unit (`branches`, `toggleBranch`).
- RowDetail, "Open a detail from outside the table": "Open them" for the failed attempts, and "Close all details" (`expanded`, `toggleRow`).
- `filter` is the one member covered by changing an existing example. In Filter/05 the quick-filter buttons now read `t.filter` to show which condition stands (`aria-pressed`, primary while active). The first render is unchanged, so its baseline stays.

Tests: `pnpm --filter @umriss-ui/table props` passes without the 33 entries, and every member's `shownIn` names the new example. lint, typecheck and test:unit are green. A throwaway jsdom check clicked through every new control and was then deleted. Playwright, table-light: own-data, features-page, silent-pages and accessibility, 70 passed. In table-light and table-dark: the screenshots of the six pages' heads, the seven examples and Filter/05, 26 passed.

Baselines: 12 new ones (6 examples × light and dark), and I looked at each. No existing baseline moved.

Deviations: the box "the five lists together hold at most 33 entries" cannot be met. Ticket 03's report explains why: the lists started at 155, not 67. After this ticket and ticket 04 they hold 109. No package CHANGELOG entry, since only the demo changed.
