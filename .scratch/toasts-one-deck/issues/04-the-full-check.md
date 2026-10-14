# 04: The full check

**What to build:** The three changes stand together and the package is ready for a release: the generated API reference is current, the full visual suite is green, and the screenshots of the Toast page show the one deck.

**Blocked by:** 01, 02, 03

**Status:** ready-for-agent

Spec: `.scratch/toasts-one-deck/spec.md` (Testing Decisions)

- [ ] `pnpm --filter @umriss-ui/core props` run; `API.md` current
- [ ] `pnpm check`, `pnpm check:site`, `pnpm typecheck` green
- [ ] The full visual suite green; the screenshot baselines of the Toast page renewed where the deck now holds toasts of several examples, each renewed picture looked at
- [ ] The changelog entry of 01 complete under **Changed**, and one line for the warning of 03
- [ ] The feature folder `.scratch/toasts-one-deck/` deleted once every ticket is done (the tracker holds open work only)
- [ ] One commit, no push
