# 02 — Freshness where it is read

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`
Blocked by: 01
Also needs: `judging-values` issue 05 (`<Stat>`), `shopfloor-instruments` issue 02 (the alarm list)

## Scope

Making age visible in the two places it is acted on.

- **`<Stat>` shows its age.** The value stays, the verdict stays, and the tile says
  how old the reading is. A stale tile is visibly different from a fresh one and
  from a disconnected one, and the difference is in words as well as in appearance.
- **The age is rendered through `wortlaut`** as a parameterised entry, per that
  module's convention — the library owns the phrasing, not the caller.
- **The alarm list shows the age of its data.** An empty list from a live feed and
  an empty list from a dead one must not look the same. This is the case that
  justifies the third freshness state.
- Greying is not sufficient on its own and would fail the accessibility suite.

## Acceptance

- jsdom: a stale `<Stat>` still shows its value and still reports its verdict in
  its accessible name. Assert both — this is issue 01's decision reaching the
  surface, and the surface is where it will be undone.
- jsdom: fresh, stale and disconnected are distinguishable in text, not only in
  styling.
- jsdom: an empty alarm list on a disconnected feed reads differently from an empty
  alarm list on a live one.
- A screenshot tile showing `<Stat>` in all three freshness states, each with a
  visible verdict, in both themes.
- axe passes at WCAG 2.1 AA in both themes with no new suppression entry.

## Notes

The tile now carries two independent states — verdict and freshness — and the
combinatorics are the interesting part of the visual design: an alarming value that
is also forty minutes old must read as both, and reading as neither is the easy
failure. Get that one combination right and the rest follow.
