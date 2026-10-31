# 24: Calculation

Status:     done
Blocked by: None (can start immediately)

Sources: earlier-runs-open calculation.md 2, 7, 8, 10, P10-8.

- [x] A long unbreakable label wraps and never overlaps its figure; a long unit is not cut at 320/375 px.
- [x] Deep levels at 375 px keep a readable label width (the indent is capped).
- [x] The reason badge names every missing given, not only the first (`evaluate.ts:19,116`).
- [x] Copying a row copies what is visible; a triple-click does not toggle the row.
- [x] A derivation's disclosure button carries its figure in its name or description.
- [x] `pnpm check calculation`; looked at as a user at 320 and 375 px.

## Comments

**Delivered (2026-10-31, run coordinator).** A long label wraps at its cell edge, the unit wraps in the
narrow layout; the indent of deep levels is one variable, capped at 15 % of the frame when narrow; the
reason badge lists every missing given once, in operand order (`calculationMissingAll` via
`Intl.ListFormat`); the hidden sentence is not copied, a double/triple click does not fold; the
disclosure button is described by the row's sentence. Looked at 320 and 375 px: clean. Decided: the
button's name stays (tests match it), the figure comes as its description; the first click of a triple
still folds once.
