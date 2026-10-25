# 01 - Plus, minus and zero zoom the plan

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/schedule-keyboard-and-reader/spec.md`

## What to build

A planner on the keyboard zooms the schedule with the chart's keys and hears the new span. Read the chart's
zoom keys first (its key factor, the keys it takes, how it says the span); they are the model.

- **The keys**, on the focused plot, with no Ctrl, Alt or Meta held and no drag in flight:
  - `+` and `=` zoom in by the chart's key factor;
  - `-` and `_` zoom out by it;
  - `0` does what `setDomain(null)` does: the view names no domain, and the subtasks' extent shows.

  They are read by the character, as the brackets are. They go through the view's existing zoom, so they
  keep to `zoomLimits` and the working calendar.
- **The anchor.** The middle of the **Active subtask**'s main time, clamped into the view. Without one, the
  middle of the plot. The Active subtask stays.
- **The report.** Each key's change is reported through `onViewChange` once, as a wheel zoom is.
- **The announcement.** After the keys rest (the readout's pause), the readout's live region says "From …
  to …". Each end is written as the summary writes an instant. A key at a limit still says the span.
- **Wording.** A new entry in core's wording for the span, in English and German. The schedule's key help
  gains a sentence naming the three keys, in both languages.
- **README.** The keyboard lines name the three keys.

## Acceptance criteria

- [ ] Keyboard unit tests through the scene, beside the existing ones:
      - `+` narrows the span by the factor about the Active subtask, and `-` widens it back;
      - both stop at `zoomLimits`;
      - `0` leaves a view without a domain that shows the subtasks' extent;
      - each key reports `onViewChange` once;
      - the span is spoken after the pause, also for a key at a limit;
      - Ctrl with a key, and a key during a drag, change nothing.
- [ ] One check in the schedule's keyboard suite presses `-`, then `0`, and asserts the time band's span
      and the live region's text.
- [ ] The German key help names the keys, and the wording test passes.
- [ ] `pnpm check schedule`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick schedule`
      pass.
- [ ] The changelogs note the keys (schedule) and the new wording entry (core) under "Added".
