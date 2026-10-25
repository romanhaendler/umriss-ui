# A number format is Intl's options

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Number formats" (its Answer holds every decision
below); findings `.scratch/shakedown/wishes.md` section 2, `reports-bi.md` 3 and 8, `composed-app.md` 5,
`data-science.md` 2 and 3, `design-family.md` 6, `calculation.md` 3 to 5; ADR-0024, ADR-0028, ADR-0031.

## Problem Statement

Six personas reached for a number format that umriss does not have, and each package had its own answer:

- **The table** knows three formats: whole per cent, a count, and fixed decimals.
  - There is no currency: the unit goes into the header.
  - There is no percent with decimals: 0.256 reads "26%".
  - There is no scientific notation and no significant digits.
  - There is no plain integer: in German, a numeric year reads "2.024" in the cell and in the filter list.
  - An object the type does not know (`{ style: "percent" }`, past the compiler with a cast) renders
    "0,0 +0,0" without a word.
- **The charts** take a function, so everything is possible there. The caller hard-codes the locale that the
  chart's wording already holds. A bound `Intl.NumberFormat#format` written inline is compared by identity
  and registers the chart again.
- **The calculation** shows "51.6 €" beside "56.28 €". An inner product does not take the `decimals={2}` of
  the sum above it, so every euro line needs its own. A tiny total such as 1e-9 + 2e-9 reads "0 mg", with no
  "≈".
- **Every package** writes "-0.0" for a negative number that rounds to zero.

The decimal separator and the grouping are already one fact, held in core's formats. The kind of format is
not: it is three shapes in three packages.

## Solution

**A number format is the vocabulary of `Intl.NumberFormat`, passed through.** A format is:

- one of the two names umriss has, `"percent"` and `"count"`; or
- an object: Intl's options, plus the shorthand `decimals` for a fixed number of places.

The table's columns, the chart's series and the chart's axes all take the same object. It is written in the
locale of the language in use:

- core's formats for the table;
- the chart's wording for the charts.

The two names and `{ decimals }` keep their meaning, so no existing caller changes.

- **A year** is `format={{ useGrouping: false }}`. It reads "2024" in the cell, the list filter, the group
  line and the range filter's fields.
- **Money** is `format={{ style: "currency", currency: "EUR" }}`. The symbol stands where the locale puts it,
  and the places are the currency's own.
- **Percent with decimals** is `{ style: "percent", decimals: 1 }`.
- **Scientific, engineering and compact** are `notation`, and significant digits are Intl's.
- **Accounting negatives** are `currencySign: "accounting"`.
- **Every number entry** writes a negative number that rounds to zero as "0", never "-0".

The sign of a number is the locale's, as its separators are.

Where a component typesets its unit apart from the figure, the unit stays a label and the places stay
`decimals`:

- `Stat` raises its unit;
- the calculation has its own unit column.

In the calculation, `decimals` now carry down to every operand that has the same unit and format. A non-zero
number never reads 0 at the calculation's default places.

## User Stories

1. As a report developer, I want a numeric year column to read "2024" in German, so that years do not look
   like thousands.
2. As a report developer, I want the year to read the same in the list filter, the range filter's fields
   and the group line, so that one column has one notation.
3. As a report developer, I want the year to stay a number, so that it sorts, range-filters and exports as
   one.
4. As an application developer, I want a money column to write the currency where the locale puts it
   ("€1,234.50", "1.234,50 €"), so that I don't put the unit in the header.
5. As an application developer, I want a JPY column to have no decimals and a BHD column three, without my
   counting them, so that each currency reads as its users expect.
6. As a finance developer, I want accounting negatives "(€1,234.50)" in a table column, so that a ledger
   reads as one.
7. As a data scientist, I want percent with decimals, so that 0.256 reads "25.6%" and 0.0004 does not read
   "0%".
8. As a data scientist, I want scientific and engineering notation and significant digits on a column, an
   axis and a tooltip, so that 6.02e23 is not 24 digits.
9. As a data scientist, I want -0.0004 at one place to read "0.0", so that a sign never stands on a zero.
10. As an application developer, I want to declare a money format once and pass the same object to a table
    column and a chart series, so that money looks the same in both.
11. As an application developer, I want a chart's options format written in the chart's wording's locale,
    so that I don't hard-code "de-DE" in a formatter.
12. As an application developer, I want an inline options object on a series or an axis not to register the
    chart again on every render, so that writing it inline costs nothing.
