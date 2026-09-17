# 03 — The fifth series kind: the state band

Status: done

Spec: `.scratch/judging-values/spec.md`
Blocked by: 01

## Scope

The series kind that draws a machine's day. Write ADR-0007 first: the decision
that a state is a number is what keeps this addition inside ADR-0001 and R-5.2,
and an implementation that does not understand why will widen
`MaterializedSeries` with a string channel.

- **`<StateBand>` is the fifth kind.** Its accessor returns a **number**: the
  index of the state in the declared state list. Same `Accessor<T>` signature as
  every other kind, same three `Float64Array` channels, same monomorphic draw
  loop, same affine scale.
- **A state holds from its point's x until the next point's x.** The last point's
  segment runs to the end of the x axis' domain — dropping it would lose the
  current state, which is the one the reader looks at first.
- **The lane is declared in domain units** on the series' y axis: `von` and `bis`,
  defaulting to the axis' whole domain. Four machines stacked are one y axis with
  a four-unit domain and four series of one unit each, labelled through the axis'
  existing `tickFormat`. **No new lane or layout concept.**
- **A state series contributes no y extent.** A lane says where to draw, not what
  the data spans. Its x extent is contributed normally.
- **A gap is a hole.** An absent state is `NaN` — the encoding every kind uses —
  and its segment is not painted. It is **not** painted in an "unknown" colour: a
  colour is a claim about the interval, and the true claim is that nothing is
  known.
- **The state list is a prop**: code, label and colour per state. Colours resolve
  once per frame into an array indexed by code, alongside the existing theme
  resolution. The draw loop reads a colour by index and never resolves a CSS
  variable per segment.
- **The legend lists the states, not the series.** One entry per state.

## Acceptance

- A new pure module beside `balken.ts` holds the segment geometry. Prior art is
  `balken.ts` exactly: same package, same shape, same test granularity.
- Materialisation tests: a state accessor's output lands in the y channel
  unchanged; an absent state becomes `NaN`.
- Scene tests: a state series' lane does not stretch its y axis; its x extent is
  contributed; its legend produces one entry per state rather than one per series.
- Pure tests: the last segment ends at the axis domain's end; an empty series
  produces no segments; a single-point series produces one segment spanning to the
  domain end; a `NaN` run produces a hole with painted segments on both sides.
- A screenshot shows a stacked state band under a curve on a shared x axis, in
  both themes, including a gap.
- No existing unit test changes. This is an addition to a union and a new
  registration path; if an existing test needs editing, an existing kind was
  altered.

## Notes

The temptation is a string-keyed accessor, because the caller's data holds
strings. Resist it. The mapping is one line in the caller's accessor, it runs once
per point at materialisation, and paying for the whole of R-5.2 to avoid it would
be a bad trade made for cosmetic reasons. The ADR says so; make sure it says why.

The second temptation is a lane in pixels or in fractions of plot height. That is
layout leaking into a data library, and it breaks the moment the plot resizes. The
axis domain already expresses "one unit per machine" and already labels them.

Do not implement hit-testing here. It is a different question with a different
answer and it has its own ticket.
