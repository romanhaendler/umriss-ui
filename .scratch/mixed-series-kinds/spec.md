# Spec: Mixing series kinds in one chart

Status: done

Origin: `/grill-with-docs` session, 25 Aug 2026. Prompted by "it is not possible
to mix chart types; the wrapper is always the concrete type."

Decisions recorded as ADRs: `docs/adr/0001-affine-scale-contract.md`,
`docs/adr/0002-bars-on-a-numeric-x-axis.md`. Vocabulary in `CONTEXT.md`.

Sequencing: self-contained within `packages/charts`. Nothing in `packages/ui`
depends on it. Issue 01 must land before the rest; 02–04 are independent of one
another once 01 is in.

---

## Problem Statement

A chart in this library can only ever be a line chart. The container is called
`LineChart`, so a bar next to a line has nowhere to go — the developer has two
containers and no way to give them one plot area, one pair of axes, one legend
and one tooltip. Revenue as bars with a margin line over it, measurements as a
scatter against a fitted line, a range as a shaded area with its median drawn
through it: none of these can be expressed.

The premise behind the complaint is only half right, and the half that is wrong
matters for the size of the job. The container is not actually a line container.
It contains no line-specific code at all: it owns the canvas layers, the resize
handling, the layout, the hover and the registration model, and the series kind
lives entirely in the `Line` child, which registers configuration and draws
nothing. The name is the smallest part of the problem.

What actually binds the library to one kind is four things further down.

Series configuration has line properties — stroke width, dash pattern, marker
policy — flattened directly into it, with no discriminator, so there is no place
for a bar's width or an area's fill to live and no way for the scene to tell
what it is holding.

The series draw pass is one hard-wired loop that builds a path and strokes it.

Materialisation produces exactly one y per x. An area needs somewhere to draw
back to, and a bar needs the same, and neither has a channel to put it in.

And the scale contract is not the contract the code keeps. The scale interface
declares a domain-to-pixel function; the draw loop ignores it and reads a slope
and an intercept off the concrete linear scale, inlining the arithmetic for
speed. A comment in the scale module asserts the opposite — that nothing in the
draw code presumes the concrete class. Any second kind of mark walks straight
into this, because it is the first thing a new draw pass has to touch.

## Solution

Make the series kind a property of the series rather than of the chart.

`LineChart` becomes `Chart`: the same container, the same props, a name that
tells the truth. It is removed rather than aliased. The package is at `0.1.0`,
nothing in the workspace consumes it, and a forwarding shim is exactly the kind
of ballast a library whose own description says "uncompromisingly clean" should
not be carrying.

Series configuration becomes a discriminated union over a kind. Four kinds ship:
line, area, bar and scatter. Each is a child component — `<Line>`, `<Area>`,
`<Bar>`, `<Scatter>` — that registers its configuration and draws nothing, just
as `<Line>` does today. Any of them may appear in any combination inside one
`<Chart>`, bound to any of its axes.

The set of kinds is closed. There is no renderer plugin seam and third parties
cannot add a kind. Opening it would mean publishing stable contracts over the
canvas path objects, the scale, the plot rectangle and the theme, and routing
the hot loop through a foreign interface — for a library that exists to hold
sixty frames per second at three million points, and whose own description
promises "few chart types". Closed today can become open later; the reverse is
not true, which is why the reversible choice is the right one to make first.

Materialisation gains a second, optional y channel. It carries an area's lower
edge and a bar's foot. Where a series has one, its baseline enters the axis
extent, so an axis carrying a filled mark always shows the baseline rather than
cropping it.

Bars are drawn against the numeric x axis every other kind uses, sized from the
step between consecutive x values (ADR-0002). There is no band scale, no
categorical axis, and therefore no second domain-to-pixel path and no second hit
model.

The scale interface is corrected to say what the draw loop actually needs
(ADR-0001), and the false comment goes with it.

## User Stories

