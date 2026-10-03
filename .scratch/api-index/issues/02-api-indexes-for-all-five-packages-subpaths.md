# 02: API indexes for all five packages, subpaths included; the appendix goes

Status: ready-for-agent
Blocked by: 01 (The API index of calculation, end to end)
Spec: `.scratch/api-index/spec.md`

**What to build:** `/core/api/`, `/charts/api/`, `/table/api/`, `/schedule/api/` join calculation's. Subpath entries of each package's exports map are listed in a group per subpath, named by its import path. A function or hook named in a page's prose or import line links to its index anchor. A constant that is a wording or format directory carries a sentence linking to the Language page. The llms appendix "The rest of the API" and its filter are removed; the llms guard stays green through the index.

- [ ] All five indexes exist, prerendered, in the sitemap, last in their sidebars.
- [ ] All 16 hooks and 91 functions stand on their package's index with their declaration.
- [ ] A subpath export (e.g. the German wording) is grouped under its import path; fixture test covers it.
- [ ] Built-site guard: every name of every entry and subpath has an anchor on its index; the build fails on one missing.
- [ ] The appendix no longer exists in `llms-full`, and the llms completeness guard is green.
