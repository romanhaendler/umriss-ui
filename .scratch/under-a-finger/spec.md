# Under a finger the controls grow, and nothing is a smaller target than 24 px

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "A touch size for the controls" (its Answer holds
every decision below); findings `.scratch/shakedown/mobile-touch.md` 1, 2, 5 and 6, `mobile-native.md` 4-7
and 9, `kiosk.md` 4 and 5, and the touch row of `wishes.md` section 2; ADR-0039, ADR-0041, ADR-0042,
ADR-0043, ADR-0045, ADR-0051.

## Problem Statement

A person who uses an umriss application with a finger meets a desktop library.

- **Every control is 32 px tall**, on a phone, a tablet and a touch-only kiosk alike. Apple's guideline and
  WCAG 2.5.5 ask for 44.
- **Some targets fall below WCAG 2.5.8's 24 px:**
  - the Tag remove (16 × 16);
  - the NumberInput stepper (20 px wide);
  - a Checkbox or Switch outside a field (17 px);
  - the TreeView chevron (16 × 16);
  - the Splitter separator (8 px);
  - the table's row checkbox (16 × 16).
- **An IconButton's name is unreachable**: its Tooltip hides on the press and never shows on touch, although
  ADR-0039 makes the tooltip the only visible name.
- **A ContextMenu cannot be opened on an iPhone**: iOS fires no `contextmenu` on a long press.
- **Many tabs push the page wider** than the phone, and the last tabs cannot be tapped.
- **On a phone with `viewport-fit=cover`**, a toast sits under the home indicator, and a full-window Modal,
  a Drawer and the palette run under the notch.
- **The CommandPalette at full screen has no close button**; a touch-only user closes it only by a backdrop
  tap.
- **The on-screen keyboard is never told what Enter does** in the library's own fields, and the browser's
  autofill list can stand over the Combobox's own list.
- **`prefers-contrast: more` changes nothing**, although forced colours and reduced motion are honoured.
- **A Schedule that fills the screen cannot be scrolled past by swiping on it**, even when all its lanes
  fit.

## Solution

Touch is told by the pointer: sizes and looks follow `@media (pointer: coarse)`; behaviour follows the
pointer type of the event that starts an interaction (ADR-0043). There is no setting, no hook and no
render-time branch, so the server's markup is one for every device. A touch laptop with a trackpad keeps
its dense screen.

- **Under a finger a `md` control is 44 px tall.** `sm` stays 26 and a dense surface's `xs` stays 26, so
  tables, calculations, toolbars and trees keep their pitch.
- **Under a finger nothing the library draws is a target smaller than 24 × 24 px.** A glyph drawn smaller
  is hit in a larger square than it is drawn, never reaching into a neighbour's. A shared check measures
  every example of every demo under touch emulation and holds the promise.
- **A long press names and opens.** On a Tooltip's trigger it shows the tip. Through a new hook,
  `useContextMenuTrigger`, it opens a ContextMenu, together with the right-click and the context-menu key.
- **The tab list scrolls sideways** within its own width and keeps the selected tab in view.
- **Edge surfaces keep clear of the safe area.**
- **The palette shows a close cross under a finger.** The library's own fields set `enterkeyhint` and
  `autocomplete` where the library knows the answer.
- **`prefers-contrast: more` raises the quieter text tones and the edges.**
- **The Schedule's plot leaves the vertical swipe to the page** while its lanes fit.

## User Stories

1. As a field-service user on a phone, I want buttons and fields 44 px tall, so that I hit what I aim at
   the first time.
2. As an operator at a touch-only kiosk, I want a dialog's buttons and a form's fields at 44 px, so that I
   can work with a glove.
3. As an analyst on a touch laptop with a trackpad, I want my dense table and toolbar to stay as they are,
   so that touch support costs me no rows.
4. As an application developer, I want touch sizing without any code or setting, so that a server-rendered
   page shows the right size from the first paint, with no hydration mismatch.
5. As an application developer who wants another height under a finger, I want to set the control-height
   token in my own media query, so that I need no prop for it.
6. As an application developer, I want a table, a calculation and a toolbar to keep their row pitch on a
   tablet, so that the dense surfaces I chose stay dense.
7. As a phone user, I want to remove a chosen value from a MultiSelect with one tap on its cross, so that I
   don't open the list to undo a choice.
8. As a phone user, I want to step a NumberInput and tick a Checkbox or a row checkbox without a second try,
   so that a checklist is quick.
9. As a phone user, I want to fold a tree node and drag a Splitter with a finger, so that those controls
   work on touch at all.
10. As a touch user, I want to hold an icon button to read its name, so that I know what it does before I
    press it.
11. As a touch user, I want holding an icon button to show its name without triggering it, so that asking
    is never acting.
12. As an iPhone user, I want a long press to open a context menu, as it does on Android, so that row and
    canvas actions reach me.
13. As an application developer, I want one hook that opens my ContextMenu on a right-click, the
    context-menu key and a long press, so that I write the trigger once for every device.
