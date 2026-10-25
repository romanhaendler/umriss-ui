# 01 - The ADR: a bad value keeps its verdict

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/data-quality/spec.md`
ADR:    ADR-0077, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

Write the decision as an ADR under `docs/adr/`, with the next free number at the time of writing, and add its
row to the ADR index (area: limits and alarms) with the count of decisions updated. ADR-0010 gets no
amendment: this ADR extends its reasoning, and the index row of ADR-0010 names it as "extended by". Do not
change code. The text below is the decision. Put it into the house style of the existing ADRs (title, Status,
Date, prose sections) without changing what it says.

### Decision text

**Title:** A bad value keeps its verdict

**Status:** accepted. **Date:** 2026-10.

A value arrives with three statements: its number, when it was true, and how far its source vouches for it.
umriss judged the number against its limits (the verdict) and the as-of time against two ages (the
freshness, ADR-0010). The third had no place. A screen showing a broken sensor's last number could not say
the source called it bad, except with a Badge placed by hand that no accessible name reached.

**Quality is a third axis, beside the verdict and the freshness, and nothing in this library collapses it
into either.** It has three levels, the severity of an OPC UA status code: good, uncertain, bad. The source
states it. umriss never derives it from the value, from the limits or from the age. A bad value keeps its
number, its verdict and its age, and says its quality in words.

*Why its own axis.* ADR-0010's reasoning holds word for word. The tempting implementation makes a bad value
`unknown`, or `null`. Unknown means we have no value; here we have one, and we also know the source doubts it.
Discarding the last number when the source starts doubting removes the only information on the screen. A bad
reading in alarm must still read "in alarm": a broken thermocouple that last read 905 °C is a reason to send
someone, not to look away.

*Why not a fourth freshness state.* Age and quality are independent. A sensor can report bad within the
second, and a good value can be twenty minutes old. A stale value keeps the quality its source last gave. A
bad value keeps its age. A lost connection does not make a value bad; a source that reports bad on a lost
link says so itself.

*Why three levels and no status codes.* OPC UA's status code carries a severity of two bits (good, uncertain,
bad) beside hundreds of named codes. OPC Classic's quality bits have the same three levels. The levels are what an operator acts on: trust it, double-check it, stop trusting it. The
sub-status is a protocol's vocabulary, and its reason is the application's text. The application maps its
source to a level in one line.

*Why no colour.* The danger, warning and success colours already mean a verdict, and the freshness borrows two
of them. Putting quality on the same colours would overload a channel (ADR-0011). A new hue would be one more
colour to learn, and colour alone carries no meaning anyway. Quality is said in a word and marked by a line
style under the figure, which survive forced colours and need no colour vision.

*Why `Stat` and the calculation's givens first.* They are where a value comes from a source and is read on
its own. In a calculation, a given's quality is carried up: a derived quantity has the worst quality among its
operands, because a number computed from a bad number is no better. Its freshness is not carried, because the
age belongs to the reading.

### Alternatives that were real

- **A bad value as the verdict `unknown`.** Rejected: ADR-0010's argument. It greys out the last picture at
  the moment the human most needs it, and it silences an alarm on a doubtful reading.
- **A fourth freshness state.** Rejected: age and quality are independent. A fresh bad value and a stale good
  one both exist.
- **OPC UA status codes as the prop.** Rejected: they would bind a component library to one protocol's
  vocabulary, and no component could say more with a code than with its level.
- **The hand-placed Badge, today's workaround.** Rejected: it reaches neither the tile's accessible name nor
  the calculation's result.
- **Quality on every component at once:** table cells, a chart's points and its tooltip. Rejected for now:
  the charts carry no freshness either (ADR-0010), because a chart shows the data it was given. A table cell
  and the tooltip get it through their own content, as examples, when asked.
- **A verdict colour for bad.** Rejected: see "Why no colour".

### Consequences

- Core exports the type `Quality`, and its wording gains three words, in English and German. `Stat` takes
  `quality`; its accessible name says the quality after the verdict when it is uncertain or bad.
- The calculation's `Given`, and a given written in place in a chain, take `quality`. Every derived line
  carries the worst quality of its operands, on the line and in its sentence.
- Without `quality`, or with `good`, nothing changes on any screen.
- `assess()` and `freshness()` take no quality and stay pure functions of their own axis.
- `@umriss-ui/charts` gets no quality.
- The alarms package reads core's type and words when an alarm carries a value's quality. An alarm on a bad
  value keeps its state, as an alarm on a stale source does.
- Taking the axis back would break every caller who passes `quality`, and every screen that relies on the
  word. That is why this is an ADR.

## Acceptance criteria

- [ ] The ADR exists under `docs/adr/` with the next free number and the content above, in the house style.
- [ ] The ADR index lists it, its count of decisions is updated, and ADR-0010's row names it as extending it.
- [ ] `pnpm check:site` passes (the site renders the workspace's documents).
- [ ] No source file changes.
