# 03: One index for the site: all five packages from any demo

Status: ready-for-agent
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
