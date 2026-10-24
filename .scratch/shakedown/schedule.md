# Shakedown: @umriss-ui/schedule 0.40.4

Status: needs-triage

A Vite 8 host (TS strict, `exactOptionalPropertyTypes`, `skipLibCheck:false`) with schedule, charts and
core from the packed tarballs, Chromium and WebKit, 2026-10-24. Build, server and test findings that touch
schedule (hydration across time zones, the false server summary, Jest via charts) are in
`cross-package.md`. The schedule's own d.ts is clean.

## Findings

1. **[Misfit] An end before its start, or a zero-length subtask, is drawn as a 1 px hairline** with no
   finding and no warning; the tooltip reads "10:00–09:00", the summary "0 overlaps, 0 violated".
2. **[Misfit] Bad references vanish silently:** a subtask on an unknown lane is dropped, a dependency to an
   unknown id is dropped or counted violated depending on the missing end, a subtask of an unknown task is
   drawn grey, duplicate dependency ids are accepted; no dev warning. Hits apps that load lanes and
   subtasks from separate queries.
3. **[Misfit] Tooltip and live region give times only**, no date and no duration: across the year boundary
   "22:00–03:00", across a leap day "20:00–04:00", a 3-hour task on the DST-end day "01:00–03:00". The bar
   width is right (real time), the label is not enough.
4. **[Look] The axis repeats labels on the DST-end day** ("02:00 02:30 02:00 02:30") with nothing telling
   CEST from CET.
5. **[Misfit] Touch cannot edit:** one finger always pans, also on a bar; swipe and a 700 ms press-and-drag
   produce no intent. The keyboard offers move and stretch (Alt+arrows) but no lane change and no
   lead-in/lead-out. Documented for the pan.
6. **[Misfit] No keyboard zoom and no zoom control:** `+`, `-`, Ctrl+`=`, PageDown do nothing; zoom only by
   Ctrl+wheel and pinch.
7. **[Misfit] A long lane name is cut without a title or tooltip**; at 375 px the lane gutter takes 135 of
   343 px (about 40 %).
8. **[Misfit] Without a domain and with subtasks far apart, the view is an empty 28-day window** with no
   hint where the work is and no "fit".
9. **[Misfit] A drop reports the id the subtask had when the drag began**; a host that remints ids every
   tick loses the edit.

## Wishes

- **Zoom and fit buttons, keyboard zoom.** Workaround: `setDomain` plus buttons, about 15 lines. Elsewhere:
  Bryntum `zoomIn`/`zoomToFit`. Unlisted.
- **Touch editing (long-press to grab).** Gave up. Elsewhere: Bryntum touch drag, dnd-kit TouchSensor.
  Unlisted.
- **Validity findings for malformed times and orphan references.** Workaround: host-side validation, about
  10 lines. Elsewhere: Bryntum data-integrity warnings. Unlisted.
- **Start-to-start, finish-to-finish, start-to-finish dependencies.** never: ADR-0032. **Instead holds, with
  a caveat:** a negative lag gives an SS dependency in one line with no false violation, but nothing marks
  it as SS in the picture.
- **A critical path.** never: ADR-0032. **Instead holds only for cascades:** `ripple()` plus `applyIntent`
  (3 lines) pushes a successor and clears the violations; the path itself was not built.
- **Dependencies between different tasks.** The README lists them as "not yet", but they already work
  (drawn and counted). The README and the type comment "of one task" are stale.
- **Undo** - not listed for the schedule; intents are plain data, so a history in app state should hold
  (not built). **A plant time zone** - not yet: ADR-0060. **Stacked overlap** - not yet: README.

## Held up

0 and 1 lanes, StrictMode clean · 500 lanes × 50 tasks (25,000 subtasks) load in about 0.7 s with 1,063 DOM
nodes (lane headers are not virtualised: 500 nodes) · 300 mount cycles: listeners flat; 20 s of updates at
50 ms clean · the plan replaced every 200 ms during drag, hover, selection: no error, the drag completes ·
mouse move, stretch, lane change, Escape mid-drag, drop outside, auto-pan at the edge (also scrolled and
under a sticky header) in both engines · snapping · keyboard: one tab stop, arrows, `]`/`[` along
dependencies, announcements, complete German wording · axe clean · flex, grid, Card, Modal, Drawer, hidden
tab, 375 and 2560 px, dark with a live flip · half-hour and 45-minute offsets label correctly · cycles and
self-dependencies flagged without a crash.
