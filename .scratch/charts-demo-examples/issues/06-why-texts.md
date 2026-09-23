# 06 - Why texts, and the exception retired

Status: done
Type: task
Blocked by: 01, 02, 03, 04, 05

Spec: `.scratch/charts-demo-examples/spec.md` (Q7)

## Scope

- `demo/why/area.tsx`: the baseline is a channel of its own, never a second series (ADR-0002, R-2.7).
- `demo/why/tooltip.tsx`: the hit is searched per series in its own axis space and compared in pixel space; the crosshair snaps to the point (R-4.6, R-4.7).
- `demo/why/axis.tsx`: the operating-time axis - removed time becomes a gap and a break mark, the axis stays affine (ADR-0001).
- Delete `WITHOUT_AN_EXAMPLE`, its assertion, and the paragraph in `demo/outline.ts`.

## Acceptance

- Smoke test green without any exception list.

## Delivery

- `demo/why/area.tsx` - the baseline is a second channel of the same series,
  never a second series (one name, one colour, one gap); without a baseline the
  foot is 0 and 0 is in the extent.
- `demo/why/tooltip.tsx` - one binary search per series in its own axis space,
  compared in pixels; the crosshair snaps to the point, and what `"x"` and
  `"nearest"` each answer.
- `demo/why/axis.tsx` - operating time as a mapping in materialisation, the
  scale stays affine (ADR-0001); a point in removed time is a gap, and every
  removed span gets a break mark at its seam. Written against
  `src/operatingTime.ts`: the line itself is joined across the seam - the
  ticket's "removed time becomes a gap" holds for the points inside it.
- `WITHOUT_AN_EXAMPLE` and the paragraph in `demo/outline.ts` are gone. The
  assertion was not deleted but made strict: "leave no page without an
  example" now expects `[]`, the same test core, table and schedule carry - so
  a page without an example still fails.
- Screenshots: none new; the why texts stand below the page head and are in no
  picture. The 30 page heads pass unchanged.
- Nothing snagged.
