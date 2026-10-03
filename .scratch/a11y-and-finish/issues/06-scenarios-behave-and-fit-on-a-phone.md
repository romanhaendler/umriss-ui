# 06: Scenarios behave and fit on a phone

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** Three finishing items on the scenarios pages. The scenario's Code toggle becomes the example's toggle (same chevron, class, name "Code", `aria-expanded`). Below a stage width of 640 px a stage gets a left gutter one mark wide and every callout mark stands in it at its element's top edge. A table scenario pins its action column only while its stage is at least 640 px wide, reading the width itself; narrower, the table scrolls inside its box.

- [ ] Shell suite: a scenario toggle and an example toggle have identical markup apart from their ids
- [ ] At 390 px, on all five scenarios pages, no mark's box intersects any text box in its stage
- [ ] At 390 px no table scenario has a pinned block and no page scrolls sideways; from 640 px nothing changes
- [ ] Screenshot baselines of the scenarios pages renewed
