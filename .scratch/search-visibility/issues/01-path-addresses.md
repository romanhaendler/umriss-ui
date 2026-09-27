# 01 - Path addresses in the shell

Status: ready-for-agent
Type: task

Spec: `.scratch/search-visibility/spec.md` (D4, D5, D7), ADR-0036

## Scope

- `addresses()` in `packages/demo/src/outline.ts`: `addressOf` returns
  `/<page>/` and `/<page>/#<example>`; `fromAddress` reads pathname and hash.
  Scenarios stay `/#<scenario>` on the front page.
- `Shell.tsx`: `history.pushState` + `popstate` instead of `hashchange`; the
  jump counter keeps working for two examples on one page.
- At start, an old hash address (`#/card/x`) is replaced by its path
  (`history.replaceState`), so old links and bookmarks still land.
- `build-pages.mjs`: absolute base `/umriss-ui/<package>/`. The dev and
  preview servers fall back to `index.html` for deep paths (check that Vite's
  default SPA fallback covers it).
- The comments that justify the hash (`Shell.tsx`, `build-pages.mjs`) and
  "No documentation website" in `docs/README.md` are rewritten, pointing at
  ADR-0036.

## Acceptance

- `packages/demo/checks/navigation.ts`, `shell.ts` and every package's visual
  suite pass; no baseline moves. `shell.ts:114` (`/#/…` deep link) is kept as
  the test of the forwarding.
- Unit test of `addressOf`/`fromAddress` round trip, old hash included.
