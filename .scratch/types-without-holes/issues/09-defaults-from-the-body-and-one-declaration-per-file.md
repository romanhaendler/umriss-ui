# 09: Defaults read from the component's body, and a declaration found in its own file

Status: done
Blocked by: 02 (Rows that are true: no `never`, no free type parameters, constraints in the header), 08 (The defaults of table, schedule and calculation move from prose into `@default`)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** Two gaps in the props reader that tickets 07 and 08 ran into. First, a component that takes its props in its body (`const { … } = props`) instead of in its parameter list shows none of those defaults: Chart, the series, the axes and LimitLine do it, and about 25 charts defaults (`xAxisId "x"`, `strokeWidth 1.5`, `padding 8`, `zoneLines true`, …) are missing from the Default column, unchecked against any `@default`. The reader reads a destructuring of the props object in the component's body the same way it reads one in the parameter list, and the conflict check of ticket 03 covers it. Second, the reader keys every interface by its bare name for the whole package, so two private interfaces with the same name in different files are mixed up (ticket 07 had to rename one in charts to stop the axes' tables showing the limit's props). Declarations are resolved through the type checker's symbol, so a name means the declaration it refers to in its own file.

- [x] A fixture component that destructures its props in its body shows its defaults in the table; a body default that contradicts its `@default` stops the reader with file and line.
- [x] A fixture with two same-named private interfaces in two files gives each table its own members.
- [x] Charts' Default column shows the body defaults (at least `xAxisId`, `strokeWidth`, `padding`, `zoneLines`); no charts default differs from its `@default`.
- [x] The parity test of the two writers still holds; lint, typecheck, test:unit green.

## Comments

Delivered in `packages/demo/src/tooling/propsReader.ts`.

**Body defaults.** A component whose first parameter is an identifier (`props`) now has every `const { … } = props` in its body read for defaults, the same way a pattern in the parameter list is read. The checker's symbol makes sure the initializer is that parameter. Component defaults are now laid over all of a table's rows, inherited ones included, because `XAxis` sets the `id` that its private `CommonProps` declares and a series sets the `xAxisId` its base declares. The conflict check of ticket 03 covers every row. It reports the member's file and line, which is the parent's where the member is inherited. One addition: where the pattern names a `const` (`laneHeight = DEFAULT_LANE_HEIGHT`), a tag may give that constant's value (`44`) instead of a name nobody can import.

**Declarations per file.** References are resolved through the checker's symbol, imports included (`declarationOf`). This covers the inheritance, the intersection parts that have a table of their own, and `belongsTo`. The cache and the "public" set are keyed by declaration, not by name. Only the type names the caller asks for are looked up by name, and an exported declaration wins over a private one of the same name.

Charts' Default column gained 35 rows, from body defaults the reader did not see before. Among them: `Chart.padding 8`; the axes' `id "x"`/`"y"`, `position` and `domain "nice"`; every series' `xAxisId`/`yAxisId`; `Line`/`Area` `strokeWidth 1.5`; `Line.markers`, `Area.fillOpacity`, `Bar.barWidth`, `BoxPlot.boxWidth` and `Scatter.radius`; `LimitLine`/`LimitBand` `severity`; `ControlChart.zoneLines true`; `Tooltip.mode "x"`. None contradicts a charts `@default`. Core, table and calculation props.json are byte-identical before and after. The declaration lookup changed no table.

Conflicts found and how they were fixed, both in `Schedule.tsx`, both with the code as the truth and neither a bug: `laneHeight` `@default 44` against `DEFAULT_LANE_HEIGHT` (= 44). The reader rule above handles it, and the tag stays. `calendar` `@default the wall clock` against `WALL_CLOCK` (= `[]`, private). The tag is now `[]`, and the description adds "Without intervals every hour counts, as on the wall clock." `intents` would have shown the private name `NO_INTENTS`, so it got `@default []`.

Tests: four new cases in `tests-unit/propsReader.test.ts`, with fixtures `fixtures/props/body.tsx` and `bodyTwin.tsx`. They cover body defaults including an inherited member, a tag giving a constant's value, a body conflict stopping with `body.tsx:35`, and two private `CommonProps` in two files each keeping their own members. The props generator runs through for all five packages. lint and typecheck are green. In test:unit, demo passes 133/133. Core failed once on a 5 s timeout in `demo-smoke` and once on an announce timer after teardown, both under a load average of about 80. Both pass when run alone, and core is untouched. Playwright: `features-page` and `features-shell` for ui-light and charts-light, under the lock: 55 passed, 2 skipped. A first run that also included schedule-light timed out starting the web servers under load and was cut down to two projects.

Baselines moved: none.

Deviations: `table/src/parts.tsx`'s `Frame` unpacks `props: TableProps<unknown>`, which is a property of its parameter and lives in another file than `TableProps`. The reader still does not read it, because defaults are only looked for in the declaration's own file. The table's output is unchanged.
