Status: ready-for-agent
Date:   2026-10-24

# The shakedown's confirmed defects are fixed

## Problem Statement

The first shakedown (`.scratch/shakedown/`) put the six packed packages into
30 host applications. Besides wishes and design questions it found defects
that hit applications which did nothing wrong, each with a cause in a few
lines of source. Step 2 of the shakedown's order of work collects them. From
the host's side:

- **Core.** A click into a Popover, a Menu or a date picker inside a Modal or
  Drawer closes the Modal. `ToastProvider` in a Next.js root layout - as the
  docs show it - fails `next build`. The published declarations fail to
  compile under `exactOptionalPropertyTypes` with `skipLibCheck: false`. A
  wrapper library that re-exports `useToast` or `useFormField` loses them from
  its declarations without an error, because their return types are not
  exported; `wording/de` does not resolve under `moduleResolution: node10`;
  `import "@umriss-ui/core/styles.css"` has no types for TS 6 and 7. Inside a
  shadow root, a click inside a Popover closes it. Breadcrumb's folded "…"
  menu follows a `javascript:` href that React blocks in the same trail's
  inline links.
- **Keyboard.** A Popover with the dialog role - the table's ColumnMenu and
  column filters, the dashboard's widget options - opens and leaves focus on
  its trigger; the panel is portalled to the end of the document, 49 to 80
  Tab presses away. A switch user cannot reach it at all.
- **Table.** The CSV export writes a cell that begins with `=`, `+`, `-` or
  `@` as it is, and a spreadsheet runs it as a formula. A `<Table>` crashes
  under happy-dom, Vitest's second default environment.
- **Calculation.** Rounding happens on the binary value: 1.005 shows 1.00
  where every format of the family shows 1.01, and an invoice reads
  "1.00 + 2.67 + 0.28 ≈ 3.96". A tiny given (1.602e-19) shows as 0, and the
  line says - shown and spoken - that a product with 0 is 96,485.33.
- **Dashboard.** A malformed stored view (`{}`, `{widgets: null}`, an older
  shape) crashes the page. Done permanently deletes every stored widget whose
  type the application does not declare right now - behind a feature flag, a
  role, a plugin not yet loaded. A widget that suspends blanks the whole
  dashboard.
- **Across packages.** The DEV warnings of charts and table never fire in a
  Vite dev server, and core's never fire anywhere: its library build compiles
  them out. The same `import.meta` that carries the flag makes charts and
  table - and with them schedule and dashboard - unloadable in Jest. A
  Calculation inside a dashboard widget is laid out wrongly because both
  packages use an unprefixed `--column`.
- **Charts.** A tooltip prints a limit in the axis's tick format: LL 0.5
  reads "1", HH 4.8 reads "5" - a wrong limit on an operator screen.
- **Core, freshness.** After a wall-clock step a `Stat` was seen reading
  "Fresh" at an age of an hour (kiosk, unconfirmed).

## Solution

Each defect is fixed where every caller routes through, starting from a test
that fails today (its red), so the defect cannot come back unseen:

- A click inside a Modal's or Drawer's dialog closes it only where it lands on
  the backdrop itself; a panel portalled into the dialog is not backdrop.
- No core component reads a browser global during render; `ToastProvider`
  renders on the server.
- The built declarations of every package compile in a consumer with the
  strictest common settings, and a check of the built package keeps it so.
  The context values of `useToast` and `useFormField` and the as-of time type
  of freshness are exported; `wording/de` resolves in every module
  resolution; `styles.css` has a declaration.
- A Popover's outside click reads the element that was really clicked, also
  inside a shadow root.
- Breadcrumb's folded menu follows only web, mail and phone links; any other
  scheme does nothing, as React makes the inline link do nothing.
