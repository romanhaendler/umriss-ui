# 01 — A generic container and a discriminated series kind

Status: done

Spec: `.scratch/mixed-series-kinds/spec.md`

## Scope

The enabling refactor. It adds no kind and changes no picture: after it, exactly
the same charts render exactly the same pixels, and the shape is in place for
issues 02–04.

- **Rename the container.** `LineChart` → `Chart`, `LineChartProps` →
  `ChartProps`, identical props and behaviour. Remove the old names from the
  package's public interface — no forwarding alias. Update the demo, the unit
  tests and the visual tests. The development-time warning about a missing
  accessible label and the error thrown when a series component is used outside a
  container both name the new component.
- **Make series configuration a discriminated union** over a `kind` field. Only
  the line member exists in this issue. Factor out the base every kind will
  share: the y accessor, optional series-local data, both axis bindings, the name
  and the colour. The line member adds stroke width, dash and marker policy.
  `<Line>` sets `kind: "line"` and is otherwise unchanged.
- **Make the draw item a union too**, mirroring the configuration union, and move
  the kind switch in the series draw pass to a single branch outside the
  per-point loop. With one member this is a switch with one arm; write it as a
  switch anyway, because the next three issues each add an arm.
- **Correct the scale contract** (ADR-0001). Add the affine coefficients to the
  `Scale` interface, documented as the fast path the draw loop relies on. Type
  the draw module against `Scale` rather than importing the concrete linear
  scale. Replace the comment in the scale module that claims nothing in the draw
  code presumes the concrete class — it is false and has been since the draw loop
  was written — with a statement of what is actually relied upon and a pointer to
  the ADR.

## Acceptance

- **No screenshot baseline moves.** Not one, in either theme. This change is
  behaviour-preserving by construction; a moved pixel means it was not, and that
  part is fixed rather than re-baselined.
- The existing unit and interaction tests pass with no assertion changed beyond
  the component name.
- `LineChart` no longer appears anywhere: not in the package's exports, not in
  the demo, not in the tests, not in the capability record.
- Extend the scene's unit tests so that the palette and ordering assertions run
  against series carrying an explicit kind, so that issues 02–04 extend a test
  that already speaks the union's language.
- Type checking passes across the workspace.

## Notes

Do this first and land it on its own. It touches every file in the package and
produces no visible result, which makes it the change that most benefits from
being reviewable in isolation against an unmoved set of baselines.

The rename is the trivial part and the union is the part worth care. Get the base
right — everything three later issues add hangs off it — and resist putting
anything kind-specific into it. If a property is meaningful for only three of the
four kinds, it belongs in those three members, not in the base with a comment.

The scale correction is small in lines and is the reason it is here rather than
in the bar issue: every new draw arm touches the same coefficients, and it should
be true before three of them are written against it.
