# 03 - A table column takes Intl's options: a year reads 2024

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-the-number-format-is-resolved-in-core.md`
Spec: `.scratch/number-formats/spec.md`

## What to build

The tracer bullet, end to end through core and the table. A report developer writes
`format={{ useGrouping: false }}` on a numeric year column. Under German formats, the column reads "2024"
in the cell, the list filter, the group line and the range filter's two fields. A money column writes
`format={{ style: "currency", currency: "EUR" }}` and reads "€1,234.50" in English and "1.234,50 €" in
German.

- **Core's formats.**
  - `Formats` gains `numberWith(n, options)`: a number written with Intl's options in the set's locale. It
    is built in `formatsFor`, with its formatters cached by the options' content.
  - `DEFAULT_FORMATS` and `GERMAN_FORMATS` both have it.
  - The Language page's `SAMPLES` gets a sample for it: a currency is a good one.
- **The shape.**
  - Core exports `NumberOptions`: Intl's `NumberFormatOptions` plus `decimals?: number`. `decimals` sets the
    minimum and the maximum fraction digits, and an Intl digit option given beside it wins.
  - `NumberFormat` becomes `"percent" | "count" | NumberOptions`.
  - `writeNumber` sends an object with any key besides `decimals` to `numberWith`. An object with only
    `decimals`, or with no keys, still goes to `number`.
- **No negative zero.** `number`, `count`, `percent` and `numberWith` set `signDisplay: "negative"` unless
  the options set it. -0.0004 at one place reads "0.0".
- **NumberInput** gains `grouping?: boolean`, default `true`. With `false` it writes no group separators:
  the separator measured by `separatorsOf` is struck out of `number`'s text. It reads its own text back.
- **The table.**
  - The column types take the widened `NumberFormat` for numbers; `FormatFor` follows.
  - The range filter passes `grouping={false}` to its fields when the column's format sets
    `useGrouping: false`.
  - The cell, the list filter, the group line and the footer already go through `writeNumber`.
- **The example.** The table's "Pick a standard format" example gains a year column and a money column, and
  its lead says that the object form is Intl's options.

## Acceptance criteria

- [ ] Core's formats characterisation test pins `numberWith` in both sets:
  - [ ] a currency (EUR, and JPY with no places);
  - [ ] 2024 without grouping;
  - [ ] percent with one decimal;
  - [ ] scientific notation;
  - [ ] accounting negatives;
  - [ ] -0.0004 at one place reading "0.0" through `number` as well.
- [ ] `writeNumber`'s test covers the options branch and the `decimals`-only branch.
- [ ] NumberInput's tests cover `grouping={false}` writing "2024" under German formats and reading it back.
- [ ] The table's tests show the German year as "2024":
  - [ ] in a cell;
  - [ ] in the list filter's values;
  - [ ] in both range-filter fields after leaving them;
  - [ ] in a group line.
- [ ] The table's tests show a currency column and a percent column with one decimal.
- [ ] A verdict column with an options format writes its value with it.
- [ ] An object with a key Intl does not know is a type error on a column.
- [ ] `pnpm check core`, `pnpm check table` and `pnpm check:site` pass, and the `API.md` files are
      regenerated.
- [ ] `pnpm test:visual:quick table` passes. Any baseline that changes only through the example's new
      columns is renewed and the count is stated.
- [ ] The changelogs of core and the table note `numberWith`, `NumberOptions`, the end of the negative zero,
      `grouping`, and the object form of `format`.
