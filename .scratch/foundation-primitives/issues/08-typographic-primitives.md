# 08 — Typographic primitives

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add text, heading and link primitives bound to the token scale. The design
concept rests on typographic strictness, and that strictness is currently
expressed as global base styles and private component rules — nothing an
application can reach for. So each application invents its own hierarchy, and the
system frays exactly where the library stops.

Behaviour:

- **Text**: size from the scale, weight from the three defined weights, colour
  from the three text colours, optional mono rendering with tabular figures.
- **Heading**: takes a semantic level and a visual size **independently**, so a
  visually small heading can still be the page's second-level heading.
- **Link**: accent colour, the standard focus treatment, and correct handling of
  an external target.

All three refuse arbitrary values. They expose the scale and nothing else.

## Acceptance

- Demo tile showing the full size scale, the three weights, the three text
  colours, mono with tabular figures, headings at mismatched level and size, and
  links in both themes.
- Screenshot baselines in both themes.
- No existing component changed.

## Notes

Deliver this **last** of the eight. It is the only item in this spec that
constrains rather than adds, and it is the one most likely to attract debate
about scope — which is easier to have once the other seven have landed.

The narrowness is the point. A permissive version that accepts any size and any
weight would be worse than not having these at all, because it would legitimise
the drift they exist to prevent. Widening later is easy; narrowing later is not.
