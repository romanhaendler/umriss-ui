# A chart reports a chosen hit and holds no selection

Status: accepted
Date:   2026-10

The chart had a hit model, the tooltip's, but no way to tell the application
that the reader chose one. What a selection is stays the application's: an
active node is not a selection (ADR-0003), and components report (ADR-0023).
The maintainer decided on 10 October 2026: report only, no `selected` prop.

**A chart reports the hit a reader chose through `onSelect` and holds, draws
and remembers nothing.** The handler stands in the options of `useChart`
beside `onViewChange`, where the row type is bound, so `ChartOptions` takes the
row type `Z` (default `unknown`). It receives the same `TooltipHit<Z>` a custom
tooltip's `render` gets - no second shape.

- **Pointer.** A click that lands on a hit reports it once. A press that
  travelled more than 4 px before its click was a pan and reports nothing. A
  double click reports on its first click only; the double click still resets
  the zoom. A tap reports too: it already shows the tooltip, so the hit is on
  the screen.
- **Keyboard.** Enter on the Active point (ADR-0030), without Shift. Space is
  left alone, as the legend uses it.
- **Key help.** The summary adds `selectHelp`, "Enter chooses the point.", only
  where `onSelect` is given.
- **No hits, nothing to report.** Without a `Tooltip` the development build
  warns once and the production build is silent.
- **The hit does not travel with `syncId`;** only the pointer's x does.
- **The latest handler is read when the reader acts,** so a new function each
  render needs no memo.

## Considered Options

- **A `selected` prop and a drawn selection.** The application draws what it
  keeps, with a series or a `LimitLine` of its own (ADR-0003).
- **A prop on `Chart` instead of the options.** The hook is where the row type
  is bound.
- **Reporting a single click after a delay,** to tell it from a double click.
  Rejected: every click would wait.
- **Reporting every click,** which reports a double click twice.
- **Space as a second key,** a click on empty plot, a legend click, the data
  table's rows, and the selecting of a range with a navigator under the plot
  (the range itself is ADR-0074; the navigator is not built).

## Consequences

- `ChartOptions` is generic; a caller who named the type without arguments is
  unaffected.
- `selectHelp` is a new required key of `ChartsWording`.
- A tap on a touch chart that also pans reports; whether that is wanted was
  a point the maintainer was asked to look at.
