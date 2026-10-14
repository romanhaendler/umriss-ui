# 08: Documentation, site and workspace

**What to build:** A developer who meets umriss finds the dashboard: on the site's front page and hub, in the package's own demo with its pages, limits and a scenario that walks through the reader's day, and in every place the workspace names its packages. Where core's documentation says that tiles are not arranged by the user, it now points to the dashboard. See `spec.md` (The workspace) and ADR-0064.

**Blocked by:** 02, 04, 05, 06, 07

**Status:** ready-for-agent

- [ ] The package has a README in the style of the other packages, with its place in the family (depends on core only).
- [ ] The demo's outline states the dashboard's limits and points to ADR-0064 for what is not yet and never.
- [ ] A scenario page walks through prototype 2's four guided cases with real umriss widgets inside: other monitors, rearranging, when something goes wrong, what the application governs.
- [ ] Core's outline lines for `Grid` and `Splitter` that say tiles are not arranged by the user point to `@umriss-ui/dashboard` instead.
- [ ] The package is named in CLAUDE.md's package list and dependency sentence, in `docs/README.md`'s map, on the site's front page and hub and in the plain-text summaries the site generates for agents.
- [ ] `pnpm check`, `pnpm check:site` and `pnpm typecheck` pass for the whole workspace; the full visual suite passes for the dashboard demo.
- [ ] The spec's status becomes `done` with a delivery report under `## Comments`, and this folder's tickets are closed out per `docs/agents/issue-tracker.md`.
