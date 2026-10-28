Status: ready-for-agent
Date:   2026-10-28

# Under a finger the hit areas grow; the controls grow only when the application asks

This ticket holds two changes, released together: the touch size (parts
"Problem Statement" to "Acceptance") and a fix of where a dialog Popover puts
the focus when it opens (part "A dialog Popover focuses its first tab stop"
below).

## Problem Statement

Since 0.43.0 (ADR-0070) every `md` control is 44 px tall under a coarse primary
pointer instead of 32 px. Of ADR-0070's decisions this one is the default that
hurts:

- **The layout depends on the device.** An application is built and reviewed
  on a desktop, where nothing changes. On a tablet its `md` buttons, inputs and
  selects grow by 12 px, and nobody at a desk sees it unless they emulate touch.
- **Only part of the scale grows.** The height of `md` changes; spacing, `sm`,
  `xs`, type and every container an application sized in pixels stay. A layout
  built for 32 px controls breaks where it holds them: a toolbar 48 px tall
  around 32 px controls keeps 2 px of air around 44 px ones, a fixed header row
  overflows, a form grid of fixed row height clips.
- **Accessibility does not need it.** WCAG 2.5.8 (AA) asks for 24 × 24 px, which
  the invisible hit areas of 0.43.0 already give without moving a pixel. 44 px is
  2.5.5, level AAA.
- **ADR-0070 names the cost itself**: "On upgrade, every application on a touch
  device sees its `md` controls at 44 px." A change every application has to
  answer should not be the default.

The rest of ADR-0070 is right and stays: touch is the primary pointer, read in
CSS only (no setting, no hook, no branch in render, so a server renders one
markup); nothing drawn under a finger is a target below 24 × 24 px; a behaviour
follows the pointer type of the gesture; a field's text is 16 px under a finger.

## Solution

**One size on every device, by default.** A `md` control is 32 px under any
pointer. Under a finger only the hit areas (the invisible pads of 0.43.0) and
the behaviours change.

**Growing is the application's choice, made in CSS.** The 44 px block moves out
of `tokens.css` into its own stylesheet, `@umriss-ui/core/touch-scale.css`. An
application that wants it imports it:

```ts
import "@umriss-ui/core/touch-scale.css";
```

```css
/* packages/core/src/styles/touch-scale.css */
@layer umriss.tokens {
  /* Opt-in (ADR-0079): under a finger a `md` control is 44 px, the height
     WCAG 2.5.5 and the HIG name. `sm` and `xs` stay (ADR-0070). */
  @media (pointer: coarse) {
    :root {
      --u-control-height: 44px;
    }
  }
}
```

This keeps every constraint ADR-0070 set: it is static and CSS only, so it is
safe for a server and known before the first paint; there is no provider setting,
no hook and no new token. An application that wants another height still writes
its own media query (ADR-0045), as ADR-0070 already says.

**Where something grows, it grows whole.** A container of the library that holds
a `md` control derives its height from `--u-control-height`
(`calc(var(--u-control-height) + …)`), never from a pixel value, so the opt-in
never clips or crowds a control inside the library itself.

## Implementation