14. As a phone user, I want a row of many tabs to scroll sideways, with the selected tab in view, so that
    every tab can be tapped and the page does not grow sideways.
15. As a phone user with a notch and a home indicator, I want toasts, a full-window Modal, a Drawer and the
    palette clear of them, so that nothing I need sits under the hardware.
16. As an application developer who does not set `viewport-fit=cover`, I want nothing to move, so that the
    safe-area handling costs me nothing.
17. As a kiosk user, I want a close cross on the command palette, so that I can leave it without a
    keyboard.
18. As a phone user, I want the keyboard's Enter key to say "go" in the palette and "search" in a search
    field, so that I know what it will do.
19. As a phone user, I want the browser's autofill list kept off the Combobox and the search fields, so that
    it does not cover the library's own list.
20. As a reader who turned on "Increase contrast", I want hints, counters and edges to become stronger, so
    that I can read them in sunlight.
21. As a phone user, I want to scroll the page past a Schedule whose lanes all fit, so that the schedule is
    not a dead zone.
22. As a phone user on a Schedule whose lanes overflow, I want the lane names to scroll the page, and the
    README to say so, so that I have one route out.
23. As the maintainer, I want a check that fails when a target in any demo falls below 24 px under touch
    emulation, so that a new component cannot break the promise unnoticed.
24. As the maintainer, I want the touch signal written down in an ADR, so that later touch work, the native
    pickers first, uses the same signal.

## Implementation Decisions

- **The signal.**
  - Sizes, hit areas and looks are set under `@media (pointer: coarse)`, never under `any-pointer`.
  - Behaviour reads the `pointerType` of the event that starts the gesture, as the Select does.
  - There is no `touch` control size, no provider setting, no exported media hook and no render-time
    branch on the device.
- **The height.**
  - Core's tokens get one block under `pointer: coarse` that sets the `md` control height to 44 px. The
    block stands next to the reduced-motion and the phone-width blocks, in the tokens layer, so an
    application's own unlayered token wins.
  - `sm` (26) and `xs` stay. The `dense` rule, which maps `sm` to `xs` only under a fine pointer, stays as
    it is.
  - Only the height changes; padding, icon size and type do not. A field's text is already 16 px under a
    finger.
  - Whatever reads the `md` height follows by itself: fields, buttons, the segmented control, a radio row,
    a checkbox in a field, the date picker's trigger, the table's `md` toolbar, the dashboard widget's head.
- **The floor.**
  - A target is anything that takes a pointer: a button, a link outside running text, a field, a select, a
    tab, an option, a menu item, a checkbox, a radio, a switch, a slider thumb, a focusable separator, a
    grip.
  - It passes when a 24 × 24 px square centred on it hits the target at every sampled point (corners, edge
    midpoints and centre), by `elementFromPoint`. A hit on something inside the target counts; a hit on a
    pseudo-element counts as a hit on its element.
  - A native input that the library hides behind its own drawing is measured as what it draws, its label or
    its box.
  - A link inside running text is exempt, as in WCAG.
  - The fix for a glyph is the pattern the clear cross and the stepper already use: an invisible
    `::after` pad, positioned absolutely, under `pointer: coarse` only, and never towards a neighbour. A
    control whose box is too small grows its box instead.
- **The check.**
  - A suite in the demo shell measures every example of a demo under `hasTouch` at phone width (375 px),
    in Chromium, light only. It works like the large-text suite: one function, per-package spec files
    calling it, the example list derived from the demo's files, and a named list of open findings that is
    meant to be empty.
  - Overlays (a menu, a list, the date panel, the palette, a toast) are measured where core's feature
    tests open them.
  - Findings in the date picker's time fields stay open, naming the native-picker spec as their fix.
- **The long press.** One internal press detector in core serves the Tooltip and the hook:
  - a touch pointer held 500 ms within 10 px;
  - the click that follows it is swallowed, and so is the `contextmenu` that Android fires.
- **Tooltip.**
  - On a touch `pointerdown` the trigger arms the press instead of hiding the tip.
  - Once the press fires, the tip shows. It stays while the finger is held and for 1.5 s after it lifts.
  - A shorter tap acts and hides, as today.
- **`useContextMenuTrigger(open)`.**
  - Exported from core. It returns props to spread on the target, its pointer and `contextmenu` handlers
    and a style that sets `user-select: none` and `-webkit-touch-callout: none`.
  - It calls `open({ x, y })` in three cases:
    - on a right-click, at the pointer;
    - on the context-menu key, at the target's box;
    - on a long press, at the finger.
  - A caller who has a style of their own merges it.
  - ContextMenu's documentation shows the hook as the way to open it.
- **Tabs.** The tab list scrolls sideways within its own width, without a visible scrollbar. The indicator
  moves with the scroll. On selection and on mount the selected tab is brought into view by setting the
  list's own scroll position, never the page's.
