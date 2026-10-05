# 03 — The inset variant and the theme switch example

Status: ready-for-agent

Blocked by: 01, 02

Spec: `.scratch/segmented-control-inset/spec.md`

## What to build

`variant="inset"` draws a segmented control that stands on its own - in a
menu, a settings panel, a sheet: a sunken track without an edge, the choice a
raised surface with the card shadow and corners concentric with the track's,
the other possibilities in the secondary text colour without seams, turning
to the text colour under the pointer. It is as tall as every control of its
size. Focus ring, invalid edge, disabled and forced colours behave as in the
field variant, and the keys are unchanged. The segmented control's page shows
it as a theme switch - Light | Dark | System, inset, filling, with icons - in
both themes, without a line of caller CSS. The owner judges the dark theme
from a screenshot before it ships.

## Acceptance criteria

- [ ] `variant?: "field" | "inset"` on `SegmentedControl`, default `"field"`; without it, everything is as in 0.26 (existing tests and baselines untouched).
- [ ] Inset track: sunken surface, no edge, the field's radius for its size, a small inner padding (about 3 px at `md`, 2 px at `sm`), total height the control height of its size - equal to a select's box at `md` and `sm` (layout test).
- [ ] Chosen inset segment: surface colour, text colour, card shadow, radius the track's minus the padding, written so the stylesheet guards pass.
- [ ] Unchosen inset segments: secondary text colour, no seams, text colour under the pointer; every inset segment in medium weight, so the width does not follow the choice.
- [ ] Focus ring on the focused segment, the invalid danger edge in a `FormField` with an error, disabled dimming and the not-allowed cursor: as in the field variant.
- [ ] Forced colours: the chosen segment in the selection colours, the track with a visible boundary; the new example joins the forced-colours spec.
- [ ] The keyboard and role unit tests run for the default and for `variant="inset" fill` alike.
- [ ] A new example "Theme switch" on the segmented control's page: inset, `fill` in a narrow panel, icons from the shared set or small inline SVGs; `variant` named in the configurator.
- [ ] The component's header comment and its page say when to use which variant (`field` in a row of fields, `inset` standing alone); the glossary entry **Segmented control** gains one sentence on the inset drawing.
- [ ] The new example joins the screenshot baselines, light and dark; a screenshot of it in both themes is left in this ticket's comments for the owner (the dark pill stands darker than its track - the owner decides).
- [ ] Core's changelog has a feature entry.
