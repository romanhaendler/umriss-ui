# Schedule - capability record

## Performance (reference run)

Measured through the demo build's Benchmark page (`#/benchmark`), which draws
a plan of a set size and drives the schedule itself with dispatched pointer and
wheel events on its canvas. Nothing in the schedule is instrumented: the page
uses `performance.now()`, a `MutationObserver` and `requestAnimationFrame`.

**Method.**

- Machine, browser and date: Apple M2, 16 GB; Chromium headless (Playwright 1.62); 2026-10-12. One run of the page per row, driven by a script.
- Build: the demo build (`pnpm --filter @umriss-ui/schedule build:demo` and a
  preview).
- Each figure is the median of five loads; the page is reloaded for every
  load and the measurement started with its button, the page's `status` reading
  `done` before the figure is read.
- The plan: lane 0 holds one long bar (the probe); the other lanes share the
  subtasks in 20-minute bars every half hour, one task per lane; every bar after
  the first on a lane is joined to the one before it by a dependency of lag 0.
  The view shows eight hours and the schedule is 440 px high with lanes of
  44 px.
- First render: from the click on the size to the second animation frame after
  the commit (canvases drawn).
- Pointer walk, pan and wheel zoom: 240 events, one to a frame. *ms per event*
  is the time the dispatch itself took (the synchronous work). *ms to end of
  frame* is the mean time from the dispatch to a task queued from the next
  animation frame callback, which runs once that frame, with the schedule's
  canvas draw, is done; it therefore includes the wait for the frame (up to one
  frame interval, about 16.7 ms at 60 Hz) and is read against that floor.
  *renders* is the number of batches of changes to the schedule's markup a
  `MutationObserver` saw during the run (the production build has no profiler).
  The walk along one bar stays on the probe; the walk across
  many crosses the visible lanes and changes the bar under the pointer on
  nearly every event. The pan drags to the left and back; the wheel zoom
  alternates in and out with Ctrl held.

| Plan | Subtasks | Dependencies | First render (click to frame) | Walk, one bar (ms/event) | Walk, one bar (renders) | Walk, one bar (ms to end of frame) | Walk, many (ms/event) | Walk, many (renders) | Walk, many (ms to end of frame) | Pan (ms/event) | Pan (ms to end of frame) | Zoom (ms/event) | Zoom (ms to end of frame) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| small (20 lanes) | 200 | 181 | 31.0 | 0.27 | 239 | 18.8 | 0.41 | 202 | 18.8 | 0.44 | 19.0 | 0.36 | 19.0 |
| medium (50 lanes) | 1,000 | 951 | 30.4 | 0.30 | 239 | 20.4 | 0.60 | 214 | 20.1 | 0.82 | 20.4 | 0.81 | 20.3 |
| large (100 lanes) | 5,000 | 4,901 | 51.6 | 0.46 | 239 | 23.9 | 1.46 | 214 | 23.5 | 2.27 | 23.3 | 2.21 | 23.1 |

## What changed the figures

Figures are the pointer walks of the benchmark page, as above (ms per event / renders / ms to end of frame).

| Change | Plan | Figure | Before | After |
|---|---|---|---|---|
| A hover publishes the tooltip and cursor into the snapshot as it stands, and draws the overlay alone | 200 subtasks | Walk, one bar | 0.27 / 239 / 18.8 | 0.14 / 239 / 17.1 |
| | 200 subtasks | Walk, many | 0.41 / 202 / 18.8 | 0.18 / 202 / 17.1 |
| | 5,000 subtasks | Walk, one bar | 0.46 / 239 / 23.9 | 0.42 / 239 / 17.2 |
| | 5,000 subtasks | Walk, many | 1.46 / 214 / 23.5 | 1.20 / 214 / 17.1 |
| A pan or zoom lays the plan out once per frame, however many events the frame holds (the layout is made when read, the rest in the frame); a dependency wholly outside the view is not stroked. Pan and zoom rows read ms per event / ms to end of frame | 200 subtasks | Pan | 0.44 / 19.0 | 0.14 / 19.7 |
| | 200 subtasks | Wheel zoom | 0.36 / 19.0 | 0.09 / 19.1 |
| | 5,000 subtasks | Pan | 2.27 / 23.3 | 0.07 / 24.2 |
| | 5,000 subtasks | Wheel zoom | 2.21 / 23.1 | 0.05 / 22.1 |

### What was not tried

Three further changes were on the list: a hit test that does not scan every
box, lane headers rendered only in view, and a lane's overlap depth without
comparing every pair. None was built. After the two changes above, an event at
5,000 subtasks costs 0.4 to 1.2 ms in all and its frame ends where the frame of
a plan of 200 ends, so there is nothing left on this page for any of them to
win. They become worth trying when a plan several times this size is measured.

### Where the figures stand

The same page, machine and method as the reference run, after the changes
above; 2026-10-12, one run of the page per row.

| Plan | First render | Walk, one bar (ms/event / ms to end of frame) | Walk, many | Pan | Zoom |
|---|---|---|---|---|---|
| 200 subtasks | 30.1 | 0.19 / 17.3 | 0.30 / 17.3 | 0.11 / 20.2 | 0.07 / 20.8 |
| 1,000 subtasks | 31.2 | 0.26 / 17.2 | 0.64 / 17.3 | 0.08 / 21.3 | 0.06 / 21.7 |
| 5,000 subtasks | 47.6 | 0.49 / 17.2 | 1.90 / 17.2 | 0.07 / 23.2 | 0.04 / 23.7 |

A hover's frame no longer grows with the plan. A pan's or a zoom's still does:
the frame lays the plan out and draws it, once.