- A dialog-role Popover takes focus when it opens: the first control in it,
  unless its content has already placed focus inside (the date pickers' day).
- The CSV export neutralises formula cells; numbers stay numbers.
- The table renders under happy-dom.
- The calculation rounds the decimal value, so a figure equals what core's
  formats write for the same number.
- A non-zero number never reads as 0 where no digit count is given: below the
  formats' ten places it is written in scientific notation.
- The dashboard reads any stored value without throwing, keeps the widgets it
  cannot read when Done saves, and gives each widget its own Suspense.
- Development mode is detected one way in core, charts and table, the way
  every bundler and Jest understand, with no `import.meta` left in any shipped
  file.
- Every package's private custom properties carry the package's name, and the
  shared style guard fails on one that does not.
- A tooltip writes a limit as it writes a value on the same axis.
- The freshness finding is first reproduced with a clock whose timers run; it
  is fixed only if it reproduces.

## User Stories

### Overlays inside dialogs (core A2)

1. As an application developer, I want a click on a date in a DatePicker inside a Modal to pick the date and leave the Modal open, so that a form in a dialog can hold a date.
2. As an application developer, I want a click on a MenuItem of a Menu inside a Drawer to run the item and leave the Drawer open, so that row actions work in a side panel.
3. As an application developer, I want a click inside a Popover opened from a Modal to keep the Modal open, so that filters and pickers work in dialogs.
4. As an application developer, I want a click on the Modal's backdrop to close it as before, so that the fix changes nothing a user relies on.
5. As an application developer, I want a click on the empty space above or below a short Modal's sheet to close it as before, so that the golden-ratio spacers still count as backdrop.
6. As an application developer, I want a Modal with `closeOnBackdrop` off to stay open on any click, so that nothing about that option changes.
7. As an application developer, I want a Tooltip inside a Modal to never close it when clicked, so that every surface portalled into a dialog behaves alike.

### Server rendering (core A4)

8. As a Next.js developer, I want `ToastProvider` in my root layout to pass `next build`, so that I can follow the README's setup.
9. As a Next.js developer, I want the server HTML of a page under `ToastProvider` to hydrate without a warning, so that the fix does not trade a crash for a mismatch.
10. As a maintainer, I want a test that renders `ToastProvider` in plain Node, so that a browser global read during render is found before release.
11. As a maintainer, I want every place in core that tells a dialog by its class to tell it without the global constructor, so that the next server-render crash has no sibling left.

### Declarations for strict consumers (core A5, B11, design-system 1, cross-package 13)

12. As a TypeScript developer with `exactOptionalPropertyTypes` and `skipLibCheck: false`, I want `import { Button } from "@umriss-ui/core"` to compile, so that I need not loosen my settings for one library.
13. As a TypeScript developer with those settings, I want every package of the family to compile, so that adding table or charts later does not break my build.
14. As a wrapper-library author, I want `export const useAcmeToast = () => useToast()` to emit declarations without TS4058, so that my library's `dist` keeps every export.
15. As a wrapper-library author, I want the same for `useFormField`, so that my form components can re-export it.
16. As a wrapper-library author, I want the as-of time type that freshness functions take to be exported, so that I can name it in my own signatures.
17. As a developer on `moduleResolution: node10`, I want `@umriss-ui/core/wording/de` to resolve with types, so that German works without changing my resolution.
18. As a developer on `node10`, I want `@umriss-ui/charts/wording/de` to resolve the same way, so that the charts speak German too.
19. As a developer on TS 6 or 7 with unchecked side-effect imports turned off, I want `import "@umriss-ui/core/styles.css"` to type-check, so that the documented import does not raise TS2882.
20. As a developer, I want the same for every package's `styles.css`, so that the rule holds across the family.
21. As a maintainer, I want the check of the built package to compile a consumer file under these settings and to emit its declarations, so that a missing export or a loose optional is found before publishing.

### Shadow DOM (core B3)

22. As a developer rendering into a shadow root, I want a click inside an open Popover to keep it open, so that its content can be used at all.
23. As a developer rendering into a shadow root, I want a click outside the Popover to close it as before, so that the outside click still works.
24. As a developer in the main document, I want nothing about the outside click to change, so that the fix is invisible there.

### Breadcrumb (security 1)

25. As an application developer who builds trail hrefs from CMS or query data, I want the folded "…" menu never to run a `javascript:` href, so that a narrow screen does not open a hole the wide screen does not have.
26. As an application developer, I want a folded entry with an `https:` or relative href to navigate as before, so that the trail still works.
27. As an application developer, I want a folded entry with a fragment href to move within the page as before, so that in-page trails keep working.
28. As an application developer, I want a folded entry with `onSelect` to call it as before, whatever its href, so that client-side routing keeps working.
29. As an application developer, I want `mailto:` and `tel:` hrefs to be followed, so that a contact trail still works.
30. As a security reviewer, I want `data:` and `vbscript:` hrefs to do nothing in the folded menu too, so that the menu allows only what it names.

### Dialog-role Popover focus (audit-family 1, accessibility P10 2 and P11 1)

31. As a keyboard user, I want focus to move into the table's ColumnMenu when I open it, so that its first control is one key away.
32. As a keyboard user, I want focus to move into a column filter when I open it, so that I can filter without 57 Tab presses.
33. As a keyboard user, I want focus to move into the dashboard's widget options when I open them, so that I can change a widget's size.
34. As a switch user with Tab and Enter alone, I want to reach every control of an opened panel, so that I am not blocked.
35. As a keyboard user, I want Escape in the panel to close it and return focus to its trigger as before, so that I keep my place.
36. As a keyboard user, I want a DatePicker to keep focusing its day on open, so that the fix does not move focus away from where the picker puts it.
37. As a keyboard user, I want a MultiSelect panel to keep its own focus behaviour, so that typing into its search still works.
38. As a keyboard user, I want listbox, menu and tooltip Popovers to keep their behaviour, so that only the dialog role changes.
39. As a screen-reader user, I want to land inside the dialog when it opens, so that its name is read and I know where I am.

### CSV formula injection (table 1)

40. As an application developer who exports user-entered text, I want a cell beginning with `=`, `+`, `-` or `@` not to run as a formula in Excel, so that an export cannot attack whoever opens it.
41. As an application developer, I want a cell beginning with a tab or a carriage return neutralised too, so that the known bypasses are closed.
42. As an application developer, I want a column label beginning with such a character neutralised as well, so that the header line is as safe as the data.
43. As a data analyst, I want a negative number to export as a number, so that `-3` stays a value I can sum.
44. As a data analyst, I want booleans and dates to export as before, so that only text changes.
45. As a data analyst, I want the neutralised text to show its own characters after the leading mark, so that nothing of the content is lost.
46. As a maintainer, I want a cell that is both neutralised and quoted to come out correctly, so that `"=HYPERLINK(""…"")"` cannot slip through the quoting.
47. As a German user, I want the file to be the same byte for byte wherever no cell begins with those characters, so that existing exports do not change.
48. As a user copying a selection with Ctrl+C, I want the tab-separated copy to stay as it is, so that pasting into a spreadsheet the user owns still carries formulas they meant to copy.

### Happy-dom (cross-package 9)

49. As a developer whose tests run under happy-dom, I want `<Table>` to render, so that I can test my table screens.
50. As a developer under happy-dom, I want the table's frame effects to tolerate a head without rows, so that sticky and scroll logic do not crash.

### Calculation rounding (calculation 1)

51. As a bookkeeper, I want 1.005 € to show as 1.01 €, so that the figure matches what every other number on the page shows.
52. As a bookkeeper, I want 2.675 and 0.285 to show as 2.68 and 0.29, so that each line of an invoice reads as the rest of the page writes it.
53. As a bookkeeper, I want the "≈" mark to appear only where the shown numbers really do not add up, so that it keeps its meaning.
54. As a developer, I want negative values to round half away from zero on the decimal value too, so that −1.005 shows −1.01.
55. As a developer, I want a value that rounds to zero to show 0, never −0, as before.
56. As a maintainer, I want the shown number to equal what core's formats write for the same value and places, so that two parts of the family never disagree about one number.

### A tiny number never reads as 0 (data-science 1)

57. As a scientist, I want a given of 1.602e-19 to show as a number I can read, not as 0, so that the line tells the truth.
58. As a screen-reader user, I want the spoken sentence to say the same number, so that what I hear is not false.
59. As a developer, I want a number that the formats write with up to ten places to look exactly as today, so that only the values that read as 0 change.
60. As a developer, I want a number given with a digit count to stay padded and rounded to that count, so that my explicit choice wins.
61. As a developer, I want zero itself to read 0, so that the change touches only non-zero values.
62. As a table user, I want a cell holding 1.6e-19 to read the same way, so that the fix holds wherever core's number format is used.

### Dashboard (dashboard 1-3)

63. As an application developer, I want a stored view that is not an object, has no widgets array, or holds entries that are not widgets to read without a crash, so that a corrupt or old localStorage entry does not take the page down.
64. As an application developer, I want such a view to fall back to my default view, so that the user sees a dashboard rather than an empty board.
65. As an application developer, I want entries without a string id or type to fall out, as widgets of unknown types already do, so that one bad entry does not discard the rest.
66. As an application developer, I want a widget whose type is not declared right now to survive Done, so that a feature flag, a role or a late plugin never deletes a user's arrangement.
67. As an application developer, I want those widgets to stay in the stored view after a move, a resize, a removal and Done, so that only what the user changed changes.
68. As an application developer, I want Reset to give the default view as before, so that Reset still means "start over".
69. As an application developer, I want Cancel to keep the stored view untouched as before.
70. As an application developer, I want a widget that suspends to show a loading placeholder in its own body, so that the other widgets stay visible.
71. As an application developer, I want a widget that throws to keep showing its fallback as before, so that Suspense and the error boundary work together.
72. As a reader, I want the loading placeholder to keep the widget's size, so that the board does not jump when data arrives.

### DEV warnings and Jest (cross-package 8, 15)

73. As a Vite developer, I want a chart without `ariaLabel` to warn in the console during `vite dev`, so that the documented DEV warnings reach me.
74. As a Vite developer, I want the table's DEV warnings to fire the same way.
75. As a developer, I want core's DEV warnings (a second ToastProvider, the tree's warnings) to fire in development at all, so that core keeps the promise its source makes.
76. As a developer, I want no DEV warning in a production build, so that users' consoles stay clean.
77. As a Jest developer, I want charts and table to load with core's Jest recipe, so that schedule and dashboard can be tested too.
78. As a Next.js developer, I want DEV warnings in `next dev` and none in `next build`, so that the flag works in the second common toolchain.
79. As a maintainer, I want the check of the built package to fail when a shipped file contains `import.meta` or when the DEV warnings were compiled out, so that the flag cannot break again unseen.

