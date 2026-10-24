# 09: The table renders under happy-dom

Spec: `.scratch/shakedown-defects/spec.md` (Table: happy-dom)
Finding: `cross-package.md` 9

**What to build:** a `<Table>` renders in a test running under happy-dom.
Every read of a table head's first row tolerates a head without a `rows`
collection.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first: happy-dom as a dev dependency of table, one test under the happy-dom environment renders a Table with a header and rows and finds it by role
- [ ] Every read of the head's first row guarded
- [ ] `pnpm check table` green
- [ ] Finding 9 struck from `.scratch/shakedown/cross-package.md`
