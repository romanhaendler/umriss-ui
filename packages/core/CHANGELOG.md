# Changes to `@umriss-ui/core`

This document describes what changes for **callers** of the package: exports,
props, behaviour. The journal of the repository (`docs/journal.md`) describes
something else — what was worked on here, including
rebuilds, tests and decisions that are invisible from outside. The two therefore
do not run in parallel: an entry there can be missing here because it changed
nothing about the contract; and one sentence here can summarise three entries
there.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why a rule stronger than the figure applies as
well: **whatever changes existing behaviour stands under a heading "Changed" of
its own**, no matter which digit rose. Whoever reads only one section before an
upgrade reads that one.

**Names read forwards.** Where an entry below describes a name that has since
been renamed, it is named here as it is called today; string literals, and
names of things that were removed rather than renamed, stand as they stood.

**The count started again at publication.** `0.1.0` is the first version for the
registry. Before it, the package counted up to `0.10.0` inside this repository
without ever being published; those entries stand below under **internal**
numbers (`internal 0.9.0`), and where another document of this repository names
a `core` version from before the first publication, it means that internal number.
Of those, `internal 0.1.0` to `internal 0.3.0` were reconstructed afterwards — the
package stood at `0.1.0` the whole time, because it had exactly one caller and that
caller lay in the same repository — and are grouped by unit of delivery, not by
commit.

## Unreleased

### Added

