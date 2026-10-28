Status: ready-for-agent
Date:   2026-10-28

# The second shakedown's defects are fixed, and its chosen wishes are built

## Problem Statement

The second shakedown (`README.md` beside this file, the reports in `personas/`) put the seven packed
packages at 0.48.0 into eight host applications. The maintainer chose what to act on (`README.md`,
"Decided"). From the host's side:

- **A list that shrinks goes blank.** A virtual table scrolled deep shows no row at all after a search
  narrows it, and the scroll bar keeps the old height; the same window logic serves TreeView, MultiSelect
  and every listbox.
- **The alarm list cannot stand a flood.** 5,000 standing alarms are 97,000-150,000 nodes and 2.4 s to
  first paint - the very case the alarms package exists for.
- **Values change silently.** A Swiss clerk types 1234.5 into a NumberInput and gets 12345.
- **The touch opt-in fails or falls short.** `touch-scale.css` imported first in the entry file does
  nothing; imported last it grows the loose fields and buttons, while the alarm Acknowledge button, the
  table toolbar, pagination and Tabs stay 24-32 px under a gloved finger. On a 4K wall at a raised root
  font size the controls keep their pixel height while their text grows.
- **Dialogs, warnings and names mislead.** `autoFocus` inside a Modal is ignored and focus lands on Close;
  the schedule README's own example warns that a drawn dependency "is left out"; two alarm lists both read
  "Alarms" whatever their `aria-label`; the schedule announces one name on two elements.
- **A beginner gets a white screen instead of a sentence.** `useTable` without `rowKey`, a string date, a
  string `options` list, a Modal without `onClose` - raw "is not a function" crashes or an empty control.
- **The docs a consumer or an agent reads miss what the README knows.** Dead links in two published
  READMEs; `llms-full.md` names neither the dark-mode caveat of a lowered build nor `touch-scale.css`;
  nothing says dev mode is ten times slower than the published figures.
- **A third language and a mixed-language screen fight the library.** The locale formats cannot be
  derived (`formatsFor` is internal), the week always starts on Monday and a Sunday-first `weekdays`
  array mislabels the calendar without a word, and every chart needs its own `wording` prop - a chart in
  a German screen stays English unless each one is told.
- **End-to-end tests time out.** Playwright's `.check()` on Checkbox, Switch, a radio, a table selection
  box or a MultiSelect option fails because a drawn box covers a 1 px input.
- **A build without a modern CSS target silently drops dark mode** for a mode set from JavaScript.
- **The table lacks five things everyday apps reach for:** a text filter with operators, a selection
  change event, two-level column headers, column widths that fit content or share the free width, and a
  written way to undo an edit.
- **Smaller looks:** a DatePicker placeholder below 4.5:1, an alarm state cut mid-word, an AlarmBanner time
  that wraps its "AM", a bar chart whose bars touch the top, a dev warning repeated per render, the
  dashboard's cards 16 px inside their neighbours.

## Solution

Each of these is fixed where all callers route through it, with a red test first; the five table wishes
are built inside "the table reports, the application applies" (ADR-0023/0057); four decisions amend ADRs
(0079 touch scale, 0031 charts wording, 0019/0024 formats and week start, 0021 the lowered build's
warning). What stays decided is in "Out of Scope".

## User Stories

Virtual lists

1. As a log-viewer user, I want a virtual table I scrolled to the end to show the matching rows after I
   search, so that a search never looks like "nothing found".
2. As a user of a live feed whose rows shrink while I am scrolled down, I want the window to move to the
   rows that remain, so that the table never goes blank.
3. As a user of a TreeView, MultiSelect or listbox with many entries, I want the same behaviour when the
   list shrinks under me, so that every virtual list in the library behaves alike.
4. As a developer, I want the scroll height to match the shrunken list at once, so that the scroll bar
   tells the truth.

Alarm list

5. As an operator in a flood, I want the alarm list to render only the rows in view, so that 5,000
   standing alarms appear as fast as 50.
6. As an operator, I want focus, selection, first-out and flood marks to stay correct while the list is
   windowed, so that virtual rows change nothing I rely on.
7. As an operator, I want keyboard acknowledge and shelve to reach rows outside the window, so that A,
   Shift+A and S work on the whole list.
8. As an application developer with two alarm lists on one screen, I want my `aria-label` to name each
   list's grid, so that a screen reader tells them apart.

Numbers, dialogs, warnings

