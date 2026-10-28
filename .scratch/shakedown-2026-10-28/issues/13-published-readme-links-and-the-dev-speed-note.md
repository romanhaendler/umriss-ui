# 13: Published READMEs have no dead links, and the table names its dev-mode speed

**What to build:** A consumer reading a README on npm or in `node_modules` finds every link resolving. Today the alarms README links to `API.md` and to the workspace's standards document, and the charts README to `docs/capabilities.md` - none of which ships. Such links point to the repository by absolute URL, or are dropped where the target is not public; a site gate (`pnpm check:site`) fails on a relative link in a package README to a file the package's `files` does not ship. Table's README and capabilities say that dev mode is about ten times slower than the published production figures (100k sort: 3.5 s dev, 0.33 s production). Spec: `../spec.md` ("Published README links", "llms-full.md"); repros: `../personas/p4-jonas.md` 6, `../personas/p22-tobias.md` 4.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The new gate fails on today's alarms and charts READMEs (red first), then passes
- [ ] All seven packages' READMEs pass the gate
- [ ] Table's README and capabilities carry the dev-mode sentence
- [ ] Commit body: `Changelog alarms Fixed:`, `Changelog charts Fixed:` lines
