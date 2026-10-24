# Shakedown: @umriss-ui/calculation 0.40.4

Status: needs-triage

A Vite 8 host with core and calculation from the packed tarballs, Chromium and WebKit, 2026-10-24. Core's
known findings are in `core.md`, cross-package ones in `cross-package.md`. ✓ = confirmed by the
coordinating session.

The package computes at full precision and rounds only on screen. 0.1 + 0.2 shows 0.3, 1,000 cents show
10.00, NaN/null/undefined/Infinity/"12" give an absent value with a reason (never zero), division by zero has
its own reason, and where the shown operands do not add up to the shown result the result carries "≈".

## Findings

1. ✓ **[Break] Rounding is wrong for money.** `evaluate.ts:47` claims "half away from zero on the exact
   decimal value", but `Number(abs.toFixed(n))` rounds the binary value: 1.005 → 1.00, 2.675 → 2.67,
   0.285 → 0.28, where `Intl.NumberFormat` and core's formats give 1.01, 2.68, 0.29. An invoice shows
   1.00 + 2.67 + 0.28 = "≈3.96".
2. **[Look] Long labels overlap the figure.** An unbreakable label lies over "12,345.67 €" at 320 px; at
   375 px "Total" collides with the double-ruled result, "EUR" touches the number, a long unit is cut.
   `LABEL_MIN_REM` (`Calculation.tsx:60`) only chooses one or two lines. Idea: `overflow-wrap:anywhere`,
   `min-width:0`, a wrapping or truncating unit with a title.
3. **[Misfit] The shown lines cannot be made to add up.** There is no per-line rounding, which invoices
   need: 3 × 10.00 € shows "≈30.01 €", a VAT split 3 × 0.83 shows "≈2.50". The "≈" is honest by design;
   per-line rounding is a wish (below).
4. **[Misfit] A tiny total rounds to 0 without "≈":** 1e-9 + 2e-9 shows "0 mg". Default places by
   magnitude, or flag a non-zero value that rounds to 0.
5. **[Misfit] Negative figures use the ASCII hyphen** ("-130.50") beside operators written "−"; the
   spoken sentence reads "equals -130.50 €". No parentheses or other negative format.
6. **[Misfit] Units are bare strings:** "€" always trails (also in English), JPY/BHD places are by hand,
   mixed units add up silently (documented: no unit algebra).
7. **[Look] Ten levels at 375 px** leave about six characters per label line; closing rows wrap into
   eight lines.
8. **[Misfit] The reason badge names only the first missing given** (four missing, "NaN is missing" shown).
9. **[Misfit] No print stylesheet:** folded levels are `hidden`, so a printout shows only what happens to
   be open, and the disclosure buttons print.
10. **[Misfit] Copying a row copies the hidden sentence** ("Invoice total equals Net amount plus VAT…")
    with the figures; mark it `user-select:none`. Selecting a figure by triple-click also toggles the row.

## Wishes

- **Per-line rounding and currency-aware numbers** (`rounding="line"`, `currency="EUR"`). Task: an invoice
  whose shown lines add up. Workaround: pre-round the givens (3 lines), losing the unrounded derivation.
  Elsewhere: Intl `style:"currency"`, Decimal.js/Dinero.js rounding modes. Unlisted.
- **A negative format** (accounting parentheses, "minus" spoken) and a unit-consistency check. Workaround:
  override `formats.number` (about 10 lines). Elsewhere: Intl `currencySign:"accounting"`, AG Grid
  `valueFormatter`. Unlisted (the unit check is a documented non-goal).
- **A print stylesheet with every level open.** Workaround: gave up. Unlisted.

## Held up

Mouse, Enter, Space and tap open a figure in both engines, with `aria-expanded`/`aria-controls` · open
state and focus survive 24 updates at 500 ms · Card, Modal, dark, root 24 px without overflow · axe finds
nothing in the component · the ARIA tree reads one sentence per line with "minus", "plus", "percent" ·
1,000 givens · 1e12 + 0.01 exact · German and Swiss grouping correct · the calculation's own d.ts is clean.
