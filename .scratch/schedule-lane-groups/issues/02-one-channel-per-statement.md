# 02 — One channel per statement

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 1–7, 10, 11, "The bar system")

## Scope

- Redraw per the table in the spec: `provisional` hollow and dashed, `fixed` as end caps, `muted` full height and opaque half-mix without outline, the rail within the main time, `open` fading at either edge.
- Painting order fixed and written at the site; `barRect` stops halving; the label's colour on a hollow bar is the text colour.
- The hatch leaves the bars in this ticket (blocked by 01 so that it never means two things).
- `SubtaskAppearance`, `resolveAppearance` and its tests stay as they are.

## Acceptance

- Browser tests through occupied canvas pixels: hollow centre, caps, left fade, rail ends at `mainTo`, muted against a setup in the same picture.
- One example of combinations (fixed + muted + open) with pictures in both themes.
- Bulk renewal of pictures allowed: the count read and stated beforehand, the list of examples named.
- `CONTEXT.md` **Appearance** and the changelog say what each one looks like now.

## Comments
