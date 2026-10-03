# 02: The table's tree: First table at its own address, Pagination under Many rows

Status: ready-for-agent
Blocked by: 01 (Forwarding a moved address, first used by the charts' Installation page)
Spec: `.scratch/sidebar-tree/spec.md`

**What to build:** In the table demo:
- `First table` moves from `/table/table/` to `/table/first-table/`, and the old address, with or without an example anchor, forwards to it. The example folder is renamed so that its anchors stay the same.
- `Pagination` leaves Finding rows and opens Many rows (Pagination, Virtualisation, Manual mode).
- Prose that names the old rubric or address follows.

- [ ] `/table/table/` and `/table/table/#<example>` land on First table at `/table/first-table/` in the app and as a static forwarder, which is absent from the sitemap.
- [ ] Finding rows holds Sorting, Search, Filter, Pre-filter; Many rows opens with Pagination.
- [ ] Sidebar counts, page-head rubric labels, palette groups and `llms.txt` follow the outline.
- [ ] Shell suite probes for the table are updated and green; the guard is green.
- [ ] No `example-*` screenshot changes content.
