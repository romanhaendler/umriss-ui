# The hosted site is switched off

Status: ready-for-human
Spec: `.scratch/local-docs/spec.md` (Implementation Decisions: "By the user, by hand, in this order")

## What to do

After the release with tickets 01 and 02 is on npm:

- [ ] GitHub Pages off (`gh api -X DELETE repos/romanhaendler/umriss-ui/pages`)
- [ ] the `github-pages` environment deleted, the Pages workflow's runs deleted
- [ ] the repository's website field no longer the old address
- [ ] Google Search Console: Indexing → Removals → prefix removal of `https://romanhaendler.github.io/umriss-ui/`; later Settings → Remove property
- [ ] `https://romanhaendler.github.io/umriss-ui/` answers 404

## Blocked by

01, 02
