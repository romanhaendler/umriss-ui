# The summary always names labelled limits, and the tooltip only on request

Status: accepted
Date:   2026-10

A `LimitLine` or `LimitBand` told a reader through colour and a label painted
in the axis band. Looked at before anything was changed: the label is on the
plot, in an HTML layer; the summary for a screen reader named no limit; the
tooltip and the readout after a key named none either
(`.scratch/charts-bin-and-limits/spec.md`). Both gaps were real. Nothing else
about limits changes.

**The summary always names a chart's labelled limits; the tooltip names them
only when it is given `limits`.**

- **The summary** gets one sentence after the series ranges, "Limits: Name
  value, ...": labelled limits only, in all orientations, each in the format of
  its own axis, a band's two edges as `a – b`. It is a new wording, `limitList`.
- **The tooltip** shows the limits of the hit's primary y axis, label and
  value, after the stack totals and in the order they were declared, when
  `<Tooltip limits />` is set; the default is `false`. The rows reuse
  `uc-tooltip-total`, so no CSS changes. With `limits`, the same rows are
  appended to the readout as `name value` through the wording that already
  exists (ADR-0030).

## Considered Options

- **Limits in the tooltip always.** The tooltip is read at every hit and a
  chart with several limits would grow every time; a reader asks for them by
  the prop. The summary is read once.
- **Limits of an x axis in the tooltip.** The tooltip speaks of the hit's y
  axis; they stand in the summary.
- **A custom `render` tooltip, the data table and the legend.** Untouched. A
  `render` can compute its own rows.

## Consequences

- The summary text of every existing chart with labelled limits changes. The
  changelog lists it under "Changed"; no picture changes.
- `limitList` is a new required key of `ChartsWording`, so a hand-written
  wording must add it.
- `limits` is read when a hit changes; toggling the prop with a tooltip open
  shows on the next hit.
- A limit without a label is named nowhere a screen reader reaches.
