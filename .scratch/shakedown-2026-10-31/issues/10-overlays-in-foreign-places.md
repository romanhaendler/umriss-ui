# 10: Overlays in foreign dialogs, shadow roots, iframes and a pinch-zoomed page

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: README 34 (foreign modal), 35 (shortcut in shadow root); H4 (two copies, iframe); earlier-runs-open
core B2, B3 rest, qa 8 (Popover role), zoom 1, zoom 4, settle 10, settle 14a.

- [ ] A Popover, Menu or Tooltip opened inside a foreign modal (`[role=dialog][aria-modal=true]`, Radix, Headless UI) portals into it, is clickable and on top; Escape closes only the top layer. `core/src/lib/portalTarget.ts:25` looks for any modal dialog, not only `<dialog>`.
- [ ] Inside a shadow root or an iframe, overlays, toasts and the announcer stay in that root/document, and listeners bind to the anchor's own document (`Popover.tsx:230-231`); README states the recipe.
- [ ] `useCommandPaletteShortcut` reads the real target (`composedPath()[0]`), so "/" typed in a shadow-root input does not open the palette; it can bind to a given window (iframe).
- [ ] Two copies of the library on one page: one Escape closes one layer.
- [ ] A Popover whose anchor scrolls out of a clipping container hides (or closes) instead of floating over the page.
- [ ] A Popover panel has a role and a name by default; its anchor carries `aria-expanded` and `aria-controls`.
- [ ] On a pinch-zoomed page, panels fit the visual viewport, and Toast, Modal and Drawer are placed against it (`visualViewport`).
- [ ] Browser cases (Chromium) for foreign modal, shadow root and pinch zoom; `pnpm check core`.

## Comments
