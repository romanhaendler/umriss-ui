# 03 — The pure modules: domain, findings, ripple, time axis, snapping

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule/spec.md` ("Domain model", "Findings", "Ripple", "Axes and scale") · ADR-0023

## Scope

- `model.ts`: `Task`, `Subtask`, `Transport` with its two anchors
  (`leaves: "main" | "teardown"`, `arrives: "main" | "setup"`), and the
  occupied interval of a subtask.
- `findings.ts`: `overlaps(subtasks)` per lane (setup and teardown occupy the
  lane; touching is not an overlap), `lateTransports(subtasks, transports)`,
  `findings(...)` for both, and the offset depth within a lane.
- `ripple.ts`: given subtasks, transports and one change, the cascaded moves —
  every successor whose transport no longer fits, transitively; never earlier;
  terminates on a cycle.
- `timeAxis.ts`: the fine step for a zoom (quarter hour up to the day), the
  local day boundaries of the coarse band, zoom around a point and pan within
  limits — through charts' scale and operating calendar.
- `snap.ts`: a wall-clock time onto a raster (with the local offset).

## Acceptance

- Unit tests named after their subject (`findings.test.ts`, `ripple.test.ts`,
  `timeAxis.test.ts`, `snap.test.ts`), expected values from an independent
  source, written first.

## Comments

**Delivered** (d452d68).

- `model.ts` also carries the intents and `applyIntent`, so that `ripple`
  returns intents a caller applies with the same function a drop uses.
  Transport anchors default to the outer pair (`teardown`, `setup`).
- `findings.test.ts` 15, `ripple.test.ts` 9, `timeAxis.test.ts` 17 (with
  `snapTime`), each written before its module. Expected instants are ISO text
  with offsets, including the clock change of 29.03.2026.
- `fineStep` uses charts' `timeStep`, clamped to quarter hour and day; ticks
  and days go through charts' calendar mapping; the local offset is taken at
  the instant, so rasters lie on local time.
