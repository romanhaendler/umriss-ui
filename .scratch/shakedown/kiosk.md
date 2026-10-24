# Shakedown: an operator screen on kiosk hardware (0.40.4)

Status: needs-triage

Three Stats, a live trend, a 500-row alarm table, a shift schedule, a dashboard, a CommandPalette, a
ConfirmDialog and a Menu, ticking every second, at 1024×768, touch only, no internet. Chromium with
`--disable-gpu`, CPU throttled 6× and 10×; Electron 45, 30 and 28 (Chromium 120, below the floor), 2026-10-24.
Not covered: a real Pi, a week, WebKit, Tauri, an on-screen keyboard, a real DST change (clock jumps via
Playwright's fake clock).

## Performance

| Run | First paint | First palette tap opens | Long tasks | Heap / listeners |
|---|---|---|---|---|
| 6×, virtual table, 60 s | 544 ms | 778 ms | 0 | 5.2–6.7 MB, 515 flat |
| 10×, virtual table, 60 s | 964 ms | 1,370 ms | 2/min, max 56 ms | same |
| 6×, 500 rows rendered, 40 s | 984 ms | 1,922 ms | 63/min, max 189 ms | 11.2–12.3 MB, 1,002 |
| 10×, 500 rows rendered, 40 s | 1,632 ms | 3,476 ms | 121/min, max 302 ms | same |

Frames p50/p95 16.7–16.8 ms in every run. A real 30-minute run (6×, 500 rows): DOM nodes and listeners flat,
heap 11.2 → 14.5 MB (about 2 MB an hour, source not found - possibly the host's history array). No console
errors anywhere.

## Findings

1. ~~**[Misfit] A wall-clock jump leaves a Stat's freshness wrong until its next armed timer:**~~ after
   +1 hour, `Stat` with `ages={{ stale: 60 s, lost: 1 h }}` still read "Fresh now" at an age of 3,604 s; after
   an NTP step back of 5 minutes the old "Stale, 1 minute ago" stayed. A sleep with timer catch-up was right
   at once. Hits every 24/7 display with NTP steps, DST changes or hypervisor clock syncs - a safety-relevant
   lie on an operator screen. Idea: re-evaluate on `visibilitychange`, `focus` and a coarse heartbeat that
   compares `Date.now()` with the armed deadline (`useFreshness`). **Closed 2026-10-24 as a measurement artefact:** `useFreshness` re-reads the clock on every tick, so a step shows within one cadence; Playwright's fake clock moved the time without running timers. A unit test with running timers guards it.
2. **[Misfit] `Export` gives no result, and in Electron it opens a native Save dialog** a touch-only kiosk
   cannot work (the download stays "progressing"). `onExport` exists; the docs do not point shells to it.
3. **[Look] Below the floor (Chromium 120) the page is unstyled and silent** - documented ("an older browser
   … shows the interface unstyled"), nothing throws, every function works; the palette appears unstyled in
   the page flow, chart gridlines black. Idea: a one-line DEV warning when `light-dark()` is unsupported.
4. **[Misfit] On touch, the CommandPalette has no close button:** full screen at 1024×768, it focuses its input
   (the on-screen keyboard rises) and closes only by a backdrop tap or Escape. Touch targets confirmed small
   at this size (Button 62×32, Export 46×26, row checkbox 16×16; `mobile-touch.md` 1).
5. **[Misfit] Copying a selection exists only as Ctrl+C** (works in all three Electrons); a touch-only user
   needs a host button around `selectionAsText()`.
6. A 500-row table that is not virtual costs 63–121 long tasks a minute when its data identity changes every
   second; the virtual one 0–2.

## Wishes (unlisted)

- **Copy and close for touch:** a toolbar button for the selection copy, a close button on the palette.
  Workaround: about 10 lines. Elsewhere: AG Grid's context-menu "Copy".
- **A freshness heartbeat that survives a clock jump** (finding 1). Workaround: a 1 s interval forcing a
  render, about 5 lines.

## Held up

Electron 45, 30 and 28 with `sandbox: true`, `contextIsolation`, `file://` and a strict CSP
(`connect-src 'none'`): no errors, no violations, the bundled font loads, `<dialog>` is modal and closes on
Escape · zero requests leave the machine · Chromium 123 (the floor) renders fully styled · no horizontal
overflow at 1024 and 1280 · midnight crossing and a one-hour sleep correct · DOM and listeners flat over 30
minutes.
