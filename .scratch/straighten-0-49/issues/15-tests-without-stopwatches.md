# 15: Unit tests fail only when behaviour breaks

**What to build:** A contributor on a busy machine sees red only for a real break: unit tests that assert elapsed milliseconds (`zone`'s 100,000 instants, the MultiSelect window's "ticks every match") assert behaviour; where speed is the point, the figure moves to the benchmark pages or a browser test with its own budget. The demo smoke tests get a timeout that fits a busy machine, or render fewer examples per test. The schedule browser test "the subtask that was clicked is told from its task's other bars" asserts with margin. Spec: `../spec.md` ("Tests without wall clocks").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] No unit test asserts a wall-clock budget (a grep over `tests-unit` for `performance.now`/`Date.now` budgets comes back empty or each remaining one is justified in a comment)
- [ ] `pnpm check` green while a second `pnpm check` runs beside it
- [ ] The schedule browser test passes ten runs in a row
