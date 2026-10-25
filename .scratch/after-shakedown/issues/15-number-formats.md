# Number formats

Type:   grilling
Status: resolved

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

## Answer

Decided 2026-10-25 by the agent, on the maintainer's delegation. Every point is *(agent)*; three are product
calls and are marked *(agent, product - for review)*.

- **The vocabulary is Intl's, passed through, not renamed** *(agent)*. A format stays one of the two names
  umriss has (`"percent"`, `"count"`) or an object. The object is `Intl.NumberFormatOptions` plus the shorthand
  `decimals`, which sets the minimum and the maximum fraction digits at once. `{ decimals: 2 }` stays valid.
  Intl already names every format the personas wanted:
  - currency with the currency's own places (`style: "currency"`, JPY 0, BHD 3);
  - percent with decimals;
  - `notation: "scientific" | "engineering" | "compact"`;
  - significant digits;
  - `useGrouping: false`;
  - `signDisplay`, and accounting negatives (`currencySign: "accounting"`).

  A vocabulary of umriss's own would only be a translation table to keep up to date. The options are plain
  data, so they can be compared by value, and an inline object costs nothing. Serialisability is not the
  reason: "What umriss promises a Server Component" keeps every declaration in a client file.
  The locale stays where ADR-0024 and ADR-0031 put it: core's formats set, and the charts' `wording.locale`.
- **One shape in every package that writes a number as one text** *(agent)*:
  - a table's `Column` and `VerdictColumn` (`format`);
  - a chart series' `format` and an axis' `tickFormat`, which take this object besides a function.
  - Core declares the shape and resolves it once. `Formats` gains `numberWith(n, options)`, built per locale
    like the other entries. A pure `writeNumber(formats, n, format)` maps:
    - the two names to `percent` and `count`;
    - `decimals` alone to `number`, so that an application's own `number` still applies;
    - everything else to `numberWith`.

    The table uses it in its two copies of that mapping today.
  - Charts depend on nothing, so they declare the same object shape themselves and build it in their
    wording's locale. On an axis, the step decides the places unless the options set digits themselves. An
    equal inline object does not register the chart again.
- **Where the unit is typeset apart, the unit stays a label and the places stay `decimals`** *(agent,
  product - for review)*. `Stat` raises its unit, and the calculation has a unit column (ADR-0028). An
  Intl currency, compact notation or accounting parentheses would put the symbol into the figure. So the
  calculation and `Stat` take no Intl options: currency there is `unit="€"` with `decimals`. For the same
  reason the calculation gets no scientific notation and no significant digits: a reader redoes it by hand,
  so it needs fixed places. `NumberInput` takes no options either, because a field must read what it
  writes.
- **Uneven decimals in a calculation** (`composed-app.md` 5) *(agent)*. A quantity without its own `decimals`
  takes them from the quantity it is an operand of, where both carry the same unit and format. A reference
  takes them where it is defined. With `decimals={2}` on the sum, every euro line under it shows two places,
  and JPY needs `decimals={0}` once, at the top.
- **A non-zero derived number never reads 0 at the calculation's default places** (`calculation.md` 4)
  *(agent)*. Where the built-in default (two places, one for a percentage) would round a non-zero value to
  0, the default does not apply, and core's `number` writes the value, in scientific notation where it is
  tiny. A caller's own `decimals` are kept. This is the promise core's `number` already makes.
- **The year is `format={{ useGrouping: false }}`, not a column type and not a heuristic** *(agent)*. A
  heuristic would print 2,024 pieces as "2024", and a year that is only a label is a string (CONTEXT.md,
  Category). The year must read "2024" wherever the column writes it:
  - in the cell, the list filter and the group line, which all go through the same mapping;
  - in the range filter's two fields, so `NumberInput` gains `grouping` (default `true`), which the table
    sets from the column's format.
- **The sign is the locale's, like the separators** *(agent)*. Intl writes U+002D in English and German, and
  U+2212 in Swedish and Finnish. A figure pasted from umriss into a spreadsheet stays a number, and
  `NumberInput` reads what it writes. The calculation's "−" is an operator, not a sign: it is a wording
  entry, and it stays.
  - **No negative zero**: core's number entries write `signDisplay: "negative"` unless the options say
    otherwise, so -0.0004 at one place reads "0.0" (`data-science.md` 2).
- **No German wording per format.** Intl writes the locale's words and order ("6 Mrd.", "1.234,50 €"), and
  `GERMAN_FORMATS` is `formatsFor("de-DE")`, so it gets `numberWith` with no new text.
- **Out:**
  - **Per-line rounding** (`rounding="line"`) *(agent, product - for review)*: never. The calculation works
    at full precision and marks with "≈" where the shown lines do not add up (CONTEXT.md: a calculation is
    not an invoice). An amount that is legally rounded is a given that the caller rounds.
  - **SI-prefix notation** (k, M, µ, n) *(agent, product - for review)*: never built in. Intl has none, and
    `compact` is the nearest it has. On a chart it is a `format` function; in a table it is a Presentation.
  - **The calculation's `"percent"`** keeps its one default place. The table's `"percent"` stays whole per
    cent; decimals are `{ style: "percent", decimals: 1 }`.
  - **Number formats in the CSV and XLSX**: exports keep raw values (ADR-0061, `.scratch/table-xlsx/`).
  - **The figures' typography**: mono against sans in the calculation, and the raised unit
    (`design-family.md` 6). These are looks, answered by tokens (ADR-0045).
  - **Charts following the provider's language** (`composed-app.md` 4): not this decision.
- **Costly to reverse: yes.** Once columns and series take Intl's options, taking them back breaks callers.
  An ADR, "A number format is Intl's options", is the spec's first ticket, with its text in it.
- **Touches:** core (`Formats.numberWith`, `writeNumber`, the `NumberFormat` and `NumberOptions` types, the
  default with no negative zero, `NumberInput`'s `grouping`, the Language page's samples), table, charts and
  calculation. Schedule and dashboard are not touched.
- **Becomes the spec** `.scratch/number-formats/`.