- **Wording for the schedule's blocked time:** `scheduleBlockedTime` ("Blocked
  time", German "Sperrzeit") on the ghost of a drag held back from it, and
  `scheduleInBlockedTime(label)` ("In blocked time (Leave)", German "In der
  Sperrzeit (Urlaub)") in the tooltip and the readout. `scheduleSummary` gets
  the field `blocked`, the subtasks in blocked time, and says it only where it
  is not zero. An application that implements the whole `Wording` type adds
  the two keys.

### Changed

- **The alarm wording keys follow `@umriss-ui/table`'s new names** (ADR-0035),
  with no deprecated aliases. A partial wording passed to the provider names
  the new keys; an application that implements the whole `Wording` type
  renames them.

  | Before | Now |
  |---|---|
  | `lifecycleStandingUnacknowledged`, `lifecycleStandingAcknowledged` | `lifecycleActiveUnacknowledged`, `lifecycleActiveAcknowledged` |
  | `lifecycleClearedUnacknowledged`, `lifecycleClearedAcknowledged` | `lifecycleResolvedUnacknowledged`, `lifecycleResolvedAcknowledged` |
  | `standingUnacknowledged(count)` | `activeUnacknowledged(count)` |
  | `availabilityShelved(until, by)`, `availabilityShelvedShort` | `availabilitySnoozed(until, by)`, `availabilitySnoozedShort` |
  | `availabilitySuppressedByDesign` | `availabilitySuppressed` |
  | `availabilityOutOfService` | `availabilityDisabled` |
  | `hiddenFromOperation(count)` | `hiddenAlarms(count)` |

  The default texts change with them. English: "Active, unacknowledged",
  "Resolved, acknowledged", "3 active alarms, unacknowledged", "Snoozed until
  12:00 by M. Keller", "Suppressed", "Disabled", "Hidden: 3". German
  (`@umriss-ui/core/wording/de`): "Aktiv, unquittiert", "Behoben, quittiert",
  "3 aktive Meldungen, unquittiert", "Unterdrückt", "Deaktiviert",
  "Ausgeblendet: 3"; "Zurückgestellt" stays.

- **The schedule's wording keys follow its renamed terms** (ADR-0035): a
  transport is a dependency, setup and teardown are lead-in and lead-out, and a
  late transport is a violated dependency. The keys are renamed in one cut, with
  no alias; an application that hands in a whole `Wording` object of its own
  renames its entries. The English texts read "Lead-in", "Lead-out",
  "Dependency" and "Violated dependency", the German ones "Vorlauf", "Nachlauf",
  "Abhängigkeit" and "Abhängigkeit verletzt"; the key help follows a dependency
  instead of a transport.

  | Before | Now |
  |---|---|
  | `scheduleSetup` | `scheduleLeadIn` |
  | `scheduleTeardown` | `scheduleLeadOut` |
  | `scheduleTransport` | `scheduleDependency` |
  | `scheduleLateTransport` | `scheduleViolatedDependency` |
  | `scheduleLateBy` | `scheduleViolatedBy` |
  | `scheduleSummary`'s field `late` | `violated` |

---

## 0.10.0 – Everything the comparison asked for (Sep. 2026)

### Added

- **`--u-shadow-sticky`**: the colour a sticking part's shadow starts from -
  `@umriss-ui/table`'s pinned blocks and its stuck group header. Light as
  before; dark is black at 50 % instead of the text colour at 9 %, which read
  as a glow on the dark ground.
- **The Windows contrast mode** (`forced-colors: active`, forced-colors 01,
  02). Forced colours drop every box-shadow and repaint every ground, and the
  library draws its rings, edges and depth as box-shadows: a focused control
  lost its ring, a button became a word, a field a line of text, a menu text
  floating over the page. Every ring now carries `outline: 2px solid
  transparent` and every edge or depth `outline: 1px solid transparent` - both
  invisible until forced colours paint them in a system colour - and the states
  that were a ground alone take a system colour: the tab's underline, the
  switch that is on, the progress bar's and the meter's fill, the checkbox's
  mixed dash, the radio's dot and the divider's line; the list cursor of
  `Combobox` and `CommandPalette`, the active `TreeView` node and the chosen
  days, range and preset of the date pickers an outline in the selection
  colour. Buttons, badges, tags and `MultiSelect`'s chips keep an edge. Nothing
  changes outside forced colours.
- **`docs/llms-full.md`**, the package's documentation as one Markdown file for
  a coding agent, in the npm package and pinned to its version: every demo page
  with its import line, its examples' source, its props tables and why it is
  built as it is, and the declaration of every other export. The same text
  stands online as <https://romanhaendler.github.io/umriss-ui/core/llms-full.txt>,
  with an index of the pages beside it (`llms.txt`).
- **Every component takes a `ref`, a `className`, a `style` and the rest of
  the DOM props** at the element a caller lays out - a tooltip on a `Stat`, a
  measured `Card`, a `data-testid` anywhere. New for `Badge`, `Card`,
  `CardHeader`, `CardBody`, `Combobox`, `CommandPalette`, `ConfirmDialog`,
  `EmptyState`, `FormField`, `Meter`, `Modal`, `ModalHeader`, `ModalBody`,
  `ModalFooter`, `MenuItem`, `MenuSeparator`, `MultiSelect`, `Skeleton`,
  `Sparkline`, `Spinner`, `Stat`, `Tabs`, `TabList`, `Tab`, `TabPanel`,
  `TreeView`, `TreeSearch` and the four pickers. The `<dialog>` takes it for
  `Modal`, `ConfirmDialog` and `CommandPalette`; the field's wrapper for the
  pickers, `Combobox` and `MultiSelect` (the id from `FormField` stays on the
  control inside); the `role="tree"` list for `TreeView`. All of them are
  `forwardRef` components, so the ref also arrives under React 18.
- **`Tabs` work uncontrolled**: `defaultValue` names the first tab, and the
  tabs switch on their own; `value` and `onChange` are both optional now.
  Without either, every tab is a tab stop until one is chosen.
- **`Card` can be controlled**: `collapsed` folds it from outside, and
  `onCollapsedChange` reports the header's button - controlled, the card
  folds once `collapsed` follows; beside `defaultCollapsed` it is a message.
- **`Switch`**: on or off, taking effect at once - a native checkbox under
  `role="switch"` with its label beside it, `checked`/`defaultChecked`, sizes
  `sm` and `md`, `invalid` (set by `FormField` with an error). The class goes
  to the label, ref and rest to the input, as for `Checkbox`.
- **`Slider`**: one value on the native range input, drawn with tokens -
  `value`/`defaultValue` with `onChange(value)`, `min`, `max`, `step`, `marks`
  (a number, or `{ value, label }`), `format` for the mono readout
  (`showValue`) and `aria-valuetext`. Arrows by a step, PageUp/PageDown by a
  tenth of the range, Home/End to the bounds, the same on every engine.
- **`Drawer`**: the `Modal`'s dialog entering from an edge, `side="right" |
  "left"`, with `ModalHeader`, `ModalBody` and `ModalFooter` inside; its width
  is the new token `--u-drawer-width` (400px).
- **`ProgressBar`**: how far a task has come, `role="progressbar"` -
  determinate with `value` from 0 to 1, indeterminate without; `valueText`
  for a count, `showLabel` for the percentage. No tone: progress is no
  verdict. New token `--u-duration-sweep` for the indeterminate bar.
- **`Accordion` / `AccordionItem`**: sections behind headers that are buttons
  with `aria-expanded` inside a heading (`headingLevel`), `type="single" |
  "multiple"`, `value`/`defaultValue` as a list with `onChange`, arrow keys,
  Home and End between the headers, `disabled` items.
- **`Breadcrumb`**: `items` from the root to the current page, the last
  `aria-current="page"`, each a link (`href`), a button (`onSelect`) or both -
  with `onSelect` the caller routes. Where the trail does not fit, its middle
  levels fold into a menu, measured from the trail's own widths.
- **`Combobox`, `MultiSelect` and `CommandPalette` say what VoiceOver leaves
  out of a list**, through one polite live region the library shares: the
  number of options on opening and on every letter of the search ("4
  options", the empty text where none is left), the option the arrow keys
  moved onto with its state ("Gamma, selected", "Beta, unavailable"; the
  palette's find with its group), and in the multi-select what Enter in the
  search, a chip or Backspace added or removed. It speaks once the keys rest
  for 150 ms, the charts' readout pause, and inside a `<dialog>` from the
  dialog's own region.
- **`Splitter`**: two panes and the line between them, the APG window
  splitter - `orientation="horizontal"` side by side or `"vertical"` stacked,
  `value`/`defaultValue` as the first pane's share in per cent with
  `onChange(value)`, `min`, `max` and `step`. The line is a focusable
  `role="separator"` (`separatorLabel` names it after the first pane): the
  pointer drags it, the arrows of its axis move it, Home and End take it to
  the bounds, Enter collapses the first pane to `min` and restores it.
- **`Stepper`**: where a procedure stands - `steps` (`label`, `description`,
  `failed`) and the index `current`, as an ordered list in a row or a column
  (`orientation`). The current step is `aria-current="step"`; every other
  step's state - done, upcoming, failed - is a word beside its label for a
  screen reader and a tick, number or cross in its marker. It has no keys:
  moving on is the caller's.
- **`FileInput`**: the native file input behind a key, inside a zone that
  takes a drop. `accept` and `multiple` hold for a drop as they hold in the
  dialog (a refused file is named beneath the list), the chosen files stand
  listed with their size and a cross each, `value` with `onChange(files)` or
  uncontrolled, `invalid` from `FormField`. What a drop or a removal leaves
  is written back into the input, so a form sends what the list shows. The
  class goes to the zone, ref and rest to the input. Nothing is uploaded.

### Changed

- **`scheduleKeyHelp` names T beside the brackets**, in English and German:
  `@umriss-ui/schedule` takes `t` and Shift+T as equals of `]` and `[`, since
  a German keyboard reaches the brackets only with AltGr. A wording of one's
  own keeps its text until it says so too.

- **The final polish of the new components and of forced colours**
  (core-foundations 07, core-layout-extras 04, forced-colors 04). The
  indeterminate `ProgressBar` rests with its segment in the middle of the
  track, its ends fading, and sweeps from there - with animations off it no
  longer reads as a share done. The key of a `Breadcrumb`'s folded levels is
  as tall and as wide as a small key and underlines its dots; the trail
  grows to that height when it folds. An invalid `Slider` draws its track
  with the fields' danger edge. The `Splitter`'s line carries the grip glyph
  in its middle, quiet at rest and darker under the pointer. Under forced
  colours the primary `Button` has an edge of two pixels (the second
  inside, so it stands as large as its neighbours) and a `Badge` keeps its
  dot in the text colour.

- **A new key in `Wording`: a shelf as one word** (for `@umriss-ui/table`'s
  alarm list, whose availability is now a badge), in English and German:
  `availabilitySnoozedShort` ("Shelved", "Zurückgestellt"). The sentence
  `availabilitySnoozed` stays - in the badge's tooltip and in what is
  spoken. An application that implements the whole `Wording` type itself no
  longer compiles until it adds it.

- **Two new keys in `Wording`: a table over a server** (for
  `@umriss-ui/table`'s manual mode), in English and German:
  `selectAllOnPage` ("Select all on this page") and `exportPageLabel`
  ("Export page"). A partial wording passed to the provider is merged as
  before; an application that implements the whole `Wording` type itself no
  longer compiles until it adds these two.
- **`pageOfPages` takes the numbers formatted as well**: a third, optional
  argument `{ page, total }` carries them in the provider's formats, and the
  English and German wording write those - "Page 1 of 100,000", "Seite 1 von
  100.000", since a table over a server has that many pages. Below a thousand
  pages nothing changes, and a wording of one's own that reads two arguments
  still compiles.
- **Eleven new keys in `Wording`, for `Splitter`, `Stepper` and
  `FileInput`**, in English and German: `splitter` (the separator's name
  where the caller gives none), `stepDone`, `stepUpcoming` and `stepFailed`
  (a step's state beside its label), `chooseFile` and `chooseFiles` (the
  key), `dropFile` and `dropFiles` (the words beside it), `removeFile(name)`
  and `fileNotAccepted(name)`. A partial wording passed to the provider is
  merged as before; an application that implements the whole `Wording` type
  itself no longer compiles until it adds these eleven.
- **Four new keys in `Wording`: what the lists announce**, in English and
  German: `optionCount(count)`, `optionActive(label, { selected, disabled,
  group })`, `optionAdded(label)` and `optionRemoved(label)`. A partial
  wording passed to the provider is merged as before; an application that
  implements the whole `Wording` type itself no longer compiles until it adds
  these four.
- **`CommandPalette` no longer renders a `role="status"` element of its own.**
  The count of finds is spoken through the shared region, which the palette's
  `<dialog>` now holds as its last child once something was said; it is also
  said on opening when `restingItems` stand, and for a query that finds
  nothing (`paletteNoFinds`).
- **A new key in `Wording`: `editCell(column, row)`**, the name of a cell's
  editor in `@umriss-ui/table`'s grid mode ("Edit Setpoint: TIC-101"), in
  English and German. A partial wording passed to the provider is merged as
  before; an application that implements the whole `Wording` type itself no
  longer compiles until it adds it.
- **Three new keys in `Wording`: the column menu's pin keys** (for
  `@umriss-ui/table`'s pinned columns), in English and German:
  `pinColumnToStart(column)`, `pinColumnToEnd(column)` and
  `unpinColumn(column)`. A partial wording passed to the provider is merged as
  before; an application that implements the whole `Wording` type itself no
  longer compiles until it adds these three.
- **Five new keys in `Wording`: the wording of an alarm's availability** (for
  `@umriss-ui/table`'s alarm model and list), in English and German:
  `availabilitySnoozed(until, by)`, `availabilitySuppressed`,
  `availabilityDisabled`, `hiddenAlarms(count)` and
  `columnAvailability`. A partial wording passed to the provider is merged as
  before; an application that implements the whole `Wording` type itself no
  longer compiles until it adds these five.
- **Three more keys in `Wording`, for the new components**, in English and
  German: `progress` (a `ProgressBar`'s name where the caller gives none),
  `breadcrumb` (the landmark's name) and `breadcrumbFolded` (the key of the
  folded levels). The same holds as above: a partial wording merges, a whole
  `Wording` of an application's own needs the three.
- **What `...rest` may not override.** `Stat` keeps its role and the name it
  has read, `Meter` its role and `aria-value*`, `Spinner`, `TreeView`,
  `TabList`, `TabPanel` and `MenuItem` their role, `Tab` its role, ids and
  tab stop, even where a caller passes the same attribute. A caller's
  `aria-label` still names a `Meter`, a `Spinner`, a `Modal` or the
  `CommandPalette`.
- **A caller's handler runs first and can prevent the component's own**:
  `onCancel` and `onMouseDown` of `Modal` and `CommandPalette` (a
  `preventDefault` keeps the window standing), `onKeyDown` of `Combobox` and
  `CommandPalette` (heard in the capture phase, before the field inside),
  `onClick` and `onKeyDown` of `MultiSelect`'s field, and `onClick` of `Tab`
  and `MenuItem`, which ran first before but could not prevent.

### Fixed

- **A drawer from the right no longer shoots in too far and jumps back.**
  The browser gives a modal dialog `overflow: auto`; the focus landing in the
  sheet while it still stood off-screen scrolled the dialog towards it. The
  drawer's dialog is clipped now.
- **A drawer from the left fades as it leaves**; its entrance rule outweighed
  the exit and it vanished at once.
- **"1 hr"**, not "1 hrs", in the English `hoursShort`.

---

## 0.9.2 – Today's dot, one chevron (Sep. 2026)

### Changed

- **Today is marked by a dot beneath its figure**, no longer by an outline.
  The outline read like the keyboard focus beside it; the focus is now the
  only ring in the calendar. On a chosen day the dot takes the ink's type
  colour. Applies to all four pickers.
- **Select, Combobox and MultiSelect draw their chevron with `AngleGlyph`**,
  turned down: the one stroke width of every glyph, a shade smaller and
  rounder than the CSS angle it replaces.

---

## 0.9.1 – Depth work on the pickers and the select family (Sep. 2026)

### Fixed

- **A compact date field's placeholder is compact.** `size="sm"` shrank the
  value but left the placeholder at the comfortable size; it now matches an
  `Input` of size `sm`. Applies to all four pickers.
- **A `Select` showing its placeholder option (`value=""`) reads muted**, like
  the `Combobox`'s placeholder and the pickers'. It stood in full ink.
- **The pickers' ghost keys at the panel's edge align with the calendar**:
  "Today", "Now" and "Clear" stood a key's inset in from the grid, the
  hairline and the TIME label above them.

---

## 0.9.0 – A token for figures (Sep. 2026)

### Added

- **`--u-tracking-figures`** (`-0.01em`), the tracking of figures set in Geist
  Mono. It carries exactly the value that stood written out in the number
  field, the input's numeric mode, the date picker's field, the multi-select's
  count and chip, and the data-viz figures; nothing moves.

---

## Target environment: applications that render in the browser

The library is aimed at client-side rendered applications. The markers a
server-rendering framework expects at the client boundary (`"use client"` at the
head of the modules) are missing **on purpose**. That is a decision, not an
omission.

The reason: practically every component of the package holds state, hangs on
focus, pointer events or layout measurement, and on the server would be nothing
but a shell. The annotations would therefore enable nothing that is missing
today — they would open a guarantee (this package runs under server rendering)
that nobody checks and that breaks silently at the first extension. Server-side
rendering is not on the plan; should it ever arrive, it will be decided as a
delivery of its own and noted here.

For the caller that means: in an application with server rendering, the
components of this package belong behind a client boundary of their own — a
module on the caller's side that carries `"use client"` and imports from there.

---

## 0.8.0 – Motion, one stroke, one canon of states (Sep. 2026)

### Added

- **`--u-text-mono`** (`0.75rem`), the size of figures set in Geist Mono inside
  a control or a cell, and **`--u-leading-none`** (`1`), the line height of a
  box as tall as its type. Both carry exactly the value that stood written out
  in eight and six places before; nothing moves.

- **A motion vocabulary** in `tokens.css`, naming the distinctions the
  library makes: `--u-ease-exit` (an exit that starts at once),
  `--u-duration-press` with `--u-transition-press` (the press point),
  `--u-transition-path` (something turns or slides), `--u-duration-draw` and
  `--u-delay-draw` (the checkbox's tick), `--u-duration-exit-fast` (a panel or
  tooltip leaves), and for continuous processes `--u-duration-spin`,
  `--u-duration-shimmer`, `--u-ease-steady` and `--u-ease-swell`. Every
  motion in the library's stylesheets now reads one of them.

- **`CalendarGlyph`** (with `range`) and **`ClockGlyph`**, the date and time
  pickers' characters, in the shared set beside `CrossGlyph` and the others.

- **Three pressed surfaces**: `--u-color-surface-pressed`,
  `--u-color-accent-subtle-pressed` and `--u-color-danger-subtle-pressed`, the
  step below the sunken, subtle-accent and subtle-danger hovers. Each holds
  4.5:1 under the type that stands on it, in both themes.

### Changed

- **`--u-transition` runs on `--u-ease-out`.** The collective token for hover
  and colour carried the CSS keyword `ease-out`; it now carries the library's
  own curve (`cubic-bezier(0.22, 1, 0.36, 1)`), which until now reached only
  the few transitions that named it. Every hover, focus-edge and colour change
  in core, table, schedule and calculation starts more decisively and lands
  more softly; its duration (120 ms) is unchanged. An application that
  overrides `--u-transition` is not affected.

- **Exits leave instead of retracing.** `Modal` enters by scale and opacity
  from its centre (the 8 px rise is gone) and leaves by fading where it
  stands, on `--u-ease-exit` instead of `ease-in`; its backdrop follows the
  same curves. The leaving `Toast` glides out on `--u-ease-exit` as well.
- **Press points take 80 ms.** The pressed glyphs of `Alert`, `Tag`,
  `NumberInput` and the date picker's time stepper ran on the 120 ms of a
  hover; they now take the button's press duration.

- **Overlays unfold from their trigger.** Every panel on `Popover` - `Menu`,
  `ContextMenu`, the lists of `Combobox` and `MultiSelect`, the panels of the
  four date pickers - enters by scale and opacity from its motion origin, the
  corner facing its trigger (a panel below a start-aligned trigger grows from
  its top left; a flipped one from its bottom). It used to slide 6 px. On
  closing it stays for `--u-duration-exit-fast` (100 ms), inert, and fades
  where it stands; it no longer disappears in the same frame. `Tooltip`
  follows the same pattern from the edge facing its trigger, and each `Toast`
  grows out of the bottom right corner it stands in. Under reduced motion all
  of them appear and go at once. `Select` keeps the browser's own list.

- **Every glyph draws one stroke width at one nominal size** – 1.4 per 10
  units, so the rendered stroke follows the size a glyph is set at. The
  `Alert`, `Modal` and `Toast` close crosses, the `Tag` and `MultiSelect`
  remove crosses are now `CrossGlyph`: the Modal's cross is slightly heavier,
  the Tag's and the chip's slightly lighter. The calendar's paging arrows, the
  `ButtonGroup` arrow and the `Combobox` tick go from 1.5 and 1.8 to 1.4.
  The date pickers' calendar leaf and clock are drawn anew at nominal size 10
  and set at 12 pixels instead of 13; the range picker's leaf shows a bar
  instead of an arrow. The `Toast` tone symbols keep their look, drawn in the
  nominal box, their dots as strokes. Held by a check (`docs/glyphs.md`).

- **One canon of interaction states.** Hover changes the surface, a press
  changes it more strongly, focus is `--u-focus-ring` and nothing else, and
  disabled dims to half and reacts to nothing. What that changes:
  - *Pressed*: every quiet key now sinks while it is pressed - `Button`
    `secondary` and `ghost`, the close keys of `Modal`, `Toast` and `Alert`, the
    remove key of `Tag`, the clear keys of the fields, the steppers, the date
    picker's pages, days and presets, the items of `Menu`, the options of
    `Combobox` and `MultiSelect`, the rows of `TreeView` and `CommandPalette`,
    the tools of `Dock`, the chips and the counter of `MultiSelect`, the
    collapse key of `Card`, and the empty boxes of `Checkbox` and `RadioGroup`.
    Before, only the primary and danger buttons darkened.
  - *Focus*: a `Menu` item reached by the keyboard carries the ring instead of
    the hover surface, and so does a `MultiSelect` chip, which showed its focus
    in the danger surface.
  - *Disabled*: the fields (`Input`, `Textarea`, `Select`, `Combobox`,
    `NumberInput`, `MultiSelect`, the date pickers' trigger and time fields),
    `Checkbox`, a `Tabs` tab, a `Menu` item, a `Combobox` option and a `Dock`
    tool dim to half opacity, as `Button` and `RadioGroup` always did, instead
    of being repainted in a sunken ground and muted type. A disabled `Dock`
    tool shows the not-allowed cursor.
  - `Checkbox` has a hover edge on its empty box, as `RadioGroup` has.
  - `NumberInput`'s steppers settle on the glyph (0.8) like the date picker's,
    instead of scaling the whole key to 0.9.

### Fixed

- **Disabled elements reacted underneath.** A disabled `Tabs` tab darkened
  under the pointer; a disabled time stepper of the date pickers came back to
  full presence and its hover surface when the pointer entered its group; the
  × of a disabled `MultiSelect` chip appeared under the pointer; and the
  pointer moved `Combobox`'s cursor onto a disabled option (the arrow keys
  still reach it).
- **A hover took the focus ring away.** On a focused `Button` `secondary`,
  `Checkbox` or `RadioGroup` the hover edge replaced the ring while the pointer
  rested on it; on the date pickers the chosen day, the ends of a range and the
  preview's end dropped the ring the same way.

---

## 0.7.0 – A text token for danger (Sep. 2026)

### Added

- **`--u-color-danger-text`**, the danger tone as type, beside
  `--u-color-danger` as surface — the split the accent has long had with
  `--u-color-accent-text`. It holds 4.5:1 on the subtle danger surface, the
  surface and the page ground in both themes.

### Changed

- **Danger text reads `--u-color-danger-text`.** In the dark theme it is
  lighter (`#d86f66` instead of `#d0655c`); the surface value measured only
  4.40:1 on `--u-color-danger-subtle`. It applies where danger is type: the
  danger tone of `Badge`, `Tag` and the `Alert` title, the `FormField` error
  and required mark, the exceeded `Textarea` count, the danger `Menu` item,
  the removing `MultiSelect` chip, the alarm verdict and the lost freshness of
  `Stat`. Surfaces, edges, focus rings and the `Toast` icon keep
  `--u-color-danger`. The light theme is unchanged. A caller who drew danger
  text with `--u-color-danger` should switch to the new token.

---

## 0.6.0 – The wording of the grouping (Sep. 2026)

### Added

- **The wording of the table's grouping and aggregates**, English and German:
  the footer's minimum, maximum, range, count, distinct values and an aggregate
  of one's own; the grouping section and its entry per column, "Grouped by",
  removing the grouping or a level, fold all and unfold all, "No value",
  "continued", the fold's and the group box's names, and the calendar week. A
  caller who builds a complete `Wording` of their own has nineteen entries to
  add.

---

## 0.5.0 – The wording of the calculation (Sep. 2026)

### Added

- **The wording of `@umriss-ui/calculation`**, English and German: the four
  operators as symbols and as words, `calculationEquals`,
  `calculationApproximately` and the approximation note, `calculationPercent`,
  the two reasons for an absent quantity (`calculationMissing`,
  `calculationDivisionByZero`), the target phrases, the worst-verdict marker,
  `calculationSource`, the disclosure labels and `calculationOperandCount`. A
  caller who builds a complete `Wording` of their own has twenty-two entries to
  add.

---

## 0.4.0 – One focus, and fields on the iPhone (Sep. 2026)

### Changed

- **Focus is a crisp two-pixel accent edge, on every component.**
  `--u-focus-ring` was a soft 4px glow at 20 %, and fields drew an accent edge
  inside it; now it is `0 0 0 2px` in the accent, for fields, buttons,
  checkboxes, radios, tags, rows and links alike. An invalid field keeps its
  danger colour while focused (new token `--u-focus-ring-danger`). A caller who
  set `--u-focus-ring` keeps their value.
- **On a touch screen, fields write at 16px** (`pointer: coarse`). Below that,
  Safari on iOS zoomed the page into the field and left it zoomed.
- **A loading button is no longer faded to half.** It stays locked, but at full
  strength, so its spinner is visible - in the dark theme it all but vanished.

### Fixed

- **Popovers stand in the visible part of the window.** They measured it with
  `innerWidth`/`innerHeight`; on an iPhone with the page zoomed and the keyboard
  up, a combobox's list stood above the field and cut off at the left. They now
  read `visualViewport` and follow it as the keyboard comes and goes. The same
  measure places the tooltip.
- **No browser outline beside the focus edge.** Input, Combobox, Select and the
  DatePicker trigger lacked `outline: none`; Safari drew its blue ring outside
  the accent edge.
- **TreeView's loading spinner** takes the secondary text colour instead of the
  muted one, which was barely visible on the dark surface.

## 0.3.2 – Phones, touch and a review (Sep. 2026)

### Changed

- **A handler a caller hands in runs beside the component's own instead of
  replacing it.** `Tab` took an `onClick`, `MenuItem` an `onClick`, `TabList`,
  `Tag` and `RadioGroup` an `onKeyDown`, `NumberInput` an `onFocus`, `onBlur`
  and `onKeyDown`, and `TreeView` an `onFocus`, `onBlur` and `onScroll` through
  their spread props - and with them the component's own work: a tab that did
  not switch, an entry that left its menu open, a tag Delete did not remove, a
  radio group the arrows did not move, a tree whose focus stopped following the
  active node. `NumberInput` was the sharpest case: a form library's `onBlur`
  took the commit on leaving, and the field then counted as focused for good
  and took no value from outside any more. The caller's handler now runs first;
  where a key handler calls `preventDefault()`, the component leaves that key
  alone.
- **Paging a calendar takes the active day along.** The arrow buttons of all
  four pickers move the active day - which carries the grid's one tab stop - by
  the same month, the 31st landing on the last day of a shorter month. Left
  behind in the month paged away from, it took the stop with it, and Tab went
  past the grid. The focus stays on the arrow that paged.

### Fixed

- **A popover never leaves the window.** Its panel is capped at the window with
  eight pixels of air (`max-width: calc(100vw - 16px)`, `max-height:
  calc(100dvh - 16px)`) and scrolls in itself beyond that; a panel that fits
  neither above nor below its trigger is pulled into the window, over the
  trigger if need be, instead of hanging out of it.
- **A popover measures its panel exactly.** It read the rounded
  `offsetWidth`/`offsetHeight`, and half a pixel decided whether a panel at the
  window's edge fitted or stuck out.
- **The range pickers fit a phone.** Below 760px the presets of
  `DateRangePicker` and `DateTimeRangePicker` stand above the months as a row;
  below 600px the two months stand one below the other.
- **The × of `Select` and of the pickers stands on a touch screen.** It faded
  in on hover, which a finger has not; on `(hover: none)` it now stands whenever
  there is a value.
- **`Sparkline` keeps its width in a flex row.** It shrank with the row; it is
  now `flex: none`.
- **Escape closes the popover and nothing more.** A menu, picker or select panel
  inside a `Modal` took the modal down with it, because the same key is the
  dialog's close request. The popover now keeps the key to itself.
- **The first opening moves the focus as well.** `Menu` and `ContextMenu` put
  the focus on their first entry, `MultiSelect` into its search and the pickers
  onto the active day - but not on the first opening of each: the panel was
  hidden (`visibility: hidden`) until its first measurement, and a hidden
  element takes no focus. It is now transparent for that pass, which is never
  painted. `Menu` and `MultiSelect` also moved their focus in an effect that ran
  before the panel stood; they now do it the moment it arrives, as `ContextMenu`
  already did.
- **Tab out of an open menu goes on from the trigger.** The panel is portalled
  to the end of the page, and a Tab from an entry went to the top of the page.
  `Menu` and `ContextMenu` now give the focus back first, and the Tab moves on
  from there.
- **`Modal` is named by its header.** `ModalHeader`'s `title` promised to name
  the window for the screen reader; a `<dialog>` takes no name from its
  content, so it said only "dialog". The dialog now points at the heading with
  `aria-labelledby` - an `aria-labelledby` or `aria-label` of the caller's still
  wins.
- **An uncontrolled `RadioGroup` is entered at its choice.** It wrote a tab stop
  on the initial option and, since no render follows a choice, kept it there:
  Tab came back to the initial option rather than the chosen one. Uncontrolled,
  it now leaves the tab stop to the browser's own rule for radio groups.
- **`Tooltip` adds to its target's description.** While it stood, it replaced
  the target's own `aria-describedby`, and a field's hint went silent.
- **An input method's Enter chooses nothing.** In `CommandPalette`, `Combobox`
  and the search of `MultiSelect`, the Enter that ends a composition (Japanese,
  Chinese, Korean) was taken as a choice.
- **`NumberInput` writes its first value in the notation of the formats.** The
  first render used the default notation and the next one corrected it, so an
  application with `GERMAN_FORMATS` saw `1,234.5` for a frame. Its description
  still spoke of German notation as well; it names the formats now.
- **The line under the chosen tab follows a late font.** It was measured before
  the font had loaded and stood a pixel or two beside its tab until the window
  changed size; it is measured again once the fonts are ready.
- **A `Dock` unmounted in the middle of a drag ends the drag.** Its Escape
  listener on the window outlived it, and a later Escape reported a place for a
  dock that no longer existed.
- **`Alert`'s `dismissLabel` names its real default** - the wording's "Close
  message", not "Close".

---

## 0.3.1 – The README catches up (Sep. 2026)

Nothing in the code changed. The README that shipped with `0.3.0` still said
the formats default to German notation, and so did the line on `NumberInput`;
both describe ADR-0024 now, with the import that takes `GERMAN_FORMATS` beside
`GERMAN_WORDING`.

The `0.3.0` entry below listed `formatsFor(locale)` as added. It is not
exported — it builds `DEFAULT_FORMATS` and `GERMAN_FORMATS` inside the package
and nothing else — and the entry is gone.

---

## 0.3.0 – English formats, and the context menu (Sep. 2026)

### Changed

- **The formats are English.** `DEFAULT_FORMATS` writes `en-GB` on a 24-hour
  clock: `17/03/2026`, `09:05`, `1,234.5`, `74%`, "3 minutes ago", and English
  collation. Until now it wrote `de-DE` whatever the wording said (ADR-0024;
  ADR-0019 left this decision open on purpose).
- **German ships as a pair.** `GERMAN_FORMATS` stands beside `GERMAN_WORDING`
  behind `@umriss-ui/core/wording/de`, so a German application takes both
  halves of its language in one import:
  `language={{ wording: GERMAN_WORDING, formats: GERMAN_FORMATS }}`. An
  application that hands in the wording alone now gets German words over
  English notation - which is what the library shipped before, and why the
  decision was made.
- **`NumberInput` reads the notation it writes.** Its parser no longer assumes
  a German dot and comma; the separators are measured off the formats
  (`separatorsOf`), so a field under any notation - including one an
  application replaced - reads its own output back. `parseNumber` and
  `filterInput` take the separators as a last argument, defaulting to the
  default notation.
- **What did not move:** the CSV export of `@umriss-ui/table` keeps its decimal
  comma and its semicolon (a machine format for a spreadsheet, argued at its
  site), and the German test fixtures that measure a property *of* German stay
  German.

### Added

- **`separatorsOf(formats)`** and `DEFAULT_SEPARATORS`: the group and decimal
  separator a notation writes, measured rather than declared.
- **Three wording entries for `@umriss-ui/schedule`'s lane groups**:
  `scheduleFoldGroup`, `scheduleUnfoldGroup` and `scheduleLaneCount(count)`,
  in English and in `GERMAN_WORDING`. An application that supplies a complete
  `Wording` of its own gains three required entries — which the type says, at
  compile time, as it is meant to (ADR-0019).

### Released together

`@umriss-ui/core` was already on `latest`; `@umriss-ui/charts`,
`@umriss-ui/table` and `@umriss-ui/schedule` join it with this delivery, and
the four are released together: the schedule stands on core and charts, and the
table's candidate peered on `^0.2.0` and would have refused this core.

## The context menu (Sep. 2026)

From `.scratch/schedule/spec.md`, ticket 01, and
`.scratch/schedule-refinement/spec.md`, ticket 03.

### Added

- **`ContextMenu`** — the menu opened at a point instead of under a trigger, for
  a right-click on a surface that is not a button. Controlled (`open`,
  `onOpenChange`, `position` in client coordinates, `ariaLabel`), built on
  `Popover`, with `MenuItem`, `MenuSeparator` and the menu's keyboard. The focus
  returns to where it stood when the menu opened.
- **Wording:** `scheduleLaneRefused`, `scheduleOverlap`, `scheduleViolatedDependency`,
  `scheduleGhostTimes`, `scheduleLeadIn`, `scheduleLeadOut`,
  `scheduleDependency`, `scheduleRoute`, `scheduleOverlapWith` and
  `scheduleViolatedBy`, for `@umriss-ui/schedule`, in both shipped wordings. An
  application that hands in a whole `Wording` object of its own adds the nine.

---

## 0.2.0 – Styles that load themselves, and touch nothing else (Sep. 2026)

Delivery report for `.scratch/styles-without-side-effects/spec.md` (ADR-0021).
The second version on the registry. The middle digit rises because `theme`
leaves `UmrissProvider` and the base layer leaves the stylesheet - read
**Changed** before upgrading from `0.1.0`.

### Changed

- **No stylesheet import any more.** `dist/core.js` imports its own stylesheet;
  `import { Button } from "@umriss-ui/core"` is the whole setup.
  `@umriss-ui/core/styles.css` stays exported and is optional.
- **No base layer.** The rules on `html`, `body`, `*`, `:focus-visible`,
  `::selection`, `input`/`textarea` and the page's scrollbars are gone. An
  application that relied on them for its own page - margin, font, background,
  box model, selection colour - sets them itself. Every component carries what it
  needs: its text context, `box-sizing` and squircle corners on its own elements
  and their `::before`/`::after`, a focus ring on every element it puts into the
  tab order (the calendar's days and month arrows, the range presets and the
  close buttons of `Modal` and `Toast` included), caret, autofill look and
  scrollbars on its own fields and scroll containers.
- **Cascade layers.** Every rule lies in `umriss.tokens`, `umriss.base` or
  `umriss.components`. CSS an application writes outside a layer wins over the
  library whatever its specificity and loading order, and a token is overridden
  with `:root { --u-… }`.
- **Light and dark are `color-scheme`.** Tokens with two values are
  `light-dark(<light>, <dark>)`. `:root[data-theme="dark"]` is gone and
  `color-scheme` is no longer set on `:root`: an application sets
  `color-scheme` (most theme libraries already do), and one that sets nothing
  stays light.
- **`UmrissProvider` has no `theme`** - the prop, `UmrissConfig.theme` and the
  `Theme` type are removed - and it writes nothing onto the document any more,
  including the `data-density` attribute no stylesheet read. `density` works as
  before, through context.
- **Browsers:** Chrome 123, Firefox 120, Safari 17.5 or newer (`light-dark()`).

---

## 0.1.0 – First publication (Sep. 2026)

The first version published to npm, under the tag `latest`. It is the state described by
every internal entry below, up to and including `internal 0.10.0`; nothing about
exports, props or behaviour changed for the publication itself.

- **Installable from the registry:** `pnpm add @umriss-ui/core`. The German
  wording ships as `@umriss-ui/core/wording/de` (ADR-0019), the stylesheet as
  `@umriss-ui/core/styles.css`.
- **The demo is online** at <https://romanhaendler.github.io/umriss-ui/core/>.
- **The version number was reset** from the internal `0.10.0` to `0.1.0` — see
  **The count started again at publication** above.

---

## internal 0.10.0 – The seam of a button group (Sep. 2026)

Appearance only; no export, prop or behaviour moves. The number stays where it
is.

### Fixed

- **A `ButtonGroup` drew two lines at every seam instead of one.** Every button
  draws its own edge, and it draws it on all four sides. Inside the group the
  two edges that face one another land exactly where the seam already is: a line
  over the full height, running hard into the rounded outline, beside the inset
  hairline that was meant to be the only line there. Three buttons read as three
  boxes shoved together rather than as one control. The edges that face into the
  group are now cut away; the edge above and below stays, because that is where
  the outline of the group comes from, and the first and the last button keep
  their outer side, rounded corner and all.
- **Groups of `primary` or `ghost` buttons are unchanged.** The repair takes away
  the edge a button happens to have rather than drawing a new one, so a variant
  that carries no edge gains none here. Visible in the demo: the seam of the
  ghost group always looked the way the secondary group now does.
- **Keyboard focus keeps its whole ring.** It stands four pixels out, and the cut
  would have sheared it off on exactly the sides that face into the group, so
  focus lifts the cut. Hover does not need to: its edge is one pixel and would
  stand where the seam already is.

## internal 0.10.0 – The provider explains itself (Sep. 2026)

Documentation only; no export, prop or behaviour moves. The number stays where
it is.

### Fixed

- **`<UmrissProvider wording={GERMAN_WORDING}>` was never valid.** The provider
  takes `language`, and the wording sits inside it:
  `language={{ wording: GERMAN_WORDING }}`. The wrong form stood in the header of
  `src/lib/language/de.ts` — the file a reader imports the German wording from —
  and in the entry below. The README always had it right. Both are corrected.

### Added

- **Four props that land in a generated table now carry their JSDoc**:
  `UmrissProviderProps.portalTarget`, `.toast` and `.children`, and
  `LanguageOptions.formats`. They appear in a props table for the first time,
  because `UmrissProvider` has a demo page for the first time.
- **The demo has a page for the provider**, with a worked example of taking the
  German wording whole and one of overriding entries and formats singly. Where
  the register was described before, it can now be read off two pictures.

## internal 0.10.0 – One language, one scope (Sep. 2026)

Delivery report for `.scratch/english-and-umriss-ui/spec.md`. The number does not
move: nothing was ever published under it, and this is a rename rather than a
release.

### Changed

- **The package is called `@umriss-ui/core`** and its directory is
  `packages/core`. The npm scope moved from `@umriss/*` to `@umriss-ui/*`, the
  org actually secured for this library; the sibling packages are
  `@umriss-ui/table` and `@umriss-ui/charts`. Nothing was ever published under
  the old names — all three returned 404 from the registry — so there is no
  alias and no deprecation window. An import line changes from `@umriss/ui` to
  `@umriss-ui/core`, and the stylesheet from `@umriss/ui/styles.css` to
  `@umriss-ui/core/styles.css`. Nothing else about a call changes.
  **`core` means the package you install first**, not a layer everything sits
  on: `@umriss-ui/charts` depends on nothing and will keep depending on nothing
  (ADR-0016).
- **Every identifier and every document is English** (ADR-0018, which supersedes
  ADR-0015 and its carve-out that props are English while identifiers are
  German). For the twenty-one names that cross the package boundary this is a
  rename of the public surface, carried out in one commit: the wording is
  `Wording` and the formats are `Formats`, `SpracheProvider` is
  `LanguageProvider` with `useWording`, `useFormats` and `mergeLanguage`,
  `STANDARD_WORTLAUT` and `STANDARD_FORMATE` are `DEFAULT_WORDING` and
  `DEFAULT_FORMATS`, the limit model is `Limit`, `LimitSet`, `Assessment`,
  `Verdict`, `Severity`, `Side`, `assess` and `verdictWeight`, freshness is
  `Freshness`, `FreshnessAges`, `freshness`, `age`, `cadence` and `useFreshness`,
  the window arithmetic is `visibleWindow`, `scrollForRow`, `useVirtual`,
  `VirtualRows` and `VirtualOptions`, and the density hook is `useDensityFor`.
  The long prose headers that carry the design reasoning were translated, not
  shortened. Deprecated aliases were considered and rejected: they were right for
  the prop renames of ADR-0015, because there were callers; here there are none.
- **English is the default wording, German ships as a subpath** (ADR-0019).
  `DEFAULT_WORDING` is English, entry for entry, and every label the library
  draws without being told otherwise is now English. The German that used to be
  the default is unchanged — down to the thin spaces — and is exported as
  `@umriss-ui/core/wording/de`:

  ```tsx
  import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

  <UmrissProvider language={{ wording: GERMAN_WORDING }}>
  ```

  Both are typed `Wording`, so an entry added to the interface and forgotten in
  the other language is a compile error rather than a missing label on a screen.
  Semantic drift between the two cannot be caught by anything and is accepted as
  the price of shipping two. A subpath and not a second entry in the main export:
  an application that never imports it never pays for it.
- **The formats are still `de-DE`.** `DEFAULT_FORMATS` groups and separates
  numbers, dates and percentages the German way, so the default currently renders
  English words around German digits — "43 of 1.204", a date as "17.03.2026".
  This was left alone on purpose and not for lack of noticing: a locale is not a
  language, changing it moves every number, date and percentage in the library,
  and `en-GB` and `en-US` disagree about dates, so a library whose audience is
  unknown arguably should not pick either. The seam already works — the
  `UmrissProvider` takes `formats` — and ADR-0019 records the state rather than
  hiding it.

### Otherwise

The licence is MIT, and a `LICENSE` file ships in the package. No behaviour
changed anywhere in this delivery: where a rename revealed a defect it was
written down and fixed in a commit of its own, never folded into the rename.

### Changed — the values, not only the names

The first pass renamed identifiers and left the values they hold standing. A
value is read as often as the name that holds it — in the DOM, in a selector, in
a screenshot's file name — so these moved too, each with every consumer:

- **`Place` is `"top" | "right" | "bottom" | "left"`.** It was `"oben" |
  "rechts" | "unten" | "links"`, and it stands in the DOM as `data-place`. The
  wording registers translate it: the German one answers "oben" where the English
  one answers "top".
- **The limit model.** `Verdict` is `"ok" | "unknown" | "warning" | "alarm"`,
  `Severity` is `"warning" | "alarm"`, `Side` is `"upper" | "lower"`, and the
  fields are `value`, `side`, `severity`, `limits`, `target`, `verdict`, `limit`,
  `excess`, `deviation`. ADR-0006 holds this model twice, once in each package,
  so core, `@umriss-ui/charts`, the shared case table and the runtime conformance
  test moved in one commit. `data-urteil` is `data-verdict`.
- **`Freshness` is `"fresh" | "stale" | "lost"`** and its two ages are `stale`
  and `lost`. `data-aktualitaet` is `data-freshness`.
- **`useVirtual`** takes `{ rowHeight, overscan }` and gives back `from`, `to`,
  `fillerBefore`, `fillerAfter`, `count`, `showRow`, `onScroll`.
- **`DateRange` is `{ from, to }`** and a `RangePreset` carries a `range`. A
  preset's key is now its wording key (`today`, `last7Days`).
- **The dock's eight tokens** are `--u-dock-tool`, `-grip`, `-gap`, `-padding`,
  `-margin`, `-grip-travel`, `-refusal-surface`, `-refusal-duration`. Three of
  them are read back at runtime, so whoever overrides them changes from how many
  tools on a side edge the dock refuses.

### Fixed

- **Virtualisation measured no row in `@umriss-ui/table`.** `useVirtual`
  re-measures the row height on a real row; it looked for `[data-zeile]`, which
  only the tree writes — the table writes `data-row`. The row height therefore
  stayed at the starting value the caller passes, and the filler rows were sized
  against it. Both attributes are `data-row` now.

## internal 0.10.0 – What the table toolbar says (Sep. 2026)

Delivery report for `.scratch/table-filters/spec.md`: the entries of the wording
that `@umriss-ui/table` reads for its column filters. The components of this
package do not change.

### Changed

- **`resetAll` says "Reset"** instead of "Reset everything". The button now
  stands in the table toolbar beside the ratio "43 of 1.204", where "everything"
  says nothing the place does not say already; in the empty body it does the same
  thing and is therefore called the same.
- **`removeConditionNamed` no longer begins with "Filter"**: "Remove Line:
  Line 1". Beside it now stands a second button for the same condition, and both
  are built alike.

### Added

- **`editConditionNamed`**: the name of a condition that opens its filter —
  "Edit Line: Line 1, Line 2".
- **`moreValues`**: the rest of a long list within a condition — "+1".
- **The range filter of the table**: `filterFrom` and `filterTo` label its two
  fields, `rangeFromTo`, `rangeFrom` and `rangeTo` name its condition —
  "100–500", "from 100", "to 500" — and `rangeInvalid` says that "From" lies
  behind "To".

### Removed

- **`sucheBedingung`**, which had no English successor and is simply gone: the
  search no longer appears as a condition beside the field that already shows it.

## internal 0.9.0 – The table moves out (Sep. 2026)

Delivery report for `.scratch/umriss-table/issues/14-remove-table-from-ui.md`.
The table and the alarm list now stand in **`@umriss-ui/table`** (ADR-0016,
ADR-0017). There, columns are elements typed against their rows, and the table
renders its rows itself — so a reordering in the model is on the screen as well.
The new package takes `@umriss-ui/core` as a peer and reads its provider, formats
and wording; one `UmrissProvider` configures both packages.

With this number appear the two sections below it as well, which had been
unpublished until now.

### Changed

- **The table and the alarm list are no longer in this package**, and three
  entries of the wording are struck. Whoever imports or overrides them no longer
  translates after the upgrade; what went where stands under "Removed". The
  section "Where the library contradicted itself" further down appears with the
  same number and has entries of its own under "Changed".

### Removed

- **The table**: `Table`, `Th`, `Td`, `TableToolbar`, `TablePagination`,
  `TableEmpty`, `TableSkeletonRows`, `TableFilter`, `TableFilterList`,
  `TableFilterStrip`, `TableExpandButton`, `TableRowDetail`, `TableRowActions`,
  `TableVirtualBody`, `TableVirtualRow` with their props types and
  `SortDirection`, `TableActiveFilter`, `TableFilterOption`; the model
  `tableModel`, `column`, `sum` with `Column`, `SortLevel`, `TableInput`,
  `TableProjection`; the companion `useCompanion` with `Companion`,
  `CompanionOptions`, `Sort`; `asCsv`; `alsSuchparameter` and `ausSuchparametern`
  with `TableView` and `AusSuchparameternOptionen`; `useTableSelection` with
  `TableSelection`.
  **Instead** `@umriss-ui/table`. Some names exist there again, in a new shape:
  `useTable(rows, options)` gives out `Table`, `Column` and the remaining parts
  instead of taking a column field; `column` builds a preset for `Column`;
  `alsSuchparameter`, `ausSuchparametern`, `useTableSelection` and their types
  are unchanged. The export is `t.asCsv()` and the part `Export`.
- **`AlarmList` and `alarmModel`** with `acknowledge`, `countAcknowledgeable`,
  `countInWindow`, `frequencyByType`, `detectFlood`, `nextLifecycleState`,
  `isActive`, `isAcknowledged`, `isDone`, `hasReturned`, `priorityRank`,
  `PRIORITIES`, `ALARM_COLUMNS`, `alarmColumns`, `DEFAULT_ORDER` and their types.
  **Instead** the same names out of `@umriss-ui/table`; the props of the alarm
  list are called `view`, `selection`, `onAcknowledge`, `asOf` and `freshness`
  there.
- **Three entries of the wording** that only the old table read:
  `zeileAufklappen`, `zeileZuklappen`, `filterEntfernen`. `@umriss-ui/table`
  names the same buttons after the row (`expandRowNamed`, `collapseRowNamed`,
  `removeConditionNamed`). A provider that overrides the three no longer
  translates. All remaining entries of the table stay here (umriss-table 04).

### Stays

- The window arithmetic (`visibleWindow`, `scrollForRow`, `useVirtual`) and
  `useDensityFor` — the `TreeView` uses the one, every part with a density of its
  own the other, and `@umriss-ui/table` both.

## internal 0.9.0 – What the table needs from outside (Sep. 2026)

Delivery report for `.scratch/umriss-table/spec.md`, ticket 04. The table moves
to `@umriss-ui/table` (ADR-0016); what it used to read from inside is now
reachable from outside. Ticket 04 removed nothing; the table itself went with
ticket 14 (the section above).

### Added

- **The window arithmetic as an export of its own:** `visibleWindow`,
  `scrollForRow`, `useVirtual` and their types `RowWindow`, `WindowInput`,
  `RowPlacement`, `VirtualRows`, `VirtualOptions`. The arithmetic and the types
  previously came out only through the export of the table, the hook not at all;
  the `TreeView` goes on using them.
- **`useDensityFor`** – the density of a part: its own statement, otherwise the
  density expressly set on the `UmrissProvider`, otherwise its own default.
  Unlike `useDensity()` it tells "the provider says comfortable" apart from
  "nobody says anything".
- **Wording for `@umriss-ui/table`**, in a section of the directory of its own:
  `columns`, `arrangeColumns`, `columnForward`, `columnBackward`, `exportLabel`,
  `exportFileName`, `tableSearchPlaceholder`, `tableSearchLabel`,
  `sucheBedingung`, `filterColumn`, `selectRow`, `selectAllRows`,
  `expandRowNamed`, `collapseRowNamed`, `rowActions`, `rowAction`,
  `rowActionsMenu`, `cellAbsentValue`, `booleanYes`, `booleanNo`, `footerSum`,
  `footerAverage`, `entries`, `selectedCount`, `noEntries`,
  `nothingMatchesFilters`. They stand here and not in the new package, so that
  one `UmrissProvider` switches the wording of both packages with one statement.
  (`sucheBedingung` went again with 0.10.0.)

## internal 0.9.0 – Where the library contradicted itself (Sep. 2026)

Delivery report for `.scratch/library-audit/spec.md`.

### Changed

**`Modal` and `CommandPalette` report `onClose` exactly once.** Until now every
gesture — cross, escape, background — arrived twice: once out of the gesture and
once more through the native `close` event that the exit triggered at the end.
Whoever counts on the closing, logs it or shows a message now sees one. A closing
the browser itself triggers still arrives.

**`Wording.zeitraumMitZeitPlatzhalter` is gone.** It never named a placeholder
but the panel of the `DateTimeRangePicker`. In its place come two entries of
their own: `dateTimeRangePanel` for the panel and `dateTimeRangeClear` for its
clear ×, which until now shared `dateRangeClear` with the `DateRangePicker`.
Whoever overrode the old entry gets a type error and rewrites it to
`dateTimeRangePanel`.

**`Wording` has five new required fields**, because five texts stood in the
components past the directory: `filterReset` and `filterDone` (the buttons in the
`TableFilter`), `multiSelectSummary` (the "3 / 12" in the panel of the
`MultiSelect`), `columnAcknowledgement` and `columnAge` (the two columns of the
alarm model that the list does not show). Whoever overrides partially notices
nothing; whoever builds a complete `Wording` object gets type errors.

**A `Toast` with `tone="danger"` or `"warning"` announces itself as `alert`.**
Until now the shared region carried `role="status"` for every tone, and an error
was more polite there than the same error in the `Alert`. The region now has two
live areas that stand before the first message arrives — `status` for the polite
tones, `alert` for warning and error — and every message lands in the one for its
tone, by the same table as for the `Alert`. On the screen the order stays the one
the messages came in.

**`FormField required` sets `aria-required`.** The comment had always promised
it; only the asterisk was set. Now `Input`, `Select`, `Textarea`, `NumberInput`,
`Combobox`, `RadioGroup` and `Checkbox` carry it — out of the same context they
take `aria-describedby` and `aria-invalid` from. The triggers of the pickers and
of the `MultiSelect` are buttons and do not carry it: there it would not be a
permitted attribute.

**Ids that arise out of the caller's values have a different format.**
`Tab`/`TabPanel`, the options of the `RadioGroup`, the boxes of the `TreeView`
and groups as well as rows of the `CommandPalette` no longer build their ids out
of the raw value: a space in it broke `aria-labelledby`, and two trees on one
page handed out the same id. Whoever read one of these ids from outside — in a
test, say — now reads a different one; it was never promised.

**The danger `Button` writes dark on light in the dark theme.** White measured
3.68:1 on the lighter danger surface of the dark theme; the type is now
`--u-color-on-danger` and turns the polarity like the accent. In the light theme
it stays white. The accessibility check no longer tolerates the pair.

**The scrim behind the `Modal` is `--u-color-scrim`.** It had a value of its own
and dimmed in the dark theme with the light one; in the light theme it is now as
light as behind the command palette.

**`UmrissProvider dichte` takes effect.** The setting was read by nothing. Now it
sets `data-dichte` at the root and is the default for the `density` of `Table`
and `AlarmList` (`"comfortable"` means `"regular"`). A provider without `dichte`
changes nothing — the alarm list then stays compact.

**The `Textarea` shows its focus ring at `:focus-visible`**, like every field
beside it; the hover edge of `Textarea` and `RadioGroup` is that of the remaining
fields.

**A `Tooltip` inside a `Modal` is visible.** It portalled to the body and thereby
lay behind the dialog — and with it every tooltip of a `Dock` inside one. It now
takes the same rule as the `Popover`: nearest `<dialog>`, then the `portalTarget`
of the `UmrissProvider`, then the body. With a `portalTarget` in the provider it
therefore lands there outside a dialog as well, instead of at the body.

**Enter in the time field commits in the `DateTimePicker` too**, as it already
did in the `DateTimeRangePicker`.

**A row of the `CommandPalette` is chosen only with the primary button.** A
right-click had already chosen.

**`wording.presets` reaches the `DateTimeRangePicker` as well.** It built its
quick select out of the German constant and passed over an override that the
`DateRangePicker` had long been taking.

### New

**Five tokens:** `--u-color-on-danger`, `--u-color-danger-active`,
`--u-color-edge-hover`, `--u-duration-exit` and `--u-duration-exit-collapse`. The
two durations fall to zero under reduced motion; `Modal` and `Toast` read them at
runtime instead of carrying the figure a second time.

**`alarmColumns(wording)`** labels the columns of the alarm model out of a
wording, and `AlarmInput.columns` takes them. The labelling lands in the
projection's `columns` and from there in the column menu and the CSV header row.
`ALARM_COLUMNS` remains as the default labelling and is the same as
`alarmColumns(DEFAULT_WORDING)`.

### Fixed

**"Now" in the `DateTimePicker` means now.** In the second 02:30 of the clock
change it gave out the first, an hour too early.

**An instant keeps its occurrence when reopened.** `DateTimePicker` and
`DateTimeRangePicker` opened a value that was the later occurrence of a doubled
hour as the earlier one; the next "apply" then shifted it by an hour.

**An `onInput` of one's own on the `Textarea` no longer takes anything away from
it.** It was spread after the library's and replaced it; the counter and the
growing then stood still. Both now run one after the other, the caller's first.

**The comments the props table shows say what the code does.** `NumberInput`
clamps every reported value, not only on blur; the default page sizes of the
`TablePagination` are 10, 25 and 50.

## internal 0.8.0 – A strip above the surface (Sep. 2026)

Delivery report for `.scratch/floating-dock/spec.md`.

### New

**`<Dock>` – the tools of a surface, above it instead of beside it.** A strip of
characters that lies above *one* host surface and carries the actions for it. It
belongs to its host and never to the screen: two charts side by side have two
docks, and neither claims to act on the other. It is rendered into a positioned
container:

```tsx
<div style={{ position: "relative" }}>
  <MyChart />
  <Dock
    tools={[{ id: "raster", label: "Grid", icon: <GridGlyph /> }, …]}
    defaultPlace="unten"
    mode={mode}
    onUse={(id) => …}
  />
</div>
```

**Four resting places, and nothing in between.** `"oben" | "rechts" | "unten" |
"links"`, controlled (`place` / `onPlaceChange`) or uncontrolled
(`defaultPlace`, default `"unten"`). The dock is moved by its **grip**: dragging
snaps into the edge whose zone the pointer reaches, and the four arrow keys on
the grip are those same four places — absolute and not relative. Corners are not
resting places: a corner names no orientation. Why the dock *snaps* while being
dragged instead of following stands in ADR-0013; why the change of orientation is
animated by hand, in ADR-0014.

**A place without room refuses visibly.** Nine tools lie, with the tokens
shipped, as 316 × 40 and stand as 40 × 316; on a wide, flat surface the first
fits and the second does not. Such places are not offered — the zone shows the
outline the dock would have there, instead of quietly doing nothing. If the host
becomes so small that the *current* place no longer fits, the dock goes to the
next one that does and reports that through `onPlaceChange`. No overflow menu, no
shrinking, no scrolling.

The one limit of that, spoken out: if the strip fits in **neither** orientation
any more, the dock stays where it is and juts out beyond its host. There is then
no place to give way to, and the alternatives — shrink, scroll, collapse — are
one and all expressly rejected. Whoever puts a dock into a surface that can
become smaller than the strip is long had better hide it.

**The mode belongs to the caller.** `mode` names at most one tool and without a
statement is *none* — a dock whose tools simply fire has no mode, and none is
preset to the first tool either. `onUse(id)` reports every taking;
`onModeChange(id)` reports the same event narrowed to "that would be a different
mode", and whether the taken `id` is a mode at all is for the application to
decide.

**Three more characters in the set:** `GripGlyph`, `GridGlyph`, `MeasureGlyph` —
drawn according to the specification in `packages/core/docs/glyphs.md`.

**New tokens:** `--u-dock-tool`, `--u-dock-grip`, `--u-dock-gap`,
`--u-dock-padding`, `--u-dock-margin`, `--u-dock-grip-travel`. They are not merely
style: the component reads them back at runtime, because the question "does this
place fit" is a calculation over exactly these values. Whoever changes them
thereby also changes from how many tools on a side edge refuses.

**`TableToolbar` stays what it is.** It is a strip *in the flow* above a table —
it takes room instead of covering, and it does not move. Nothing about it
changes, and it is not deprecated.

## internal 0.7.0 – A window for searching (Sep. 2026)

Delivery report for `.scratch/command-palette/spec.md`.

### New

**`<CommandPalette>` – one list, one term, one window.** Controlled like the
modal (`open`, `onClose`); the opening remains the application's decision. An
item is `{ id, label, group?, icon?, weight? }`, and what is chosen is the `id` —
whether that leads to a jump or to something being executed is for the caller to
decide. Exactly that keeps **places and commands under one term** instead of
under two.

**The resting state belongs to the caller.** Without a statement the palette
shows nothing before the first character — a search field and not a menu, and
only so is the growth movement producible at all. Whoever wants something
standing there passes `restingItems`:

```tsx
<CommandPalette items={ALL} restingItems={recentlyUsed} … />
```

A **list** and not a switch, because the interesting question is not "all or
none" but "which". Whoever really wants to show everything writes
`restingItems={items}`; whoever wants to show the five most recently used can do
that too — and a `showAll` could not. With long lists, "all" is anyway exactly
the state this component abolished.

The rows stand in **your** order and without markings: without a term there is no
rank and nothing to mark. Everything else — arrow keys, enter, escape, the
pointer rule — applies unchanged.

There is **no `placeholder` prop**. Every visible text — placeholder, window
name, empty line, key hints down to the legend "Esc" — comes out of the
`Wording`. A second way to set the same text is worse than one.

Functionally it stays small, on purpose: **one** list as a prop. No sources, no
asynchrony, no preview, no "top hit", no memory. What is missing is reach — and
none of it is visible.

**The finder finds subsequences, not substrings.** `dtp` finds
`DateTimePicker`. A hit at the start of a word beats one in the middle of a word,
a contiguous run beats a scattered one, the shorter name beats the longer at
equal quality; the group name is searched along and ranks below every find in a
name. The matched characters are drawn in the accent — a find that no substring
explains has to let itself be seen to be one. The formula itself is internal;
what is promised is the **order**.

`weight` is the hook for frequency or recency: it is added to the rank last. The
library expressly keeps **no memory** for it — remembering is the application's
business.

**`useCommandPaletteShortcut(onOpen)`.** Binds ⌘K/Ctrl+K and `/`, including the
rule that every caller otherwise rediscovers through a bug report: `/` does
**not** open while the focus stands in an input, a textarea or a
`contenteditable`.

**Three new tokens, public** – so that overlays of one's own meet the palette
instead of guessing at it: `--u-radius-xl` (18px, one step above the card),
`--u-color-material` with `--u-color-material-fallback` and `--u-material-blur`
(the translucent surface with its opaque substitute colour), and
`--u-color-scrim` (the dimming behind an overlay). Both themes have values of
their own; the dark one is chosen by eye and did not come about by inverting.

The alpha of the material is a **floor**: the opaque colour beneath it carries
the legibility alone, the translucency supplies atmosphere and never contrast.
Whoever lowers the value gets a panel whose type is legible by luck. The reason
stands in `docs/adr/0012-a-translucent-material-needs-a-floor.md`. Where
`backdrop-filter` is missing or switched off, the pane falls back to the opaque
colour — quieter than intended, in every other respect right. The existing
overlays of the library do **not** move along; that is a decision of its own with
consequences of its own for the baselines.

### Changed

**`Wording` has ten new required fields** for the palette: `palettePlaceholder`,
`paletteField`, `palettePanel`, `paletteList`, `paletteNoFinds`,
`paletteFindCount`, `paletteHintMove`, `paletteHintChoose`, `paletteHintClose`,
`paletteKeyEsc`. As before: whoever overrides **partially** notices nothing;
whoever has built a complete `Wording` object gets type errors.

They are deliberately entries of **their own** and not those of the combobox. Its
`noMatches` stays where it is: the palette finds *finds*, and the word "hit" is
taken in the glossary for the point detection of the charts. Two meanings under
one grep are exactly what the directory exists against.

Nothing changes in the behaviour of existing components. Modal and palette share
the entrance and exit choreography of the native `<dialog>` internally; the
times, the escape behaviour and the background rule of the modal are unchanged,
and the shared hook is not part of the public interface.

## internal 0.6.0 – The value, the alarm and its age (Aug. 2026)

Delivery report for `.scratch/judging-values/spec.md`,
`.scratch/shopfloor-instruments/spec.md` and
`.scratch/plant-at-a-glance/spec.md`, this package's share.

### New

**The limit is a rule, not a colour.** `assess()`, `verdictWeight()` and the
types `Limit`, `LimitSet`, `Assessment`, `Verdict`, `Severity`, `Side`. A limit
is a value, a side and a severity; a target is something else and is never
violated, only missed. The assessment has **four** outcomes — `ok`, `unbekannt`,
`warnung`, `alarm` — and the fourth is the reason for the module: an absent value
must not look like a good one. No `null` return value, because that invites a
`?? "ok"` at the call site. A violation is **beyond** a limit, not on it.

The same module also stands in `@umriss-ui/charts` — written twice, on purpose,
justified in ADR-0006 and held together by a conformance test. For callers that
means: a tile and the chart beneath it never contradict each other about the same
figure, and `@umriss-ui/core` brings no canvas library along for it.

**`<Stat>` – the tile that reads its value.** Value, unit, label, optionally a
target, limits, a history and an as-of time. It gets **no `tone`**: the rule is
pulled out of the call site, and a tone prop would push it back. It has **no
trend arrow**: a direction out of two points of a noisy signal is noise with an
arrowhead. It says its verdict as a **word**, not only as a colour. Without
limits it passes no verdict at all. There is deliberately no `StatRow`: a row of
tiles is a layout problem, and `<Stat>` aligns its inside itself.

**`<AlarmList>` and `alarmModel` – the lifecycle of an alarm.** The library takes
alarms in and generates none (ADR-0009). The lifecycle state is **one field with
four values**, not two booleans — otherwise every list loses the third: came,
went, and nobody saw it. On top of that: the default order priority →
acknowledgement → time, the frequency per alarm type, flood detection, a return
threshold (dead band) and bulk acknowledgement through the known selection
helper. A flood is **marked, never suppressed**. The model composes with
`tableModel`; all previous guarantees go on holding.

**Freshness is a different axis from the verdict.** `freshness()`, `age()`,
`cadence()` and the hook `useFreshness()`. Three states out of two thresholds:
`frisch`, `alt`, `abgerissen`. **A stale value keeps its verdict** (ADR-0010) —
it does not become "unknown", because when the connection drops exactly what the
human then needs would otherwise be lost. The cadence derives from the
thresholds; a tile that goes stale after five minutes does not tick sixty times a
minute.

`Formats` gains `relative(ms)` — "vor 3 Minuten", in the coarsest unit that still
works out. (The formats are `de-DE`; see the entry at the top.)

### Changed

**`Wording` has new required fields** – some thirty, for assessment, freshness
and the alarm list. Whoever overrides the wording **partially**, as foreseen
(`<LanguageProvider wording={{ … }}>`), notices nothing of it: the statement was
and remains `Partial`. Whoever has built a complete `Wording` object themselves
gets type errors and adds the new entries — or writes
`{ ...DEFAULT_WORDING, …own }`, which is the better way anyway.

## internal 0.5.0 – Configurable, very large, checked (Aug. 2026)

### New

**Formats and wording are overridable.** `LanguageProvider`, `useFormats()`,
`useWording()`, `mergeLanguage()` as well as the defaults `DEFAULT_FORMATS` and
`DEFAULT_WORDING`. The wording is a **directory of entries**, named after what
they label — not a translation call. Whoever leaves an entry out gets the default
text, never a key name and never an empty string. At this point German was still
the only shipped language; since 0.10.0 English is the default and German ships
as `@umriss-ui/core/wording/de` (ADR-0019).

**One place to configure.** `UmrissProvider` holds exactly five things: `theme`
(`"light" | "dark" | "system"`, where "system" subscribes and takes a change at
runtime along), `dichte`, `portalTarget`, `toast` and `language`. With them
`useUmriss()`, `useDensity()`, `usePortalTarget()`, `useToastConfig()`.

**Virtualisation of very large tables.** `useTable(…, { virtual: { zeilenHoehe }
})`, `<Table virtual={…}>`, `TableVirtualBody`, `TableVirtualRow` and the pure
functions `visibleWindow` / `scrollForRow`. The sticky header and the sticky
first column stay; the keyboard reaches rows that were never rendered.

**A character set.** `CrossGlyph`, `PlusGlyph`, `MinusGlyph` – with a written-down
specification and a list of the characters that deviate from it (`packages/core/docs/glyphs.md`).
The set has grown since; what it holds today and what deviates stands in that
file, which is the actual deliverable.

`Meter` takes `label`.

### Changed

**The provider is voluntary.** Without it every component behaves **exactly as
before**. That is tested, not claimed: one component of every sort that reads
configuration at all.

**The row actions of the table are visible.** They lay at `opacity: 0.4` at rest
and thereby came to about **1.6:1** — by WCAG no longer readable text. Now `0.9`.
**That is a visible change**: whoever uses the action column sees it more clearly
at rest than before.

**`Meter` carries an accessible name.** Without a `label` it says "Fill level".
Before, the role `meter` had no name at all.

**A disabled `Tag` reports that in the accessibility tree** (`aria-disabled`), no
longer only through a CSS class.

**Virtualisation switches paging off.** Whoever sets `virtual` gets no pages:
`pageSize` and `setPage` stay without effect, and the view carries neither `page`
nor `pageSize`. Both at once would be a control that contradicts itself.

Otherwise nothing changes about the contract. All formatters give out character
for character the same as before — the checks for that were written **before** the
move — and the glyph migration is pixel-identical.

## internal 0.4.0 – Eight parts of the foundation (Aug. 2026)

The first version counted as it happened rather than reconstructed afterwards.

### New

| Export | Purpose |
|---|---|
| `Textarea` | multi-line input; `autoGrow` with `maxRows`, `showCount` |
| `RadioGroup` | one out of few, with an explanatory line per option |
| `Alert` | a message that stays — five tones, optionally dismissible |
| `Tag`, `TagGroup` | a removable label; the group navigates with arrow keys |
| `Divider` | a separating line as a layout primitive, horizontal/vertical, with a label |
| `VisuallyHidden` | text only for the screen reader; `focusable` for skip links |
| `ButtonGroup`, `SplitButton` | buttons that belong together; a main action plus variants |
| `Text`, `Heading`, `Link` | typography on the token scale |

Two peculiarities that stand out at the call: `Heading` separates outline level
from size, so that nobody picks the wrong level in order to get the right size.
And the tone of the `Alert` determines its aria role, not the caller — the two
urgent tones interrupt the screen reader, the rest do not.

### Changed

Nothing. No existing component was touched, no prop changed its meaning. This
release is purely additive.

### Otherwise

The package gets this changelog and a `prepublishOnly` step that runs the type
check and the build — a package that does not build can no longer be published by
accident. Nothing about the delivered content changes.

## internal 0.3.0 – The table as a surface, part one (Aug. 2026)

### New

| Export | What it is |
|---|---|
| `asCsv` | the filtered set as delimiter-separated text |
| `alsSuchparameter`, `ausSuchparametern` | the view as a link and back |
| `orderColumns` | column order, shared with the companion |

`Column` carries two new fields: `label` (column menu, CSV header row) and
`hideable` — `false` for columns that identify the row. `TableInput` takes
`hidden` and `order`; `TableProjection` gives the visible columns back in order,
and `columnCount` derives from that. `useTable` gains `sortRankOf`,
`toggleColumn`, `columnChoices`, `setOrder`, `initialView` and `view`.

`asCsv` returns text and triggers no download; file name and timestamp belong to
the application. Likewise the library does not write the address bar itself —
which is why the package hangs on no routing library.

### Changed

- **The sort is an ordered list of levels** instead of a single one. The model
  still accepts a single level; existing calling code stays valid and yields the
  same order. What is new is the behaviour *with* a modifier key: without it, one
  actuation replaces the list and turns up/down as before; with it, it appends,
  turns, and at the end of the cycle takes itself out again.
- **`Th` reports the modifier key to `onSort`** as a second parameter and shows
  the rank from two levels on. Whoever calls `onSort` with a one-parameter
  handler notices nothing of it.
- **Hiding does not reset the page.** Unlike search, sort and page size it does
  not change the set of rows. Hiding is pure presentation: the pipeline goes on
  working with all columns, so that a sort by a hidden column is preserved.

### Without a version of its own

Into the same period falls a rebuild of the two range pickers: the preset column,
the month pair, the calendar configuration and the trigger now lie in shared,
package-internal parts. For the caller nothing changes about it — no prop, no
commit moment, no two-click rule, no class name — which is why it gets no number
here.

## internal 0.2.0 – Popover, and the logic behind the bodies (Aug. 2026)

### New

- **`Popover`** – the one dismissible, anchored surface: portal, position,
  outside click, escape with focus return, travelling along while scrolling,
  stacking order, entrance. Eight panel modules in the package have lain on it
  since; whoever builds anchored surfaces of their own can take the same
  primitive.
- **`DateTimePicker` has `size`** – of the four pickers it was the only one
  missing it.
- **`Th` gains `column`** and passes the identifier on to `onSort`.
- The stacking order is a token scale (`--u-z-popover`, `--u-z-toast`,
  `--u-z-tooltip`) and thereby shiftable from outside. A surface inside a
  `<dialog>` portals there and no longer lies behind it.

### Changed

This release corrects behaviour that one may have arranged oneself around. The
list in full:

- **`NumberInput` reports a clamped value on every route.** Previously a key
  press gave out the unclamped value while blur and stepping gave the clamped one
  — one prop with two contracts that the caller could not tell apart. The text in
  the field still stays untouched while typing.
- **`DatePicker` "today" gives out local midnight.** The grid already did; the
  button supplied the time of day with it.
- **`DateTimePicker` "now" goes through the time-zone resolution.** It was the
  only way around it.
- **The choice between two identical wall-clock times** (the doubled hour at the
  end of summer time) **applies per day.** Previously it was reset only on
  opening.
- **Clearing while the panel is open closes it** – in all four pickers.
  Previously a panel stayed standing that was filled out of a deleted value.
- **`TablePagination` clamps internally.** Without hits it said "page 1 of 1"
  while "next" was disabled.

### Otherwise

The checkable logic of the components has since lain in modules of its own
(German number notation, the month grid, the clock change, date and time formats,
option lists, scale projection, position arithmetic, the table model). They are
not part of the public interface; all that is visible of it is that these parts
are now checked one by one.

## internal 0.1.0 – Takeover state (Aug. 2026)

The state the package came into this repository with.

What is delivered is an ESM bundle, type declarations and a stylesheet under
`@umriss-ui/core/styles.css`; `react` and `react-dom` from version 18 on are peer
dependencies. Contained are Badge, Button, Card, Checkbox, Combobox, DataViz, the
four date and time pickers, EmptyState, FormField, Input, Layout, Menu, Modal,
MultiSelect, NumberInput, Select, Skeleton, Spinner, Table, Tabs, Toast, Tooltip
and `useTableSelection`.

The number was a placeholder figure, not a statement — it stood for "delivered
once", not for a state one can update against. From 0.4.0 on, the rule above
applies.
