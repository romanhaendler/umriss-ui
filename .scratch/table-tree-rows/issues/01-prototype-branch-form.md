# 01 — Prototype: how a branch looks, and leaves with more fields

Status: done
Type: prototype

Blocked by: none
Spec: `.scratch/table-tree-rows/spec.md` ("How a branch looks - decided on the prototype", "Levels with more fields") · ADR-0029

## What to build

A throwaway page in `prototype/` beside the spec that the user judges rendered.
It shows an uneven organisation five levels deep (one division five levels, a
staff unit one) in the table's own look, in three branch forms side by side:

1. weight only - a branch medium, a leaf regular;
2. an open branch heads its rows - the group header's tone and line, a closed
   branch a plain row;
3. form by level - the roots as heads, below them weight only.

Beside them the two ways for leaves that carry more: absent cells (regions with
and without states), and master/detail (the employees of a unit as a table in
the leaf's detail). And form 2 with heads sticking under a sticky head, five
levels deep.

## Acceptance criteria

- [ ] The page runs in the browser, light and dark, regular and compact.
- [ ] The user has chosen a branch form and judged both ways for richer leaves.
- [ ] The decision stands in the spec's section "How a branch looks", with the
      reasons the user gave.

## Comments

**2026-10-01 (agent):** Rendered in `prototype/index.html`: the three forms plus
today's look, light and dark, over the shipped table (injected CSS on the demo's
"An uneven organisation"), and absent cells and master/detail. Waiting for the
user's choice. Seen while rendering: the row detail's expander stands beside the
fold - two chevrons on one row - and shows on a branch whose detail is empty.

**2026-10-01 (user):** "Forsche selber noch einmal nach, was da wirklich die
optimale Lösung wäre, und wende diese an." Researched (spec, "Decided"): weight
only, a stronger line above each root after the first. Built in 09.
