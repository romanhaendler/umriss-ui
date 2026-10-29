Status: done
Date:   2026-10-29

# What 0.49.0 left crooked is straightened

## Problem Statement

0.49.0 shipped the second shakedown (`../shakedown-2026-10-28/`). The run worked through 22 tickets with
parallel agents, a code review, two full browser runs and a screenshot review of every moved baseline.
Along the way the coordinator noted what was shipped with a known ceiling, what was fixed only where the
ticket pointed, what the tests do not yet prove, and where the workspace's own tooling made the work
slower or less safe than it needs to be. None of it blocked the release; all of it is cheaper to fix now
than after a host builds on it.

From the side of the people involved:

- **A host's dialog depends on React's internals.** An `autoFocus` field in a Modal or Drawer is found by
  reading React's private props key on each element. A React minor that renames the key silently puts the
  cursor back on the close cross.
- **A warning that guesses.** The DEV warning for a lowered `light-dark()` compares the root's background
  token with a copy of its light value written into the code, and looks only once, at the first control's
  mount: a theme that changes the background, or a dark mode switched on later, gets a false warning or
  none.
- **Work done on every render.** Flex column widths are measured after every render of every table that
  uses `flex`, even a scroll frame of a virtual table; `onSelectionChange` serialises the whole selection
  on every render to see whether it changed.
- **Edges the tickets did not reach.** A second `Subtasks` layer that registers after a `Dependencies` layer
  can still raise the false "dependency is left out" warning; the value-axis headroom covers vertical bars
  but not horizontal ones; a refused character in a NumberInput leaves the text unchanged but says nothing;
  a search that narrows a virtual list leaves it scrolled to its end.
- **Looks that were already wrong.** A numeric column header such as "Budget (days)" is cut with an
  ellipsis though the column has room for it (present before 0.49.0); the Modal and Drawer examples of
  `autoFocus` stack their fields without the form gap.
- **Coupling and duplication.** The alarm list's state and duration cells share one class, so a change for
  the state broke the duration's alignment; table, alarms, schedule, calculation and dashboard each carry a
  warn-once helper of their own; the text filter's names are terse.
- **Tests that prove less than they say.** Wall-clock budgets in unit tests (`zone`, `multiSelectWindow`,
  demo smoke) fail under load and train everyone to rerun; one schedule browser test sits exactly on its
  boundary; several acceptance boxes of 0.49.0 are covered by code reading only (weekStart in the range and
  date-time pickers, the text filter's keyboard, a column's header naming its group, XLSX group headers, a
  virtual table with groups in the browser).
- **A search index that grew past its budget,** raised from 500 to 550 kB to ship.
- **Tooling that keeps agents blind.** The browser suite's preview ports are fixed, so only one checkout
  can run it at a time: implementers wrote browser specs they could not run, and most were wrong on the
  first run; screenshots of an example were taken with throwaway scripts; `test:visual:on-main` does not run
  from a worktree.

## Solution

Each item is fixed where all callers route through it, with a red test first where behaviour changes. The
Modal finds its `autoFocus` field without React's internals; the light-dark warning reads the token itself
and follows the root's mode; per-render work becomes per-change work; the open edges get their own tests;
the two looks are fixed; the coupled class is split and the warn-once helpers become one where the package
graph allows; flaky tests lose their wall-clock assumptions; the missing acceptance proofs become tests; the
search index is slimmed back under 500 kB; and the workspace gains per-checkout browser ports and one
screenshot command, so a worker can run and see its own browser work.

## User Stories

Dialogs

1. As an application developer, I want `autoFocus` on a field inside a Modal or Drawer to keep working
   across React minors, so that an edit dialog never silently opens on its close cross.
2. As an application developer, I want a dialog without `autoFocus` to focus where it does today (the first
   tab stop), so that nothing moves for dialogs that do not ask.
3. As an application developer, I want focus to return to the trigger when a dialog closes, as today, so
   that keyboard users keep their place.
