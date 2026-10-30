# 04: With a Pagination the page is what the frame holds

Status:     ready-for-agent
Blocked by: 03

Spec: `../spec.md`, user stories 3-4, 7-10, 38-39, 42-44, 51, decisions "The
fitted page", "Option and view" (the option part), "Loading and empty",
"Totals footer", "Limits", "ADRs" (ADR-0042), "Documents".

**What to build:** with a Pagination in a filled frame, a page holds as many
whole lines as fit between the head and the pager - the **Fitted page**. A
pane of twelve lines over a hundred rows shows twelve rows, none cut, no
scrollbar, "1–12 of 100". Blank surface stands only on a short last page,
under the few rows a search leaves, and under the empty message.

- [ ] A page holds `max(1, floor(scroll area height / pitch))` lines; the head is excluded, repeated group headers and the totals footer count; the rest under one pitch stays as a thin strip above the pager.
- [ ] With 100 rows no row is cut and the scroll area has no vertical scrollbar; on the short last page the rows stand on top, blank surface below, footer and pager in place.
- [ ] Folding a group fills the page with the following lines.
- [ ] The totals footer of a paged filled table is a line of the page, directly above the pager.
- [ ] The `pageSize` option is the page in flow and the start value before the first measurement; in flow and with `maxHeight` nothing changes.
- [ ] The first load shows exactly as many placeholders as the fitted page holds; loading over rows is unchanged.
- [ ] Compact density and the touch pitch fit the page anew.
- [ ] In development the table warns once when fewer than three lines fit.
- [ ] Dated amendment to ADR-0042's "A page holds its height": in a filled frame the held height is the frame's. `CONTEXT.md` gets **Fitted page**. The docs of `pageSize` say what it is now; API.md regenerated.
- [ ] Unit tests with a faked scroll-area height (prior art: the unbounded virtual tests fake `clientHeight`): the fitted line count for heights and pitches, headers and footer counted, at least one line, the warning.
- [ ] Visual test (`@quick`): in the pane of fixed height with 100 rows, the page shows only whole rows and no vertical scrollbar.
- [ ] `pnpm check table` and `pnpm check:site` pass; the demo example from 03 looked at as a user.

## Comments
