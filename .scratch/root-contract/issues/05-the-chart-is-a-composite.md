# 05 - The chart is a composite

Status: ready-for-agent
Type: task
Size: S

Blocked by: `04-the-table-is-a-composite.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

The chart follows the table.

- **`Chart`.**
  - Its props take the HTML attributes of a `<div>` and a `ref` to that `<div>`. Charts depends on
    nothing, so it declares the `ref` itself.
  - `ref`, `id` and `data-*` reach the root that its class and style already reach.
  - `aria-label` and `aria-labelledby` go to the plot. A caller's `aria-describedby` is joined to the
    plot's own summary, the summary first.
  - `ariaLabel` is removed.
  - The chart's own effects still bind the same root: the caller's ref and the chart's own ref both
    receive it.
- **The development warning** reads "Chart without aria-label" and is satisfied by `aria-labelledby` as
  well.
- **The guard.** Charts calls the shared guard with:
  - the `Chart` that a `useChart` harness hands back, in the composite shape, with the plot as its named
    element;
  - its exports, and the parts its hook hands back, as exceptions with their reasons: they register with
    the chart or are drawn inside its root (series, axes, `Legend`, `DataTable`, `Tooltip`, limits,
    `ControlChart`).
- **README.** One line on the shape. Every `ariaLabel` in the charts' README, capabilities record, demo and
  tests, in the schedule's and the dashboard's demos that draw charts, and in core's control-room page moves
  to `aria-label`. Regenerate `API.md`.
- **Changelog** (Changed): the rename; `ref`, `id` and `data-*` now reach the root.

## Acceptance criteria

- [ ] `<c.Chart data-testid="trend" ref={r}>` puts the test id on the root, and `r.current` is that root.
- [ ] `<c.Chart aria-labelledby="h" aria-describedby="note">` names the plot by the heading, and its
      description lists the summary and then `note`.
- [ ] `ariaLabel` is a type error on `Chart`. A chart without any name warns once in development, naming
      `aria-label`.
- [ ] The guard fails if `data-*` is dropped again.
- [ ] `pnpm check charts`, `pnpm typecheck` and `pnpm check:site` pass, and `pnpm test:visual:quick charts`
      passes.
- [ ] The changelog carries one migration line per change.
