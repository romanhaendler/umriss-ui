---
name: umriss-ui
description: Build applications with umriss-ui, the React components for data-dense applications. Use when the user imports or mentions @umriss-ui/core, @umriss-ui/charts, @umriss-ui/table, @umriss-ui/schedule or @umriss-ui/calculation, or writes UmrissProvider, useTable, useChart, useSchedule, Calculation, a Gantt-style schedule, a canvas chart or a data table with these.
---

# umriss-ui

Five packages, all `0.x`: `@umriss-ui/core` (components), `charts` (canvas charts), `table`, `schedule`, `calculation`. Do not write umriss-ui code from memory. Read the documentation first; names and props change between versions.

## Where to read

1. The installed version, first: `node_modules/@umriss-ui/<package>/docs/llms-full.md`. Every page with its examples' source, its props tables, why it is built as it is, and an index of every export with its declaration. Search it for the component's name before you write a line.
2. Online, for the latest version: `llms.txt` links every page's Markdown twin.
   - <https://romanhaendler.github.io/umriss-ui/core/llms.txt>
   - <https://romanhaendler.github.io/umriss-ui/charts/llms.txt>
   - <https://romanhaendler.github.io/umriss-ui/table/llms.txt>
   - <https://romanhaendler.github.io/umriss-ui/schedule/llms.txt>
   - <https://romanhaendler.github.io/umriss-ui/calculation/llms.txt>

What changes for a caller stands in the package's `CHANGELOG.md`.

## How each package is entered

Install what you use. `table` and `calculation` take `core` as a peer; `schedule` takes `core` and `charts`; `charts` takes nothing but React 19 or newer.

```bash
pnpm add @umriss-ui/core
pnpm add @umriss-ui/table @umriss-ui/core
pnpm add @umriss-ui/schedule @umriss-ui/core @umriss-ui/charts
```

- **core.** `import { Button, Card } from "@umriss-ui/core"`. Nothing else is required: the JavaScript loads its own stylesheet, which touches nothing but the library's own elements. `UmrissProvider` is optional (density, portal target, toasts, language); it holds no theme. Light and dark follow the `color-scheme` the application sets.
- **table.** `import { useTable } from "@umriss-ui/table"`. `const { Table, Column } = useTable(rows, { rowKey })`, then `<Table ariaLabel="…">` with `<Column value="number" label="Order" />` as children. Columns are JSX, typed against their rows. Sorting, filtering, grouping and aggregates come from the column and the hook options, not from a separate configuration object.
- **charts.** `import { Tooltip, useChart } from "@umriss-ui/charts"`. `const { Chart, XAxis, YAxis, Line } = useChart(rows)`; `initialView` is read once, `setView(view)` goes to another view later and is not reported through `onViewChange`. A series is an element; its order in the JSX decides what lies over what and its palette colour.
- **schedule.** `import { useSchedule } from "@umriss-ui/schedule"`. `const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView })` (`initialView` is read once; `setView(view)` goes to another view later and is not reported through `onViewChange`); the data are `Task`, `Subtask` and `Dependency` objects, with times in milliseconds.
- **calculation.** `import { Calculation, Given, Product, Sum } from "@umriss-ui/calculation"`. A derivation is written as it is shown: operators are elements, their children are the operands, `Given` is a leaf, `Ref` reuses a quantity defined once. A chain (`Chain`, `Plus`, `Times`, `Interim`) suits a sheet read top to bottom. The library evaluates it.

## Rules that surprise

- **Tokens are the styling API; data attributes and class names are not (ADR-0045).** Restyle by overriding `--u-…` tokens (core) and `--uc-…` tokens (charts) in the cascade; the stylesheet lies in the layers `umriss.tokens`, `umriss.base`, `umriss.components`, so the application's CSS wins. Never select `[data-…]` or a generated class: they change in any version. Missing a token is a request for a token.
- **A field's width is counted in characters and never follows what it shows (ADR-0041).** A field fills the place it is given; where the place asks, it is `chars` characters wide (20 for text, select, combobox and multiselect). Do not set a field's width with `style`; say `chars`, or let the place decide. `size` sets a control's height; `ControlSizeProvider` sets it for a place.
- **Editing is controlled, and components report intents (ADR-0023).** No component changes the data it is given. The schedule lists what the application handles in `intents` (`move`, `lane`, `stretch`, `place`, …) and reports each one to `onIntent`; the application applies it to its own state. Without `intents` it is read-only. The same holds for the table's editing: it reports what was typed and applies nothing. Do not look for an undo stack.
- **English is the default wording; German is a subpath (ADR-0019).** `import { GERMAN_WORDING } from "@umriss-ui/core/wording/de"` and `<UmrissProvider language={{ wording: GERMAN_WORDING }}>`; the charts take `GERMAN_CHARTS_WORDING` from `@umriss-ui/charts/wording/de` per chart, with `wording`. A third language is an object of the wording type that the application passes.
- Fonts are not loaded (Geist is used when present). Browsers: Chrome 123, Firefox 120, Safari 17.5 or newer.

## What it deliberately does not build (ADR-0032)

Do not look for these, and do not build them on the library's internals. Do the "instead".

| Not built | Instead |
|---|---|
| Pie, donut, radar, candlestick | `pareto()` with `Bar` and `Line` for a share; a `Line` per axis for a profile |
| Log scale | the logarithm computed in the accessor and named in `tickFormat` |
| WebGL, smoothing, animation, chart export, horizontal bars | `Line step` for what was held; `canvas.toDataURL()` for a picture |
| Pivot | compute the pivoted rows and declare their columns; use grouping with aggregates |
| Cell range selection, undo | select rows; undo in the application's state |
| Dependency types, critical path, auto-scheduling | the application's planning system decides; the schedule shows the result and its findings |
| Rich text editor, carousel | a dedicated editor; a list |
| More languages than English and German, right-to-left | pass your own wording object; for right-to-left, another library |

A caller who brings a question of a data-dense application that one of these answers may reopen the decision; say so to the user instead of working around it.
