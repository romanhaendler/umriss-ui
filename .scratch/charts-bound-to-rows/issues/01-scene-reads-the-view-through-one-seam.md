# 01: Prefactor: the scene reads view state through one seam

**What to build:** The chart's scene asks one place whether a series is hidden, whether an x axis may zoom, and where a proposed domain goes, instead of reading the series' `hidden` and the axis' `onDomainChange` wherever it needs them. Nothing a caller sees changes; the view tickets of `component-view` then change that one place.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Every read of a series' hidden state and of an axis' zoom handler in the scene goes through the seam
- [x] All existing unit, interaction and screenshot tests pass unchanged

## Comments

Delivered. `packages/charts/src/scene.ts` has a new section "The view
(ADR-0047)" with three private methods: `isHidden(series config)`,
`zooms(axis config)` (an x axis with a handler) and `proposeDomain(axis
config, domain)`. Every former read of `config.hidden` (stacking, extents,
legend entries, drawing, bar placements, hover, the keyboard's walk, the
empty check, the change detection in `updateSeries`) and of
`onDomainChange` (`hasZoom`, `zoomAxes`, `propose`, the change detection in
`updateAxis`) goes through them; nothing else in charts src read either.
Tests: typecheck clean, `test:unit` 727/727, charts-light and charts-dark
visual projects 311 passed (129 skipped, as before), `pnpm lint` clean.