13. As an application developer, I want an axis with an options format to keep places that follow the step,
    unless my options set digits, so that a currency axis is not "€0.00, €500.00, €1,000.00".
14. As an application developer, I want `"percent"`, `"count"` and `{ decimals }` to keep their meaning, so
    that no column I wrote changes.
15. As an application developer who replaced `number` in my formats, I want `{ decimals }` to still go
    through my function, so that my override keeps applying.
16. As a TypeScript user, I want an invalid key on a format to be a type error, and an invalid combination
    (currency without a code) to fail loudly, so that a format never renders garbage in silence.
17. As a calculation author, I want `decimals={2}` on a sum to apply to every line under it in the same unit,
    so that "51.6 €" no longer stands beside "56.28 €".
18. As a calculation author, I want a line in another unit (hours under a euro product) to keep its own
    places, so that the carried places do not reach a different kind of figure.
19. As a calculation author, I want a tiny non-zero total not to read "0 mg", so that the derivation never
    states something false.
20. As a calculation reader, I want each figure's sign written the way the locale writes it, and the
    operator "−" kept as an operator, so that the sign and the operation stay distinct.
21. As a German application developer, I want every new format in German through `GERMAN_FORMATS`, with no
    new import, so that my language is still two lines.
22. As a reader of the Language page, I want the new formats entry listed with an English and a German
    sample, so that I see what each set writes.
23. As the maintainer, I want the number-format mapping in one place in core, so that the table's two copies
    of it cannot drift.
24. As the maintainer, I want an ADR that records why the vocabulary is Intl's and where the unit stays a
    label, so that no one invents a parallel set of names later.

## Implementation Decisions

- **The shape.**
  - Core exports `NumberOptions`: Intl's `NumberFormatOptions` plus `decimals?: number`. `decimals` sets the
    minimum and the maximum fraction digits; an explicit Intl digit option given beside it wins.
  - Core exports `NumberFormat`: `"percent"`, `"count"` or a `NumberOptions`.
  - The table's exported `NumberFormat` becomes core's; `VerdictColumn` drops its local copy.
  - Charts depend on nothing, so they declare and export the same `NumberOptions` shape themselves. Their
    `format` and `tickFormat` take a function or a `NumberOptions`. Charts have no `"percent"` or `"count"`
    names.
- **Core's formats.** `Formats` gains one entry: `numberWith(n, options)`.
  - It is built in `formatsFor` like the others, so the locale stands once.
  - Its formatters are cached by the options' content.
  - It takes pure Intl options; `decimals` is expanded before it.
  - `DEFAULT_FORMATS` and `GERMAN_FORMATS` get it without new text.
  - The Language page's samples include it, because `SAMPLES` is typed by `Formats`.
- **The mapping.** Core exports one pure function, `writeNumber(formats, n, format?)`:
  - `"percent"` goes to `percent`;
  - `"count"` goes to `count`;
  - nothing, or an object whose only key is `decimals`, goes to `number`, so that an application's own
    `number` applies;
  - every other object goes to `numberWith`.

  The table's `asText` and `VerdictColumn` call it in place of their own mapping. The table's footer
  places for a sum or an average stay as they are, for a column without a format.
- **No negative zero.** Core's `number`, `count`, `percent` and `numberWith` set
  `signDisplay: "negative"`, and so do the charts' built-in number formats and their options formats.
  Options that set `signDisplay` themselves win. The calculation already writes no "-0" and is not touched
  for it.
- **The sign.** Every figure carries the sign Intl writes for the locale. No package replaces it. The
  calculation's operator symbols stay wording entries.
- **NumberInput.** It gains `grouping?: boolean`, default `true`.
  - With `false`, it writes no group separators: the text from `number`, with the separator measured by
    `separatorsOf` struck out. It still reads what it writes, and an application's own `number` still
    applies.
  - The table's range filter passes `grouping={false}` when the column's format sets `useGrouping: false`.
- **Charts.**
  - An options `format` or `tickFormat` is built with `Intl.NumberFormat` in `wording.locale`, behind the
    existing formatter cache.
  - On an axis, the step's places are the default. Options that set fraction or significant digits replace
    them.
  - Registration compares an options object by value, so an inline object does not register the chart
    again. A changed object relabels.
  - Tooltip, data table, limits and readout already follow the series' and the axis' format, so they need no
    change.
