# 02 - A gap threshold on Line and Area

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/charts-small-additions/spec.md`

## What to build

A process engineer writes `<Line value="temperature" maxGap={5 * MINUTE} />`, and the hour in which the
historian sent nothing is a hole, not a straight stroke.

- **The prop.** `maxGap?: number` on `Line` and `Area`, in the x axis' units: milliseconds on a time axis,
  working time on a calendar axis, places on a category axis. Off by default.
- **The rule.** A step from one reading to the next longer than `maxGap` is a **Gap**: the stroke breaks,
  and an area's section closes on both sides, exactly as a missing value does. It is found in the drawing
  loops and in the hit test from the distance of neighbouring readings. Nothing is inserted into the
  materialised series.
- **A `step` line** holds its last reading before a gap for `maxGap`, then ends. A missing value still ends
  the hold at its own x.
- **The hit.** A pointer farther than `maxGap` from the nearest reading finds no hit on that series.
- **Markers.** A reading with a gap on both sides is isolated, so `markers="auto"` marks it.
- **Downsampling** keeps the gap.
- **In a stack** `maxGap` is not read; the doc comment says so, as `baseline`'s does.
- **The example.** A historian trend on the Line page with an outage, drawn with and without `maxGap`.
- **Docs.** The doc comment (the units and the default), the capability record's Line and Area rows, and
  the changelog under "Added".

## Acceptance criteria

- [ ] A draw test with the recording context: a long step breaks the stroke; a step of exactly `maxGap`
      does not; an area closes on both sides; a step line's hold ends `maxGap` after its last reading; a lone
      reading between two gaps keeps its marker under `auto`.
- [ ] A hit test: no hit farther than `maxGap` from the nearest reading; a hit within it.
- [ ] A downsampling test: a gap survives the thinning.
- [ ] Without `maxGap` every existing screenshot is unchanged.
- [ ] The example's screenshots, light and dark, are new baselines and reviewed.
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
- [ ] `pnpm test:visual:quick charts` passes.
