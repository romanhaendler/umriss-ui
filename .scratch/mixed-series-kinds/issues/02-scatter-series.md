# 02 — `<Scatter>`

Status: done

Spec: `.scratch/mixed-series-kinds/spec.md`
Blocked by: 01

## Scope

The cheapest of the three new kinds, and the one that proves the union carries
its weight without touching materialisation.

- A `<Scatter>` component that registers a series with `kind: "scatter"` and
  renders nothing, following `<Line>` exactly.
- Its own properties: a point radius. It shares the base — accessor, optional
  series-local data, axis bindings, name, colour.
- A draw arm that emits points and no connecting path. It uses the same batched
  approach the line's marker pass already uses: one path object for the whole
  series, one fill.
- Gaps omit their point. This falls out of the `NaN` encoding; no scatter-specific
  rule is written.
- Legend entry and palette assignment come from the shared registration order and
  need no scatter-specific code.

## Acceptance

- A scatter series and a line series register in one chart, bound to the same
  axes, and both draw.
- Registration order across the two kinds decides both palette and painting, and
  the scene's unit tests say so.
- Hovering a scatter series produces a tooltip entry and an overlay marker at the
  point, using the unchanged hit model.
- No existing screenshot baseline moves.

## Notes

Do this before area and bar. It is the smallest possible second arm: no new
channel, no new extent rule, no new geometry. If the union from issue 01 is
awkward, this is where that shows up cheaply, while there is still time to fix
the shape before two harder kinds are built on it.

Resist reusing the line's marker policy here. A scatter is points; `auto` /
`always` / `never` is a line's question about whether to decorate its path, and
borrowing it would put a meaningless property on a kind that is nothing but
markers.
