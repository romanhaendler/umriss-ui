# Fixes without a break

Status: ready-for-agent
Release: 0.57.0 (no break)

Takes from the map `.scratch/release-1-0/map.md`: the lists marked *(agent)*, no break, at the end of each
of the surface decisions (issues 15 to 20 under `../release-1-0/issues/`), with the findings they cite
(research 04 to 09 under `../release-1-0/research/`, by the letters in brackets);
[What the demos leave unfinished](../release-1-0/issues/11-what-the-demos-leave-unfinished.md) (findings
research 11); and
[Which keyboard items of the shakedowns still stand](../release-1-0/issues/21-which-keyboard-items-of-the-shakedowns-still-stand.md)
(the legend's Tab order).

## Problem Statement

The reviews of the seven surfaces turned up what is wrong without being a question for the maintainer: a
default the doc comment states wrongly or not at all, a type declared twice, an export a changelog promised
and the index lacks, a border that reads a token declared nowhere, internal custom properties under the
public prefix, a legend drawn above the plot and reached after it by Tab, and props and kinds of value that
no example shows.

## Solution

Each package sets right its own list, without changing what any caller's code does or how it types, and the
demos show what they left out: no entry of `unshown.json` says "not shown yet".

## User Stories

1. As a caller, I want every default the code applies stated in the doc comment, so that `API.md` prints it.
2. As a caller, I want one type where two equal ones are declared (`NumberFormat`, `ZoomLimits`), so that a
   value of one fits the other.
3. As a caller, I want `lifecycleAt` exported, as the changelog of 0.47 says.
4. As a caller, I want `Tone`, and named props types for `FormFieldBoundary`, `ToneGlyph`, `CalendarGlyph`
   and a bar's three parts, so that I can type my own wrappers.
5. As a keyboard user, I want a chart's legend before its plot in Tab order, as it is drawn.
6. As a user, I want the alarm banner's border drawn.
7. As a caller who themes, I want the table's internal properties not to look like tokens.
8. As a translator, I want the parameter names in `Wording` in English.
9. As a reader of the demos, I want an example for every prop, for a list filter set through `initialView`,
   for a filter on a boolean column, and for `SearchProps.onValueChange`.
10. As a developer, I want the calculation to warn in development where `emphasis` or `rule` stand on the
    result.

## Implementation Decisions

- **One ticket per package**, each taking exactly its list. Nothing on it is a break: where an item turns
  out to change a caller's types or behaviour, the worker stops and reports, and the item waits for the
  candidate.
- **Core** (issue 16, issue 20): named props types for `FormFieldBoundary`, `ToneGlyph`, `CalendarGlyph`;
  one exported `Tone` type; `presets` typed `readonly`; the doc sentences of `UmrissConfig` and
  `useFormField`; the rules for `size` and `aria-label` written once; the seven German parameter names in
  `Wording` in English (W6); six px literals read their space token (T7). The glyphs' defaults are the
  generator's.
- **Charts** (issue 18, issue 21): `Bar.barWidth`'s doc says 0.8 (C3); the missing `@default` lines (A3);
  the legend is rendered before the plot, so Tab order follows the picture. History in doc comments goes
  with "The documents set right".
- **Table** (issue 15, issue 20, research 10 B11): core's `NumberFormat` where the two are equal (C5);
  `RowKey` wherever `string | number` is spelled out (C2); `VerdictBase` picks its shared props from
  `ColumnBase` (A13); the missing `@default` lines (E3); `TableView`'s doc comments name `folded`,
  `branches` and the row filters' conditions; the eleven internal custom properties become `--_table-*`
  (T3).
- **Schedule** (issue 19): the doc sentences on `children` and the tooltip's kinds (D1, D2); the schedule
  re-exports charts' `ZoomLimits` instead of declaring its own (C1); a named type for a bar's three parts
  (B6); where `CalendarInput` comes from (C2).
- **Calculation** (issue 17): a development warning where `emphasis` or `rule` stand on the result.
- **Dashboard**: nothing but its examples.
- **Alarms** (issue 17, issue 20): `lifecycleAt` exported; `AlarmType.returnBand.limit` optional; the doc
  sentences of `PriorityMark`, `snoozeDurations` (no "default: no default") and `AlarmList.density`;
  `AlarmBanner`'s border reads a token that exists (T1), looked at before and after by the coordinator.
- **Examples** (research 11): every entry of a package's `unshown.json` whose reason is "not shown yet"
  gets an example or, where an example cannot show it, a reason that says why; the table gains an example
  that sets a list filter through `initialView`, one that filters a boolean column, and one for
  `SearchProps.onValueChange`. An example is written the way its neighbours are and passes the shell's page
  rules. The thin demos of the dashboard and the alarms get examples only for unshown props.
- **The new `@default` lines become promises** (ADR-0083): each is the value the code applies today, read
  from the code, never from the old doc.

## Testing Decisions

- A type-only change is held by `pnpm typecheck` and the regenerated `API.md` (`check:site`).
- A behaviour that is new (the legend's order, the calculation's warning, the banner's border) gets a unit
  test at the component's existing seam; the legend's order also in the charts' keyboard spec, which the
  coordinator runs.
- New examples are held by each demo's smoke test and `unshown.json`'s gate; the coordinator looks at each
  in the browser before it is merged and runs `pnpm test:visual:quick <package>`.
- No existing test expectation changes; a custom property renamed in the table changes the tests that name
  it, and the worker lists those lines.

## Out of Scope

- Every rename, removal and changed type of the decisions (specs 6 to 10).
- The muted text; density's word.
- Examples for the members of types (`unshown.json` lists component props only).
