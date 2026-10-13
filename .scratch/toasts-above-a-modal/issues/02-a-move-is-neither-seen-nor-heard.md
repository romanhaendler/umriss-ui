# 02 - A move is neither seen nor heard

Status: done
Type: task
Size: M

Blocked by: 01
Spec: `.scratch/toasts-above-a-modal/spec.md`, "Portalling the region" (what
does not survive a remount); user stories 6, 7, 10, 14, 22, 25, 30, 31

## What to build

When the region changes its place - a dialog opens, a dialog closes - a reader
notices nothing but what lies behind the toast. The toasts and their timers
live in the provider and survive the remount by themselves; this ticket takes
care of what does not.

- **Hover, focus and the pin** are set to false on every change of target, and
  the place the focus would return to is given up. The old node sends no leave
  and no blur, and every countdown would otherwise stand still for good.
- **The entrance.** A card that stood before the move arrives settled: its
  entrance animation is suppressed for the commit of the move only. A card
  that arrives later enters as always.
- **The measured heights** are read again from the new nodes; the deck does
  not collapse for a frame.
- **A toast and a closing dialog in one tick** ("Save" closes and reports):
  whichever order the two happen in, the toast ends up outside the dialog and
  has not entered twice.

jsdom shows the clocks, the callbacks and the deck's state. It has no layout
and plays no animation, so the entrance and the heights are proven by sight in
ticket 04, which samples a standing toast's box in every frame. If that test
shows a second entrance or a collapsed deck, it is this ticket's code that is
corrected.

## Acceptance

- [ ] A move does not call `onClose`.
- [ ] A move does not restart a countdown: a 5 s toast moved at 3 s leaves at
      5 s (fake timers).
- [ ] A deck open under the pointer is closed by a move, and its countdowns
      run again.
- [ ] A deck holding the keyboard's focus is closed by a move, its countdowns
      run again, and a later Escape gives nothing back.
- [ ] `update()` and `dismiss()` reach a toast by its id after a move: a
      `loading` toast shown inside a dialog turns into its outcome after the
      dialog has closed, and its time starts then.
- [ ] A toast shown in the same tick as the dialog's closing, in either order,
      stands once, outside the dialog, with `onClose` not called.
- [ ] A standing toast is not put into a live region a second time by
      anything but the move itself: the same toasts stand in the same two
      regions after it.
- [ ] Every existing toast test passes unchanged.
- [ ] `pnpm check core` passes.