### Custom properties (cross-package 16)

80. As an application developer, I want a Calculation inside a dashboard widget to lay out as it does anywhere else, so that a daily balance can be a widget.
81. As an application developer, I want a Table, a Schedule or a Calculation inside any other umriss surface never to inherit that surface's private custom properties, so that nesting packages is safe.
82. As a maintainer, I want the shared style guard to fail on a private custom property without its package's name, so that the next collision is caught at `pnpm check`.
83. As a theme author, I want core's public `--u-` tokens and charts' `--uc-` tokens to keep their names, so that no theme breaks.

### Chart tooltip limits (operator-screens 1)

84. As an operator, I want the tooltip to show a limit of 0.5 as 0.5, not 1, so that I read the limit that is set.
85. As an operator, I want HH 4.8 to read 4.8, so that a limit near a value is not mistaken for another.
86. As a developer with a `tickFormat` on the y axis, I want limits to read in that format as series values do, so that one axis writes its numbers one way.
87. As a developer, I want the keyboard readout of limits to say the same as the tooltip, so that sighted and screen-reader users read one number.

### Freshness after a clock step (kiosk 1)

88. As a kiosk operator, I want a Stat's freshness to be right within one cadence after the wall clock steps forward or back, so that an NTP step or a DST change never leaves "Fresh" on a lost value.
89. As a maintainer, I want the finding reproduced with timers that run in real time before anything is changed, so that a test-clock artefact does not turn into code.

