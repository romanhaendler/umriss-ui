# The charts carry their own wording

Status: accepted
Date:   2026-09

The charts had words in three places only - "No data" and two hint strings, each
an English default in a prop. Being walked by keyboard and read aloud makes
them speak whole sentences: the chart's summary, the key help, the readout of
a position. A prop per sentence does not scale, and core's register
cannot be borrowed: the charts depend on nothing (ADR-0016's reasoning, and
CONTEXT.md's).

**`@umriss-ui/charts` carries a typed `ChartsWording`, English by default, and
German as `GERMAN_CHARTS_WORDING` behind the subpath
`@umriss-ui/charts/wording/de`.** `Chart` takes it as the prop `wording`;
entries left out fall back to the English ones.

## Why the pattern of core, and not core's register

ADR-0019 settled how a second language ships: a register named after what it
labels, English in the main entry, German as freight behind a subpath, and the
type as the completeness guarantee. The charts repeat that pattern rather than
inventing a second one - but in their own register, because importing core's
would make the one package that depends on nothing depend on everything.

## Consequences

- An application using both packages passes two wordings. That is the price of
  the charts' independence, and it is paid once, at the root.
- The existing string props (`empty` and its kin) stay and win over the
  register, so no caller's text changes.
- Numbers and times keep the formats the series and axes already declare
  (`format`, `tickFormat`); the wording holds words, not formats - except one
  tag, `locale` (`en-GB`, `de-DE`): the default number and date formats of the
  axes, tooltip, data table and screen-reader text are made in it, and the
  browser's language is not read.

## Amendment 2026-10-28

Setting the wording on every `Chart` did not scale to an app: a chart inside a
dashboard widget fell back to English. `@umriss-ui/charts` exports
`ChartsWordingProvider`, which takes a partial `ChartsWording` and sets it for
every chart below it. A chart merges the English default, then the provider's,
then its own `wording` prop, so one chart can still differ. The charts still
depend on nothing: an app with both packages sets both providers, once, at the
root.