- **The calculation.**
  - **Carried places.** When the model is read, a quantity without its own `decimals` takes those of the
    quantity it is an operand of, where both have the same `unit` and `format`. This holds down the whole
    tree and through a chain's interims. A `Ref` takes its places where its quantity is defined. Carried
    places count as the caller's: they are padded, and they decide the "≈".
  - **Never reads 0.** A derived non-zero value that would round to 0 at the built-in default places is
    shown without fixed places. Two places is the default for a derived number, one for a percentage. Core's
    `number` then writes the value, in scientific notation where it is tiny. The "≈" follows from the
    places as shown.
  - **Unchanged.** The calculation's `format` stays `"percent"`, and its `unit` stays a label in the unit
    column (ADR-0028).
- **Unchanged elsewhere.** `Stat` keeps `unit` and `decimals`. Schedule and dashboard are not touched.
  Exports keep raw values.
- **ADR.** One new ADR, "A number format is Intl's options". Its text is the first ticket. The coordinating
  session gives it its number.

## Testing Decisions

- A good test here asserts on the text a reader sees for a value and a format, in English and in German. It
  never asserts on a cached formatter or on internal state.
- **Core.**
  - The characterisation test of the formats pins `numberWith` in both sets: a currency, a year without
    grouping, percent with a decimal, scientific notation, and -0.0004 at one place.
  - A unit test pins `writeNumber`'s mapping, including that `{ decimals }` goes through an application's
    own `number`.
  - NumberInput's existing tests gain `grouping={false}`, for writing and for reading back.
- **Table.**
  - `values.test` pins `asText` with options.
  - The column filter's existing tests pin the year in the list filter and in the range filter's fields,
    under German formats.
  - The verdict column is pinned with an options format, and the old local type is gone.
- **Charts.**
  - The tooltip-format jsdom test gets an options series format in a German wording.
  - The ticks test gets an options tick format, with step places and with the options' own digits.
  - A registry test checks that an equal inline object does not register again and a changed one does.
- **Calculation.**
  - The model and evaluation tests pin the carried places: the same unit takes them, another unit does not,
    a reference takes them where it is defined.
  - They pin the tiny derived total that no longer reads 0.
  - The calculation's own test renders the composed-app case: a sum with `decimals={2}` and inner products
    in €.
- **Examples.** The table's "Pick a standard format" example gains a year and a money column, and the
  charts' value-format tooltip example shows an options format. The demos' own smoke tests cover both.
- Prior art:
  - `formatsCharacterisation.test.tsx` pins both sets against one instant;
  - `values.test.ts` covers the table's text per kind;
  - `tooltipFormat.jsdom.test.tsx` covers the tooltip's format resolution;
  - `evaluate.test.tsx` covers rounding and "≈".

## Out of Scope

- **A vocabulary of umriss's own** ("currency", "year", "scientific" as names), and a year column type or a
  heuristic for numbers that look like years.
- **U+2212 for every figure.** The sign is the locale's.
- **Per-line rounding in the calculation** (`rounding="line"`): never. A legally rounded amount is a given
  the caller rounds, and "≈" stays honest.
- **Intl options on the calculation, `Stat` and `NumberInput`**: currency, notation, significant digits and
  accounting parentheses. Their unit is typeset apart, or the field must read what it writes.
- **SI-prefix notation** (k, M, µ, n). Intl has none: it is a function on a chart and a Presentation in a
  table.
- **A different default for the table's `"percent"`** (it stays whole per cent) or for the calculation's
  (it stays one place).
- **Number formats in the CSV or the XLSX sheet.** Exports carry raw values; see `.scratch/table-xlsx/`.
- **The figures' typography**: mono against sans, and the raised unit against a flush one
  (`design-family.md` 6). These are tokens, by ADR-0045.
- **Charts reading the provider's language** (`composed-app.md` 4).
- **A spoken word for a figure's sign** in the calculation's sentence. The figure stays as the locale writes
  it.

## Further Notes

- **Browsers.** `signDisplay: "negative"` is supported by every engine since 2023. An engine without it
  throws a RangeError rather than writing wrongly.
- **Invalid options.** Intl throws on an invalid combination, such as a currency without a code, and the
  library does not catch it. A key Intl does not know is a type error on an object literal. With a cast it
  is ignored, which is Intl's behaviour, and no longer renders garbage.
- **Server Components.** Columns and series stay declared in a client file, as the map's ticket "What
  umriss promises a Server Component" decided. That a format is now data changes nothing there. That
  ticket's hydration-safe formats cover the instant members only, and `numberWith` is not one of them.