## Implementation Decisions

### One ticket per finding, red first

- Every finding is fixed from a test that fails on today's code. A finding
  whose red cannot be produced is not fixed; it is closed with a note in its
  shakedown file saying what was measured.
- The fix sits where every caller routes through: Popover for the focus and
  the shadow-root click, the dialog frame for Modal and Drawer, core's number
  format for the tiny number, the dev module for the flag.

### Core

- **Backdrop.** The dialog frame shared by Modal and Drawer counts a press as
  backdrop only when it lands on the dialog element itself or on one of its
  two spacers - no longer "anything outside the sheet". Panels that portal
  into the dialog (Popover, Menu, Tooltip, date pickers, ContextMenu) are
  thereby inside without each having to say so.
- **Server render.** Telling a dialog apart reads the element's node name, not
  the `HTMLDialogElement` global; this holds for the toast region's target and
  the hold's drawn-target test. No other render-time global is introduced.
- **Strict declarations.** The `ref` of `RefProp` is declared as possibly
  `undefined`, and any other optional the strict compile names gets the same.
  The two context-value interfaces (`ToastContextValue`,
  `FormFieldContextValue`) and the freshness as-of type are exported under
  names that read as part of the API; `API.md` is regenerated by `props`.
- **Resolution and stylesheet types.** Core and charts add `typesVersions` for
  `wording/de`; every package's `styles.css` export gets a one-line
  declaration so a side-effect import type-checks.
