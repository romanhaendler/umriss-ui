# 04 - A chart takes the same options, in its wording's locale

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr.md`
Spec: `.scratch/number-formats/spec.md`

## What to build

An application developer declares `const money = { style: "currency", currency: "EUR" }` once and passes it
to a table column's `format` and to a chart series' `format`. Under `GERMAN_CHARTS_WORDING`, the tooltip, the
data table and the readout write "1.234,50 €", and nobody hard-codes "de-DE". The charts depend on nothing,
so this ticket does not wait for core's.

- **The shape.** Charts declare and export `NumberOptions`: Intl's `NumberFormatOptions` plus
  `decimals?: number`. It is the same shape as core's, declared here because charts import nothing.
  `decimals` sets the minimum and the maximum fraction digits, and an Intl digit option given beside it
  wins.
- **The props.** Every series' `format` and every axis' `tickFormat` take a function, as today, or a
  `NumberOptions`. An options object is built with `Intl.NumberFormat` in `wording.locale`, behind the
  charts' formatter cache.
- **Ticks.** The step's places are the default. Options that set fraction or significant digits replace
  them. A currency axis therefore reads "€0", "€500", "€1,000", not "€0.00".
- **No negative zero.** The charts' built-in number formats and the options set `signDisplay: "negative"`
  unless the options set it.
- **Registration.** An options object is compared by value: an inline object equal to the last one does not
  register the series or the axis again, and a changed one relabels.
- **Everything that already follows a format follows this one too:** the tooltip, the data table, the limit
  rows, the readout and the spoken text.
- **The example.** The charts' value-format tooltip example shows an options format besides the function,
  and the props' doc lines say both forms.

## Acceptance criteria

- [ ] The tooltip-format jsdom test shows an options series format in English and in German wording, and a
      y axis' options `tickFormat` taken by the tooltip where the series has none.
- [ ] The ticks test pins an options tick format with step places, and one with its own
      `maximumFractionDigits`.
- [ ] A test shows that re-rendering with an equal inline options object does not register again, and a
      changed one relabels the axis.
- [ ] -0.0004 on a one-place axis reads "0.0".
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
- [ ] `pnpm test:visual:quick charts` passes.
- [ ] The charts' changelog notes the object form of `format` and `tickFormat`, and `NumberOptions`.
