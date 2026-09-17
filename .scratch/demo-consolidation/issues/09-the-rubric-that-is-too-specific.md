# 09 — The rubric that is too specific

Status: done
Type: task

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

The rubric `Operations` in the core and table demos, and `Operation` in the charts demo, is too narrow for what stands under it. In core that is `Stat`, `Sparkline` and `Meter` — a figure, a trend, a fraction, none of them tied to a producing plant. In table it is `VerdictColumn` and `AlarmList`. The name lends the library a branch it does not have.

There is a second reason, and it is the repository's own rule: the word is taken twice already. `lib/options.ts` performs *set operations*, and several component heads use *operation* for how a control is worked. One word, two meanings, which `CONTEXT.md` exists to prevent — it goes unnoticed only because a rubric has no address.

**Recommended: `Monitoring`**, in all three demos, with the specificity kept in the rubric's *sentence* rather than its name ("A value read against its limits — and its shape over time"). Alternatives considered: `Indicators` (fits core and table, not the control chart or Pareto), `Instruments` (the demo's own prose word, but metaphorical), `Data display` (too wide — the table would belong under it). Ruled out by collision: `Measures` (**Measure** is the textarea's height calculation) and `Readings` (**Reading** belongs to freshness).

**`needs-info`: the word is Roman's to pick.** Everything below holds for whichever word is chosen.

**What it costs, checked rather than estimated.** A rubric has no address, and the baselines are named after page and example (`page-stat-…`, `example-card--anatomy-…`, in charts `pareto-…`). **No link breaks and no picture moves.** To change: `demo/outline.ts` in core and table; `features-shell.spec.ts` in core (`rail.rubricId`) and table (`rail.rubricId`, `palettePage.rubricName`); in charts the outline and, if this lands before ticket 04, `Showcase.tsx` and the two `page.goto("/#operation")` calls; the rubric list in `CONTEXT.md`.

**What must not be renamed:** "the three operations packages" in `TESTS.md` and `packages/charts/STATUS.md`. There the word names the three efforts under `.scratch/` (`judging-values`, `shopfloor-instruments`, `plant-at-a-glance`), which is historically correct and stays.

## Acceptance

- No demo has a rubric called `Operations` or `Operation`.
- `pnpm test:visual` is green with no baseline modified.
- `CONTEXT.md`'s rubric list names the new word.
- `TESTS.md`/`docs/testing.md` and the charts capability record still say "operations packages" where they mean the efforts.

## Comments

**Answered and delivered.** Roman chose **`Monitoring`**. It stands in all three
demos, with the specificity in the rubric's sentence rather than in its name. The
charts demo took it directly in ticket 03, so nothing was renamed twice.

Changed: the outlines of core and table, `features-shell.spec.ts` in core
(`rail.rubricId`) and table (`rail.rubricId`, `palettePage.rubricName`), and the
rubric list in `CONTEXT.md`, which now names all three demos' rubrics. Not
changed, deliberately: "the three operations packages" in `docs/testing.md` and
in charts' capability record, where the word names the efforts under `.scratch/`.