1. As a developer, I want one chart container regardless of what I draw in it, so that the container's name stops deciding what I am allowed to plot.
2. As a developer, I want to put a bar series and a line series in the same chart, so that I can show a total and a rate against one pair of axes.
3. As a developer, I want to put a scatter series and a line series in the same chart, so that I can show measurements against a fitted curve.
4. As a developer, I want to put an area series and a line series in the same chart, so that I can show a range with its median drawn through it.
5. As a developer, I want mixed series to share one plot area, so that they are visually comparable rather than merely adjacent.
6. As a developer, I want mixed series to share one legend, so that the reader gets one key rather than several.
7. As a developer, I want mixed series to share one tooltip, so that hovering reports every kind at that position at once.
8. As a developer, I want to bind any series kind to any registered axis, so that a bar on a left axis and a line on a right axis work the way two lines on two axes already do.
9. As a developer, I want the series kind to be visible in my JSX, so that reading the markup tells me what the chart looks like.
10. As a developer, I want the order of my children to decide what is painted over what, so that I can put bars behind a line by writing them first.
11. As a developer, I want that same order to decide palette colours, so that there is one order to reason about rather than two.
12. As a developer, I want an area to be drawn back to zero by default, so that the common case needs no configuration.
13. As a developer, I want to supply a second accessor for an area's lower edge, so that I can shade a band between two series.
14. As a developer, I want an area's fill opacity to be settable, so that an area underneath a line does not hide it.
15. As a developer, I want an area to keep the stroke along its upper edge, so that the boundary stays legible against a filled body.
16. As a developer, I want a bar's y axis to include zero, so that the bar is not silently drawn with a cropped foot that misstates its size.
17. As a developer, I want bar width expressed as a fraction of the step between x values, so that bars stay proportionate when I change the data density.
18. As a developer, I want two bar series on the same x axis to sit side by side, so that the second one is not hidden behind the first.
19. As a developer, I want bars grouped in registration order, so that their arrangement matches their legend order.
20. As a developer, I want a scatter series with a settable point radius, so that dense and sparse measurement sets both read well.
21. As a developer, I want a scatter series to be drawn without connecting its points, so that it does not imply an ordering the data does not have.
22. As a developer, I want gaps to behave the same in every kind, so that an absent value breaks a line, leaves a hole in an area, omits a bar and omits a point, without me learning four rules.
23. As a developer, I want hovering to find the nearest point regardless of kind, so that the tooltip works the same everywhere.
24. As a developer, I want the hover marker on a bar to sit at the bar's top, so that the crosshair reading matches the mark I am pointing at.
25. As a developer, I want each kind to carry only the properties that mean something for it, so that the type checker rejects a dash pattern on a bar rather than silently ignoring it.
26. As a developer, I want a clear error when I use a series component outside a chart, so that the failure names the mistake as it already does today.
27. As a developer, I want axis extents to account for every kind bound to the axis, so that mixing kinds cannot produce a mark that runs off the plot area.
28. As a developer migrating existing code, I want the rename to be mechanical, so that changing `LineChart` to `Chart` is the whole migration.
29. As a library maintainer, I want the series kind to be a discriminated union, so that adding a fifth kind is a compiler-guided exercise rather than a search.
30. As a library maintainer, I want each kind to keep its own tight draw loop, so that generalising the interface does not cost the performance the library exists for.
31. As a library maintainer, I want the kind switch to happen outside the per-point loop, so that the loop stays monomorphic at a million points.
32. As a library maintainer, I want the scale interface to declare what the draw loop actually uses, so that the next person adding a mark does not discover the reliance by breaking it.
33. As a library maintainer, I want the untrue comment in the scale module corrected, so that the documentation stops contradicting the code.
34. As a library maintainer, I want bar geometry in a pure module, so that the arithmetic that decides where a bar's edges land is asserted without a canvas.
35. As a library maintainer, I want a screenshot tile showing all four kinds in one chart, so that the feature's whole point is guarded by a baseline.
36. As a library maintainer, I want the existing screenshot baselines to be unchanged by the enabling refactor, so that a moved pixel means a real regression rather than a rename.
37. As a library maintainer, I want the capability table kept current, so that the record of what is proven at which level does not go stale.
38. As an end user, I want a mixed chart to read as one picture, so that I can compare a bar against a line without translating between two charts.
39. As an end user, I want a hover anywhere in a mixed chart to report every series at that position, so that I do not have to hover four times.
40. As an end user, I want bars and lines to keep their colours consistent with the legend, so that I can tell which mark is which.

## Implementation Decisions

**The container is renamed, not aliased.** `LineChart` and `LineChartProps`
become `Chart` and `ChartProps`, with identical props and identical behaviour.
The old names are removed from the package's public interface. The demo, the
unit tests and the visual tests are updated in the same change. The DEV warning
naming the component and the error thrown when a child is used outside a
container both take the new name.