9. As a Swiss or French user, I want a typed "." to be read as the decimal separator where "." is not the
   group separator, so that 1234.5 stays 1234.5.
10. As a German user, I want "." to stay the group separator, so that 1.234 stays one thousand two hundred
    thirty-four.
11. As a user typing a character the field cannot read, I want to see it refused rather than silently
    dropped, so that I never save ten times the value.
12. As an application developer, I want `autoFocus` on a field inside a Modal or Drawer to be honoured, so
    that an edit dialog opens with the cursor in its first field.
13. As a developer copying the schedule README, I want no warning about a dependency that is drawn, so that
    I do not "fix" what is not broken.
14. As a JavaScript developer who forgot `onClose`, I want Escape not to throw, and a DEV warning naming
    `onClose`, so that the dialog state does not drift.

DEV warnings for props

15. As a beginner, I want `useTable` without `rowKey`, or with a string, to warn "rowKey must be a function
    (row) => string" instead of crashing, so that I know what to write.
16. As a beginner, I want a string `value` on a DatePicker, DateRangePicker or DateTimePicker to warn and
    name the expected `Date`, so that the page does not go white.
17. As a beginner, I want a non-array `value` on a MultiSelect, and string `options` on a Combobox or
    MultiSelect, to warn and show the expected shape, so that I do not stare at an empty list.
18. As a beginner, I want a string `value` on a NumberInput or a Stat to warn, so that "3.42" does not show
    as "No value".
19. As a beginner, I want a table column whose field no row has to warn once with the field's name, so
    that a typo does not fill a column with "No value".
20. As a beginner, I want schedule `from`/`to` given as strings, Dates or seconds to warn, so that a
    subtask does not vanish.
21. As a beginner, I want each of these warnings once, not on every render, so that the console stays
    readable.

Touch and size

22. As a field-service developer, I want `touch-scale.css` to work wherever I import it, so that the
    opt-in is not decided by the order of my imports.
23. As an operator on a touch panel, I want the alarm Acknowledge, Shelve and Unshelve buttons to grow
    under the opt-in, so that a gloved finger hits them.
24. As a technician, I want the table toolbar, pagination, row actions and every `sm` control to grow
    under the opt-in, so that the screen does not mix 44 px fields with 26 px buttons.
25. As a technician, I want Tabs to follow the control height like every other `md` control, so that
    they grow with the opt-in.
26. As a developer, I want the docs to name what the opt-in does not grow (menu rows, calendar days,
    checkboxes, `xs`), so that I know where my own CSS is needed.
27. As an operator at a 4K wall with a raised root font size, I want controls to grow with the root size,
    so that 22 px text never sits in a 26 px button.
28. As a user who set a larger default font, I want the same, so that the controls keep their proportion.

Docs

29. As a consumer reading the README on npm or in `node_modules`, I want every link to resolve, so that
    "see API.md" leads somewhere.
30. As a coding agent that reads only `llms-full.md`, I want the dark-mode caveat of a lowered build and
    `touch-scale.css` there, so that I do not ship a light production build or miss the opt-in.
31. As an evaluator trying the table in `vite dev`, I want to read that dev mode is about ten times
    slower than the published figures, so that I do not judge it by a 3.5 s dev sort.
32. As a developer who sets dark mode from JavaScript in a build that lowered `light-dark()`, I want one
    DEV warning that names the one-line fix, so that I find out before my users do.

Third language and charts

33. As a team adding French, I want `formatsFor(locale, timeZone)` exported, so that I derive all formats
    from a locale in one line instead of writing twenty functions.
34. As a team in a fixed zone with custom formats, I want `formatsFor(locale, timeZone)` to give me
    zoned instants I can spread my own entries over, so that my times show in the plant's zone.
35. As a team in a Sunday-first locale, I want a `weekStart` in the formats that the calendar, the range
    and date-time pickers and the schedule's week bands follow, so that weeks start where my users expect.
36. As a developer, I want the `weekdays` wording to stay Monday-first and the calendar to rotate it, so
    that a Sunday-first week cannot mislabel a day.
37. As a developer, I want `formatsFor` to take the week start from the locale where the browser knows it,
    so that a locale brings its week with it.
38. As a developer of a German app with charts, I want one charts wording provider at the root, so that
    every chart speaks German without a prop on each.
39. As a developer, I want a chart's own `wording` prop to still win over the provider, so that one chart
    can differ.