1. **ADR-0079**, "The size is the application's, the hit area the library's":
   it supersedes the part of ADR-0070 headed "Under a finger a `md` control is
   44 px tall" and its first consequence. ADR-0070's status becomes "amended by
   ADR-0079"; its other decisions stand. Considered options to record: keeping
   the default (rejected for the reasons above), a provider setting or a size in
   `ControlSizeProvider` (rejected by ADR-0070 already: hook, render branch,
   hydration), a token such as `--u-touch-control-height` (rejected: a token
   cannot fall back to the value of the token it replaces, so it would either
   fix 32 px or ignore an application's own `--u-control-height`).
2. **`packages/core/src/styles/tokens.css`**: delete the `@media (pointer: coarse)`
   block that sets `--u-control-height: 44px`, with its comment. The hit-area
   rules in the component stylesheets stay.
3. **`packages/core/src/styles/touch-scale.css`** as above; the build emits it as
   `dist/touch-scale.css`, and `package.json` exports it beside `./styles.css`,
   with the same `types` entry (`dist/styles.d.ts`) so a side-effect import type
   checks.
4. **Audit the containers.** Every fixed height or min-height in the packages'
   stylesheets that holds a `md` control is written from `--u-control-height`.
   List what was found and changed in the delivery comment.
5. **Checks.** The visual suite's touch emulation runs twice:
   - without `touch-scale.css`: every `md` control has the size it has under a
     fine pointer (a size assertion, not only a screenshot);
   - with `touch-scale.css`: no `md` control overflows or is clipped by its
     container in any example of any demo.
   The existing 24 × 24 px check stays as it is.
6. **Demo.** `@umriss-ui/demo` gets a switch that loads `touch-scale.css`, so the
   grown state can be looked at from a desk.
7. **CHANGELOG** of the next minor, under "Changed":
   > **`md` controls stay 32 px under a finger** (ADR-0079); the 24 px hit areas
   > and the touch behaviours stay.
   > Migration: to keep the 44 px of 0.43.0 to 0.47.0, `import "@umriss-ui/core/touch-scale.css"`.
8. **README**, Styles section: a short "Touch" paragraph that separates what
   happens on its own under a finger (hit areas of at least 24 px, 16 px field
   text, behaviours by the gesture) from what is opt-in (`touch-scale.css`).
9. **`packages/core/API.md`** and the site gates (`pnpm check:site`) follow the
   new export.

## Out of Scope

- The 24 × 24 px hit areas and the boxes that grow to reach them (free Checkbox,
  Switch and the others listed in 0.43.0): they are the AA requirement and stay.
- `sm` and `xs`, dense surfaces (ADR-0042, ADR-0051) and the Select's choice of
  list by the gesture (ADR-0043).
- A scale that also grows spacing, icons and type (a "large scale" as in Adobe's
  Spectrum). If it is ever wanted, it belongs in `touch-scale.css` as well, so
  the opt-in stays one import.

## Acceptance

- Under touch emulation without `touch-scale.css`, a `md` Button, Input, Select
  and SegmentedControl measure 32 px, as under a fine pointer.
- With `touch-scale.css` imported they measure 44 px, and no demo example shows a
  clipped or overflowing control.
- Every target is still at least 24 × 24 px under touch emulation, with and
  without the import.
- `pnpm check` and `pnpm check:site` pass; ADR-0079, the amended ADR-0070, the
  CHANGELOG entry and the README paragraph are written.

# A dialog Popover focuses its first tab stop

## Problem Statement

Since 0.41.0 a `Popover` with `role="dialog"` takes the focus when it opens:
`panel.querySelector(FOCUSABLE)` in `Popover.tsx` (the effect after "A dialog
takes the focus in"), else the panel. That is the first *focusable* element in
document order, which is not always the element Tab would reach:

- **A radio group.** A settings panel whose first control is a
  `SegmentedControl` (or a `RadioGroup`) with its third option chosen gets the
  focus on the *first* radio, an option that is not chosen. The group's tab
  stop is the chosen radio. A keyboard user who presses Space, as one does to
  confirm what has the focus, chooses the first option and changes the setting
  by accident; a screen reader announces "radio, 1 of 3, not selected" where the
  chosen value should be read.
- **A roving tab stop.** `Tabs`, `TreeView` and other composites keep one item at
  `tabindex="0"` and the others at `-1`. `button:not([disabled])` matches an item
  at `-1` as well, so the focus can land on an item that is not the composite's
  tab stop.
- **Hidden elements.** An element hidden with `display: none`, `visibility:
  hidden` or inside `inert` matches the selector and cannot take the focus; the
  call then silently does nothing and the focus stays outside the panel.

## Solution

The panel focuses its **first tab stop**: the first element in document order
that a Tab press would reach.

- It matches `FOCUSABLE`, its `tabIndex` property is 0 or more (this covers a
  roving `tabindex="-1"` on any element, not only on `[tabindex]` itself), it is
  rendered and visible (`element.checkVisibility({ visibilityProperty: true })`
  where available, else a box test) and not inside an `inert` subtree.
- A radio input with a `name` stands for its group: the group's chosen radio,
  else, when none is chosen, its first enabled radio. The other radios of the
  group are skipped.
- No tab stop: the panel itself, as today. Content that placed the focus
  already keeps it, as today.

One helper, `firstTabStop(container)` in `src/lib/`, holds the rule, so a later
surface that takes the focus in (Drawer, Modal, CommandPalette) can use the same
one; changing those is out of scope here.

## Implementation

1. `src/lib/firstTabStop.ts` with the rule above; unit tests in jsdom for: a
   chosen radio that is not the first, a group without a chosen radio, two
   groups, a roving composite with its tab stop not first, a hidden first
   button, an `inert` subtree, an empty panel (returns null).
2. `Popover.tsx`: the focus effect uses `firstTabStop(panel) ?? panel`.
3. A browser test in the demo: a dialog Popover whose first control is a
   `SegmentedControl` with its last option chosen opens with the focus on that
   option, by pointer and by keyboard; Space does not change the value.
4. CHANGELOG of the same minor, under "Fixed":
   > **A dialog Popover focuses its first tab stop**: in a radio group the chosen
   > option, in a composite its tab stop, never a hidden element.

## Acceptance

- The browser test above passes in Chromium and WebKit.
- The unit tests of `firstTabStop` pass; `pnpm check core` passes.

## Comments
