# 11: Smaller core components - Slider, TreeView, Button, radios, Badge, Menu, Alert

Status:     done
Blocked by: 01

Sources: README 14, 29, 31, 36 (Menu), 37, 42; P9 (FileInput crosses); P10 15 (Tree `aria-selected`);
earlier-runs-open core D (Badge, buttons, TreeView title), core E (Sparkline), core-screens 6, 7, P12-2,
settle 12b.

- [x] Slider snaps on the grid from `min` with the decimals of `min` and `step` (min 0.5 step 1: 0.5 → 1.5; min 0.25 step 0.5: End → 9.75) and handles exponent steps (1e-7).
- [x] TreeView: checking while a filter is active touches only what the filter shows (`setChecked`, `toggleAll`, cascade); a long label shows in full on hover/focus; `aria-selected` only where selection exists.
- [x] Button `loading` keeps focus (`aria-disabled`, clicks ignored) instead of `disabled`; disabled buttons reach 3:1 in both themes; a danger button's focus ring reaches 3:1; a disabled primary in dark is not the brightest thing on the bar.
- [x] Radios draw as circles: `RadioGroup.module.css` sets `corner-shape: round` as Badge and Stepper do (the build's `ownStyles()` adds `squircle`); checked dot round too.
- [x] RadioGroup options stand as close as a Checkbox and a Switch stacked beside them (H5 measured ~31 px between radio rows against tight neighbours; `../reds/h5-forms/`); confirm and align.
- [x] Badge truncates with an ellipsis in a narrow parent.
- [x] Menu and RowActions open on ArrowDown/ArrowUp from the trigger (first/last item) and have typeahead (APG menu button).
- [x] Alert shows its tone by a glyph as well as colour.
- [x] Sparkline: `aria-label` sits on an element with a role (`img`).
- [x] VisuallyHidden causes no overflow in a non-positioned scroller.
- [x] Splitter's separator is visible at rest (3:1 against the surface).
- [x] FileInput's remove crosses line up across rows.
- [x] `pnpm check core`; each looked at as a user, light and dark.

## Comments

**Delivered (2026-10-31, run coordinator).** Slider grid from the decimals of `min` and `step`; TreeView
checks stop at what a filter shows, rows carry `title`; Button `loading` is `aria-disabled` + `aria-busy`
and ignores clicks (focus stays); a disabled button is repainted on the sunken surface with muted type
(looked at, light and dark - no longer the brightest block); a gapped danger focus ring; round radio dots
(looked at); Badge text ellipsis; Menu/RowActions open on ArrowDown/Up with typeahead; Alert shows a
`ToneGlyph` (now a public export); Sparkline `role=img` when named; VisuallyHidden pinned; Splitter line
visible at rest; FileInput names flex. Decided: the canon test got four reasoned exception rows (the
disabled repaint and the danger gap - opacity cannot reach 3:1); `--u-button-disabled-opacity` (added
by ticket 12 in this run) removed again, no migration needed; radio gap 8 px and leading tight like
Checkbox. Left: the VisuallyHidden overflow could not be reproduced in a browser.