40. As a dashboard developer, I want a chart inside a widget to read the provider too, so that widgets do
    not fall back to English.

Playwright and the lowered build

41. As a QA engineer, I want `.check()` and `.uncheck()` to work on Checkbox, Switch, RadioGroup radios,
    the table's selection boxes and MultiSelect options without `force`, so that my e2e suite does not
    time out.
42. As a QA engineer, I want the click to land on the real input, so that Cypress and Playwright behave
    alike.

Table

43. As a user, I want a text column filter with operators - contains, does not contain, starts with, ends
    with, equals, is empty - so that "name contains foo" is one click away.
44. As a user, I want to combine two conditions with AND or OR, so that "starts with A or starts with B"
    works.
45. As a user, I want the text condition shown as a chip and kept in the view, so that a reload or a shared
    view keeps it.
46. As a server-mode developer, I want the text condition in the request in a documented shape, so that my
    backend can apply it.
47. As an application developer, I want `onSelectionChange` on the table, so that the parent learns which
    rows are ticked without holding the selection itself.
48. As a developer, I want `onSelectionChange` to fire after the user's change and never during render,
    so that lifting it into state cannot loop.
49. As a report user, I want a two-level header ("Q1" over "Jan | Feb | Mar"), so that related columns
    read as one group.
50. As a user, I want hiding, resizing and pinning to keep working per column under a group, and the group
    label to span the visible columns, so that grouping costs me nothing.
51. As a screen-reader user, I want the group header announced with the columns it spans, so that I hear
    "Q1, Jan".
52. As a user exporting a grouped table, I want the group label in the exported header, so that "Jan" of
    Q1 and "Jan" of Q2 stay apart.
53. As a user, I want "Fit all columns" in the column menu, so that every column takes its content's width
    at once.
54. As a developer, I want `flex` on a column, so that columns share the width left over and the table
    fills its frame.
55. As a user, I want a column I resize by hand to keep my width, so that flex never fights my drag.
56. As a developer, I want a recipe for undo and redo over `onCellEdit`, so that Ctrl+Z after a wrong edit
    is twenty lines in my app.

Smaller looks

57. As a user, I want the DatePicker placeholder at 4.5:1, so that "Select date" is readable.
58. As an operator, I want a long alarm state to end in an ellipsis with the full text available, so that
    "unacknowledged" is never cut mid-word.
59. As a phone user, I want the AlarmBanner time on one line, so that "AM" is not orphaned.
60. As a chart reader, I want the value axis to end on a round step above the largest bar, so that bars do
    not touch the top.
61. As a developer, I want the "pageSize without Pagination" warning once, so that the console stays
    readable.
62. As a screen-reader user, I want the schedule's plot named "<label>, plot", so that I do not hear the
    same name twice.
63. As a developer, I want the dashboard's cards flush with a table or chart above them while not editing,
    so that the page has one left edge.

## Implementation Decisions

**Virtual window (core).** The pure window function clamps its first visible row to the last full window
of the current count, so a scroll position past the end of a shrunken list yields the last rows and a
leading filler no taller than the list. The virtual hook re-reads the scroll position when the count
changes. One fix serves the table, TreeView, MultiSelect and the listbox.

**AlarmList windowing.** The list passes the table's `virtual` through when its scroll area is bounded
(`maxHeight`); first-out, flood and lifecycle marks, the one-number live region and the focus-follows-
alarm behaviour stay as they are. The README's "Known limits" names the bound it needs.

**AlarmList name.** `aria-label` and `aria-labelledby` reach the grid as ADR-0068 routes names in a
composite; the wording's "Alarms" stays the default when the caller gives none.

**NumberInput.** Reading and filtering share one rule: "." is the decimal separator wherever the formats'
group separator is not "."; where it is (German), "." stays a group separator. A character the field cannot
read is refused visibly (the field keeps the previous text) instead of dropped while the rest is read.

**Modal and Drawer initial focus.** After the dialog opens, an element inside it that React focused for
`autoFocus` keeps the focus; without one, the dialog's own focusing steps apply as today. No new prop.

**Schedule dependency check.** The unknown-subtask check for dependencies runs once every layer has
registered, like the lane check below it.

**Modal without `onClose`.** Escape and the close button call `onClose` only when it is a function; DEV
warns once naming `onClose`.

