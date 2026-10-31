# 33: Table - a sticky footer row

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8. Source: P22 (Σ row scrolls away at 50 rows).

- [x] With `stickyHeader` (or its own option, decided in the ticket) the footer of totals sticks to the bottom of the table's scroll area, as the head sticks to the top - also in virtual mode and with pinned columns.
- [x] Unit/`@quick` tests; an example; `pnpm check table`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** With `stickyHeader` the footer of totals sticks to the
bottom of the scroll area (pinned footer cells above the scrolling ones), back in the flow under
`@media print`; CSS-reading test; example "Totals that stay in view" (5,000 virtual rows, pins at both
sides) - looked at mid-scroll in dark. Decided: no prop of its own - the footer follows `stickyHeader`.
