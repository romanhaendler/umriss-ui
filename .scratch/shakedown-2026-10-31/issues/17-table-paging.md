# 17: Table paging - a fitted page holds still, a server's empty answer pages right

Status:     done
Blocked by: None (can start immediately)

Sources: README 4, 11, 25, 38 (pager status, refit); P2 (answers warning); P22 8; H7 (pager text);
earlier-runs-open design-family 8. Reds: H7 `f01`, `f02`; P2 `i-fit`, `o-pager`; P28 "server mode with
rowCount 0".
All reds named here are in `../reds/` (`../reds/README.md`).

- [x] Ticking "select all" in a fitted (server) page changes neither the page size nor the page: the "Select all N that match" line is reserved in the fit or stands outside the counted frame; no new request from a tick.
- [x] A page clamped because rows shrank is written back: when rows return, the user stays on the page they saw.
- [x] Server mode tells "total unknown" from "total 0": with `rowCount: 0` the page is 1 of 1 and the request asks for page 1 (`tableModel.ts:353`).
- [x] A loading table shows no "0" count and no "Page 1 of 1" under its skeleton.
- [x] The pager's status region follows a shrink of the data.
- [x] A fitted page refits when the frame grows or shrinks while focus is in the grid, keeping the focused row in view.
- [x] The "`answers` matches none of the requests" warning does not fire for the placeholder answer the docs' own failed-fetch pattern uses.
- [x] The pager's page text uses the type of its neighbours.
- [x] Unit tests plus a `@quick` browser case for the fitted page; `pnpm check table`, `pnpm check alarms`.

## Comments

**Delivered (2026-10-31, run coordinator).** The fit leaves the "Select all N that match" line's room in
a selectable server table, so a tick changes neither page size nor page and asks nothing (first tried as
an empty status line under the toolbar - two blank bands in the screenshot, so moved into the fit: one
spare line at the body's foot); a clamped page is written back while rows stand; `server: { rowCount,
answered }` - a known 0 is page 1 of 1; no count or page text under the skeleton; the pager's status
follows a shrink and the live range; the page text in the range's type with tabular figures; the
`answers` warning skips the placeholder. Refit while focus is in the grid: the 0.51.0 guard is gone, the
focused row keeps its page and focus (one case each in `fitReport`/`pageAnchor` moved to the new rule,
coordinator's call). New example "Fill a pane from a server" (looked at, light and dark), `@quick`
`server-fit.spec.ts`. Decided: a bare `rowCount: 0` without `answered` still reads "not answered yet"
(`serverModel.test.ts`); `useTable` sets `answered` after a total above 0 or a second request.
