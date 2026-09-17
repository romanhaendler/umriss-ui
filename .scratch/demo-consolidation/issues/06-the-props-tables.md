# 06 — The props tables for the charts demo

Status: done
Type: task

Blocked by: 03

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

The largest ticket, and the one with a cost that has not been measured yet. It gives charts what the other two demos have: a props table per page, generated from `src/` and true by construction.

- `demo/props.ts` — the gate, as in core and table: ten lines naming this demo's package and outline, calling the generator in `@umriss-ui/demo/tooling/props`.
- `package.json` scripts: `props`, `predev`, `prebuild:demo`, `pretypecheck`, exactly as `packages/table` declares them. A prop without JSDoc that lands in a table then breaks `dev`, `build:demo` and `typecheck` — that is the gate, and it is the point of it.
- `demo/.generated/props.json` is generated, never committed; `.gitignore` already covers `packages/*/demo/.generated/`.

**Measure before promising.** Charts exports 29 `*Props`/`*Config` interfaces. How many of their props carry JSDoc is unknown — and the precedent is unambiguous: `demo-as-documentation` estimated "roughly sixty" undocumented props in core and the gate found **149**. So the first step of this ticket is to run the generator and count, and the second is to decide, with the number in hand, whether it lands as one ticket or as two (the gate plus the comments per component group). Record the number in the delivery note either way.

A comment says what the prop is for and what happens when it is left out — not what its type already says. The `*Config` interfaces are the registration shapes behind the components; where one of them is internal and reaches no table, it does not need comments, and the outline's `types` field is what decides that.

## Acceptance

- Every page of the charts demo shows an API table, or is a page whose `types` list is deliberately empty.
- `pnpm --filter @umriss-ui/charts typecheck` runs the gate and is green.
- No `.generated/` file is committed.
- The measured JSDoc debt is recorded in this ticket's delivery note, against the 29 interfaces.

## Comments

**Measured, then paid.** The gate found **48 props without JSDoc** across the
fourteen `*Props` interfaces that land in a table — against the 29 `*Props`/
`*Config` interfaces the spec counted, and well under core's 149. The precedent
held in direction but not in size, and 48 was one sitting's work, so it was paid
off in this ticket rather than split into two.

The distribution, for the record: `ChartProps`, `SpanProps`, `LimitBandProps` and
`ControlChartProps` 5 each; `XAxisProps`, `YAxisProps`, `StateBandProps`,
`MatrixProps`, `LineProps`, `LimitLineProps` 4 each; `AreaProps`, `BarProps`,
`ScatterProps`, `LegendProps` 1 each. Most of them were the four that repeat per
series — `xAxisId`, `yAxisId`, `data`, `name` — which already carried wordings in
`Line`, `Area`, `Bar` and `Scatter`; those wordings were reused verbatim rather
than reinvented per file.

The `*Config` interfaces stay out of the outline's `types`: they are the
registration shapes the chart passes among its own parts, they reach no table,
and the outline is what decides that.