**Series configuration becomes a discriminated union over a `kind` field**, with
four members: line, area, bar and scatter. A shared base carries what every kind
needs — the y accessor, optional series-local data, the two axis bindings, the
name and the colour. Each member adds only its own properties: stroke width,
dash and marker policy for a line; baseline accessor, fill opacity and stroke
width for an area; width fraction for a bar; point radius for a scatter. The
type checker is the mechanism that stops a dash pattern being set on a bar.

**Each kind is a child component that registers and renders nothing.** `<Line>`,
`<Area>`, `<Bar>` and `<Scatter>` all use the existing series registration hook
and return null, exactly as `<Line>` does today. No new registration mechanism
is introduced.

**The set of kinds is closed.** No renderer interface is published and no
extension point exists. The scene knows every kind by name.

**Registration order remains the single order.** It decides the palette index
and it decides painting, for every kind alike. The library does not reorder by
kind — bars are not automatically pushed behind lines. Two orders where there
was one would be worse than the rule that a developer can see in their own JSX.

**The draw pass switches on kind once, outside the per-point loop.** Each kind
gets its own loop over the materialised channels, so the arithmetic inside stays
monomorphic and allocation-free. The draw item type becomes a union mirroring
the configuration union, carrying the shared geometry — the channels, the two
scales, the colour and the alpha — plus the per-kind properties.

**Materialisation gains an optional second y channel.** A series with a baseline
materialises two parallel `Float64Array`s instead of one; a series without keeps
exactly the shape it has now. Only two channels are added, not a general N-channel
model: stacking and OHLC would need more, and both are out of scope.

**A baseline participates in its axis' extent.** A bar contributes zero; an area
contributes zero or the values of its baseline accessor. This is what stops an
axis cropping the foot of a filled mark. It is computed where axis extents are
already computed, from the series bound to the axis.

**Bars are sized from the step, not from a band scale** (ADR-0002). The step is
the smallest distance between two consecutive x values of the series, computed
in one pass at materialisation time, when the x channel is already being walked
and its sortedness is already assumed. A bar's width is a fraction of the step,
defaulting to a little under full so that neighbouring bars do not touch.

**A bar widens its x axis' extent by half a step on each side.** A bar is
centred on its x value, so half a step to either side belongs to the range the
axis must cover. Without it the first and last bar of a series are sliced by the
edge of the plot area. This was not in the original spec: it was found by looking
at the mixed tile's screenshot, which is the only place it could have been found.

**Bar series bound to the same x axis are grouped side by side.** Each such
series learns how many bar series share its x axis and its own index among them,
in registration order, and takes that share of the step. A single bar series is
the degenerate case of one group member and is centred on its x value. Without
this, a second bar series would be drawn exactly on top of the first.

**The scale interface declares the affine coefficients** the draw loop uses, and
the draw module types against the interface rather than the concrete linear
scale (ADR-0001). The comment in the scale module claiming that nothing in the
draw code presumes the concrete class is corrected to state the reliance.

**A group shares one step and one width fraction.** The step is the smallest
measurable one among its members, because only the smallest guarantees that
neighbouring x positions do not touch; a step of zero means "not measurable"
rather than "tiny" and does not count. The width fraction is the first member's,
in registration order, and members that disagree draw a development-time warning
rather than silently losing their setting. Both values belong to the group and
not to its members: the offsets are computed from the group's total width, so
members computing from their own values would fall out of step and overlap.

**Bar geometry moves to a pure module.** Deriving the step from an x channel and
turning a step, a width fraction, a group size and a group index into an offset
and a width in domain units are pure functions in their own module, following
the pattern the tick, hit and materialisation modules already set.

**One hit model serves all four kinds.** The existing nearest-x binary search is
unchanged. For a bar this resolves to the nearest bar centre, which for regularly
spaced data is the bar under the pointer. The overlay marker is drawn at the
series' data point for every kind, which for a bar is the top of the bar. Gaps
remain non-hits everywhere.

**Gap semantics are uniform and follow from the encoding.** An absent y is `NaN`
in the channel: a line lifts the pen, an area closes and restarts its fill, a bar
is not emitted, a scatter point is not emitted. No kind-specific gap rule is
written.

**The demo gains a mixed tile** showing all four kinds in one chart against
shared axes, with a legend and a tooltip, and it becomes a screenshot baseline in
both themes.

## Testing Decisions

**What makes a good test here.** A test asserts what a caller or a reader can
observe: the numbers a pure module returns, the series and legend a scene reports
after registration, the pixels a browser renders, the tooltip a hover produces.
It does not assert on private methods, on the order of internal calls, or on the
shape of intermediate objects that exist only to get from one module to the next.

