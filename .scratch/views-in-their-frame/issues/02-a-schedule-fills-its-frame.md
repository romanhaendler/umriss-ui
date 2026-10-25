# 02 - A schedule fills its frame, never below its floor

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/views-in-their-frame/spec.md`

## What to build

ADR-0050's rule, for the schedule. Without `height`, a schedule takes its frame's height and never goes
below 400 px, which is also its height in a frame without one. A number stays a fixed height.

- **The root.** Without `height`, the root is `height: 100%` with a floor of 400 px. With a number, it is
  that number, as today. `style` still goes to the root after the schedule's own sizing, so its `height` or
  `minHeight` wins.
- **The floor, not the lanes.** In a frame without a definite height the schedule is exactly 400 px,
  however many lanes it holds: neither the lane headers nor the plot may size the root. Lanes beyond the
  plot scroll inside it, as now. Check that the grid's middle row and the header column do not hand their
  content height to the root.
- **The prop's documentation.** `height`: "Left out, the schedule fills its frame - a stretched grid cell, a
  card the grid stretches, a container of definite height - and never goes below 400 px, which is also its
  height in a frame without one. A different floor goes through `style`'s `minHeight` (ADR-0050)." Its
  `@default` says the same.
- **The examples.** Two new examples in the schedule's demo, passing the shell's page rules:
  - a schedule without `height` in a pane of fixed height;
  - one with thirty lanes in a block with no height.
- **The README** says how the schedule is sized, in the chart README's words.
- **ADR-0050** gets the schedule's amendment from the spec ("The schedule's size"), dated the day of the
  change.
- **The checks.** `@quick` checks in the schedule's visual suite, beside `features-schedule`:
  - in the pane, the root is exactly the pane's height, and it follows the pane when the pane is resized;
  - in the block, the root is 400 px, and the plot scrolls to the thirtieth lane;
  - an existing example with a numeric `height` keeps it.

## Acceptance criteria

- [ ] The three checks pass in Chromium and WebKit, and the first fails against today's fixed 400 px.
- [ ] Every existing schedule screenshot passes unchanged; an example that relied on the 400 px default in a
      taller frame is named in the commit and renewed after a look.
- [ ] The schedule's server-render test still passes.
- [ ] The prop's documentation, the README and ADR-0050 say what is stated above.
- [ ] `pnpm check schedule`, `pnpm check:site` and `pnpm test:visual:quick schedule` pass, and `API.md` is
      regenerated if the gate asks.
- [ ] The changelog notes that a schedule without `height` now fills a frame taller than 400 px.
