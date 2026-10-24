# 01: The development flag works in every toolchain

Spec: `.scratch/shakedown-defects/spec.md` (Development mode; Check of the built package, part 1)
Findings: `cross-package.md` 8 and 15

**What to build:** core, charts and table tell development from production one
way: `process.env.NODE_ENV` not being `"production"`, written literally, read
inside a guard that answers "production" where no `process` exists. No
`import.meta` stays in the source of any shipped module. A chart without
`ariaLabel` then warns during `vite dev`, core's second-provider and tree
warnings reach a developer at all, nothing warns in a production build, and
charts and table load in Jest with core's recipe. `check:dist` keeps it so.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first: `check:dist` fails when a shipped JavaScript file contains `import.meta`, and when the entry no longer contains the development-mode expression - red today on charts and table (`import.meta`) and on core (no warning shipped)
- [ ] Core, charts and table use the one rule; core's two `import.meta.env?.DEV` reads go through it
- [ ] The library build keeps the expression; core's published entry carries its warnings again
- [ ] Confirmed once by hand from the packed tarballs (`docs/agents/shakedown/`): a chart without `ariaLabel` warns in a Vite 8 dev server and not in its production build; charts and table load in a Jest 30 project with core's recipe
- [ ] `pnpm check` green for core, charts and table; `check:dist` green for all three after a build
- [ ] The two findings struck from `.scratch/shakedown/cross-package.md`