- **Shadow root.** Popover's outside click tests the first element of the
  event's composed path instead of `event.target`. Portalling, styles and the
  other shadow-DOM points of `core.md` B3 stay out.
- **Breadcrumb.** A folded entry's href is resolved against the document and
  followed only for `http:`, `https:`, `mailto:` and `tel:`; any other scheme
  makes the entry do nothing. `onSelect` keeps precedence. The inline links
  stay plain `<a>` elements under React's own guard (`security.md` 2 is not
  this spec).
- **Dialog-role focus.** When a Popover with `role="dialog"` opens and focus
  is not inside its panel once its content has mounted, focus goes to the
  panel's first focusable element, or to the panel itself when it has none.
  Other roles are untouched. Closing returns focus as today.
- **Tiny numbers.** Core's `number` format without a digit count writes a
  non-zero value that would read 0 at ten places in scientific notation with
  up to ten significant digits, in the locale's notation. Every other value
  reads as today; a value with a digit count is unchanged. This fixes the
  table's 1.6e-19 cell with it; the table's percent cells (`data-science.md`
  2) are not this spec.

### Development mode (core, charts, table)

- One rule in all three: development is `process.env.NODE_ENV` not being
  `"production"`, written literally so that Vite's dependency optimizer, Vite
  and Next builds, webpack and Jest all replace or read it, and read inside a
  guard that answers "production" where no `process` exists. No `import.meta`
  remains in the source of any shipped module.
- The library build keeps that expression as it is (Vite's library mode does
  not replace `process.env`), so the warnings ship and the consumer's bundler
  decides.
- Correction to `cross-package.md` 8: core does read `import.meta.env?.DEV`
  (Toast's second-provider warning, the tree's warnings); its library build
  replaces it with `false`, so core's published build carries no warning.

### Check of the built package

