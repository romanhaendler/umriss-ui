# 07 - First-out, the flood rate, and a flood in the list

Status: ready-for-agent
Type: task
Size: M

Blocked by: `05-the-banner.md`, `06-table-a-date-column-with-seconds.md`
Spec: `.scratch/alarms/spec.md`

## What to build

The tracer slice for a trip and a flood, end to end. The model marks the first alarm of a group and the first
of a flood, and says the rate. The list shows both, to the second. It holds 500 arrivals and 1,000 standing
rows without losing what the operator holds.

- **First-out.**
  - `Alarm` gains two optional fields:
    - `group`: the application's trip or unit, the set of alarms one cause raises;
    - `sequence`: the application's order, for alarms whose `raised` collide.
  - The row gains `firstOut`. Per group, it is true for exactly one alarm: the earliest `raised` among the
    alarms the model is given, done ones included. Ties go to the lower `sequence`, then to the input order.
  - An alarm without `group` is never first-out.
  - The JSDoc says that this is the standards' sense: the first of a group or a trip.
- **First in the flood.** `Flood` gains `first`, the id of the flood's earliest alarm by the same rule. It is
  shown as "first in the flood", a mark of its own, worded as umriss's extension and not as first-out.
- **The rate.** The projection gains `rate`: the alarms raised in the ten minutes before the as-of time
  (`countInWindow`).
  - The flood badge names the count and the window: "Alarm flood: 40 in 10 min".
  - The banner's flood mark reads the same.
- **The rule.** `flood` stays the caller's, with no default. The flood rule's JSDoc and the demo give
  ISA-18.2's reference: more than 10 alarms in 10 minutes per operating position is
  `{ windowMs: 600000, atLeast: 11 }`, and the application passes one position's alarms.
- **The list.**
  - A "First out" badge on the first-out row, and a "First in flood" badge on the flood's first. Both are
    words, not colour alone.
  - The "Raised" column uses `format="dateTimeWithSeconds"` (ticket 06).
- **At flood volume** (A6.1, A8). Component tests drive the list with a host that ticks `asOf` once a second:
  - 500 alarms over ten ticks (50 a tick): 500 rows, the flood marked at the first tick past the threshold,
    and focus held on a control in a row across every tick and re-sort;
  - 1,000 standing alarms of 100 types, updated every tick: focus and the selection held, and in the visual
    suite the scroll position as well.
- **The render budget.** In a production build of the demo, measure one tick's update of 1,000 rows, as the
  shakedown's audit measured the table.
  - Write the number under `## Comments` of this ticket.
  - If an update takes more than 50 ms, say so there. Virtual rows, and the virtual grid's focus drop
    (`audit-family.md` 2), then become a ticket of their own; this ticket does not make the list virtual.
- **Wording**, English and German, with the prefix `alarm`: "First out", "First in flood", and the flood
  hint with its window.
- **The demo.**
  - A page "Trips and floods": a trip of 40 alarms within two seconds, one marked first-out, the times
    showing seconds.
  - A flood example that ticks.

## Acceptance criteria

- [ ] 40 alarms of one group raised within 2 s: exactly one row has `firstOut`, the earliest. With two equal
      `raised`, the lower `sequence` wins. Model tests with literal times.
- [ ] `flood.first` and `rate` are right at both edges of the window.
- [ ] The 500-arrival test: `rows === 500` at the last tick, the flood marked from the threshold's tick on,
      and focus never on `<body>`.
- [ ] The 1,000-row test holds focus and selection across ten ticks. A visual-suite test on the flood example
      scrolls the list half way and finds the same rows in view after ten ticks (jsdom has no layout).
- [ ] The measured update time stands under `## Comments`.
- [ ] `pnpm check alarms`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick alarms` pass.
