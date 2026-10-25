# A touch size for the controls

Type:   grilling
Status: resolved

## Question

How do umriss controls reach a touch size, and what else does a touch screen get from the library?

`--u-control-height` stays 32 px under `pointer: coarse` and `ControlSizeProvider` offers `sm` and `md`; the
Tag remove (16x16) and the NumberInput stepper (20 px) fall below WCAG 2.5.8's 24 px
(`.scratch/shakedown/mobile-touch.md` 1). Five personas wished for touch (`wishes.md` section 2).

- The mechanism: a `touch` size in `ControlSizeProvider` the app chooses, or `@media (pointer: coarse)` raising
  the height to 44 px by itself, or both. What happens to a dense data screen on a touch laptop?
- What "touch" means for the whole library (media query, provider, both) - the native-picker ticket reuses it.
- Which other touch needs are the library's: safe-area insets (`mobile-touch.md` 2), `enterkeyhint` and
  `autocomplete` defaults (5), `prefers-contrast: more` (6), small targets (TreeView chevron, Splitter,
  `mobile-native.md` 7), the schedule plot trapping vertical scroll (`mobile-native.md` 9).
- The touch wishes: a bottom sheet, a media-query / coarse-pointer hook, a bottom tab bar, a touch route to a
  Tooltip, a long-press helper for ContextMenu, TabList overflow (`mobile-touch.md`, `mobile-native.md` 4-6,
  wishes).

If "how should 44 px look on a dense screen" stays open, a prototype is the next step.

## Answer

Decided 2026-10-25 by the agent; the maintainer delegated the technical questions. Product calls are marked
*(agent, product - for review)*.

- **"Touch" means the pointer, never a setting** *(agent)*. A size or a look follows
  `@media (pointer: coarse)`. A behaviour follows the `pointerType` of the event that starts the
  interaction, as the Select already does (ADR-0043). There is no provider prop, no control size, no
  exported hook and no render-time branch on the device. The reasons:
  - The server renders one markup for every device, so nothing touch-related can cause a hydration
    mismatch.
  - CSS knows the pointer before the first paint.
  - A touch laptop with a trackpad has a fine primary pointer and keeps its dense screen. `any-pointer` is
    never used.

  The library already works this way: the field text is 16 px under a finger, and a compact row is
  35 px under a finger (ADR-0042, ADR-0051). The native-picker ticket and every later touch decision reuse
  this signal.
