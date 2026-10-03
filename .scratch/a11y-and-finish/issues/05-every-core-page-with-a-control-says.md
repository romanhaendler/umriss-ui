# 05: Every core page with a control says its keys

Status: done
Blocked by: 02 (The silent-page check, with charts and calculation filled)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The check wired into the core demo. Pages with a tabbable stage and no Keyboard section — among them Button, Input, Textarea, Card, Alert, Toast, Typography, Stepper — get their native keys as own rows; Toast, Alert, Spinner, ProgressBar, Meter, Stat and Skeleton get Accessibility sections for what they announce or expose.

- [x] The check passes on all core pages, exceptions reasoned
- [x] Every core page that announces something has an Accessibility section
- [x] Screenshot baselines renewed for the pages that gained sections (none needed renewing; see below)

## Comments

Delivered.

- `packages/core/tests-visual/silent-pages.spec.ts` calls `checkSilentPages` with every page except the scenarios page, as charts and calculation do. The check (`packages/demo/checks/silentPages.ts`) now also probes the stage of a page's configurator (`[data-configurator]`). A fault names it "configurator". The configurator is the first slot on ten core pages, and it renders the component exactly as an example does. Without this probe Meter would pass while silent, because only its configurator's stage holds a `meter`.
- Before filling, the check failed on 23 core pages, each named. Tab: alert, badge, button, card, divider, emptystate, formfield, input, installation, language, progressbar, sizes, skeleton, spinner, stack-and-grid, stepper, textarea, theming, toast, typography, umrissprovider. Live regions: alert, button, dock, meter, progressbar, spinner, stepper, textarea. Five of these were first found in a configurator.
- Own Keyboard tables, taken from the source and its tests:
  - Button: Tab, which skips a disabled or loading button; Enter/Space.
  - Input: Tab, and the `clearable` cross has `tabIndex=-1`; the editing keys are the browser's.
  - Textarea: Tab; Enter starts a new line.
  - Card: Tab reaches the head's actions and Show/Hide, and passes over the folded body, which is inert; Enter/Space folds or unfolds.
  - Typography: Tab reaches each Link; Enter follows it, and an `external` link opens a new tab.
  - Alert: Tab reaches the actions, then the cross; Enter/Space calls `onDismiss`.
  - Toast: Alt+T; Tab through the actions and crosses, which opens the deck and holds the clocks; Enter/Space; Escape gives the focus back after Alt+T.
- `keysOf` names the controls that actually stand in the examples:
  - installation, stack-and-grid, divider, spinner, progressbar, skeleton, stepper, badge → button
  - umrissprovider → button, menu, datepicker
  - theming → button, checkbox, switch, typography
  - sizes → twelve control pages
  - language → button, numberinput, combobox, datepicker
  - formfield → input, numberinput, checkbox, select, datepicker, button
  - emptystate → button, tag
  - card, alert and toast → button as well
  - Stepper binds no key of its own (its limits say so), so it links Button's keys.
- Accessibility sections for Button, Textarea, Spinner, ProgressBar, Skeleton, Alert, Toast, Stepper, Stat, Meter and Dock. Each names the role and name, what is announced and when, the label to pass, and what forced colours and reduced motion change, all taken from the source and the CSS.
  - Stepper and Dock were not in the ticket's list. The check found the progress bar in Stepper's deployment example and the dock's `status` line.
  - Stat has no live region; it got its section because the spec asks for one.
  - The existing `about` paragraphs stay, so no page head moves.
- No new exception in the check. Toast's live regions stand in a portal outside the stage, and every other live region is now described on its page.
- Runs: lint, typecheck and test:unit are green. Playwright under the lock: ui-light, charts-light and calculation-light × silent-pages and accessibility, plus the ui-light page-head screenshots of the 24 changed pages: 149 passed.
- Baselines: none moved. The page-head pictures of all 24 changed pages compare unchanged, because the new sections stand below the head.
- `docs/testing.md`'s row now names core and the configurator; core's CHANGELOG says what the pages gained.
