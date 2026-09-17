# 01 — `ContextMenu` in `@umriss-ui/core`

Status: done
Type: task

Spec: `.scratch/schedule/spec.md` ("ContextMenu", user story 22)

## Scope

- `ContextMenu`: a menu that opens at a position in the viewport, not under a
  trigger. Controlled like `Popover`: `open`, `onOpenChange`, `position`
  (`{ x, y }`, client coordinates), `ariaLabel`, `children`.
- Built on `Popover` (portal, clamping and flipping, outside click, Escape),
  with `MenuItem` and `MenuSeparator` as entries and the keyboard behaviour of
  `Menu` — shared, not copied.
- Focus: the first enabled entry on opening; on closing, back to the element
  that had the focus when it opened.
- Exported at the END of `src/index.ts` (the order rule). No new stylesheet.
- A page in the core demo beside `Menu`, with one example.

## Acceptance

- `contextMenu.test.tsx`: opens at a position (the anchor stands at the
  point), arrow keys cycle, Home/End, an entry runs and closes, Escape closes
  and returns the focus, an outside click closes, the panel is portalled.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green; the new page's
  pictures are new baselines, no existing baseline moves.

## Comments

**Delivered.**

- `ContextMenu` (`packages/core/src/components/ContextMenu/`): controlled
  (`open`, `onOpenChange`, `position`, `ariaLabel`), hangs from a fixed,
  zero-sized anchor at the point, so `Popover` places, dismisses and portals.
  The menu's keyboard handling moved into `handleMenuKeyDown` and its context
  is shared; both stay internal. Focus goes to the first enabled entry when
  the panel mounts (a ref callback: an effect on `open` runs before the
  popover's portal target exists) and back to the element that had it in the
  commit that opened the menu.
- Exported at the end of `src/index.ts`; README table row; demo page
  `contextmenu` after `Menu` with one example.
- `tests-unit/contextMenu.test.tsx`, 10 cases. Core unit suite 998 green.
- **Baselines.** New: `page-contextmenu` and `example-contextmenu--at-the-pointer`
  (both themes). Moved, because the overview lists the new page:
  `page-overview` (both) and `palette-window-ui-light` (the overview lies behind
  the palette). Both had been red before this ticket as well - they still showed
  the former brand "KONTUR UI" and `KonturProvider` - so the renewal also takes
  that stale state out. No other core picture moved (373 passed).
