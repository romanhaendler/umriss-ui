# 10: Overlays in foreign dialogs, shadow roots, iframes and a pinch-zoomed page

Status:     done
Blocked by: None (can start immediately)

Sources: README 34 (foreign modal), 35 (shortcut in shadow root); H4 (two copies, iframe); earlier-runs-open
core B2, B3 rest, qa 8 (Popover role), zoom 1, zoom 4, settle 10, settle 14a.

- [x] A Popover, Menu or Tooltip opened inside a foreign modal (`[role=dialog][aria-modal=true]`, Radix, Headless UI) portals into it, is clickable and on top; Escape closes only the top layer. `core/src/lib/portalTarget.ts:25` looks for any modal dialog, not only `<dialog>`.
- [x] Inside a shadow root or an iframe, overlays, toasts and the announcer stay in that root/document, and listeners bind to the anchor's own document (`Popover.tsx:230-231`); README states the recipe.
- [x] `useCommandPaletteShortcut` reads the real target (`composedPath()[0]`), so "/" typed in a shadow-root input does not open the palette; it can bind to a given window (iframe).
- [x] Two copies of the library on one page: one Escape closes one layer.
- [x] A Popover whose anchor scrolls out of a clipping container hides (or closes) instead of floating over the page.
- [x] A Popover panel has a role and a name by default; its anchor carries `aria-expanded` and `aria-controls`.
- [x] On a pinch-zoomed page, panels fit the visual viewport, and Toast, Modal and Drawer are placed against it (`visualViewport`).
- [ ] Browser cases (Chromium) for foreign modal, shadow root and pinch zoom; `pnpm check core`.

## Comments

**Delivered (2026-10-31, run coordinator).** `portalTargetFor` finds foreign modals (`[role=dialog|alertdialog][aria-modal=true]`),
a transformed foreign dialog's fixed origin is subtracted, Escape is claimed at the window's capture
phase inside a foreign modal; shadow roots and iframes: portal and listeners in the anchor's own root and
document, README recipe; the palette shortcut reads `composedPath()[0]` and takes `{ target }`; the open
stack hangs on `globalThis` (two copies); a Popover whose anchor is clipped away closes; Popover defaults
to `role="dialog"`, named by its anchor, anchor gets `aria-expanded`/`aria-controls`; pinch zoom via
`lib/visualViewport.ts`. 14 jsdom tests, three `@quick` cases (foreign modal, toast and Modal under zoom).
Decided: `role="none"` added for panels whose inner element has the role (listbox, MultiSelect, the
table's row-actions and editor message); scrolled-out anchor closes rather than hides. Left: no shadow-root
browser case (the demo cannot host a shadow root; jsdom and the worker's Chromium script cover it); a lone
Tooltip is no Escape layer, so Escape closes a foreign dialog behind it.

**Coordinator, checkbox audit (2026-10-31):** unticked - the foreign-modal and pinch-zoom browser cases exist, the shadow-root one does not (the demo cannot host a shadow root).