**Prefer the seams that already exist.** Four of the five are already in the
package and need extending rather than inventing:

- **The scene, DOM-free.** The existing scene test file drives registration,
  ordering, palette assignment and the development-time invariants without any
  DOM. Extend it to mixed kinds: that registration order holds across kinds, that
  the palette is assigned across kinds by the same order, that the axis-binding
  invariants fire for every kind, and that a bar series learns its group index and
  group size from the other bar series on its axis.
- **Materialisation.** The existing pure test file covers the channels, gaps, the
  sortedness check and axis extents. Extend it to the second channel, to a
  baseline entering an axis extent, and to the step derived from an x channel
  including the degenerate cases — a single point, and all x values equal.
- **Mounting, in jsdom.** The existing mount test asserts the container's DOM
  shape and accessibility attributes. It needs the rename and nothing more.
- **Screenshots and interaction, in a browser.** The mixed tile gets baselines in
  both themes. An interaction test hovers the mixed chart and asserts that the
  tooltip lists every kind at that position and that the overlay marker for the
  bar sits at the bar's top rather than at its foot.

**One new seam.** Bar geometry — the step and the group arithmetic — becomes a
pure module with its own test file, because it is the genuinely new and
error-prone calculation and because canvas output is a bad place to discover an
off-by-half-a-bar. Prior art for its shape: the tick and hit modules.

**Deliberately not a seam.** The draw pass gets no unit test. It writes to a
canvas context, and what it produces is guarded by screenshots, which is the
right level for it. Extracting a mock context to count path operations would test
the implementation rather than the picture.

**Everything materialisation reads must force re-materialisation.** That is the
y accessor, the data reference, the baseline accessor and the kind — the kind
because it decides both the baseline and the step. A field-by-field comparison
of the visual properties alone is not enough: it leaves the channels stale while
the configuration says otherwise.

**Regression safety for the enabling change.** The rename and the union
introduce no visual change. Every existing screenshot baseline must be unchanged.
If one moves, something was not behaviour-preserving, and that part is fixed
rather than re-baselined.

**Coverage priorities, in order.** Bar geometry, because it is new arithmetic
with no visual intuition behind it. Then the second channel and baseline extents,
because a cropped filled mark is a wrong picture rather than an ugly one. Then
mixed registration and palette order at the scene, because it is the promise the
whole change makes. Then the mixed screenshots and the mixed hover.

## Out of Scope

- **Stacking.** Stacked bars and stacked areas need more than two y channels and
  a cross-series accumulation step. This is a data question, not a drawing one,
  and deserves its own work package.
- **A categorical or band scale.** Bars sit on the numeric x axis (ADR-0002).
  Categories are supplied as numeric positions with a tick format that names them.
- **Time and logarithmic scales.** Already out of scope for the package, and
  ADR-0001 records what a logarithmic scale would additionally cost.
- **A renderer plugin seam.** The set of kinds is closed.
- **Horizontal bars.** Bars grow along the y axis from a baseline on the x axis.
- **Further kinds** — step lines, candlesticks, pie, radar, heatmap, box plots.
- **Kind-specific interaction.** No bar-hover highlight, no brush, no click
  selection. The hover model is unchanged.
- **Curve interpolation, downsampling, zoom, pan, animation, export, WebGL.**
  All remain on the package's existing list of non-goals.
- **Any change to `packages/ui`.** It does not depend on this package.
- **The axis, layout, theme, legend and tooltip modules**, beyond what the new
  channel and the baseline extent require.

## Further Notes

The framing to hold on to is that this is mostly a typing and drawing change, not
an architectural one. The registration model was built for exactly this: children
that carry configuration and paint nothing, a scene that owns the pixels, and an
order that is the JSX order. Three of the four kinds fall out of that model
almost for free. Bars are the one that does not, and every awkward decision in
this spec — the step, the grouping, the baseline extent, the affine contract —
exists because of them.

Leaving bars out was considered and rejected. Line, area and scatter share a
materialisation, a scale, a hit model and a draw shape; generalising over the
three of them would produce an abstraction that looks general and is not. Bars
are what makes the seam a real seam.

The performance numbers in the package's capability record were measured with
three line series. They should be re-measured once bars and areas exist, because
a filled mark and a per-bar rectangle are different work from a single stroked
path, and the record should not imply a guarantee that was never tested for them.
