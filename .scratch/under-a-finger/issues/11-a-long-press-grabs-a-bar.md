# 11 - A long press grabs a schedule's bar

Status: ready-for-agent
Type: task
Size: M

Blocked by: `05-a-long-press-names-and-opens.md` (core's press), `10-a-schedule-that-lets-the-page-scroll.md` (the
plot's `touch-action`)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

On a phone, a planner holds a finger on a bar, and the bar is grabbed: the ghost appears and follows the
finger in time and across lanes, and the lift reports the intents a mouse drag would. Today one finger
always pans, so a phone cannot edit at all (`.scratch/shakedown/schedule.md` 5). The decisions come from the
Answer of the map ticket "The table's and the schedule's single wishes", which the spec's Out of Scope
pointed at. This ticket takes touch editing into this spec.

- **Core's press becomes public** *(agent)*. The schedule may use only core's public entry (ADR-0022), and
  the rule of that ADR is that what the schedule needs becomes public in core, as `useVirtual` did for the
  table.
  - So the press detector that 05 builds internal to core is exported, with its JSDoc. It is the one
    detector, and the Tooltip and `useContextMenuTrigger` keep using it.
  - Its shape is a plain function over pointer events, not a hook *(agent)*: the schedule's gestures live
    in a class outside React. It fires once, with the finger's point, when a touch pointer is held 500 ms
    within 10 px. It cancels on a move, a lift and `pointercancel`. It swallows the click that ends a press
    and the `contextmenu` Android fires for it.
  - Core's `API.md` lists it, and core's changelog notes it under "Added".
- **The grab.**
  - A touch `pointerdown` on a bar arms the press, and the finger pans as today until the press fires.
  - Once the press fires, the bar is grabbed. This needs `"move"` or `"lane"` in `intents`.
  - From then on the finger drags the bar as the mouse does: the ghost, the snapping, `canMoveTo`'s
    refusals, blocked time stepped over, and the auto-pan at the edge.
  - The lift ends in the same intents as a mouse drag. A drop outside the plot reports nothing.
- **What the grab does not do.**
  - A long press on anything but a bar, or on a read-only schedule, does nothing new, and its
    `contextmenu` reaches `onInteraction` as today.
  - Stretching, lead-in and lead-out stay with the mouse, the pen and the keyboard *(agent)*. A bar's edge
    is too narrow a target under a finger, and the triage took the move.
  - A second finger during a grab cancels it, with no intent *(agent)*. The pinch then goes on as today.
- **The page scroll.**
  - Under 10's `pan-y` the browser has chosen at touch start, so it would scroll the page under a grabbed
    bar.
  - A `touchmove` listener, registered as not passive beside the wheel's, cancels the page scroll while a
    bar is grabbed, and only then. Before the grab and after the lift, a vertical swipe scrolls the page as
    10 made it.
  - The plot carries `-webkit-touch-callout: none` and `user-select: none`, so iOS shows no callout during
    the hold.
- **Comments and README.**
  - The comment at the touch branch of the gestures says what the press decides and why the `touchmove`
    must not be passive.
  - The README's touch sentence says that a long press grabs a bar.
- If `.scratch/views-in-their-frame/` (03) has landed, a grab is a drag start and does not start while
  `loading` is on.

## Acceptance criteria

- [ ] Gesture unit tests through the scene in jsdom, with fake timers and `pointerType: "touch"`:
      - a 500 ms hold on a bar, then a move, shows the ghost, and the lift reports the move intent (and the
        lane intent across lanes) a mouse drag of that length reports;
      - a move beyond 10 px before 500 ms pans and grabs nothing;
      - a hold on an empty part of the plot, or with no `"move"` and no `"lane"` in `intents`, grabs
        nothing;
      - a second finger during a grab cancels it with no intent;
      - the click that follows the lift is swallowed: `onInteraction` hears no click for it.
- [ ] A unit test shows that the non-passive `touchmove` cancels the page scroll during a grab and not
      before it.
- [ ] Core's press tests from 05 still pass through the exported function.
- [ ] The schedule's existing touch tests pass: the pinch zooms, a one-finger drag pans, and 10's vertical
      swipe scrolls the page.
- [ ] `pnpm check core`, `pnpm check schedule`, `pnpm check:site` and `pnpm test:visual:quick schedule`
      pass; both `API.md` files are current.
- [ ] The changelogs note the exported press (core) and touch editing (schedule) under "Added".
