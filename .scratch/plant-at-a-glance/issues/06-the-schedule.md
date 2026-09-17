# 06 — The schedule as a composition

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`
Blocked by: 05

## Scope

The Belegungsplan, assembled from parts that already exist.

- **It is a documented composition, not a component**: a chart, a span series, a y
  axis whose domain is the lane count and whose `tickFormat` names the resources,
  and an x axis which may carry an operating calendar from
  `shopfloor-instruments`.
- **No wrapper component in this ticket.** Wrapping it would mean owning the axis
  formatting, which is the part a caller most wants to control. If the composition
  turns out to have more pieces than a caller can wire correctly — the test being
  whether the demo's version and a second caller's version diverge — a thin
  convenience is added then, the way `<ControlChart>` earned its.
- The demo is the documentation.

## Acceptance

- A screenshot tile: resources down the side, time across the top, with an
  **overlap**, an **idle gap** and an **open-ended span** all visible, in both
  themes.
- The same tile with an operating calendar on the x axis, proving the two bundles
  compose. This can be the same tile if it stays readable.
- axe passes in both themes.
- Scene tests: the composition registers what it says it does, and the lane count
  matches the axis domain.

## Notes

The tile is the deliverable here, and its content is chosen: overlap, gap, open
end. Those three are exactly what distinguishes this from a state band, and a
screenshot showing three tidy adjacent bars would prove nothing and look better.

If the composition feels awkward to write while building the tile, that is
evidence for the convenience component — record it in the ticket rather than
building it, so the decision is made on two call sites rather than one.
