# 06 — The rest of the idiom, and series from long rows

Status: done
Type: task

Blocked by: 02, 03
Spec: "Implementation Decisions" D22, D23, D25, D26; "Out of Scope" (series
derived from a field); user stories 6, 42–44, 46

## What to build

No example and no scenario of the charts demo names a category through
positions any more. What is left after tickets 01, 03 and 05: "Tell series
apart without colour" and "Legend above or below" - months, which is what `categories` is
for - and the three scenarios that carry the idiom: the vans (the fleet on x,
and its lanes), budget against forecast (cost centres and months), and the
sprint burn-down (the holders).

And a developer with long rows - one row per service and hour - finds the
example that says what to do with them: the platform's own grouping, then one
series per group, each with its own `data`. It is two lines and it is the
caller's; the example says so in its lead.

## Acceptance

- [x] No file under the charts demo's examples and scenarios gives an axis
      `ticks` together with a `tickFormat` that looks a name up by position.
- [x] The two month examples read their rows' month and write its name through `categoryLabel` (see Comments: the rows come in order, so no list is needed).
- [x] The charts of scenario 03 that draw one mark per category hold their
      rows as literals, with the numbers they draw today; the scenarios' text
      and callouts still point at what they pointed at.
- [x] A new example on the Chart page, titled by what it shows, draws one
      series per group of long rows using the platform's grouping and
      per-series `data`; it runs as copied and has screenshot baselines.
- [x] Every example runs as copied: the own-data check passes.
- [x] Screenshots, and forced-colours baselines where they exist, are looked
      at before they are accepted.
- [x] The demo smoke test, the interaction suite and the accessibility check
      pass.

## Comments

Delivered. No example and no scenario names a category through positions.

- The two month examples read `month` - `"2026-03"`, as the ledger holds it -
  and write its name through `categoryLabel`. Not `categories`, as the ticket
  had it: the rows come in the year's order, and a list would say it twice.
- Scenario 02: each band names its `lane`, the idle bars read the plate.
  Its picture did not move.
- Scenario 03: its generator is gone; the year per cost centre and
  Marketing's twelve months stand as the rows a ledger would send, and the
  three figures are summed from them. Its picture did not move by a pixel.
- Scenario 04: the working day is a category, which is what "the weekend
  takes no room" always meant; the holders read their name.
- New on the Chart page: "Draw a series per group of long rows" - a `Set`
  for the groups and a `filter` per group, once, outside the component.
  `Object.groupBy` would be shorter and is not in the workspace's ES2022 lib,
  nor in every reader's.

One thing a reader will see: a line on a category axis no longer begins at
the plot's edge. A category axis spans its places with half a step at either
end, whatever stands on it (D12), so the first point of "Legend above or
below", of "Tell series apart without colour" and of the burn-down stands
half a step in. The two burn-down examples that place their days by their
instant (`Line`, `Tooltip`) are numeric axes with named ticks and stay.
