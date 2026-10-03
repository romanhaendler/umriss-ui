# 05: Exports in the search

Status: ready-for-agent
Blocked by: 03 (One index for the site: all five packages from any demo), `api-index` 02 (API indexes for all five packages, subpaths included; the appendix goes)
Spec: `.scratch/one-search/spec.md`

**What to build:** Every entry of each package's API index joins the fragment as an `export` entry, labelled with the export name, grouped `<package> · API index`, and landing on its anchor there.

- [ ] From any demo on the built site, `useToast` and `controlLimits` land on their signatures in the API index.
- [ ] Every export entry's anchor exists (the guard stays green).
- [ ] Shell suite export probe green.
