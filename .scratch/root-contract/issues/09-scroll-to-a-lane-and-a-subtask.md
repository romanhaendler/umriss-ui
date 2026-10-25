# 09 - Scroll to a lane and a subtask

Status: ready-for-agent
Type: task
Size: M

Blocked by: `06-the-schedules-ref-is-its-root.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

Three functions on `useSchedule`'s return, for a host that shows a lane or a subtask from a list of its own:
a findings list, or a search for an order.

- **`scrollToLane(lane)`** scrolls the lanes vertically until the lane's row is in view, and returns
  `true`.
- **`scrollToSubtask(id)`** brings the subtask's lane into view, and its time as well. When the subtask lies
  outside the span, the span moves to it and keeps its width, as a `setDomain` would. The focus stays where
  it is.
- **`focusSubtask(id)`** does what `scrollToSubtask` does, then makes the subtask the **Active subtask** and
  moves the focus to the plot. The live region reads it out, as the arrow keys do.
- **All three return `false` and change nothing** for:
  - an unknown lane or subtask;
  - a lane inside a folded **Lane group**;
  - a schedule that is not mounted.

  None of them unfolds a group.
- **Demo:** one example in the schedule's demo. A list of findings beside the schedule shows the subtask of
  the finding that is picked, and Enter in the list focuses it.

## Acceptance criteria

- [ ] In jsdom, through the hook:
  - `scrollToLane` sets the lanes' scroll so that the lane's row is in view;
  - `scrollToSubtask` of a subtask outside the span moves the span to it and keeps its width, and leaves
    the focus where it was;
  - `focusSubtask` leaves the plot focused with that subtask as the **Active subtask**;
  - each `false` case returns `false` and changes nothing.
- [ ] One `@quick` visual check in Chromium: after `scrollToSubtask` on a plan with 60 lanes, the bar is
      visible.
- [ ] `API.md` lists the three functions with their first sentences.
- [ ] `pnpm check schedule` and `pnpm check:site` pass, and `pnpm test:visual:quick schedule` passes.
- [ ] The changelog notes the three under Added.
