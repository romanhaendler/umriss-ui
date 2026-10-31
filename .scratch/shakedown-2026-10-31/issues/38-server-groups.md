# 38: Server mode groups - the request carries the grouping, the answer carries the group lines

Status:     ready-for-agent
Blocked by: 17

Spec: `../spec.md`, decision 9. Sources: README wish table 3; P2 and P22 wishes ("group 2M server rows by
status"); `table-feature-matrix.md` "Server-side grouping/aggregation". The table README today says
"Groups from the server are the next piece, with a spec of their own" - this ticket is that piece.

**What to build:** a server-mode table can be grouped - by `defaultGrouping`, the ColumnMenu or a view - and
shows the groups the server computed over every match, with their counts and totals, paged like a grouped
table in the browser.

- [ ] ADR (`docs/adr/0081-…`, amending ADR-0072): the request also carries `grouping` (column ids, outermost first, `[]` by default) and `folded` (paths of the folded groups); the answer names its group lines through a new prop `groups` - per group on the page its `path` (the values from the outermost level), `count` (rows below it over every match), `totals` (by column id, as the footer's `totals`) and `at` (the index in `rows` before which its header stands). A page counts lines - group headers and rows - as the grouped table in the browser does, so `rowCount` counts lines while grouped. The application names the answer; the table computes nothing over the rows. Considered options written down (AG Grid's per-level pull contract, a lines array) with why not.
- [ ] `TableRequest` and `requestKey` carry `grouping` and `folded`; `answers` compares them; changing the grouping sends one request. The three "passed over in server mode" warnings for grouping go.
- [ ] The table draws the group header lines from `groups` with the same parts as the browser's grouping (level, fold button, label, count, aggregates under their columns), the rows of each group under its header; a group whose header stands on an earlier page continues without a repeated header unless the browser's grouping repeats it (match it).
- [ ] A missing or malformed `groups` while `grouping` is set warns in DEV and shows the rows ungrouped.
- [ ] A server-mode example with a fake server that groups and pages (the demo's own data), and the README section "A million rows on a server" says how a server answers a grouped request.
- [ ] Unit tests for the request, the drawing from `groups`, paging by lines; `pnpm check table`, `pnpm check alarms`, `pnpm check:site`; the example looked at as a user, light and dark.

## Comments

**Coordinator, 2026-10-31.** ADR-0081 went to the field contract (ticket 01, the next free number when it
was written); this ticket's ADR is 0082.
