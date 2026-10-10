# 06 — The rest of the idiom, and series from long rows

Status: ready-for-agent
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

- [ ] No file under the charts demo's examples and scenarios gives an axis
      `ticks` together with a `tickFormat` that looks a name up by position.
- [ ] The two month examples take their order from `categories`.
- [ ] The charts of scenario 03 that draw one mark per category hold their
      rows as literals, with the numbers they draw today; the scenarios' text
      and callouts still point at what they pointed at.
- [ ] A new example on the Chart page, titled by what it shows, draws one
      series per group of long rows using the platform's grouping and
      per-series `data`; it runs as copied and has screenshot baselines.
- [ ] Every example runs as copied: the own-data check passes.
- [ ] Screenshots, and forced-colours baselines where they exist, are looked
      at before they are accepted.
- [ ] The demo smoke test, the interaction suite and the accessibility check
      pass.

## Comments
