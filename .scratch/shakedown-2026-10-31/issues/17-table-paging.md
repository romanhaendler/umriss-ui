# 17: Table paging - a fitted page holds still, a server's empty answer pages right

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: README 4, 11, 25, 38 (pager status, refit); P2 (answers warning); P22 8; H7 (pager text);
earlier-runs-open design-family 8. Reds: H7 `f01`, `f02`; P2 `i-fit`, `o-pager`; P28 "server mode with
rowCount 0".
All reds named here are in `../reds/` (`../reds/README.md`).

- [ ] Ticking "select all" in a fitted (server) page changes neither the page size nor the page: the "Select all N that match" line is reserved in the fit or stands outside the counted frame; no new request from a tick.
- [ ] A page clamped because rows shrank is written back: when rows return, the user stays on the page they saw.
- [ ] Server mode tells "total unknown" from "total 0": with `rowCount: 0` the page is 1 of 1 and the request asks for page 1 (`tableModel.ts:353`).
- [ ] A loading table shows no "0" count and no "Page 1 of 1" under its skeleton.
- [ ] The pager's status region follows a shrink of the data.
- [ ] A fitted page refits when the frame grows or shrinks while focus is in the grid, keeping the focused row in view.
- [ ] The "`answers` matches none of the requests" warning does not fire for the placeholder answer the docs' own failed-fetch pattern uses.
- [ ] The pager's page text uses the type of its neighbours.
- [ ] Unit tests plus a `@quick` browser case for the fitted page; `pnpm check table`, `pnpm check alarms`.

## Comments
