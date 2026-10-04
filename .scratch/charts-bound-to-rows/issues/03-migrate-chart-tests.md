# 03: Migrate: the charts' unit and interaction tests

**What to build:** Every unit and interaction test of the charts declares its charts through `useChart` and `value`.

**Blocked by:** 02 (Expand: `useChart` and `value`)

**Status:** done

- [x] No `accessor` and no free series, axis or `Chart` remain in the batch
- [x] Typecheck and tests green; screenshots unchanged

## Comments

Delivered. The sixteen test files that declared charts as components (boxPlot, controlChartText, controlChartViolations, dataTable, emptyState, encoding, keyboard, legendToggle, limitLabel, mount, readout, ssr, stacking, tone, wording, zoomKeys) declare them through `useChart` and `value`. Each chart is a small component that calls the hook. Where a test handed its series in from outside (encoding, tone), it now passes a function of the parts, `(parts: ChartParts<Row>) => ReactNode`. A value is a field name wherever the old accessor only read a field, and a function otherwise (`d.b ?? 0`, `d.machine + 0.5`, constants, the shifted boxes). What the tests assert has not changed.

Left as they are:
- the matrix's row `accessor` (its new name is open for 07);
- `ControlChart`'s `accessor`, because the control chart is its own component and does not take `value` yet;
- the scene-level tests (scene, materialize, sceneFrame, sceneLimitsAndBands, openPoints, tooltipFormat and the scene parts of readout, stacking and boxPlot), which build the internal `SeriesConfig` and `AxisConfig` and not the public props;
- the old-shape lines in `useChart.test-d.tsx`.

One small setup change: in dataTable's "follows new data", the rerender goes through the same `twoLines` and keeps its x domain at `"data"`. The old code wrote the tree out again and left the domain at its default. The assertion is unchanged.

Charts unit suite 730/730, typecheck and `pnpm lint` green. The visual suite was not run because no source or example changed.
