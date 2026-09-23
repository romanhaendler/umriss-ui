# 01 - Area

Status: done
Type: task

Spec: `.scratch/charts-demo-examples/spec.md`

## Scope

- `01-filled`: one area filled down to 0 - e.g. power draw of a line over a shift; shows `fillOpacity` and `strokeWidth` set explicitly.
- `02-corridor`: a corridor between two channels (`baseline` accessor) with a gap, and the measured temperature as a `Line` inside it - the baseline is a channel, not a second series.
- Remove `area` from `WITHOUT_AN_EXAMPLE`.

## Acceptance

- Smoke test green; pictures light and dark renewed, count stated.
- `docs/capabilities.md`: Area `fillOpacity`/`strokeWidth` now point at these screenshots instead of `mixed`.

## Delivery

- `demo/examples/Area/01-filled.tsx` - the power draw of a line over the early
  shift, filled down to 0, `fillOpacity={0.35}` and `strokeWidth={2}`.
- `demo/examples/Area/02-corridor.tsx` - the recipe corridor of a hardening
  furnace (`baseline` accessor, `strokeWidth={0}`) with a gap during the recipe
  change, and the measured temperature as a `Line` that runs through it.
- `demo/data.ts`: a new section "Data of the kind pages" with `powerDraw()` and
  `corridor()`; nothing above it changed.
- `area` left `WITHOUT_AN_EXAMPLE`; `docs/capabilities.md` points Area's fill,
  corridor, gap, `fillOpacity` and `strokeWidth` rows at `filled`/`corridor`.
- Screenshots: 4 new pictures (2 examples × light/dark); the page head of
  `area` is unchanged.
- Nothing snagged. The time ticks (05:23, 06:46, ...) are those of every time
  course today; the time axis is `charts-essentials` (Q15), not a new finding.
