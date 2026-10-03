# 05: Drive a table from controls of your own

Status: ready-for-agent
Blocked by: 03 (A prop without an example fails the build)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** Examples for the 21 unshown `TableSnapshot` members, each on the page whose feature it drives: paging, search, sort, column visibility, order and CSV on First table ("Controls of your own"); `pinned`, `setPin`, `widths`, `setWidth` on Width and pinning; `grouping`, `setGrouping`, `toggleFold` on Grouping; `branches`, `toggleBranch`, `unfoldAllBranches`, `foldAllBranches` on Tree rows; `expanded`, `toggleRow` on RowDetail. The 21 entries leave the table's exception list; with ticket 04 done, the five lists together hold 33 entries or fewer.

- [ ] Every `TableSnapshot` member has a use in some table example, and the gate passes without its 21 entries
- [ ] Each new example follows the example rules (one file, own data, title, lead) and passes the own-data check
- [ ] The five exception lists together hold at most 33 entries
- [ ] Screenshot baselines exist for the new examples
