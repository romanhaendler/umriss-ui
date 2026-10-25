# Number formats

Type:   grilling
Status: claimed

## Question

Which number formats does umriss name, and where is a format declared once for every package?

Six personas reached for them (`.scratch/shakedown/wishes.md` section 2): currency, scientific / engineering /
SI notation, significant digits, percent with decimals, a plain integer (a numeric year prints "2.024" in
German, `reports-bi.md` 3), a consistent minus sign; calculation adds per-line rounding, currency-aware
numbers and a negative format (`calculation.md`), and uneven decimals (`composed-app.md` 5).

- `Intl.NumberFormat` already has `style: 'currency' | 'percent'`, `notation: 'scientific' | 'engineering' |
  'compact'`, significant digits and `signDisplay`. Does umriss pass its options through, name a small set of
  its own formats, or both?
- One format vocabulary across table columns, chart ticks and tooltips, calculation lines and `Figure` - or
  per package as today?
- The year: a column type, or a `useGrouping: false` default for integers that look like years?
- The minus sign (U+2212 or hyphen) and the German wording of each format.

Likely costly to reverse once columns and ticks share it: an ADR.
