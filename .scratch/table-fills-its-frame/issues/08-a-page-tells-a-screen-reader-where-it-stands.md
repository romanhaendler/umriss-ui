# 08: A page tells a screen reader where it stands

Status:     ready-for-agent
Blocked by: 02

Spec: `../spec.md`, user stories 15-16, decision "Accessibility".

**What to build:** a paged table tells assistive technology the position of
its rows in the whole set, and paging is announced. A row on page 2 is "row
14 of 121", not "row 2 of 13".

- [ ] A paged table carries `aria-rowcount` (all rows, head and footer included) and `aria-rowindex` on every row, head and footer, as the virtual window already does; in server mode the count is the server's.
- [ ] When the user pages, a polite status message says the new range, in the pager's range wording (ticket 02); focus stays on the control the user used.
- [ ] A table without a Pagination is unchanged.
- [ ] Unit tests: `aria-rowcount` and `aria-rowindex` on page 1 and a later page, grouped too; the polite message after paging.
- [ ] `pnpm check table` passes; checked once with VoiceOver in the table demo.

## Comments
