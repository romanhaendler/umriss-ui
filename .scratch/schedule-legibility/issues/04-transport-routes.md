# 04 — Routes and anchors of the transports

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule-legibility/spec.md` (user stories 9–16, "Transport routes")

## Scope

- `route`: curve, straight, orthogonal. `anchor`: centre, nearest (the corner facing the other stop).
- Options of the schedule, overridable per transport; the hit follows the drawn polyline.
- The findings do not move: `leaves`/`arrives` decide lateness, `route`/`anchor` only the drawing.

## Acceptance

- Unit tests of the geometry (a stop above, below, in the same lane; the polyline of the hit); browser tests through the examples; own pictures.

## Comments

**Delivered.**

- `route`: `"curve"` (as before), `"straight"`, `"orthogonal"`. `anchor`:
  `"centre"` (as before) or `"nearest"` - the edge of the bar that faces the
  other stop. Both are options of the schedule and both are overridable per
  transport, which also carries them as fields.
- **`ends` came in on Roman's ask during delivery:** `"dot"` (the default) or
  `"none"`, so a plan full of short moves can have the line alone. Same shape
  as the other two - schedule-wide, overridable per transport.
- `anchorY` asks one question at both ends - does the other stop lie below me? -
  so a line leaves the lower edge of the upper bar and meets the upper edge of
  the lower one. The first attempt passed a `leaving` flag and had one end
  inverted; the test caught it and the flag turned out to be unnecessary.
- Within one lane both anchors mean the middle: a move that changes nothing but
  time stays in its lane (story 13).
- **The drawn line and the hit line are one:** straight and orthogonal are
  stroked as the polyline they are hit along, and the curve is sampled into it.
- **The findings did not move.** `leaves`/`arrives` decide lateness,
  `route`/`anchor`/`ends` decide the picture. `transportPath.test.ts`, 11 cases,
  written first, and none of them touches a finding.
- Example `Transports/03-routes` with five variants; two pictures.
- **A second hour lost to the pictures:** `--update-snapshots=missing` does not
  renew a picture that exists, so a changed example fails and the old file
  stays - and reading that file looks exactly like "the change did not take
  effect". Renewing takes plain `--update-snapshots` with the name of the
  picture.
