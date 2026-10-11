# 01 - ADR: the set of chart kinds is open

Status: done
Type: task
Size: S

Blocked by: none
Spec: `.scratch/what-umriss-is-not-2/spec.md` - W1 to W3, W6

## What to build

One ADR, the next free number, `docs/adr/NNNN-the-set-of-chart-kinds-is-open.md`,
indexed in `docs/adr/README.md` (row; "Fifty-eight" becomes "Fifty-nine"), area
"charts", status `accepted, supersedes ADR-0032 in two points`, date `2026-10`.
In the voice of ADR-0032 and ADR-0052.

**Title as a sentence:** The set of chart kinds is open, and a kind is added when
it answers a question no kind there answers better.

**Opening.** ADR-0032 called the set closed, "no renderer interface for third
parties" its sign. The need for a ranking with long names (11 Oct 2026) showed that
the sentence shuts more than its reasons do: they are against six particular kinds.

**Decision (bold):** **The set of kinds is open. A kind is added when it answers a
question that no kind there answers better, and each gets an ADR that names the
question. The library builds the kinds; there is no renderer interface for third
parties.**

**The test.** A kind's ADR (1) states the question in the reader's words, (2)
names the nearest kind and what answering with it costs the caller, (3) shows that
nothing is drawn that was not measured, (4) says how keyboard and screen reader
reach every value, (5) says how it sits beside ADR-0001: on affine axes or, with
none (Sankey, treemap), on what.

**Exclusions that stand, reasons unchanged:** pie and donut (a share reads better
from sorted bars, `pareto()`), radar (a profile reads better as a line per axis),
candlestick (candles are for markets), violin (a density estimate draws values
nobody measured), a log scale (every scale is affine, ADR-0001).

**The kinds, in order, and what each must answer:**
- *Horizontal bars, first.* A ranking with long names, read by name. Today a
  `Matrix` or a `Table`. Must show: names on y without a rotated label (the
  category axis of ADR-0052 on y), stacking and data table unchanged. Supersedes
  ADR-0032's exclusion.
- *Sankey, a case of its own.* What flows where: material from stage to stage,
  rejects by cause. Today a stacked bar per stage, which loses the links. Must
  show: conservation (in equals out, or the gap named as a finding), a table of
  links as the alternative, a walk over nodes then links.
- *A bullet graph, in core beside `Meter`.* One value against a target and bands.
  Today `Meter` plus a limit. Must show what it says that `Meter` does not (a target
  mark, a comparison) and that it has a verdict, as `Meter` has and `ProgressBar`
  has not. A component, not a chart kind.
- *A treemap, later.* The parts of a whole in two levels. Today grouping with
  aggregates in the table. Must show why area beats a sorted bar.

**Alternatives that were real:** stay closed and decline horizontal bars again
(the maintainer is the caller, ADR-0032's own door); open it for horizontal bars
only (the next request reopens it); a renderer interface for callers (rejected:
each kind then needs a stable contract for scene, hit model, accessibility and
data table, for kinds the library would not test).

**Consequences.** Each kind costs an ADR, a walk and a data table - the price of
the test. A request for pie is still answered with ADR-0032 and this one.

## Documents in the same commit

- ADR-0032 status line and index row: `accepted, superseded in two points by
  ADR-0052 (the x axis reads categories; still no band scale) and by ADR-NNNN (the
  set of kinds is open; horizontal bars are the first to come)`.
- `packages/charts/docs/capabilities.md`: in "Out" delete **Horizontal bars**; make
  **Pie, radar, candle** "**Pie, donut, radar, candle.** None answers a question a
  data-dense screen asks (ADR-NNNN)", dropping the clause "The set of kinds is
  closed (no renderer interface for third parties)"; in "Later" add the four kinds
  in order, one line each.
- `packages/charts/README.md`, "What it deliberately cannot do": "a log or band
  scale, horizontal bars, pie and radar" becomes "a log scale, pie, donut and
  radar", then: horizontal bars are the next kind to come.

## Acceptance

- [x] The ADR as above; `grep -rn "set of kinds is closed" .` finds only ADR-0032.

## Comments

- Done as ADR-0059. ADR-0032 status line and index row, `capabilities.md` (Out, Later) and the charts README brought into line; "set of kinds is closed" now stands only in ADR-0032 and a September research file.
