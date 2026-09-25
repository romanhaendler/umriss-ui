# 03 - Percent stacks

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/charts-stacking/spec.md`

## Scope

K5.

## Acceptance

- Unit tests; example.

## Comments

**2026-09-25 (agent).** Done. `normalize` on any member normalises the whole
stack - no rule about disagreeing members, so no DEV warning. Shares are taken
of the absolute sum per x, so positives and negatives together span 100; the
edges are summed in readings and scaled afterwards, because summed shares
landed beside 100 and a nice axis went on to 150 % (caught by the first
screenshot, now a unit test).

Decision beyond the spec: an axis carrying a normalised stack gets a percent
`tickFormat` of its own where it has none, from the new wording entry
`percent` (`42%` / `42 %`). Tooltip rows show the share; the total row shows
the readings' sum in the series' `format` - the one number the shares hide - so
`format` on a normalised member writes readings, not shares.

Tests: `stack.test.ts` (normalising, exactly 100, zeros),
`stacking.jsdom.test.tsx` (shares, the percent axis in both wordings, the total
in `format`). Example and screenshot: `bar--percent`, light and dark.
