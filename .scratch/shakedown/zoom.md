# Shakedown: zoom and text size on phones (0.40.4)

Status: needs-triage

All six packages on iPhone 13 (WebKit) and Pixel 7 (Chromium), portrait and landscape,
`width=device-width, initial-scale=1`, Vite 8 with `cssTarget`, 2026-10-24. Pinch tested in Chromium only
(CDP); nothing on a real device.

**The zoom-on-focus guard holds everywhere.** Every text-entry element is at least 16 px under
`pointer: coarse`, at `md`, at `size="sm"` and inside `ControlSizeProvider size="sm"`: Input, Textarea,
NumberInput, Combobox, Select, MultiSelect's search, the DateTimePicker's hour and minute, the
CommandPalette, the table's Search, rows-per-page select and range filters. The guard is the shared
`.field`/`.fieldRoot` rule from `#own-styles` (`@media (pointer: coarse) { font-size: 16px }`). Nothing sets
`user-scalable`, `maximum-scale` or `text-size-adjust`.

## Findings

1. **[Misfit] On a pinch-zoomed page, DatePicker, DateTimePicker, MultiSelect and Popover panels are wider
   than the visible area, and their right edge cannot be reached:** they re-pin to the visual viewport on
   every pan (`core/src/components/Popover/position.ts:149`, `Popover.tsx:207`), but their width is fixed and
   `max-width: calc(100vw - 16px)` (`Popover.module.css:14`) uses the layout width. At scale 2 the visual
   viewport is 206 px, the date panel 260 px: Saturday, Sunday and the forward arrow stay cut off. Idea:
   size the panel to `min(own width, visualViewport.width - 16)` and the height likewise. Menu and Combobox
   panels are already clamped correctly.
2. **[Misfit] Pinch zoom is blocked over the Schedule and the Chart plots**, and the schedule plot also
   blocks page scroll: `.plot { touch-action: none }` (`schedule/src/Schedule.module.css:200`); a zoomable
   chart sets `touch-action: pan-y` without `pinch-zoom`. A schedule of 244 px or more on a phone is a dead
   zone for scrolling and zooming (WCAG 1.4.4). Idea: `pan-y pinch-zoom`, switched to `none` only for the
   run of a drag. See also `mobile-native.md` 9.
3. **[Misfit] On touch the field text is pinned to 16 px and does not follow the root font size:** at root
   24 px the input text is 16 px while its label is 19.5 px. Idea: `font-size: max(16px, var(--u-text-sm))`
   in the guard (and `--u-text-xs` for `sm`).
4. **[Misfit] A Toast is placed against the layout viewport**, so it is off screen while the page is
   pinch-zoomed (Popover follows `visualViewport`, Toast does not); Modal and Drawer likewise fill the layout
   viewport. Idea: anchor to `visualViewport`, or document it.
5. **[Look] Chart legend buttons (12.5 px) do not grow with the root font size**, like the axis ticks
   (`design-family.md` 3). Table, schedule and dashboard text scale.
6. **[Misfit] No `touch-action: manipulation` on any control**, so iOS double-tap can still zoom the page
   from a button or day cell (not confirmed in WebKit emulation). Idea: add it to buttons, options and day
   cells - it keeps pinch.

## Held up

The focus guard above · range and file inputs below 16 px but they take no text · a focused field deep in a
page or a Modal stays visible in a viewport shrunk to 420 px (keyboard emulation) in both engines ·
pinch-zoomed Menu and Combobox panels clamp inside the visual viewport · plain text and the table zoom
normally · dashboard edit heads block pinch only when the finger starts on them.
