# 16: The site's search index is under 500 kB again

**What to build:** A reader's first search opening fetches less: the index drops what it repeats (keywords equal to the title or heading, text that stands twice for one anchor) and the budget returns to 500,000. Spec: `../spec.md` ("Search index").

**Blocked by:** 04, 13 (both add documentation)

**Status:** ready-for-agent

- [ ] `pnpm build:site` green with the budget at 500,000
- [ ] Every find still lands on its page and anchor (`site.test.ts`, the site guard)
- [ ] Searching the examples' titles and a few everyday words still finds them (a test with three queries)
