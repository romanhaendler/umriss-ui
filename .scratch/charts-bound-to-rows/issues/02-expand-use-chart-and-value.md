# 02: Expand: `useChart` and `value` beside the old shape

**What to build:** A developer can write a chart as they write a table: `useChart(rows)` hands back `Chart`, `XAxis`, `YAxis` and every series kind typed at the row, and a series or axis names its value as `value` - a field name or a function (ADR-0048). A series with its own `data` is typed by that `data`. Named channels (`baseline`, the box channels) take the same two forms. A field name is compared by its name, so changing it updates the chart. The free parts and `accessor` keep working beside it, so nothing else breaks yet; `data` on `<Chart>` stays accepted until the contract.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Type tests: an unknown field fails, a field of the wrong type fails, a field of another row type fails in a series with its own `data`, a function still works
- [x] The parts the hook returns keep their identity across renders
- [x] Switching `value` from one field to another redraws the series
- [x] One example written in the new shape (the first chart of the Installation page)
- [x] All existing tests pass unchanged

## Comments

Delivered. `useChart(rows)` (`src/useChart.tsx`) returns `ChartParts<Z>`: its own `Chart` (every `ChartProps` but `data`, made once, reads the rows of the latest render) and the module's `XAxis`, `YAxis` typed at `Z`, every series kind typed `<T = Z>` - a series' own `data` infers `T`. No `options` yet: the view ticket adds them. `value` on the series and axes, and the named channels (`baseline`, `median` and the box channels, `outliers` as a list field, the matrix's colour `value`), take `NumberField<T>` (or `ListField<T>`) or a function; the field types are `NoInfer`, else a misspelt name made up a row type of its own. A field name comes to one reader per name (`src/value.ts`), which `fnEqual` compares by identity, so switching the name redraws. `accessor` is optional beside `value` on Line, Area, Bar, Scatter, StateBand and the axes.

Tests: `tests-unit/useChart.test-d.tsx` (compiled by `typecheck`), `tests-unit/useChart.jsdom.test.tsx` (identity, latest rows, a switched field redraws - red without the name comparison). Installation/01 is written with `useChart`; its lead still says "accessor", kept so the screenshot stays unchanged - ticket 05 rewords it with the page. `demo/unshown.json` lists `value` on Area, Bar, Scatter and StateBand as not shown yet, until 04/05.

Open for 07: the matrix's row position is still `accessor` - its `value` is the colour (ADR-0011's value channel), so removing `accessor` needs a name for the row position.
