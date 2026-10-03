# 02: The table's tree: First table at its own address, Pagination under Many rows

Status: done
Blocked by: 01 (Forwarding a moved address, first used by the charts' Installation page)
Spec: `.scratch/sidebar-tree/spec.md`

**What to build:** In the table demo:
- `First table` moves from `/table/table/` to `/table/first-table/`, and the old address, with or without an example anchor, forwards to it. The example folder is renamed so that its anchors stay the same.
- `Pagination` leaves Finding rows and opens Many rows (Pagination, Virtualisation, Manual mode).
- Prose that names the old rubric or address follows.

- [x] `/table/table/` and `/table/table/#<example>` land on First table at `/table/first-table/` in the app and as a static forwarder, which is absent from the sitemap.
- [x] Finding rows holds Sorting, Search, Filter, Pre-filter; Many rows opens with Pagination.
- [x] Sidebar counts, page-head rubric labels, palette groups and `llms.txt` follow the outline.
- [x] Shell suite probes for the table are updated and green; the guard is green.
- [x] No `example-*` screenshot changes content.

## Comments

**Delivered.** Everything follows from the table's outline, as ticket 01 laid out:
- `packages/table/demo/outline.ts`: the page `table` is now `first-table` ("First table", unchanged name); `MOVED = { table: "first-table" }` goes to `addresses(OUTLINE, MOVED)`. Pagination leaves Finding rows (now Sorting, Search, Filter, Pre-filter) and opens Many rows (Pagination, Virtualisation, Manual mode). The head comment no longer says `#/table`.
- `demo/props.ts` passes `moved`; the examples folder `Table/` is now `First-table/`, so the anchor `#first-table` is unchanged.
- `packages/demo/src/packages.ts`: the table starts at `first-table`; the comment that announced it is gone.
- The page id follows where it was named: the two scenarios' `builtFrom`, the accessibility sample in `tests-visual/pages.ts`.
- Prose: no prose outside the outline named `/table/table/`, `#/table` or Pagination's old rubric; `CONTEXT.md`'s list of the table's rubrics still holds.

**Tests.**
- Shell suite (`features-shell.spec.ts`, table-light): 24 passed. Probes: `notOnTheFrontDoor` and `deepLink.absent` name `first-table`; the neighbours are Pagination and Virtualisation, two pages of Many rows; the new `moved` probe (`/table/` → `/first-table/`, and `/table/#first-table` lands highlighted on the example).
- `pnpm build:pages`: the guard passes with 2 forwarders; `site/table/table/index.html` is the forwarder (noindex, canonical to `/table/first-table/`), absent from the sitemap. The table's `llms.txt` lists First table at its new address and Pagination first under Many rows.
- `pnpm lint`, `pnpm typecheck` green; `pnpm test:unit` green except load timeouts on a machine at load ~50 (charts `readout.jsdom`, table smoke "Grouping"); each passes when run alone, and neither touches what changed.

**Baselines.** The four images of the renamed page were renamed `*-table-*` → `*-first-table-*`; `example-first-table--first-table` light and dark pass unchanged, and so does `page-first-table` (the head reads "Getting started / First table" as before). 2 of the 62 table `page-*` images (62 before, 62 after) changed content: `page-pagination` light and dark, whose rubric label reads "Many rows" instead of "Finding rows". Both were looked at and renewed with `--update-snapshots=all -g "Seitenkopf pagination"`. All scenario images pass; no `example-*` image changes.

**Deviation.** None from the ticket. The shell's neighbours probe moved from Toolbar/Search (which stand in two rubrics) to Pagination/Virtualisation, so it is two pages of one rubric again and shows the move.

