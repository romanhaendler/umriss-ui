# 05 - A long press names a button and opens a context menu

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

On touch, holding an icon button shows its name, and a long press opens a ContextMenu, on iOS as on
Android. Both use one press.

- **The press**, internal to core:
  - a touch pointer held 500 ms within 10 px fires it;
  - the click that ends such a press is swallowed, and so is the `contextmenu` that Android fires for it;
  - it cancels on a move, a lift and `pointercancel`.
- **Tooltip.**
  - A touch `pointerdown` on the trigger arms the press instead of hiding the tip.
  - When it fires, the tip shows. It stays while the finger is held and for 1.5 s after it lifts.
  - A shorter tap acts and hides, as today.
  - A mouse and a pen behave as today.
- **`useContextMenuTrigger(open)`**, exported from core with its JSDoc:
  - it returns props to spread on the target: pointer handlers, `onContextMenu`, and a style with
    `user-select: none` and `-webkit-touch-callout: none`;
  - it calls `open({ x, y })` on a right-click (at the pointer), on the context-menu key (at the target's
    box), and on a long press (at the finger);
  - a caller with a style of their own merges it, and the JSDoc says so.
- **ContextMenu's documentation and demo** show the hook as the way to open it. Its prop text no longer
  says "typically `clientX` and `clientY`" alone.
- **The props** in `API.md` are regenerated.

## Acceptance criteria

- [ ] Tooltip unit tests (fake timers, `pointerType: "touch"`):
      - a 500 ms hold shows the tip, and it hides 1.5 s after the lift;
      - the click that follows is not received by the trigger's `onClick`;
      - a 200 ms tap reaches `onClick` and shows no tip;
      - a move beyond 10 px cancels;
      - mouse behaviour is unchanged.
- [ ] `useContextMenuTrigger` unit tests:
      - a right-click opens at the pointer;
      - the context-menu key opens at the target;
      - a 500 ms touch press opens at the finger, and the click and the `contextmenu` that follow do not
        open it twice or reach the target.
- [ ] `pnpm check core` and `pnpm check:site` pass; `API.md` is current.
