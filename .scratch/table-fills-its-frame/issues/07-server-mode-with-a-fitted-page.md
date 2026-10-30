# 07: Server mode with a fitted page

Status:     ready-for-agent
Blocked by: 04, 06

Spec: `../spec.md`, user stories 35-37, decision "Server mode".

**What to build:** in server mode (ADR-0072) the request keeps its shape;
`page` and `pageSize` are the fitted page. The table never asks with an
unmeasured size, and a resize costs one request, not one per pixel.

- [ ] The first request waits for the first measurement and carries the fitted page size; no request ever goes out with an unmeasured size or a size of 0.
- [ ] A run of frame resizes sends one request, once the size has held 300 ms.
- [ ] Until the answer, the rows that stay stand, new slots show placeholders, surplus rows leave; the table never blanks.
- [ ] A chosen page size (ticket 05) and the anchor's page (ticket 06) are what the request carries.
- [ ] In flow and with `maxHeight` the requests are as today.
- [ ] Dated amendment to ADR-0072: the first request carries the measured size, a resize requests after 300 ms of rest.
- [ ] Unit tests in the server mode tests (prior art: they assert what `onRequest` receives): first request measured; one request after a run of resizes; rows and placeholders meanwhile.
- [ ] `pnpm check table` and `pnpm check:site` pass; the server-mode demo looked at as a user while resizing.

## Comments