4. As a library maintainer, I want no read of React's private keys anywhere in the packages, so that a React
   upgrade cannot break behaviour without a type error.
5. As a developer reading the Modal page, I want its `autoFocus` example laid out like a form (a gap
   between the fields), so that the example looks like the library's design language.
6. As a developer reading the Drawer page, I want the same, so that both examples match.

Lowered light-dark()

7. As a developer whose theme overrides `--u-color-bg`, I want no false warning about a lowered build, so
   that a deliberate theme is not reported as a fault.
8. As a developer who switches to dark mode after the first render (a toggle, a stored preference read
   late), I want the warning to appear then, once, so that I learn about the lowered build in the case that
   actually hits me.
9. As a library maintainer, I want the warning to read the light value from the token, not from a copy, so
   that changing the token cannot leave the check behind.
10. As a developer in production, I want none of this to run, so that the check costs nothing there.

Table: per-change work

11. As a user scrolling a virtual table with flex columns, I want no layout measurement per scroll frame,
    so that scrolling stays smooth.
12. As a developer, I want flex widths to be recomputed when the columns, their widths, the visible set or
    the frame's width change, so that the layout is right without measuring on every render.
13. As a developer with a large selection, I want `onSelectionChange` to detect a change without serialising
    the selection on every render, so that a 50,000-key selection costs nothing while unchanged.
14. As a developer, I want `onSelectionChange` to keep its contract (after each change, never during render
    or at mount, once per change), so that lifting it into state stays safe.

Table: looks and behaviour

15. As a user, I want a numeric header such as "Budget (days)" shown whole when its column has room, so
    that headers are not cut for no reason.
16. As a user, I want a header that truly does not fit to keep its ellipsis and its full text available, so
    that narrow columns still work.
17. As a user of a virtual table scrolled deep, I want a search or filter that narrows the list to show its
    first rows, so that I see the best matches rather than the end of the list.
18. As a keyboard user, I want the text filter popover operable with Tab, the arrow keys and Enter, proven
    in a browser, so that the filter is not mouse-only by accident.
19. As a screen-reader user, I want a cell under a column group to be announced with its group ("Q1, Jan"),
    proven by an accessibility-tree test, so that grouped headers stay understandable.
20. As a user exporting a grouped table to Excel, I want the XLSX header cells to read "Q1 · Jan", proven on
    the file's bytes, so that the export matches the CSV.
21. As a user of a virtual table with column groups, I want the head rows, row numbering and sticky head to
    behave in a browser as they do in the unit tests, so that grouping and virtual rows combine.
22. As a library maintainer, I want the text filter's internal names to say what they hold, so that the next
    change to the filter is not a decoding exercise.

Alarms

23. As a library maintainer, I want the state cell and the duration cell styled by classes of their own, so
    that a change to one cannot move the other.
24. As an operator in a third language, I want a long lifecycle state in a narrow state column to end in an
    ellipsis with its full text available, proven in a browser at a narrow width, so that the 0.49.0 fix is
    known to work where it matters.

Schedule

25. As a developer with two `Subtasks` layers, I want no false "dependency is left out" warning when a
    `Dependencies` layer registers between them, so that a correct plan stays silent.
26. As a developer, I want a dependency that names a subtask no layer has to still warn once, so that real
    mistakes are reported.
27. As a developer in a Sunday-first locale, I want the week bands proven in a browser to open on Sunday,
    so that the axis is known to follow `weekStart` on screen too.

Core fields and calendars

28. As a user typing a character a NumberInput cannot read, I want a brief, polite announcement and a visible
    cue that the character was refused, so that "nothing happened" is not my only feedback.
29. As a developer, I want `weekStart` proven for DateRangePicker and DateTimePicker (heads, grid, Home/End),
    so that all three pickers are known to follow it.
30. As a developer evaluating a third language, I want a demo example that sets `formatsFor("fr-CH")` and a
    Sunday-first week, so that I can see both in the docs.

Charts

