# 04: The full check

**What to build:** The three changes stand together and the package is ready for a release: the generated API reference is current, the full visual suite is green, and the screenshots of the Toast page show the one deck.

**Blocked by:** 01, 02, 03

**Status:** done

Spec: `.scratch/toasts-one-deck/spec.md` (Testing Decisions)

- [x] Unit test in the limit tests: limit 3, three `duration: 0` toasts stand, a toast of 30 s arrives; it stands in front, none of the four is pushed out, the count says 4
- [x] `pnpm --filter @umriss-ui/core props` run; `API.md` current
- [x] `pnpm check`, `pnpm check:site`, `pnpm typecheck` green
- [x] The full visual suite green; the screenshot baselines of the Toast page renewed where the deck now holds toasts of several examples, each renewed picture looked at
- [x] The changelog entry of 01 complete under **Changed**, and one line for the warning of 03
- [ ] The feature folder `.scratch/toasts-one-deck/` deleted once every ticket is done (the tracker holds open work only)
- [x] One commit, no push


- [ ] note: the feature folder is left for the coordinator, who deletes it after the code review.

## Comments

Unit test added to the limit tests. `props` run: API.md unchanged. Changelog: line for the dev warning added under Changed. Full visual suite: no screenshot baseline changed, none renewed. The suite found a real failure: `checks/ownData` rejected the demo-only `pageToast` import of ticket 02; it now reads the displayed source (`withRoot`), as a reader copies it. Other failures (calculation-dark: preview server died; one tick check in table-light) passed on rerun.
