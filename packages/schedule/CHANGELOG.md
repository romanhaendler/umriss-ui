# Changes to `@umriss-ui/schedule`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository stands in the
repository's journal (`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why whatever changes existing behaviour stands
under a heading "Changed" of its own, no matter which digit rose.

**Release candidates.** The package starts as a release candidate under the tag
`next`: the interface is expected to move before `0.1.0`.

---

## 0.1.0-rc.0 – The schedule (Sep. 2026)

Delivery report for `.scratch/schedule/spec.md` (ADR-0022, ADR-0023). Not yet
published.

### Added

- **`Schedule`** with **`Lane`**, **`Subtasks`** and **`Transports`** declared
  as children. Lane headers at the left as text, a day band above the plot and a
  time band below it that steps from the day down to the quarter hour with the
  zoom. Subtasks drawn with main time, setup and teardown in their task's colour;
  transports as lines from an end to a start, anchored per transport
  (`leaves`, `arrives`). Canvas colours follow `color-scheme`.
- **Findings drawn and never resolved:** an overlap on a lane — setup and
  teardown included — offset and marked; a late transport dashed in the finding
  colour.
- **Pan and zoom:** drag the background in both directions, the wheel and a
  pinch zoom around the pointer, a horizontal wheel pans; `zoomLimits`. An
  operating calendar (`calendar`) cuts removed time out of the axis.
- **Interaction:** `onInteraction` reports click, context menu and hover with
  the hit (subtask and part, transport, lane, nothing), the client point, the
  time and the lane. A click selects the whole task; `selectedTask` and
  `onSelectedTaskChange` control it.
- **Controlled editing:** `intents` and `onIntent` — move, lane, stretch at the
  edges, setup and teardown grips on the selected subtask — with a ghost that
  shows its times and findings while the drag is in flight; Escape cancels.
  `snap`: the tick raster by default, a step, or `false`.
- **The arithmetic:** `findings`, `overlaps`, `lateTransports`, `ripple`,
  `applyIntent`, `snapTime`, `occupied`, `departure`, `arrival`, and the types
  `Task`, `Subtask`, `Transport`, `Intent` and its five kinds.