- `check:dist` grows two checks, run per package after the build:
  1. no shipped JavaScript file contains `import.meta`, and the entry still
     contains the development-mode expression (the warnings were not compiled
     out);
  2. a consumer file importing every entry (including `wording/de` and
     `styles.css`) and re-exporting one hook's return type compiles with
     `strict`, `exactOptionalPropertyTypes`, `skipLibCheck: false` and
     `declaration: true`, once under `bundler` and once under `node10`
     resolution.
- These are the only new checks of the built package; the smoke check in
  fresh Vite, Next and Vitest hosts is step 3 of the shakedown, not this spec.

### Table

- **CSV formulas.** A text value (a string, also a column label) whose first
  character is `=`, `+`, `-`, `@`, a tab or a carriage return is written with
  a leading apostrophe, before quoting. Numbers, booleans and dates are
  untouched. The clipboard copy (TSV) is not neutralised: the user pastes into
  their own sheet. ADR-0061 is amended by one paragraph: the CSV no longer
  reads back exactly for such text, and why.
- **Happy-dom.** Every read of a table head's first row tolerates a head
  without a `rows` collection.

### Calculation

- `round` rounds the number's shortest decimal representation half away from
  zero, so the shown number is the one core's formats write for the same
  value and places. Its comment states that and nothing more.
- The "≈" logic is unchanged; it simply compares correct shown numbers now.
- A tiny given is fixed by core's number format (above); the calculation adds
  no notation of its own. The tiny total that rounds to 0 at two places
  (`calculation.md` 4) is not this spec.

### Dashboard

- `readView` accepts `unknown`: a value that is not an object with a widgets
  array reads as the default view; within the array an entry that is not an
  object with a string `id` and `type` falls out, as an unknown type does.
- **Unknown widgets survive.** The stored view keeps the entries the declared
  types cannot read. Done writes the edited arrangement followed by those
  entries in their stored order. Cancel writes nothing; Reset puts the
  default view in the draft, and Done after it keeps those entries as after
  any other edit.
- **Suspense.** Each widget's content stands in its own `Suspense` inside the
  existing error boundary, with core's `Skeleton` filling the widget body as
  the fallback. No new wording.
- No schema version or migration (a wish in `dashboard.md`).

### Custom properties

- In every package but core, a private custom property is named
  `--_<package>-<name>` (`--_dashboard-column`, `--_calculation-line-pad`,
  `--_table-pad`). Core's own `--_` names and the public `--u-` and `--uc-`
  tokens stay.
- The shared style guard - the one table, schedule, calculation and
  dashboard already call - fails when a stylesheet declares or reads a custom
  property that is neither a public token nor its own package's private name.
  The inline style a component writes is caught through the stylesheet that
  reads it.

### Charts

- A limit row in the tooltip, and its keyboard readout, is written as a value
  of its y axis: in the axis's `tickFormat` when the caller gave one, else in
  the value format the tooltip uses for series (up to three places). The
  step-derived tick format no longer writes limits. `LimitLine` and
  `LimitBand` get no `format` of their own.

### Freshness

- The red uses a clock whose timers keep running in real time while the wall
  clock steps an hour forward and five minutes back. The current interval
  re-reads `Date.now()` on every tick, so the reading is expected to be right
  within one cadence (at most 60 s, 6 s for a 60 s stale age); the
  shakedown's Playwright clock moved the time without running timers. If so,
  the ticket leaves that test as a guarantee and closes the finding as a
  measurement artefact. Only if the red holds is the reading re-taken on
  `visibilitychange` and on a heartbeat comparing the wall clock with the
  armed deadline.

### Release

- Each fixed defect gets a "Fixed" line in its package's changelog at
  release; the strict declarations and the dev flag in every package they
  touch.

## Testing Decisions

- A good test drives the public surface - a rendered component, a hook, an
  exported function, the built package - and asserts what a user or a host
  sees: the Modal still open, the focused element, the bytes of the CSV, the
  text of a figure, the stored view, the compiler's exit. No test reads a
  private function or a CSS class.