- **Safe areas.** Each edge surface adds `env(safe-area-inset-*)` of its edge to its own inset, so the
  toast tokens keep meaning "room from the visible edge". The edge surfaces are:
  - the toast region;
  - a Modal while it fills the window;
  - the Drawer;
  - the CommandPalette while it fills the window.
- **The palette's close.** A close cross in the palette's input row. It is hidden under a fine pointer by
  CSS, so the markup stays one. It reports through `onClose`.
- **Keyboard hints.**
  - The CommandPalette's input: `enterkeyhint="go"`.
  - Combobox and MultiSelect's search: `enterkeyhint="done"`.
  - TreeSearch and the table's Search: `enterkeyhint="search"`.
  - Combobox, MultiSelect's search, TreeSearch and the table's Search: `autocomplete="off"`, which the
    palette already sets.
  - A caller's own attribute wins.
  - Plain fields get no defaults.
- **More contrast.** Core's tokens get one block under `prefers-contrast: more`. It sets:
  - the secondary and muted text tones to at least 7:1 on the page and the surfaces;
  - the edges and hairlines to at least 3:1;
  - in both themes, through `light-dark()`.
- **The Schedule's plot.** The plot's `touch-action` is `pan-y` while the lanes fit (nothing to scroll
  vertically), else `none`. The schedule sets it from its view whenever the lanes or the size change. The
  README's touch sentence names the lane names as the page's scroll route on an overflowing schedule.
- **ADR.** One new ADR records the signal, the 44 px, the 24 px floor, and why there is no touch control
  size. It is the first ticket; its number is given when it is written. The rest are commit messages.
  ADR-0042, ADR-0043 and ADR-0051 stand unchanged.

## Testing Decisions

- A good test here measures what a finger meets in a real layout: boxes, hit tests and computed
  `touch-action`. It never asserts on class names. Touch is emulated with Playwright's `hasTouch`, which
  makes `pointer: coarse` match in Chromium; the calculation's density suite asserts that, and the new
  check does too.
- **The height:** core's sizes suite gains an "under a finger" block. Every control on the Sizes page is
  44 px at `md` and 26 at `sm`. A compact table's row stays 35 px; the table's own suite already holds
  that.
- **The floor:** the new shared check, with each package's spec file calling it. Prior art is the
  large-text suite and its "open" list.
- **The long press:** jsdom unit tests with fake timers and `pointerType: "touch"` pointer events, beside
  `tooltip.test.tsx` and `contextMenu.test.tsx`. A held press shows or opens, a short tap acts, the
  swallowed click does not reach the button, and the context-menu key opens at the target. Playwright
  cannot hold a touch reliably (`mobile-native.md` 6).
- **Tabs:** a feature test at 375 px. The document is no wider than the window, the last tab can be tapped,
  and selecting it leaves it fully in view.
- **Safe areas:** a Chromium feature test that sets the insets through the DevTools protocol's safe-area
  override, on a page with `viewport-fit=cover`. The toast, the full-window Modal and the Drawer stand
  inside the insets. Without the override nothing moves, by the existing screenshots.
- **Keyboard hints:** unit tests on the rendered attributes, and that a caller's own value wins.
- **More contrast:** the contrast unit test also reads the `prefers-contrast: more` block, and asserts 7:1
  for the text tones and 3:1 for the edges, in both themes.
- **The Schedule:** the schedule's touch suite asserts the computed `touch-action` on a fitting and an
  overflowing example. Its existing protocol-driven touch, or a synthesised scroll gesture, shows that a
  vertical swipe over a fitting plot scrolls the page.

## Out of Scope

- The native pickers, the date picker's year jump and typed entry, MultiSelect's autofocus on touch,
  NumberInput's minus key and the time fields on WebKit: the ticket "Native pickers on touch".
- Touch editing of a Schedule (long-press to grab): the ticket "The table's and the schedule's single
  wishes".
- A bottom sheet, a Drawer from the bottom, a media-query hook, swipe actions, pull-to-refresh, a FAB and an
  action sheet.
- A bottom tab bar, AppShell and NavLink: the ticket "Core's single wishes".
- A built-in copy button for a table selection: a `Button` around `selectionAsText()` is the route.
- `touch-action: manipulation`, pinch over charts and the schedule, field text at a raised root size, the
  controls on a 4K wall, and the Popover over the on-screen keyboard: the defects triage of `zoom.md`,
  `operator-screens.md` and `mobile-touch.md` 3.
- A height of 44 px for `sm` or `xs`, menu items or calendar days. They stay above the 24 px floor.

## Further Notes

- On upgrade, every application on a touch device sees its `md` controls at 44 px. That stands under
  "Changed" in core's changelog, with the token line that restores 32.
- The check will find targets nobody has listed yet, a chart's legend keys likely among them. Each finding
  gets fixed in its package's ticket, or stays in the open list with its reason and its fix.
- If a 44 px button with today's padding reads as too empty beside a fine-pointer form in the screenshot
  comparison, that is a look for the maintainer to judge. It is not a reason to change more tokens in the
  height ticket.
