# Charts

Status: ready-for-agent
Release: 0.58.0 (the candidate)

Takes from the map `.scratch/release-1-0/map.md`:
[What of the charts' surface changes before 1.0](../release-1-0/issues/18-what-of-the-charts-surface-changes-before-1-0.md)
(findings `../release-1-0/research/05-the-surface-of-charts.md`, by the letters in brackets).
The mechanism of a rename is ADR-0066; what `1.0.0` promises is ADR-0083.

## Problem Statement

Charts export twenty types of their internal registry, which would freeze how a chart holds its series. A
series' verdict colour is called `tone`, which the glossary keeps for success, warning and danger. `value`
means the reading on most series, the row on a matrix and the state on a state band. A chart takes a
`div`'s `onSelect`, `title` and `color` beside its own. A limit line can be given the role `"zone"`,
which only a control chart draws. A chart without a name compiles.

## Solution

The registry's types leave the index; a series says `verdict`; `value` is the reading only; `ChartProps`
takes what does not collide; a limit's role is what a limit can be; a chart's name is required by type.

## User Stories

1. As a caller, I want `verdict` on a series, so that Tone never means a Verdict.
2. As a caller, I want `row` on `Matrix` and `state` on `StateBand`, so that `value` is always the reading.
3. As a caller, I want a chart without a name not to compile, so that a screen reader always has one.
4. As a caller, I want `onSelect` on a chart to be the chart's, not the DOM's.
5. As a caller, I want `LimitRole` to offer only what a limit line draws.
6. As a maintainer, I want the registry's types out of the index, so that the registry can change.
7. As a developer, I want a warning for two series of one name and for hiding an unnamed one.
8. As a caller, I want my old names to work for this minor with a warning that names the new one.

## Implementation Decisions

- **A rename keeps its old name for this minor** (ADR-0066): the old prop, field, type or export is marked
  `@deprecated since 0.58 - use <new>.`, stands last, works exactly as before and warns once in development
  through core's `warnDeprecated*`; where both are given the new one wins. Every caller inside the
  workspace moves in the same ticket, by a script where one rule covers many files. What cannot keep an old
  form stands under "Changed" with its migration line.
- **`tone` becomes `verdict`** on the seven series prop types (B4), values unchanged.
- **`value` is the reading only** (B3): `Matrix.value` becomes `row`, `StateBand.value` becomes `state`. `BoxPlot.median` stays.
- **The registry's types leave the index** (D1, D2): `AxisConfig`, `SeriesBase`, `SeriesConfig`, `SeriesKind`, the seven `*SeriesConfig`, `LimitConfig`, `LimitLineConfig`, `LimitBandConfig`, `LegendConfig`, `TooltipConfig`, `MaterializedSeries`, `BoxChannels`, `Padding`, `Rect`, `ResolvedTheme`, `DataTableGroup`, `ParetoOptions`. A removal: "Changed", no alias. Where a remaining public type names one of them, the worker reports it before removing. `ChartPerf` and `onPerf` stay, `@experimental`. `BoxNumbers` and `BoxExtras` stay.
- **`ChartProps`** (C8, B6) takes a `div`'s attributes without `onSelect`, `title` and `color`. "Changed".
- **`LimitRole`** (C1) on `LimitLine` and `LimitBand` is `"specification" | "control"`; `"zone"` stays inside `ControlChart`. "Changed".
- **A name is required by type** (E): `Chart` takes `aria-label` or `aria-labelledby`, one of the two. "Changed" for a chart that compiled without one; at run time nothing changes.
- **A series is identified by its `name`** (C4): a development warning for two series of one name and for hiding an unnamed one. The axis binding's three names stay, and the limit's doc says why (B1).

## Testing Decisions

- A good test drives the public surface (the hook, the component, the pure function) and reads what a
  caller gets; it does not reach into a module.
- Each rename: a case at the existing unit test of its component or hook that the new name works, the old
  one works and warns once, and the new one wins. Each changed type: a line in the package's
  `*.test-d.tsx` for what compiles and what no longer does.
- `API.md` regenerated (`check:site`) shows the new names, the deprecated ones last, and what is
  experimental under its heading.
- An existing expectation changes only where this spec decides the behaviour changes; the worker lists each.
- The coordinator runs the package's visual suite; nothing a user sees may change unless a ticket says so.

## Out of Scope

- An `id` for a series.
- The schedule's name by type (the schedule's spec).
- Removing any old name (that is `1.0.0`).