- **Under a finger, a `md` control is 44 px tall; `sm` stays 26, and a dense surface's small control stays
  26 as today (ADR-0042)**
  *(agent, product - for review)*. One token block in core's tokens, under `pointer: coarse`, sets
  `--u-control-height` to 44 px (WCAG 2.5.5, Apple's HIG). Only the height changes; padding and icon size
  do not.
  - A form, a dialog's buttons and a dashboard widget's head grow on a phone, a tablet and a touch kiosk.
  - A dense place stays dense: the table's toolbar, a compact table, the TreeView and the breadcrumb are
    `sm`. The row pitches of ADR-0042 and ADR-0051 do not move, and those ADRs stand.
  - On a dense data screen with a touch laptop nothing changes, because the laptop's primary pointer is
    fine.
  - An application that wants another height under a finger sets the token in its own media query
    (ADR-0045).
- **Under a finger, nothing the library draws is a target smaller than 24 × 24 px (WCAG 2.5.8)**
  *(agent, product - for review)*. A glyph drawn smaller is hit in a larger square than it is drawn, as
  the clear cross, the stepper and the Toast close already are, and the larger square never reaches into a
  neighbour's. The known cases are the Tag remove (16 px), the NumberInput stepper (20 px wide), the
  Checkbox and Switch outside a field (17 px), the TreeView chevron (16 px), the Splitter separator
  (8 px), the table's row checkbox (16 px) and the time fields' arrows (13 px, left to "Native pickers on
  touch"). A shared check in the demo shell holds the promise: like the large-text check, it measures
  every example of every demo under `hasTouch`.
- **No `touch` size in `ControlSizeProvider`, and no `lg` for touch** *(agent)*. A control size belongs
  to a place and stops at every surface opened from it (ADR-0041). A dialog opened from a toolbar would
  lose a touch size. Touch belongs to the device and reaches every surface.
- **The other touch needs that are the library's:**
  - *Safe areas* *(agent)*. The toasts, a Modal that fills the window, the Drawer and the CommandPalette
    keep their insets from the edge of the safe area, `env(safe-area-inset-*)` added to their own. Without
    `viewport-fit=cover` that inset is 0 and nothing moves.
  - *`enterkeyhint` and `autocomplete`* *(agent)*. A field whose Enter and list the library owns says so:
    - the CommandPalette's input takes `enterkeyhint="go"`;
    - the Combobox, the MultiSelect's search, TreeSearch and the table's Search take
      `autocomplete="off"`, so that the browser's own list does not stand over the library's;
    - Combobox and MultiSelect take `enterkeyhint="done"`, the search fields `enterkeyhint="search"`.

    A plain Input, NumberInput or Textarea gets no defaults: what the value is, and what Enter does, are
    the application's, and the attributes pass through today.
  - *`prefers-contrast: more`* *(agent)*. One token block, as reduced motion has one. Under it the quieter
    text tones reach 7:1 (WCAG 1.4.6) and the edges and hairlines reach 3:1 (1.4.11), in both themes. The
    contrast unit test reads that block too.
  - *Small targets* are under the 24 px floor above. A tap on a TreeView label still selects and does not
    fold *(agent)*: the chevron is the fold, and it grows.
  - *The Schedule plot* *(agent)*. The plot claims the vertical swipe only while it has lanes to scroll.
    When its lanes fit (`maxScroll` 0), the plot sets `touch-action: pan-y`: a vertical swipe scrolls the
    page, and the one-finger time pan and the pinch stay the schedule's. While its lanes overflow, the plot
    keeps `none` and the lane names are the route to scroll the page, as the README says. A touch gesture
    cannot be handed to the page halfway, so there is no hand-over at the end of the lanes, unlike the
    wheel's.
  - *The CommandPalette's close* *(agent)*. Under a finger the palette shows a close cross in its input
    row. Under a fine pointer the cross is hidden by CSS, and Escape stays the way out.
- **The touch wishes:**
  - *A touch route to the Tooltip: take* *(agent)*. A press of 500 ms that moves less than 10 px shows the
    tip. The tip stays while the finger is held and for 1.5 s after it lifts, and the click that ends such
    a press is swallowed: the user asked for the name, not the action. A shorter tap acts as today. This
    makes an IconButton's name (ADR-0039) reachable on touch.
  - *A long-press helper for ContextMenu: take, as `useContextMenuTrigger(open)`* *(agent)*. It returns
    props to spread on the target and calls `open({ x, y })` in three cases:
    - a right-click;
    - the context-menu key, positioned at the target;
    - a touch press of 500 ms. It swallows the click and Android's own `contextmenu` that follow, and it
      sets `user-select: none` and `-webkit-touch-callout: none`.

    It uses the same press as the Tooltip. One hook replaces the application's `onContextMenu`, so iOS
    is covered.
  - *TabList overflow: take* *(agent)*. The tab list scrolls sideways within its own width, and the
    selected tab is scrolled into view within the list, never the page. This is a fix at every width, not
    only on touch.
  - *A bottom sheet: never* *(agent, product - for review)*. At phone width a Modal is already the whole
    window, and it scrolls and holds (`mobile-touch.md` 4). A Menu covers a list of actions. Handles, snap
    points and swipe-to-dismiss are a gesture component that a data-dense application (ADR-0035) does not
    need. Cheap to reverse: a `side="bottom"` would be additive.
  - *A media-query or coarse-pointer hook: never* *(agent, product - for review)*. The library's own
    touch signal is CSS and the pointer type, so it has no use for the hook. The workaround is six lines
    on `matchMedia`, and an exported hook invites the render-time device branch that the first point rules
    out.
  - *A bottom tab bar* belongs to "Core's single wishes" (AppShell / NavLink / bottom navigation). From
    touch's side it needs only the 44 px and the safe area above.
  - *A copy button for a table selection: never built in* *(agent, product - for review)*. The toolbar
    holds the application's controls, and `selectionAsText()` returns what Ctrl+C writes. A `Button` around
    it is the route.
- **Explicitly out:**
  - The handovers to native pickers, MultiSelect's autofocus, NumberInput's minus key and the time fields
    (ticket "Native pickers on touch").
  - Touch editing in the Schedule ("The table's and the schedule's single wishes").
  - `touch-action: manipulation`, pinch over charts and schedule, the field text at a raised root size, and
    the controls at a raised root font size on a 4K wall (`zoom.md`, `operator-screens.md` 2): the defects
    triage.
  - The Popover over the on-screen keyboard (`mobile-touch.md` 3, emulation only).
  - Swipe actions, pull-to-refresh, a FAB, an action sheet, and `any-pointer`.
- **Costly to reverse: yes, for the first two points.** The touch signal and the 44 px change how every
  application looks on every touch device, and later decisions build on the signal. They need an ADR, which
  is the spec's first ticket. Everything else is a commit message.
- **Touches:** core (tokens, Tag, NumberInput, Checkbox, Switch, TreeView, Splitter, Tooltip,
  ContextMenu's new hook, Tabs, Toast, Modal, Drawer, CommandPalette, Combobox, MultiSelect, TreeSearch);
  table (row checkbox, Search); schedule (the plot's `touch-action`); charts, calculation and dashboard only
  where the shared check finds a target below the floor; the demo shell (the new check).
- **Becomes the spec** `.scratch/under-a-finger/`.
