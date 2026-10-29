# 01: Each checkout runs the browser tests on ports of its own

**What to build:** An implementing agent in its own worktree runs its package's browser specs while another checkout does the same, and neither tests the other's build. The Playwright configuration, the `preview:demo` scripts, `test:visual:quick` and `test:visual:on-main` take a base port from the environment (default the current 4173; each package keeps its offset). A preview server is reused only when it serves this checkout (a marker the preview answers with). `test:visual:on-main` runs from a worktree (its export installs without the repository's `prepare` step, or the step skips itself outside a git checkout). CONTRIBUTING names the variable. Spec: `../spec.md` ("Per-checkout browser ports", "test:visual:on-main in a worktree").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Two checkouts run `test:visual:quick <pkg>` at the same time with different base ports, both green, each against its own build (a manual check, described in the commit body)
- [ ] A unit test of the configuration's port arithmetic (base plus offset per package, default unchanged)
- [ ] A preview server of another checkout on the port is refused, not reused (shown once by hand, the refusal message names both paths)
- [ ] `test:visual:on-main '<pattern>'` runs from a worktree
- [ ] CONTRIBUTING and the root README's check list name the variable