- **Seams.** Three, all existing:
  1. each package's unit suite (Vitest, jsdom; a per-file environment
     annotation where another is needed) for every behavioural defect;
  2. the check of the built package (`check:dist`) for what only a consumer's
     toolchain sees: the declarations under strict settings and the dev flag;
  3. the shared style guard for the custom-property names.
  No visual test is added; none of the defects is a matter of pixels.
- **Per module, with prior art:**
  - Modal and Drawer with a DatePicker, Menu and Popover inside: core's
    modal, drawer and popover tests.
  - `ToastProvider` server render: a Node-environment test like charts' and
    table's server-render tests.
  - Popover in a shadow root and dialog-role focus: core's popover test; the
    ColumnMenu and column filter by role in table's suite; the dashboard's
    options in `useDashboard`'s suite.
  - Breadcrumb's folded menu with `javascript:`, `data:`, relative, fragment,
    `mailto:` hrefs and `onSelect`: core's breadcrumb test, with navigation
    observed through a stubbed `location.assign`.
  - Number format: core's formats characterisation test (1.6e-19, 1e-9,
    0, a value with a digit count, German notation).
  - CSV: table's csv test with each trigger character, a negative number, a
    quoted formula and a label.
  - Happy-dom: one table render under the happy-dom environment, added as a
    dev dependency of table.
  - Rounding: calculation's evaluate test with 1.005, 2.675, 0.285, −1.005 and
    the invoice sum, each compared with core's format.
  - Dashboard: `useDashboard`'s suite for malformed views, Done with an
    undeclared widget, and a lazy widget beside a plain one.
  - Tooltip limits: charts' tooltip-limits jsdom test with LL 0.5 and HH 4.8,
    with and without a `tickFormat`.
  - Freshness: core's freshness test with a stepped wall clock and running
    timers.
  - Dev flag: the new `check:dist` assertions, red today on charts and table
    (`import.meta` present) and on core (no warning shipped).
- The implementer confirms the dev flag once by hand in a Vite 8 dev server
  and a Jest 30 project from the packed tarballs, following
  `docs/agents/shakedown/`, since no automated seam runs a consumer's dev
  server.

## Out of Scope

- Step 3 of the shakedown: Jest and Vitest out of the box (an `exports`
  `default` condition, the CSS import), server components, the root-prop
  contract, touch sizes, native pickers, and the smoke check in fresh hosts.
- Steps 4 and 5: wishes, the "never" list, alarm management.
- The rest of `core.md` B3 (portalling into a shadow root, styles there),
  `security.md` 2 and 3 (hrefs in `Link`, the export file name), the
  typing of `Tooltip.children` and `Menu.trigger` (B11).
- A `format` prop on `LimitLine` and `LimitBand`.
- The tiny total that rounds to 0 (`calculation.md` 4), per-line rounding,
  scientific notation as an option on axes, columns and the calculation.
- The table's percent decimals and negative zero (`data-science.md` 2).
- A schema version and migration for stored dashboard views; hiding a widget
  from a user; per-widget retry and `onError`; `onDraftChange(false)` on
  unmount (`dashboard.md` 4).
- Any change to the clipboard copy of a table selection.

## Further Notes

- The findings, their repro scripts and the shakedown procedure:
  `.scratch/shakedown/` (each finding named above by file and number) and
  `docs/agents/shakedown/`. The hosts were throwaway; a ticket that needs one
  rebuilds it from the procedure.
- When a ticket is done, its finding is struck from its shakedown file - the
  tracker holds open work only - and step 2 of the shakedown README shrinks
  with it.
- Two findings were not reproduced by the coordinating session: kiosk 1
  (doubtful, see Freshness) and dashboard 1 (no `Suspense` in the package,
  confirmed in the source). Operator-screens 1 and data-science 1 were
  confirmed in the source while writing this spec: the limit row reads the
  axis's step format, and core's number format stops at ten places.
- Suggested ticket order: the dev flag and the built-package check first (it
  gives several reds at once), then core, then the packages.
