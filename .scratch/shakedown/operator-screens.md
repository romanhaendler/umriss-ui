# Shakedown: control-room operator screens on all six packages (0.40.4)

Status: needs-triage

An SCADA/HMI developer (ISA-101, ISA-18.2) builds the screens a control room runs: a level-1 overview, an
alarm list and banner, a trend with HH/H/L/LL, a faceplate, a shift log with a schedule, a daily balance.
Vite 8 with `cssTarget`, TS 7, Chromium, 2026-10-24. Verdict: keep it for overviews, trends and reports, and
build alarms on top. "In an afternoon a better level 1 than some vendors ship."

## Findings

1. **[Misfit] The tooltip prints limits in the y axis's `tickFormat`, so a limit reads rounded:** LL 0.5
   shows "1", HH 4.8 shows "5". A one-decimal `tickFormat` fixes the limits but rounds every series value
   with it (4.021 → 4.0). `LimitLine`/`LimitBand` have no `format`. A wrong limit on an operator screen is
   a safety matter. Documented as "in that axis' format"; the trap is not.
2. **[Look] At a raised root font size (a 4K wall) small controls stay 26 px high while their text grows**
   (19.25 px text in a 26 px button at root 28 px); table rows grow less than their text; cells default to
   12 px. See also `design-family.md` 9.
3. **[Misfit] A zoomed trend does not follow the live edge:** after "Last hour" the span stays fixed while
   data arrives. Following takes 2 lines (`setDomain` every second), but a wheel zoom during the follow is
   overwritten. Navigator and range are "Later" in `capabilities.md`.
4. **[Misfit] A `Date` column shows minutes only** ("24/10/2026, 20:36"); ISA-18.2 timestamps need seconds and
   no format option was found; an epoch number prints as `1,792,863,467,657` without a warning.
5. **[Misfit] No package has a print stylesheet** (`@media print` occurs 0 times): the shift log and the
   daily balance print with tabs, banner and toasts. See `calculation.md` 9, `table.md` 8.
6. Dark mode is not automatic (documented, ADR-0021); a lost value keeps its green "OK" beside "No
   connection" (documented, ADR-0010 - freshness is its own axis).

## Wishes

- **Alarm management:** ISA-18.2 states (unacknowledged/acknowledged, active/cleared, shelved, suppressed),
  acknowledge one or all, shelve with reason and timeout, first-out, a sticky banner. Workaround: about 80
  lines (state machine, list on a virtual table, shelve Modal, ack-all ConfirmDialog, a sticky Alert with
  `announce`) - it works, focus survives a 500-alarm flood and re-sorting. Elsewhere: Ignition Alarm
  Status/Journal, WinCC Unified AlarmControl, AVEVA alarm banner. Unlisted, and squarely the audience.
- **Alarm priorities 1–4 with shape and colour; deadband and on-delay.** `Verdict`/`Severity` have two
  levels (ADR-0006), `assess` has no hysteresis. Workaround: a 5-line priority mark over `Badge` and four
  `LimitLine`s, HH and LL sharing a colour. Elsewhere: Ignition priorities and deadband, WinCC limit classes.
- **Data quality** (good/uncertain/bad, OPC UA style) on `Stat`, table cells and the tooltip. Gave up beyond
  a hand-placed Badge. Elsewhere: Ignition tag quality overlays, AVEVA quality bits. Unlisted; freshness
  covers age only.
- **Chart export with axes and legend.** never: ADR-0032. **Instead fails for the picture** - a second
  independent run (see `charts.md`): two canvases, axes, ticks, limit labels and legend are DOM, so
  `toDataURL` yields lines only. **Instead holds for the data** (CSV from the rows, one line).
- **A trend that follows the live edge with pause/resume.** not yet: `capabilities.md`. Instead holds but
  fights manual zoom. Elsewhere: Grafana relative ranges, Highcharts Stock navigator.
- **Alarm sound, flash and hotkeys** (acknowledge the visible alarm, silence). Only `announce` and the
  palette shortcut exist. A reduced-motion-safe flash is an ISA-101 design question. Unlisted.
- **A tag-aware trend:** a pen list, per-pen scale, two periods as one overlay (the overlay takes one line
  today). Elsewhere: Ignition Easy Chart, AVEVA Trend. Unlisted.
- **A symbol / P&ID mimic layer** (pumps, valves, pipes). Gave up. Elsewhere: Ignition Perspective symbols,
  WinCC faceplates. Unlisted; `standards.md` calls faceplates the application's.

## Held up

`Stat` with limits, target, `asOf` and ages reads fresh, stale, lost, no value and alarm correctly · a
simulated soak with fake time: overview 2 h, heap 3.6–4.3 MB, nodes and listeners constant; live trend over
3,600 rolling rows 4 h, heap 6.0–6.1 MB, listeners constant (a full week was too slow to simulate) · focus on
an Ack button survives a new priority-1 alarm and a re-sort in a 500-row virtual table · a sticky banner with
`role="alert"` · NumberInput clamps a setpoint · ConfirmDialog, toasts, the schedule with blocked
maintenance time and a milestone, the calculation as a daily balance · no external URL in any dist, runs
offline with system fonts · a runtime `colorScheme` switch redraws the canvases.
