# 05: Exports in the search

Status: done
Blocked by: 03 (One index for the site: all five packages from any demo), `api-index` 02 (API indexes for all five packages, subpaths included; the appendix goes)
Spec: `.scratch/one-search/spec.md`

**What to build:** Every entry of each package's API index joins the fragment as an `export` entry, labelled with the export name, grouped `<package> · API index`, and landing on its anchor there.

- [x] From any demo on the built site, `useToast` and `controlLimits` land on their signatures in the API index.
- [x] Every export entry's anchor exists (the guard stays green).
- [x] Shell suite export probe green.

## Comments

**Delivered.** `exportEntries` in `packages/demo/src/search.ts` turns the API
index's model into `export` entries:
- label: the export's name;
- group: `<package> · API index`;
- address: `/<package>/api/#<anchor>`, which is `#<name>` for a value and
  `#type-<Name>` for a type.

`renderLlms` appends them after the tokens and wording.

An entry that the index only refers onwards (one with `home`) is left out,
because the search already finds it elsewhere: a component with a page is
found as that page, and a type with a props table is found through its props.
Everything else in the index joins: hooks, functions, constants, components
without a page, types without a table, and the subpaths' exports. That makes
351 exports:

| Package | Exports |
|---|---|
| core | 116 |
| charts | 96 |
| table | 97 |
| schedule | 32 |
| calculation | 10 |

`site/search.json` is now 389 kB, against a budget of 500 kB. `pnpm build:pages`
passes `searchFaults`, so every export anchor exists on its prerendered index.

**Tests.**
- `llms.test.ts`, under "the API index": the fixture's index puts exactly the
  seven exports that it alone shows into the search, with their group and
  address, and each address lands on an `id` of the prerendered index.
- Shell suite: a new required probe `exported` ("an export's name finds its
  entry in the API index") for each demo: core `useToast`, charts
  `controlLimits`, table `useTableSelection`, schedule `applyIntent` and
  calculation `MetricValues` (at `type-MetricValues`).
- New `elsewhere` finds on the built site: the table demo opens
  `/core/api/#useToast`, and the schedule demo opens
  `/charts/api/#controlLimits`. The landing check accepts an entry of the
  API index.

**Baselines.** None moved, because nothing visible changed.

**Deviations.** The ticket says "every entry" of the index. Entries that have
a page or a props table are left out, so that nothing is found twice. No
changelog entry, because nothing changed for a caller of a package.
