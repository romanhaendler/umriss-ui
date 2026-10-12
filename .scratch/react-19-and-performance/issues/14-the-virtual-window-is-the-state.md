# 14 - The virtual window is the state

Status: done
Type: task
Size: S

Blocked by: 10, 12
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", third fix; user story 24

## What to build

Scrolling inside the window of a virtualised table or tree renders nothing.

`useVirtual` holds the window it derives and renders its caller only when the
window, the measured **Row pitch** or the viewport changes. A scroll event
that leaves the window where it is sets no state. What the hook returns keeps
its shape, and `showRow` keeps working.

## Acceptance

- [ ] Through `renderHook`: scroll events inside one window do not render the
      caller; one that crosses it does, and the window and the filler heights
      are right.
- [ ] The existing tests of `useVirtual`, of the virtualised table and of the
      virtualised tree pass unchanged.
- [ ] Core's `API.md` is unchanged.
- [ ] The scroll figures of the table's and the tree's benchmark pages, before
      and after, are in their capability records.
- [ ] `pnpm check core`, `pnpm check table` and the quick layout checks of
      both demos pass.
