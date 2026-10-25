# The hosted site is switched off

Status: ready-for-human
Spec: `.scratch/local-docs/spec.md` (Implementation Decisions: "By the user, by hand, in this order")

## What to do

After the release with tickets 01 and 02 is on npm:

- [x] GitHub Pages off (`gh api -X DELETE repos/romanhaendler/umriss-ui/pages`)
- [x] the `github-pages` environment deleted, the Pages workflow's 90 runs and 89 deployments deleted
- [x] the repository's website field no longer the old address (now the npm org)
- [ ] Google Search Console: Indexing → Removals → prefix removal of `https://romanhaendler.github.io/umriss-ui/`; later Settings → Remove property
- [x] `https://romanhaendler.github.io/umriss-ui/` answers 404

## Blocked by

01, 02

## Comments

2026-10-25: everything above but the Search Console was done with `gh` right after 0.41.1 was pushed. What stays is the user's, in the Search Console's own interface.
