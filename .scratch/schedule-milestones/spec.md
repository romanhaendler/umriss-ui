# Milestones for the schedule

Status: ready-for-human

## Problem

The schedule draws work as bars, but a plan also has points in time that have no
duration: a handover, a release, a freeze. The README listed "Milestones" under
"Not yet". A caller today fakes one with a zero-length subtask, which is
neither drawn as a mark nor safe to drag.

## Decisions

The first block was decided by the coordinator without a design session; the
second is the builder's.

| Decision | Choice | Why |
|---|---|---|
| Data (coordinator) | `{ id, lane, at, label? }`, `at` in the schedule's own time | a sibling of `BlockedTime`, plain data (ADR-0023) |
| Declaration (coordinator) | `<Milestones data />` inside `Schedule`, handed out by `useSchedule` | as `BlockedTimes` |
| Drawing (coordinator) | a diamond on its lane at `at`, above the work, in the text ink; no tone, no size | marks take the neutral ink |
| Read-only (coordinator) | not dragged, no intent, no finding | a subtask ending after a milestone is planning judgement |
| Without a pointer (coordinator) | see the next four rows | |
| Walk (builder) | milestones stand in the keyboard walk beside the subtasks of their lane, ordered by time (`sceneKeys.ts`, `walk.ts` made generic) | the walk is how a keyboard meets anything on the plot; ArrowUp/Down, Home/End and Page keys work on them unchanged |
| Readout (builder) | the live region reads `lane, Milestone: label, day time` | as for a subtask, and a screen reader can tell it from one; the label falls back to the id |
| Tooltip (builder) | head `Milestone: label`, then `dateShort time` from core's formats | one new wording, `scheduleMilestone(name)`, in core (`Meilenstein: …` in German; follow-up decided by the coordinator) |
| Alt+arrows, `[` `]` (builder) | no effect on a milestone (the key is still the plot's) | no intent, no dependency |
| Summary (builder) | unchanged | a milestone is no finding and no subtask; a count needs a wording |
| Hit (builder) | a new `ScheduleHit` and `ScheduleTooltipTarget` kind `"milestone"`, tested before the bars; a diamond's hit area is its half width plus 2 px | it is drawn above the work |
| Press (builder) | a press on a milestone pans, never takes the bar beneath | "not dragged" |
| Miniature (builder) | drawn in a folded group's strip, as small as the strip allows (2 to 7 px half width) | blocked time is drawn there too |
| Hover and the keys' stop (builder) | an accent ring around the diamond | the same colour the bars' hover uses under forced colours; under forced colours the ring is `Highlight` |
| Ids (builder) | a milestone's id is its own; the walk keeps it apart from subtask ids | no cross-list uniqueness is asked of the caller |
| Examples (builder) | `Milestones/01` (marks on three lanes), `Milestones/02` (own tooltip using `target.milestone`) | the second shows the new target |

## Out of scope

- Dragging or moving a milestone, any intent for it.
- A finding (work ending after a milestone, a milestone in blocked time).
- A tone, a size, a shape, an icon or a task colour.
- A count of milestones in the summary (it would need a wording of its own).
- Selection of a milestone.
- Milestones drawn on a group head, or without a lane.
- Screenshot baselines of the new examples.

## To check when accepting

1. **The look.** No browser was run: the diamond (text ink, surface ring, accent ring on hover) was never seen. Look at both examples in light and dark and under forced colours, and in a folded group.
2. **The words.** `scheduleMilestone` in core, "Milestone: Release" / "Meilenstein: Release", used by the tooltip head and the readout. Core's changelog has a line; the schedule now needs a core with it.
3. **A breaking type change for tooltip functions.** `ScheduleTooltipTarget` gained a third kind, so `tooltip={(t) => t.task}` no longer type-checks without a check on `kind`; two existing examples (`Tooltip/02`, `Tooltip/04`) needed one line. The schedule's CHANGELOG lists it under "Changed".
4. **The walk.** Milestones are walked among the subtasks (ArrowRight lands on one). Check that this is not noise for a plan with many milestones; the alternative is a separate key.
5. **Hit area.** The diamond is hit within its half width plus 2 px (Manhattan distance) and wins over the bar beneath.
6. `CONTEXT.md` has the new term **Milestone**. No ADR was written.
