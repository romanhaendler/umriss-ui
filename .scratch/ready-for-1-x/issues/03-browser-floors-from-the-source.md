# 03: The browser floors are derived from the source

**What to build:** one table of the platform features the packages' `src` uses, each with the first Chrome,
Firefox and Safari that ship it and the address of the compatibility data it was checked against (look each
up now; do not write a version from memory). The floor per browser is the highest of its column. A unit test
scans `src` and fails when a construct outside the baseline has no row, and when a document states a floor
other than the derived one. The floor is stated in full in the root README; every other place that states
it (four documents and `skills/umriss-ui/SKILL.md`) points there or is held by the test. See the spec's
"Browser floors"; findings `.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md` B13 and
`.scratch/release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet, with web access for the compatibility data)

- [ ] The table covers at least `light-dark()`, `:has()`, the `popover` attribute, `text-wrap: balance`,
      `@starting-style` and whatever else the scan finds
- [ ] The test fails on a fixture with an unknown at-rule and on a document with another floor
- [ ] The report names the three derived floors and what raised each, and the old ones
- [ ] `pnpm check demo` (or the package the test lives in) and `pnpm check:site` are green
