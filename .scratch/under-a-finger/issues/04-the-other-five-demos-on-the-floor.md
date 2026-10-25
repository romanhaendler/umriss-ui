# 04 - Table, charts, schedule, calculation and dashboard on the 24 px floor

Status: ready-for-agent
Type: task
Size: M

Blocked by: `03-the-floor-check-and-cores-targets.md`
Spec: `.scratch/under-a-finger/spec.md`

## What to build

The other five packages keep the same promise: under a finger, none of them draws a target smaller than
24 × 24 px.

- **Each package gets a spec file** that calls the shared check over its demo.
- **Fix what it finds**, in the package that draws the target, by the same two means as core: a pad on a
  glyph, or a box that grows. The known case is the table's row checkbox (16 × 16). Chart legend keys
  and the table's head controls are likely. A control from core that a package wraps is core's to fix:
  reopen 03's open list rather than patch it in the wrapping package.
- **A finding that is not a defect** stays in the open list with its reason, for example a canvas mark that
  is not a DOM target. A finding that is a defect but too big for this ticket stays there with the fix
  named, and gets a line under `## Comments`.

## Acceptance criteria

- [ ] Table, charts, schedule, calculation and dashboard each run the check, green, with an open list that
      is empty or names each entry's reason and fix.
- [ ] The table's row checkbox passes. Under a fine pointer the regular row stays 36 px and the compact row
      27 px; under a finger the compact row stays 35 px.
- [ ] `pnpm check` passes for every package, and `pnpm test:visual:quick` passes for each of the five
      demos.
