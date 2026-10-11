# The set of chart kinds is open, and a kind is added when it answers a question no kind there answers better

Status: accepted, supersedes ADR-0032 in two points
Date:   2026-10

ADR-0032 called the set of chart kinds closed, with "there is no renderer
interface for third parties" as its sign. The need for a ranking with long
names (11 October 2026) showed that the sentence shuts more than its reasons
do: the reasons are against six particular kinds, not against a seventh.

**The set of kinds is open. A kind is added when it answers a question that no
kind there answers better, and each gets an ADR that names the question. The
library builds the kinds; there is no renderer interface for third parties.**

## The test

A kind's ADR:

1. states the question in the reader's words;
2. names the nearest kind and what answering with it costs the caller;
3. shows that nothing is drawn that was not measured;
4. says how keyboard and screen reader reach every value;
5. says how it sits beside ADR-0001: on affine axes or, with none (Sankey,
   treemap), on what.

This ADR decides no kind. It decides what the deciding must show.

## The exclusions that stand

Their reasons are unchanged: pie and donut (a share reads better from sorted
bars, `pareto()`), radar (a profile reads better as a line per axis),
candlestick (candles are for markets), violin (a density estimate draws values
nobody measured), a log scale (every scale is affine, ADR-0001).

## The kinds, in order, and what each must answer

- **Horizontal bars, first.** A ranking with long names, read by name. Today
  a `Matrix` or a `Table`. Must show: names on y without a rotated label (the
  category axis of ADR-0052 on y), stacking and data table unchanged. This
  supersedes ADR-0032's exclusion ("bars grow along the y axis"): a kind named
  as the first to come cannot also stand under "never".
- **Sankey, a case of its own.** What flows where: material from stage to
  stage, rejects by cause. Today a stacked bar per stage, which loses the
  links. Must show: conservation (in equals out, or the gap named as a
  finding), a table of links as the alternative, a walk over nodes then links.
- **A bullet graph, in core beside `Meter`.** One value against a target and
  bands. Today `Meter` plus a limit. Must show what it says that `Meter` does
  not (a target mark, a comparison) and that it has a verdict, as `Meter` has
  and `ProgressBar` has not. A component, not a chart kind.
- **A treemap, later.** The parts of a whole in two levels. Today grouping
  with aggregates in the table. Must show why area beats a sorted bar.

## What it supersedes

- ADR-0032 stays in its other points. Its sentence "the set of kinds is
  closed" falls, and so does the exclusion of horizontal bars.

## Considered Options

- **Stay closed and decline horizontal bars again.** The maintainer is the
  caller, which is ADR-0032's own door.
- **Open it for horizontal bars only.** The next request reopens it.
- **A renderer interface for callers.** Each kind would then need a stable
  contract for scene, hit model, accessibility and data table, for kinds the
  library would not test.

## Consequences

- Each kind costs an ADR, a walk and a data table - the price of the test.
- A request for pie is still answered with ADR-0032 and this one.
