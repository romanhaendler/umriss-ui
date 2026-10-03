# 07: The charts' defaults move from prose into `@default`

Status: done
Blocked by: 03 (`@deprecated` and `@default` are read)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** Every charts prop whose description states its default gets a `@default` tag, and the sentence that only stated it leaves the description; a description left empty is rewritten into a real sentence. The Default column of the charts fills from 1 of 158 upwards.

- [x] No charts description repeats a default that its `@default` states.
- [x] Every charts prop whose description stated a default has a Default entry (e.g. `Chart`'s `height` shows `300`).
- [x] The JSDoc gate passes (no description left empty).
- [x] No destructuring default conflicts with a tag (the generator runs through).

## Comments

Delivered: every charts prop whose description stated its default now has a `@default` tag. The sentence that only stated the default is gone. The Default column of the charts went from 1 of 158 to 45 of 158. Values, shown as code: `Chart` `width` `"100%"`, `height` `300`, `wording` `DEFAULT_CHARTS_WORDING`, `encoding` `"color"`; `LimitLine`/`LimitBand` `orientation` `"y"`, `inExtent` `true`, `role` `"specification"`; `Matrix` `coloring` `{ kind: "gradient", stops: DEFAULT_GRADIENT }`; `Legend` `placement` `"top"`. Phrases: every series' `name` ("Series n", after its place), `format`, `color` and `dash`, `Area baseline`, `Chart empty`, the axes' `grid`, a limit's `axisId`, `ControlChart` `labelUpper`/`labelLower`/`violationName`, and `Tooltip render`. Every value was checked against the code that sets it. `Matrix coloring` lost its only sentence and was rewritten into a description. Two types that stand in no table yet were tagged too, for the definition block that will draw them: `MatrixColoring.range`, and `ParetoOptions.cutoff`/`collectRank`.

One more change, in charts sources only: `LimitLine.tsx`'s private `CommonProps` is now `LimitCommonProps`. The reader keys declarations by name across the package, so `XAxisProps`/`YAxisProps` were showing the limit's props in place of their own `CommonProps` (`id`, `accessor`, `label`, `tickCount`, `tickFormat`, `grid`, `ticks`). They show their own props now. The cause is still in the reader, `declarations` in `propsReader.ts`, for any later package that has two private interfaces with the same name.

Tests: the generator runs through, so no tag conflicts with a destructuring default and no description is empty. lint, typecheck and test:unit are green. In Playwright, every charts-light and charts-dark spec passed: 244 passed, 60 skipped.

Baselines moved: none.

Deviations: these were left alone. Callbacks whose absence switches a behaviour off (`onDomainChange`, `Legend onToggle`) have no default value. Destructuring defaults that no description stated were not tagged either (`xAxisId = "x"`, `strokeWidth = 1.5`, `padding = 8`, `zoneLines = true`, …). Components such as `Chart` destructure in the body (`const {…} = props`), and the reader does not read that, so these defaults do not show and no conflict check covers them. A reader fix would fill about 25 more rows. The `R-x.y` numbers were kept; `grid` now reads "Grid lines (R-4.15)."
