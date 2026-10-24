# Shakedown: an end-to-end suite over all six packages (0.40.4)

Status: needs-triage

A QA lead's suite of a small app on all six packages, in Playwright 1.64 (Chromium, WebKit) and Cypress 15.21
(Electron, testing-library, cypress-axe), axe 4.14, 2026-10-24. Not covered: Firefox, Cypress in Chrome, CI
Linux fonts. **Flakiness: Playwright `--repeat-each=20` (3,840 runs) 0 flaky; Cypress 8 runs 0 flaky** - every
red is deterministic except the menu screenshot (3).

## Findings

1. **[Misfit] `.check()` fails on RadioGroup radios, every table checkbox and the MultiSelect options** too, in
   both tools (the 1×1 input is covered by the drawn dot/box) - `core-screens.md` 1 named only Checkbox and
   Switch. SegmentedControl works. Workaround: a label click or `force`. Idea: `inset: 0` on the input.
2. **[Trap] `data-testid` is silently dropped on `Chart`, the table's `Table`, `Schedule` and `Tooltip`**
   (TypeScript never checks `data-*`); on Combobox, MultiSelect and DatePicker it lands on the wrapper, so
   `getByTestId('city').fill()` fails. It reaches the control on Input, Select, Checkbox, Switch, Slider,
   FileInput, and the `<dialog>` on Modal, Drawer, ConfirmDialog. Idea: forward `data-*` to the root and say
   which element that is (see the root contract, `audit-family.md` 5).
3. **[Misfit] An open-menu screenshot flakes with motion on** (5 of 20 in Chromium, against its own baseline;
   0 of 520 with `reducedMotion: 'reduce'`); Playwright's `animations: 'disabled'` is not enough; setting
   `--u-duration-*: 0s` leaves the 120 ms background and shadow transitions. Idea: a `data-motion="off"` hook.
4. **[Misfit] axe in CI:** (a) dark-mode emulation does nothing until the host sets `color-scheme` and paints
   the body, so axe reports false contrast failures (2 lines of host CSS; documented); (b) the `region` rule
   fails on every open Combobox, Menu and Popover panel, portalled outside `<main>` (`portalTarget` into
   `main` fixes it); (c) real failures at `#8b8b8b` (`core.md` B5) in Select, MultiSelect and DatePicker
   placeholders, the chart legend and "Show data" (55 nodes with the data table open), the dashboard's size
   label; schedule ticks fail only at DPR 2 in WebKit, so a laptop and CI disagree. Also two widgets of one
   type share a landmark name, and the toast counter "1 / 3" is named "3 messages, show all"
   (`label-content-name-mismatch`).
5. **[Misfit] Schedule bars are canvas;** their label spans are `pointer-events: none`, so click, hover and
   `dragTo` fail in both tools, and no bar has a role or name. Workaround: `boundingBox()` plus `page.mouse`
   (5 lines). Idea: a focusable, named hit element per bar.
6. **[Misfit] Cypress cannot drive several overlays:** `{esc}` does not close a Modal (native `<dialog>`
   cancel; `cy.realPress('Escape')` works); a tooltip is "covered" for `be.visible` and not found by
   `findByRole('tooltip')`; `trigger('mouseover')` does not show it (`realHover` does). Idea: the Modal also
   handles `keydown` Escape.
7. **[Misfit] In WebKit a Modal opened by mouse does not return focus to its opener** (Safari does not focus a
   clicked button); by keyboard it does. Idea: remember the trigger element, not `activeElement`.
8. **[Misfit] Smaller:** the toast deck's back close buttons are covered until a hover and all share the name
   "Close message"; a Popover panel has no role or name and its anchor no `aria-expanded`/`aria-controls` (Menu
   has both); MultiSelect and DatePicker dialogs are named "Select"/"Select date", not by their field; MultiSelect
   options are checkboxes, not `option`s; `findByLabelText('Name')` fails on a required field labelled "Name*".
9. **[Look] An inline Checkbox followed by a Switch overlap:** the switch covers the checkbox label.

## Wishes (unlisted)

- **A test-mode switch** (`data-motion="off"` or a provider prop). Workaround: one line of Playwright config.
  Elsewhere: MUI `transitions.create`.
- **A `data-testid` pass-through contract.** Workaround: wrapper elements. Elsewhere: MUI `slotProps`, Mantine
  `data-*` on the root.

## Held up

Role and name locators for every form control, `aria-required` set · Combobox `aria-controls`, Menu
`aria-expanded`/`aria-controls`, Tooltip `aria-describedby` · native `selectOption`, Slider `fill`, keyboard and
drag, FileInput `setInputFiles` and the download · dashboard `dragTo` and keyboard reorder · the chart's data
table and live region are assertable, the calculation reads as text, the schedule has an `aria-describedby`
summary · focus-ring fade and caret blink never flaked a snapshot · Chromium and WebKit agree apart from 4, 7
and the schedule contrast.
