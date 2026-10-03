# 09: Defaults read from the component's body, and a declaration found in its own file

Status: ready-for-agent
Blocked by: 02 (Rows that are true: no `never`, no free type parameters, constraints in the header), 08 (The defaults of table, schedule and calculation move from prose into `@default`)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** Two gaps in the props reader that tickets 07 and 08 ran into. First, a component that takes its props in its body (`const { … } = props`) instead of in its parameter list shows none of those defaults: Chart, the series, the axes and LimitLine do it, and about 25 charts defaults (`xAxisId "x"`, `strokeWidth 1.5`, `padding 8`, `zoneLines true`, …) are missing from the Default column, unchecked against any `@default`. The reader reads a destructuring of the props object in the component's body the same way it reads one in the parameter list, and the conflict check of ticket 03 covers it. Second, the reader keys every interface by its bare name for the whole package, so two private interfaces with the same name in different files are mixed up (ticket 07 had to rename one in charts to stop the axes' tables showing the limit's props). Declarations are resolved through the type checker's symbol, so a name means the declaration it refers to in its own file.

- [ ] A fixture component that destructures its props in its body shows its defaults in the table; a body default that contradicts its `@default` stops the reader with file and line.
- [ ] A fixture with two same-named private interfaces in two files gives each table its own members.
- [ ] Charts' Default column shows the body defaults (at least `xAxisId`, `strokeWidth`, `padding`, `zoneLines`); no charts default differs from its `@default`.
- [ ] The parity test of the two writers still holds; lint, typecheck, test:unit green.
