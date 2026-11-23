# 02: Axe runs on every demo page

**What to build:** the axe specs of the seven demos take their pages from the demo's generated list of pages
instead of a written sample, so every page is checked (canvases excepted as today); the root README states
the aim and the check (built to WCAG 2.1 AA, checked with axe on every demo page, no conformance declared);
`CONTRIBUTING.md`'s sentence on the tolerated colour pairs is true. See the spec's "Axe on every page" and
"The statement".

You may run Playwright for this ticket: only the axe specs, one demo at a time, Chromium. A page that fails
is fixed where the fix is small and breaks nobody; anything else is reported, not silenced. Do not touch
the list of tolerated colour pairs.

**Blocked by:** 01 (same files and ports; same agent, continued)

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] No written sample of pages is left in an axe spec; a unit test holds it
- [ ] The report lists, per demo, how many pages are now checked and every page that failed with what was
      done about it
- [ ] The README paragraph stands; `pnpm check demo` and `pnpm check:site` are green
