# 02: The first example starts with the component

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/facade-defects/spec.md`

**What to build:** The first example on every page (the one without a heading) loses its empty head row. Its card shows lead, stage, then a slim foot with the "Code" toggle at the right, styled like the head-row toggle. The hero keeps its accessible name from the example's title; the toggle follows the stage in the tab order. Titled examples are unchanged.

- [ ] No example card on any page starts with an empty head row.
- [ ] The first example's "Code" toggle sits after its stage, visually and in the tab order, and opens the code.
- [ ] The first example is still named by its title for assistive technology.
- [ ] The page suite asserts both, on every demo.
- [ ] The page-head screenshot baselines of all five demos are renewed together.
