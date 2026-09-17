# 04 — The control chart, drawn

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`
Blocked by: 03
Also needs: `judging-values` issue 02 (`<Limit>`)

## Scope

`<ControlChart>` as a composition, and the proof that it is one.

- **It adds no drawing code.** It is a line series, control limit lines, faint
  zone lines at one and two sigma, and a scatter of the violating points — all
  existing parts. It exists because the composition has enough pieces to be wired
  inconsistently, not because it needs to draw anything.
- **Control limits and specification limits are drawn differently**, so that a
  reader can see in one glance whether the problem is the process or the
  tolerance. Specification limits come from `<Limit>`; control limits are drawn in
  the chart's own weight.
- **Zone lines are drawn faintly.** Rule four is about them, and a reader cannot
  check a rule against a chart that does not show what it refers to.
- **Violating indices are available as data as well as marked on the chart**, so a
  caller can list them beside it.

## Acceptance

- **The no-new-drawing-code claim is a test, not a comment.** Assert it however
  the package makes cheapest — that the component registers only known series and
  limit kinds with the scene, or that it makes no canvas call of its own. If the
  component gains one, the composition was wrong and the missing capability
  belongs in the parts.
- Scene tests: the composition registers the expected children, and the violating
  points land on the same axes as the line.
- A screenshot tile showing a violation of each of the four rules, both kinds of
  limit, and the zone lines, in both themes.
- axe passes in both themes.
- No existing screenshot baseline moves.

## Notes

The tempting shortcut is to draw the violation markers directly rather than
registering a scatter series, because it is fewer moving parts. It is also the
first step to a component with a canvas of its own, and then the second one is
easier. The test above exists to make the first step fail.

If drawing the specification limits and the control limits distinctly turns out to
need something `<Limit>` does not offer, that is a finding for `judging-values`
issue 02, not a reason to draw a line here.
