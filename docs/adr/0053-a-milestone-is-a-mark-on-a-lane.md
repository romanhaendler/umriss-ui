# A milestone is a mark on a lane, not a piece of work

Status: accepted
Date:   2026-10

A plan has points in time that have no duration: a handover, a release, a
freeze. The schedule drew work as bars and listed "Milestones" under "Not
yet"; a caller faked one with a zero-length subtask, which is neither drawn as
a mark nor safe to drag.

**A milestone is a mark on a lane, `{ id, lane, at, label? }`: read-only, a
stop in the keyboard walk, and no finding.** It is plain data, declared as
`<Milestones data />` inside the `Schedule` as `BlockedTimes` is, and drawn as
a diamond on its lane at `at`, above the work, in the neutral text ink - no
tone, no size.

- **Read-only.** It is not dragged and has no intent (ADR-0023); a press on it
  pans and never takes the bar beneath. Alt+arrows and `[` `]` leave it alone.
- **No finding.** A subtask that ends after a milestone is planning judgement,
  which the schedule does not make (ADR-0023, ADR-0032). The summary does not
  count milestones either: a count would need a wording of its own.
- **A stop in the walk.** The keys meet it beside the subtasks of its lane, in
  time order; the walk is how a keyboard meets anything on the plot
  (ADR-0030, ADR-0033), and the live region reads it as `lane, Milestone:
  label, day time`, so that a screen reader can tell it from a subtask. The
  label falls back to the id.
- **Hit before the bars.** It is drawn above the work, so it is tested first,
  by its half width plus 2 px; `ScheduleHit` and `ScheduleTooltipTarget` gain
  the kind `"milestone"`.
- **An id of its own.** The walk keeps a milestone's id apart from the
  subtasks'; the caller is asked for no uniqueness across lists.

## Considered Options

- **The zero-length subtask,** what a caller had. A bar with no width, a drag
  handle with nothing to hold, and an overlap check that has nothing to say.
- **A separate key for milestones** instead of a place in the walk. Left out:
  ArrowUp/Down, Home/End and the Page keys then work on them unchanged. Whether
  a plan with many milestones makes the walk noisy was the one point the
  maintainer was asked to look at.
- **Findings and dragging.** Work ending after a milestone, a milestone in
  blocked time, and moving a milestone are decisions that belong to the
  application's planning; they stay out, with a tone, a size, an icon, a
  task colour, selection and milestones on a group head.

## Consequences

- `ScheduleTooltipTarget` gained a third kind, so `tooltip={(t) => t.task}`
  no longer type-checks without a check on `kind`. It is listed under
  "Changed" in the schedule's changelog.
- Core gains one wording, `scheduleMilestone(name)`, in English and German, and
  the schedule needs a core that has it.
- A folded group's strip draws the milestone too, as small as the strip allows.
- The glossary gains **Milestone**.
