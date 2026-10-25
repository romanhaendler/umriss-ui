# 05 - A trend with pens

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Axis page, "A trend with pens", in the operations world. Three pens stand on one time axis,
each on a scale of its own. A pen list hides and shows them, and yesterday's course of one pen stands beside
today's (`operator-screens.md`, the tag-aware trend).

- **The scales.** A `YAxis` per pen, its unit as its label: two on the left, one on the right.
- **The pen list** is built from core's components: a `Checkbox` per pen, with its name, unit and value at the
  right edge, bound to the hook's `hidden` and `toggleSeries`. The lead says that an application with the
  table binds a `Table` the same way.
- **Two periods.** Yesterday's course of one pen is one more `Line`, dashed, its rows shifted by a day.
- **The lead** says that a pen is a tag of the application's historian, which the chart does not know.
- **The record.** A new "Out" entry, "A pen trend component", with that reason and the example.

## Acceptance criteria

- [ ] A jsdom test of the example: unchecking a pen hides its series, and the hook's `hidden` names it;
      checking it shows it again.
- [ ] The example's screenshots, light and dark, are new baselines and reviewed: every pen's axis carries its
      unit.
- [ ] The example renders in the demo smoke test, and the page passes the shell's page rules (`ownBase`,
      `silentPages`).
- [ ] `pnpm check charts` and `pnpm check:site` pass, and `pnpm test:visual:quick charts` passes.
