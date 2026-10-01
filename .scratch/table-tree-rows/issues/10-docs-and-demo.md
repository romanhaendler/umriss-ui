# 10 — Documentation and the demo page "Tree rows"

Status: done
Type: task

Blocked by: 04, 05, 06, 07, 08, 09
Spec: `.scratch/table-tree-rows/spec.md` ("Further Notes", "Glossary")

## What to build

A page "Tree rows" under the demo's grouping rubric, examples from simple to
full: a small tree; an uneven organisation five levels deep with its employees
as master/detail; regions with and without states as absent cells; search with
path rows; open branches kept in a view; the recipe that nests flat data with a
parent id. "When to use something else": values the rows share → Grouping; a
hierarchy without figures → `TreeView`. `CONTEXT.md` gains **Tree rows** and
**Path row**; `llms-full.md` regenerated; changelogs for table and core.

## Acceptance criteria

- [ ] The page renders prerendered and passes the demo smoke test.
- [ ] Every example is a working table, not a screenshot.
- [ ] Glossary entries and the level counting (zero in the glossary, one in aria and export) are stated.
- [ ] `llms-full.md` and changelogs are updated.

## Comments

**2026-10-01 (agent):** The page "Tree rows" stands under Grouping with five
examples (small tree, uneven organisation with search and footer, regions with
absent cells, employees as master/detail, nesting a flat list). `CONTEXT.md`
has **Tree rows** and **Path row**, and the **Filtered set** names the tree's
rule. The changelogs and `llms-full.md` follow with the release commit, as for
every feature.
