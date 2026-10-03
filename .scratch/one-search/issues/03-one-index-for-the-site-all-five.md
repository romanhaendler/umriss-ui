# 03: One index for the site: all five packages from any demo

Status: done
Blocked by: 02 (The own package's search fragment: pages, scenarios and examples with ledes, ranked by kind)
Spec: `.scratch/one-search/spec.md`

**What to build:** Each demo's build ships its fragment beside its `llms.txt`, and the pages build merges the five into `search.json` at the site root.

On first opening, the palette fetches the site index once and adds the other four packages, ignoring entries of its own. A find in another package is a full navigation to its address and anchor. A failed fetch leaves the own package working silently. No site index is fetched when the demo's base has no parent, as under the dev server.

**The pages build fails when:**
- an entry's path is not in the sitemap, or its anchor is not on the prerendered page;
- the merged index exceeds 500 kB.

- [ ] On the built site, the table demo's palette finds `Select` and opens core's Select page. Core's palette finds a table page at its anchor.
- [ ] Own-package entries do not appear twice.
- [ ] With the site index blocked, the palette still searches the own package with no error shown.
- [ ] A dangling entry or an index over budget fails the pages build, listing the offenders (guard and tooling unit tests).
- [ ] The shell suite's cross-package probe runs against the site build and is green.

## Comments

**Delivered.** `pnpm build:pages` copies each demo's fragment to
`site/<package>/search.json`, beside its `llms.txt`, and merges the five into
`site/search.json` (`siteSearch` in `packages/demo/src/tooling/site.ts`). It
weighs 175 kB today. The build's guard now runs `searchFaults` too. Every
entry's path must be a sitemap address, so a forwarder fails. Its anchor must
be an `id` on that prerendered page, and the index must stay under
`SEARCH_BUDGET` (500,000 bytes). Each offender is listed as
`search.json: "<label>" points at …`.

**Shell.** On the palette's first opening, `Shell.tsx` fetches
`${SITE}search.json` once and drops entries under `/<ownId>/`. The rest join
the own fragment, ranked by the `KIND_WEIGHT` from 02. Where the base has no
parent (`SITE === BASE`: the dev server and the test build), nothing is
fetched. A failed fetch or a bad response leaves the own package alone,
silently. Choosing another package's address was already a full navigation
in 02.

**Tests.** `tests-unit/site.test.ts`, "the site's search index":
- merging keeps both fragments in order;
- a clean index passes;
- a missing anchor, a path outside the sitemap and a forwarder are each listed;
- an index over budget is reported with its size.

The shell suite (`checks/shell.ts`) has two probes for the built site, run
where a demo gives `elsewhere`. They hand `site/` to the browser by
`page.route` at the site's real address, so they need no server and no port.
Where `site/` has not been built, they are skipped.
- Table finds `Select` under "core · Choosing" and opens `/umriss-ui/core/select/`.
- Core finds the table's "Show loading, empty, failed and no match" and lands
  at `/umriss-ui/table/row-appearance/#states`.
- Both check that an own example stands once.
- With `search.json` aborted, the palette still finds and opens an own page,
  and no alert appears.

After a fresh `pnpm build:pages`, all four probes passed in `ui-light` and
`table-light`. The rest of `features-shell` passed in `ui-light`,
`table-light` and `charts-light` (137 passed). A find's accessible name is its
label followed by its group, so the probes match the two together.

**Baselines.** None moved: nothing visible changed.

**Deviations.** Document pages (concepts-and-changelog) are not indexed,
because the spec's seven kinds do not include them. Forwarders never enter
the index: the fragment comes from the outline's pages, and the guard would
refuse one. Nothing changed for a caller of a package, so no changelog
entry.
