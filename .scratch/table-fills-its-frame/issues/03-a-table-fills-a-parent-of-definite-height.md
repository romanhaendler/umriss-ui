# 03: A table fills a parent of definite height

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`, user stories 1-2, 5-6, 11-14, 40-41, 46-50, 52-53,
decisions "Filling", "What the table contributes", "Totals footer", "Virtual
and tree tables", "Limits" (`maxHeight`, printing), "One new read on the
table", "ADRs", "Documents". Use the mechanism ticket 01 chose.

**What to build:** in a parent of definite height the table's frame is
exactly the parent's height, with no prop: toolbar on top, pager at the
bottom edge, the scroll area takes the rest. Under the last row the surface
is blank and unlined. In a parent without a definite height nothing changes.
Not to be released alone: a paged table in a frame shows ten rows over blank
surface until ticket 04 lands.

- [ ] In a pane of fixed height a table with 0, 5 and 100 rows has the pane's height (within 1 px); the pager's bottom edge is the frame's.
- [ ] The empty message stands at the top of the scroll area.
- [ ] The surface under the last row carries no stripes, lines or borders, is not focusable, takes no click, and is not in the accessibility tree; the arrow keys stop at the last row.
- [ ] A filled scrolling table without a pager (also `virtual`, also tree rows) scrolls in the frame; its totals footer stands at the frame's bottom edge.
- [ ] The table contributes its held page height to its parent, never its current rows: in a stretched grid row beside a chart the row grows and shrinks back with the chart.
- [ ] With `maxHeight` set, or in a flowing parent, the table is as tall as its rows, as today; printing shows it as tall as its page.
- [ ] `framed: boolean` on what `useTable` returns and on the snapshot says whether the table fills a parent of definite height; documented, API.md regenerated.
- [ ] New ADR "A page is what its frame holds", written with every decision of the spec (also those later tickets build), and the dated amendment to ADR-0050 reversing its table part of 2026-10-25.
- [ ] Table README's paragraph on parents of definite height and the dashboard README's "a table stays within it" say what the table does now.
- [ ] One table demo example shows the rule: a pane with a control for 0/5/100 rows and a control for its height.
- [ ] Visual tests next to "in a pane of fixed height", tagged `@quick`, Chromium and WebKit: the frame against the pane for 0/5/100 rows, the pager at the bottom edge, flow unchanged, `maxHeight` unchanged, the stretched grid row growing and shrinking back. The existing "in a pane of fixed height" tests stay green.
- [ ] Unit tests: nothing focusable or filler under the last row; `framed` true and false.
- [ ] The core demo's control room, the dashboard demo and the alarms demo are looked at as a user and their screenshots accepted; `pnpm check table`, `pnpm check alarms`, `pnpm check dashboard`, `pnpm check:site` pass.

## Comments