**DEV warnings for props.** Each package's existing warn-once helper, the rule of ticket 18 (`after-
shakedown/issues/18`): warn where the package sees the mistake at the moment it happens. `useTable`:
`rowKey` missing or not a function (and render nothing instead of crashing); a column whose field no row of
the first page has. Core: a non-`Date` value on the date pickers, a non-array on MultiSelect, strings in
`options` of Combobox and MultiSelect, a string `value` on NumberInput and Stat. Schedule: `from`/`to` that
are not numbers in milliseconds. Each message names the prop and the expected shape; misspelt `variant`
and `size` stay with TypeScript.

**`pageSize` warning** fires once per table instance.

**Touch scale (amends ADR-0079).** `touch-scale.css` raises `--u-control-height-sm` with `md` under a
coarse pointer (both 44 px); `xs`, menu rows, calendar days, checkboxes, switches and radios keep their
size and their 24 px hit areas, and the README and `llms-full.md` say so. Its rule wins whatever the import
order (a higher specificity than the token rule; still on `:root` inside `umriss.tokens`, so ADR-0021
holds). Tabs read `--u-control-height` like every `md` control. Alarms and table controls built on `sm`
grow with it; no size prop is added to alarms.

**Control heights follow the root font size.** The control-height tokens are written in `rem`
(2rem, 1.625rem, 1.125rem at a 16 px root, so nothing moves at the default) and the touch opt-in in `rem`
too. Whatever derives from them (row pitch) follows.

**Published README links** point to the repository on GitHub by absolute URL, or are dropped where the
target is not public; a site gate fails on a relative link to a file the package's `files` does not ship.

**`llms-full.md`** of core carries a "Touch" section (the opt-in, its order-independence, what does not
grow) and the lowered-build dark-mode rule; table's and alarms' point to it in one line. Table's
capabilities and README say dev mode is about ten times slower than the production figures.

**Lowered `light-dark()` warning (amends ADR-0021's note).** In DEV, core detects once after mount that its
tokens were lowered by the build (the lowering's own custom properties are present on the root) and that
the page's computed `color-scheme` is dark while the tokens resolve to their light values; it then warns
once with the two fixes the README names. Behaviour does not change.

**Playwright-checkable inputs.** Checkbox, Switch and RadioGroup cover their drawn box with the real
input (`inset: 0`, full size, invisible), as SegmentedControl and FileInput already do; the drawn parts
take no pointer events. Table and MultiSelect inherit it through core's Checkbox.

**Formats (amends ADR-0019/0024).** Core exports `formatsFor(locale, timeZone?)` as it exists. `Formats`
gains `weekStart` (1 = Monday … 7 = Sunday, ISO numbering); the English and German sets carry Monday;
`formatsFor` takes it from the locale's week info where the runtime offers it, else Monday. The month grid,
its Home/End and the weekday heads of every calendar rotate by it; the `weekdays` wording stays
Monday-first by definition. The schedule's week bands follow it. The table's "week" grouping stays ISO.

**Charts wording provider (amends ADR-0031).** Charts export a `ChartsWordingProvider` taking a partial
`ChartsWording`; a chart merges default, then provider, then its own `wording` prop. Charts keep no
dependency on core; an app with both packages sets both providers.

**Table: text filter.** A fourth filter kind `"text"` beside `"list"`, `"range"` and `columnFilter`:
operators contains, does not contain, starts with, ends with, equals, is empty; up to two conditions joined
by AND or OR; matching case-insensitive through the formats' text comparison. The condition is JSON-safe in
the view, shows as a chip, and appears in a server-mode request under the column's id with its operators
and values (documented shape).

**Table: `onSelectionChange`.** An option of `useTable` called with the selected keys after each change
the user or the API makes, from an effect, never during render; the controlled `selection` prop stays.

**Table: column groups.** A `ColumnGroup` part with a `label` wraps `Column`s; the head gets a second row
of group cells (`scope="colgroup"`, spanning the visible columns of the group). Columns keep hiding,
resizing and pinning per column; a column cannot leave its group by reordering; a group split by pinning
shows its label over each part. Exports keep one header row and write "<group> · <column>". The view and
the column menu list columns under their group.

**Table: widths.** A column takes `flex` (a share of the width left after fixed columns) with an optional
`minWidth`; a hand resize stores a pixel width in the view and ends the flex for that column. The column
menu gains "Fit all columns", and the hook returns `autoSizeColumns()`, both using the measurement the grip's
double-click already uses.

**Table: undo recipe.** A recipe in the table docs and a demo example: the app keeps a history of
`onCellEdit` edits and applies the inverse on Ctrl+Z / Ctrl+Shift+Z; the table stays as it is (ADR-0032).

**Smaller looks.** DatePicker placeholder on the muted-text token that reaches 4.5:1; AlarmList state cell
ellipsis with the full text available to pointer and screen reader; AlarmBanner time `nowrap`; bar and
column value axes end on the next nice step above the maximum; schedule plot named "<label>, plot";
dashboard root without side padding while not editing (the edit outline keeps its room in edit mode).

**Changelog.** Every commit carries its `Changelog <pkg> <Added|Changed|Fixed>:` lines and `Migration:`
where a default moves (the rem tokens, the touch opt-in reaching `sm`, the dashboard edge).

## Testing Decisions

- A good test drives the public component or hook the way a host does and asserts what a user or a host
  sees: rows in the DOM, a value, a name, a focused element, a console warning, a measured box. No test
  reaches into a private module except the existing pure seams below.
- Seams, highest first:
  - **Browser (Playwright, `tests-visual`)** for everything layout or pointer decides: the virtual table
    after scroll-and-search (rows present, scroll height), AlarmList with 5,000 alarms (node count bound),
    `touch-scale.css` imported before and after core (44 px either way), `sm` buttons of table and alarms
    under the opt-in, Tabs height, controls at root 32 px, `.check()` without `force` on each input kind,
    the Modal's focused field, the dashboard edge, the alarm state ellipsis, the banner time, column groups'
    head and flex widths. Tag the cheap ones `@quick`. Prior art: `table/tests-visual/touch-scale.spec.ts`,
    `alarms/tests-visual/touch-scale.spec.ts`, `table/tests-visual/density-tokens.spec.ts`.
  - **Component (`tests-unit`, Vitest + Testing Library)** for behaviour without layout: the DEV warnings
    (once, named prop), the schedule's silence on the README example, AlarmList's routed name,
    `onSelectionChange` timing, the text filter's operators and AND/OR, the view round trip, server-mode
    request shape, export header of groups, `ChartsWordingProvider` precedence, weekday heads under each
    `weekStart`, `formatsFor` from the package root. Prior art: `core/tests-unit/switch.test.tsx`,
    `table/tests-unit/useTableSelection.test.ts`, `alarms/tests-unit/alarmList.test.tsx`.
  - **Existing pure seams** where they already carry the logic: the window function (shrinking count, past
    the end), the number parser and input filter (fr-CH, de, en).
  - **Consumer (`tests-consumer`)** for the published shape: `formatsFor` and `ChartsWordingProvider`
    importable from the built package.
  - **Site gate (`pnpm check:site`)** for README links against `files`.
- Each fix starts from its host's red (`personas/` names the repro) turned into one of these tests.
- No existing test is edited to make a change pass; one that seems to need it is reported.

## Out of Scope

- Table: range selection, paste and Delete, fill handle, infinite scroll, column virtualisation, export of
  formatted values, styled Excel, header drag, context menu, pinned rows, status bar, side panel, runtime
  pivot, row drag, cell merge, formulas, charts from a selection, RTL. ADR-0032 stands.
- Sorting by a click on the whole header cell (only the button sorts, as now).
- A longer rename window (it stays one minor).
- `hourCycle` and a 12-hour picker panel.
- A size prop or annunciator variant for alarms; horn, latched alarms, statistics views.
- An app bar, a chart `title`, a page reset, an initial-focus prop.
- Making the lowered build flip a JavaScript-set mode (ADR-0021's amendment stands; only the warning is
  new).
- The table's ISO week grouping.

## Further Notes

- Findings marked unverified in `README.md` (placeholder contrast, alarm cell, banner time, bar axis) are
  reproduced first; one that does not reproduce is reported, not fixed.
- ADR amendments: 0079 (opt-in reaches `sm`, order-independent), 0031 (a charts wording provider), 0019
  and 0024 (`formatsFor` public, `weekStart`), 0021 (the DEV warning). Each amendment is a dated section in
  the ADR, not a new ADR.
- The rem tokens move nothing at a 16 px root; the visual baselines should not change except where a test
  raises the root.
- Wording: new user-facing strings (text filter operators, "Fit all columns", "<label>, plot", the AND/OR
  join) go into core's English and German wording.
