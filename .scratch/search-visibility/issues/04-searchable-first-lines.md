# 04 - Searchable first lines

Status: ready-for-agent
Type: task

Spec: `.scratch/search-visibility/spec.md` (D2, D10)

## Scope

- Each published `package.json`: the `description` starts with the search
  terms ("React canvas chart library for data-dense dashboards — few chart
  kinds, drawn well, fast"); `keywords` widened by the terms of D2 that are
  true for the package (e.g. charts: `react-charts`, `line-chart`,
  `bar-chart`, `sparkline`, `canvas`, `dashboard`, `typescript`).
- Root and package READMEs: first sentence carries the terms the same way;
  links into the demo point at paths, not hashes.
- Weak page summaries in the outlines (read the generated `llms.txt`s) name
  what a searcher would type, as "also called …" already does.

## Acceptance

- Read by the user once for voice. No claim that is not true of the package.