31. As a chart reader, I want a horizontal bar chart's value axis to end one step above a largest bar that
    sits on a tick, like a vertical one, so that bars never touch the edge in either direction.
32. As a chart reader, I want a normalised horizontal stack to end at 100 %, so that a share chart reads the
    whole.

Warnings, one helper

33. As a library maintainer, I want table, alarms, schedule, calculation and dashboard to use core's
    warn-once helper, so that "once", the DEV gate and the message prefix are one implementation.
34. As a library maintainer, I want charts to keep a helper of its own, so that charts still depend on
    nothing.

Tests that hold under load

35. As a contributor on a busy machine, I want unit tests without wall-clock budgets, so that a test fails
    only when behaviour breaks.
36. As a contributor, I want a performance figure that matters measured where it is meant to be (a
    benchmark or a browser test with its own budget), so that speed is still guarded.
37. As a contributor, I want the demo smoke tests to stop timing out at 5 s while other work runs, so that
    their red means a broken example.
38. As a contributor, I want the schedule browser test that sits on its boundary (a clicked subtask told
    from its task's other bars) to assert with margin, so that it does not flake.

Site

39. As a reader opening the site's search, I want the index under 500 kB again, so that the first opening
    stays fast.
40. As a maintainer, I want the budget back at 500 kB with the index slimmed (duplicate keywords, repeated
    text), so that the budget keeps meaning something.

Tooling for agents and contributors

41. As an implementing agent in my own worktree, I want to run my package's browser specs on ports of my own,
    so that I can see my specs fail and pass before I report.
42. As a coordinator, I want two checkouts to run browser tests at the same time without reusing each
    other's preview server, so that a run never tests the wrong build.
43. As an agent or a contributor, I want one command that screenshots a demo example (and an opened state
    of it) to a file, so that looking at a change is one line, not a script.
44. As a contributor in a worktree, I want `test:visual:on-main` to run there, so that "was it me?" can be
    asked from any checkout.

## Implementation Decisions

**Modal and Drawer initial focus.** The dialog's children mount when the dialog opens, after `showModal()`
has made it visible, and unmount once its exit has ended. React's own `autoFocus` then focuses a visible
field, and the dialog's focusing steps apply only where no field asked. The read of React's props goes. A
closed dialog therefore keeps no state of its own children: a form inside a closed Modal starts afresh on
the next opening. This changes behaviour (Changelog `Changed` with `Migration:` - state that must survive
closing belongs to the caller, as the Modal is controlled already) and is recorded as a dated amendment of
the ADR that governs the dialogs (the dialog choreography's), not a new ADR. Focus return to the trigger
and the exit choreography stay. ConfirmDialog and CommandPalette, which share the choreography, follow.

**Lowered light-dark() warning.** The light value is read from the token itself: a probe element that
forces `color-scheme: light` resolves the root's background token, and the warning compares that with the
root's value while the page is dark. It checks once after mount and once more when the root's
`color-scheme` changes (an observer on the root's class, style and data attributes, disconnected after the
first warning), DEV only. The copied colour literal goes.

**Flex widths.** The measurement runs when the visible columns, their declared or stored widths, their
order, the pin sides or the scroll area's width change - not after every render. The hook that measures
keys on those inputs and on a resize observer; behaviour for a user is unchanged.

**onSelectionChange.** Change is detected from the selection state's own identity (or a version the
selection store bumps on each change), not from a serialisation per render. Contract unchanged.

**Header label width.** A header cell's auto width accounts for its whole label and its sort control, so a
label that fits its column is never cut; a column narrower than its label keeps the ellipsis and the full
text in the accessible name, as today. The cause is found first (reproduced at 0.48.0 too); the fix sits
where header widths are computed, for every column, not only numeric ones.

**Scroll after narrowing.** When a search or a column condition changes the row set of a virtual table, the
scroll area returns to its top. A row set that shrinks for any other reason (a live feed) keeps the clamped
position 0.49.0 gives it.

**Schedule dependency check.** It runs once the scene has settled - after the registration pass in which
the last layer registered - instead of "while no subtask has registered". The lane check uses the same
signal. A real unknown subtask still warns once.

**NumberInput refusal.** A refused character leaves text and value as they are (0.49.0) and in addition
announces once, politely, through core's live-region announcer, with wording in English and German ("Only
digits and the decimal separator"), and marks the field invalid for a moment. No new prop.

**Charts headroom.** The value axis of horizontal bars gets the same headroom rule as vertical bars; a
normalised stack keeps 100 % in both orientations.

**One warn-once helper.** Table, alarms, schedule, calculation and dashboard import core's warn-once helper
(they already depend on core); their own copies go. Charts keeps its own. The message prefix names the
package that warns.

**Alarm cells.** The state cell and the duration cell get classes of their own; the duration keeps
`white-space: nowrap` and its cell's end alignment, the state its inline-flex layout, ellipsis and cap.

**Text filter names.** Internal names in the filter module say what they hold (the canonical condition, a
draft of the panel, an empty term, whether an operator needs a value). No behaviour change.

**Tests without wall clocks.** Unit tests that assert elapsed milliseconds (the zone conversion of 100,000
instants, the MultiSelect window's "ticks every match") assert behaviour only; where the speed is the point,
the figure moves to the benchmark pages or a browser test with its own budget. The demo smoke tests get a
timeout that fits a busy machine, or render fewer examples per test.

**Search index.** The index drops what it repeats (keywords that equal the title or the heading, text that
stands twice for one anchor) until it is under 500 kB; the budget returns to 500,000.

**Per-checkout browser ports.** The Playwright configuration and the `preview:demo` scripts take a base port
from the environment (default the current 4173); each package's server is the base plus its fixed offset,
and `reuseExistingServer` checks that the server it would reuse serves this checkout (a marker the preview
answers with, e.g. the checkout's path in a response header or a small file). The brief for workers gives
each one a base port. The visual-quick script and `test:visual:on-main` take the same variable.

**Screenshot command.** A workspace script takes a package, a page and an example id (optionally a click on
a named button first, a viewport width, light or dark, the touch opt-in) and writes a PNG of that example
from a dev server on a free port, printing console errors. Workers and the coordinator use it instead of
ad-hoc scripts; the worker brief names it.

**`test:visual:on-main` in a worktree.** The export it builds runs the install without the repository's
`prepare` step (which calls `git config` outside a repository), or the step skips itself outside a git
checkout.

**Changelog.** Every commit carries its `Changelog <pkg> <Added|Changed|Fixed>:` lines; the dialog's
children mounting on open is `Changed` with `Migration:`.

## Testing Decisions

- A good test drives the public component or hook as a host does and asserts what a user or host sees:
  the focused element, a console warning, the rows in the DOM, a header's visible text, an announcement, the
  file a host downloads. No test reads a private module except the existing pure seams.
- Seams, highest first:
  - **Browser (Playwright, `tests-visual`)**: Modal and Drawer `autoFocus` and focus return (the existing
    `features-dialog-focus` spec, now also run by the worker); the header label shown whole; scroll to top
    after a narrowing search in a virtual table; text filter keyboard; a virtual table with column groups;
    the alarm state ellipsis at a narrow width; schedule week bands from Sunday; horizontal bar headroom. Prior
    art: `table/tests-visual/features-virtual.spec.ts`, `table/tests-visual/column-groups.spec.ts`,
    `core/tests-visual/features-dialog-focus.spec.ts`.
  - **Component (Vitest + Testing Library)**: the light-dark warning with a themed background and with dark
    switched on after mount; `onSelectionChange` once per change with a large selection; the schedule with
    two Subtasks layers around a Dependencies layer; NumberInput's announcement; weekStart in DateRangePicker
    and DateTimePicker; XLSX group headers read from the produced workbook; a column's header naming its
    group in an ARIA snapshot; each package's warnings still once and silent in production. Prior art:
    `core/tests-unit/loweredLightDark.test.ts`, `table/tests-unit/onSelectionChange.test.tsx`,
    `schedule/tests-unit/malformedData.test.tsx`, `core/tests-unit/weekStart.test.tsx`,
    `table/tests-unit/columnGroups.test.tsx`.
  - **Existing pure seams**: the flex share arithmetic; the charts' tick and domain functions for horizontal
    bars.
  - **Site gate**: the search budget at 500,000 with the slimmed index (`demo/tests-unit/site.test.ts`).
  - **Tooling**: the port variable and the reuse check are proven by running two checkouts' quick visual
    runs at once (one manual check, written into the worker brief), and by a unit test of the config's port
    arithmetic.
- No existing test is edited to make a change pass; the Modal's "children mount on open" may need a closed
  Modal's tests to open it first - such an edit is named in the commit body with its reason.
- Each fix starts from a red test; a finding that does not reproduce is reported, not changed.

## Out of Scope

- Anything the shakedown's maintainer decisions left out (`../shakedown-2026-10-28/README.md`, "Decided"):
  range selection, paste, fill handle, pivot, header drag and the other table wishes not taken; `hourCycle`;
  a longer rename window; sorting by a click on the whole header cell.
- Making the lowered build flip a JavaScript-set mode (ADR-0021's amendment stands; the warning only gets
  more precise).
- Space tokens in `rem` (the row padding grows with the controls but not with the root font; whether the
  spacing scale should follow the root size is a design decision of its own).
- Centred versus start-aligned group labels (no decision asked for).
- The code-quality reviewers P23-P27 (`docs/agents/shakedown/personas.md`) - they run at the next shakedown,
  not here.

## Further Notes

- Source of each item: the 0.49.0 run's code review (standards and spec axes), the coordinator's screenshot
  review of every moved baseline, the browser runs, and the open points in the release report.
- The Modal decision is the only one that moves behaviour for hosts; everything else is internal, a fix of
  a 0.49.0 edge, or tooling. Confirmed by the maintainer (2026-10-29): the children mount on opening; a host
  that wants state to survive closing keeps it itself. The seams above are confirmed as well.
- The worker brief used in 0.49.0 (`$CLAUDE_JOB_DIR/tmp/brief.md` of that job) gains the port base and the
  screenshot command once they exist; the coordinator's lesson "look before merging UI" stands in the
  maintainer's memory.

## Comments

2026-10-29 (coordinator) - delivered in 0.50.0. The sixteen tickets were implemented on parallel agents, each in its own checkout and on its own browser ports, then merged, code-reviewed on both axes, and run through the full browser suite: 4,410 passed, and the six failures were the three new examples' missing baselines, which were reviewed by eye and then written.

Where the delivery departs from the decisions above:
- Charts headroom: does not reproduce. Charts has no horizontal bar kind yet, and the rule should travel with that kind when it comes.
- Lowered light-dark() warning: the probe design was shown in Chromium to warn falsely. A lowered token is substituted on the root, so a light-forcing child sees the same value: a lowered build with a CSS dark mode, and an unlowered one with a plain theme, both warned. The warning now decides from the build (a readable rule carrying `var(--lightningcss-light`) and from Lightning's dark switch on the root, and no token colour stands in the code (ADR-0021 amendment).
- Search index: no keyword equalled a title or heading. The shipped index is written compact instead - each entry an array, each group once - and went from 501 to 351 kB with every lead whole.
- Flex widths: they refit when the rows change as well, so rows that arrive after mount are measured. A scroll of a virtual window measures nothing.
- CommandPalette: unchanged. It takes no children from a host, resets its own query on opening and focuses its own field.
- One warn-once helper: alarms and dashboard had no copy of their own.
- The alarms "Shift+A on a scrolled list" browser test had a race of its own, present at 0.49.0 too: it focused a row and then scrolled it out of the virtual window. It now focuses a row in view.
