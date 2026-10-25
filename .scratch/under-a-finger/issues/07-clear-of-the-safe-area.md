# 07 - Edge surfaces clear of the safe area

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

On a phone with a notch and a home indicator, and a page that sets `viewport-fit=cover`, the library's
edge surfaces keep clear of the hardware. Without `viewport-fit=cover` nothing moves.

- **The toast region** adds `env(safe-area-inset-*)` of its edge to each toast inset token. The tokens keep
  meaning "room from the visible edge", and their comments say so.
- **A Modal while it fills the window, the Drawer, and the CommandPalette while it fills the window** keep
  their head, foot and content inside the insets of the edges they touch.
- **Core's README**, where it speaks of phones, says that the safe area is honoured under
  `viewport-fit=cover`.

## Acceptance criteria

- [ ] A Chromium feature test sets the safe-area insets through the DevTools protocol's safe-area override,
      on a page with `viewport-fit=cover`, at 375 × 667. It asserts that:
      - a bottom toast stands its inset above the bottom inset;
      - the full-window Modal's head is below the top inset and its foot above the bottom inset;
      - the Drawer stands inside the insets of its edges;
      - the full-window palette stands inside the insets.
- [ ] Without the override, the existing screenshots are unchanged.
- [ ] `pnpm check core` and `pnpm test:visual:quick core` pass.
