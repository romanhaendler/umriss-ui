# Every charts page shows its component

Status: ready-for-agent
Date:   2026-09-23
Origin: `.scratch/charts-review/spec.md`, task 1; decisions Q1-Q4, Q7, Q8.

## Problem Statement

Five pages of the charts demo - `Area`, `Bar`, `Scatter`, `StateBand` and
`Tooltip & Legend` - carry no example of their own. They are only seen inside
the composed examples of other pages, and `tests-unit/demo-smoke.jsdom.test.tsx`
keeps them as a named exception (`WITHOUT_AN_EXAMPLE`). Many of their props
are exercised nowhere: Area's `color`, `fillOpacity`, `strokeWidth`; Bar's
`color` and negative values; Scatter's `radius` and `tone`; StateBand's default
lane.

## Solution

Two to three examples per page, each showing one property (Q2). The first
shows the kind alone; a second may compose it with another kind where that is
its strength (Q3). Data is plant data from new generators in `demo/data.ts`;
existing examples and their data stay untouched (Q4). Written against today's
API - whatever snags while writing is appended as a finding to
`.scratch/charts-review/spec.md`, not worked around (Q1).

Examples do not show `Span`: it is removed in `charts-fixes` 01.

## Conventions

- Import from `"../../../src"`, `export const title`, `shows = ["../../data.ts"]`.
- A new example file is photographed automatically (`tests-visual/pages.ts`),
  light and dark; the first run needs `--update-snapshots`, and the delivery
  states the count of new pictures.
- Each issue deletes its page's entry from `WITHOUT_AN_EXAMPLE`; the last one
  deletes the list, the test that asserts it, and the paragraph in
  `demo/outline.ts` that explains it.

## Issues

01 Area · 02 Bar · 03 Scatter · 04 StateBand · 05 Tooltip & Legend · 06 Why texts
