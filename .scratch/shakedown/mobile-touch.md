# Shakedown: core, charts and table on phones and tablets (0.40.4)

Status: needs-triage

A field-service app (job list, detail with a trend, checklist with photos, measurement form, overlays) on
iPad (gen 7), iPhone 13 and Pixel 7 (Chromium), iPad and iPhone (WebKit), all with `hasTouch`, Vite 8 with
`cssTarget`, 2026-10-24. Typecheck and build clean, no console output on any device.

## Findings

1. **[Misfit] There is no touch size for the controls.** `--u-control-height` (`core/src/styles/tokens.css:143`)
   stays 32 px under `pointer: coarse`, and `ControlSizeProvider` offers only `sm` and `md`. Measured on
   every device: buttons and tabs 32 px high, row menu trigger 32×32, checkbox and switch 17 px, radios and
   segmented control 26 px, file input 26 px, menu items 32 px, calendar days 38×32, calendar arrows 26×26.
   Below WCAG 2.5.8's 24 px: the Tag remove (16×16) and the NumberInput stepper (20 px wide). Only the clear
   cross, the stepper, the Toast close and the DatePicker clear get a `pointer: coarse` pad. Idea: a `touch`
   size, or `@media (pointer: coarse)` raising the control height to 44 px.
2. **[Look] No safe-area handling anywhere** (`safe-area` occurs 0 times in core, charts and table CSS): a
   toast sits 16 px from the bottom edge, under the home indicator with `viewport-fit=cover`; Drawer and
   Modal edges likewise. Idea: `max(var(--u-toast-inset-bottom), env(safe-area-inset-bottom))`.
3. **[Look] A Popover with a focused input is not kept above the on-screen keyboard:** it repositions
   against its anchor on `visualViewport` resize (`Popover.tsx:201`), but its bottom ends at 412 px in a
   380 px viewport. Emulation only; confirm on a device.
4. **[Look] A Modal at 375 px is the whole window** (`0,0 375×667`); it scrolls and holds, but there is no
   bottom-sheet form. In landscape the sheet is 375 px high.
5. **[Misfit] Core fields set no `enterkeyhint` or `autocomplete` defaults** (pass-through works); only
   NumberInput's `inputmode=decimal` is set.
6. **[Misfit] `prefers-contrast: more` changes nothing** (not in any dist CSS); `forced-colors` is handled.
   For sunlight the muted text (core B5) matters most.

## Wishes

- **A bottom sheet** (a Drawer from the bottom with a handle and snap points). Gave up. Elsewhere: MUI
  SwipeableDrawer, Mantine Drawer `position="bottom"`, vaul. Unlisted (the Drawer takes left/right only).
- **A responsive hook** (`useMediaQuery`, a coarse-pointer hook). Workaround: 6 lines on `matchMedia`.
  Elsewhere: Mantine and MUI `useMediaQuery`. Unlisted.
- **A signature pad.** Gave up (about 80 lines of canvas). Elsewhere: `signature_pad`; not in MUI or
  Mantine. Unlisted; marginal under ADR-0035.
- **A photo-capture field with thumbnails.** `FileInput accept="image/*" capture="environment"` works but
  shows no preview or per-file list. Elsewhere: Mantine Dropzone. Unlisted.
- **Bottom tab bar, swipe actions, pull-to-refresh, FAB, action sheet.** `Tabs` plus `Menu` hold for the
  job list (apart from the 32 px size). Swipe would fight the page scroll; pull-to-refresh is the host's.
  Only the tab bar seems worth it. Unlisted.
- An offline/sync indicator is not needed: `Badge` plus `freshness`/`useFreshness` cover it.

## Held up

Every input is 16 px, so no iOS zoom on focus · German NumberInput gets `inputmode=decimal` · the Modal
follows a shrinking viewport without losing its field · the Toast is full width at 375 px · no CDN requests
and no web fonts · at 6× CPU on a Pixel 7 the job list is ready in 377 ms, a chart in 153 ms · the Popover is
bounded to `100dvh - 16px` · `touch-action:none` only in 3 core rules and 1 table rule.
