# 01 - Follow the live edge, with pause

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/charts-recipes/spec.md`

## What to build

An example on the Zoom and pan page, "Follow the live edge": a trend that keeps the last hour in view while
readings arrive, stops following when the reader zooms or pans, and resumes on "Live"
(`operator-screens.md` 3).

- **The data.** A reading a second, derived from the clock: a window ending now, from the demo's seeded
  generator. Under the screenshot suite's frozen clock the picture is one.
- **The follow.** The x axis is `zoomable`. While following, each arrival calls `setView` with the last
  hour. `setView` is not reported, so the following is never heard as the reader's.
- **The pause.** `onViewChange` reports only the reader: a zoom or a pan stops the following, and the view
  stays while rows arrive.
- **The button.** A core `Button` reads "Pause" while following and "Live" while paused. "Live" sets the view
  to the edge again and resumes.
- **The lead** says why `setDomain` fought the zoom (it is reported) and `setView` does not.
- **The record.** The capability record names following the live edge as the application's, with
  `setView`, and points at the example.

## Acceptance criteria

- [ ] An interaction test drives the clock: the view's end follows the newest reading; a wheel zoom stops it,
      and the view stays while rows arrive; "Live" brings the view back to the edge; "Pause" stops it by
      keyboard.
- [ ] The example's screenshots, light and dark, are new baselines and reviewed.
- [ ] The example renders in the demo smoke test; `pnpm check charts` and `pnpm check:site` pass.
- [ ] `pnpm test:visual:quick charts` passes, and the page passes the shell's page rules.
