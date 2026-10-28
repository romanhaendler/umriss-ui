Status: done
Size: M
Blocked by: none

# Containers that hold a `md` control derive their height from `--u-control-height`

Spec: `../spec.md`, Solution "Where something grows, it grows whole" and Implementation step 4.

Audit every package's stylesheets (`packages/*/src/**/*.css`, and the demo
shell's `packages/demo/src/*.css`) for a fixed `height`, `min-height`,
`block-size` or `grid-template-rows` in px (or a size token that is a fixed px)
on an element that holds a `md` control (toolbars, headers, footers, field rows,
pagination bars, dialog footers, ...). Rewrite each from the token:
`calc(var(--u-control-height) + <the old difference>)`, so it renders the same
pixel value today. Do not touch hit-area pads, `sm`/`xs` places, or dense
surfaces (ADR-0042, ADR-0051). Do not touch `packages/core/src/styles/tokens.css`'s
coarse-pointer block (ticket 02 removes it).

To see the effect, temporarily set `--u-control-height: 44px` and look at a demo
(headless Chromium script on a port of your own, 4274-4277), then drop the
temporary change.

Report the list of what you found and changed (file:line, old -> new) and what
you looked at and left, with the reason; it goes into the delivery comment.

## Comments

Delivered without a code change. Containers that hold a `md` control already
derive from the token: Dashboard head (`calc(var(--u-control-height) + 2px)`),
Table `.toolbarMd .toolbarGroup` (`var(--u-control-height)`), Textarea
(`calc(var(--u-control-height) * 2)`), and every `md` control's own height.
Left, holding no `md` control: Schedule header/footer bands (28 px, sm text),
DatePicker day cells (32 px), CommandPalette field row (56 px, bare input) and
result rows (38 px, dense), Stat sparkline, EmptyState/Alert icon boxes,
Dashboard row unit (the application's `--u-dashboard-row`), Table row pitch
(`sm`), the demo shell header and its own buttons, the 24 px hit-area rules.
The shared clipping check of ticket 04 confirms this in the browser.
