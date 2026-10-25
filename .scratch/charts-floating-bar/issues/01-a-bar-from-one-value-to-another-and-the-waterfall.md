# 01 - A bar from one value to another, and the waterfall

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/dev-warnings/issues/03-a-stale-series-says-so.md`
Spec: `.scratch/charts-floating-bar/spec.md`

## What to build

A report author builds a waterfall from a running sum and one `<Bar value="to" baseline="from" />`. Its
tooltip, readout and data table name each step by both edges, and no helper series exists to leak.

- **The prop.** `baseline?: Value<T>` on `Bar`, read as `Area`'s is. A gap in either edge leaves the bar out.
- **The channel.** The bar fills the baseline channel that an area's `baseline` and a stack's foot already
  fill.
- **Drawing and hit.** From the baseline to the value, either way up; width, group, hatch and forced colours
  as any bar. The hit rectangle is the drawn one.
- **The extent** is both edges; the zero foot only without a `baseline`.
- **A stack.** With `stack` or `normalize` a bar's own `baseline` is not read; its doc comment says so, as
  `Area`'s does.
- **The text.** The built-in tooltip and the readout write a series with its own baseline, a `Bar` or an
  `Area` outside a stack, as "baseline – value" in its format. The data table already does so.
- **`TooltipPoint.baseline?: number`**, present only where the series has a baseline of its own, never a
  stack's foot.
- **Change detection.** The series comparison compares a bar's `baseline` as it compares an area's, and the
  stale-series probe of dev-warnings 03 covers it.
- **`CONTEXT.md`.** The charts entry **Baseline** takes the wording in the spec.
- **The example.** "A waterfall" on the Bar page: a start total from zero, the changes as floating bars, an
  end total from zero, on a category axis. It has a tooltip and the data key. Its lead names the running sum.
- **Docs.** The doc comments, `API.md`, the capability record's Bar, Area and Tooltip rows, and the changelog
  ("Added": `Bar baseline`, `TooltipPoint.baseline`; "Changed": an area corridor's tooltip names both
  edges, with the migration line).

## Acceptance criteria

- [ ] A materialisation test: a bar with a baseline fills the channel and takes both edges into the extent,
      not zero.
- [ ] A draw test: a rise and a fall are drawn between their edges.
- [ ] A stacking test: a stacked bar ignores its own `baseline`.
- [ ] jsdom tests: the tooltip and the readout write "1,200 – 1,450" for a floating bar and for an area
      corridor; a render's hit carries `baseline`; a stacked bar's hit does not.
- [ ] A jsdom test of the waterfall example's data: the data table has one row per step with both edges, and
      no row or column names a helper series.
- [ ] A type test accepts `baseline` as a number field and refuses a string field.
- [ ] The waterfall's screenshots, light and dark, are new baselines and reviewed; the corridor example's
      screenshots are unchanged.
- [ ] `CONTEXT.md`'s **Baseline** reads as in the spec.
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
- [ ] `pnpm test:visual:quick charts` passes.
