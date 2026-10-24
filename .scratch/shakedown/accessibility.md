# Shakedown: accessibility across the six packages (0.40.4)

Status: needs-triage

Three personas, 2026-10-24: low vision (P12), keyboard-only and switch (P11), screen reader (P10). Earlier
accessibility findings stand in `core.md`, `audit-family.md`, `dashboard.md` and `mobile-native.md`.

## Low vision (P12)

Reflow at 320×256 (dpr 4), text spacing (WCAG 1.4.12), root 32 px, colour-vision deficiencies (CDP),
forced colours dark and light, a magnifier's view; Chromium, WebKit for reflow and four overlays.

1. **[Look] Chart series are told apart by colour alone in the normal theme**, while forced colours already
   draw dashes, markers and hatching. Under deuteranopia and achromatopsia two of three lines are the same
   grey, two bars one grey, the Running and Fault state bands two near-identical greys. The verdict-colour
   register admits the blind spot: "What the canvas draws this check cannot read"
   (`core/tests-unit/verdictColour.test.ts:100`). Idea: turn the forced-colours patterns on by default, or a
   `pattern` prop. The design language promises "never colour alone".
2. **[Look] `Alert` shows its tone only through colour:** five tones look identical in achromatopsia; the
   only glyph is the dismiss cross. Documented in the register ("the title and the text are the words"), so
   the tone's meaning rests on the caller's wording. Idea: a glyph per tone, as the table's ▲ ■ ✓ and the
   Toast's check do. Badge dots are one 5 px circle for every tone (documented: a word stands beside it).
3. **[Misfit] `Stat` in a flex row collapses to 34 px** (`container-type: inline-size` with `flex: 0 1 auto`):
   value and verdict spill out of the tile. Idea: a `min-inline-size`. Seen before in round 1.
4. **[Look] The Schedule at 320 px leaves a plot of about 165 px** (the lane labels take 110 of 272); a 2-hour
   bar is 28 px and its label unreadable; the day band is clipped. Idea: labels above the lanes when narrow.
5. **[Look] At root 32 px the chart legend (12.5 px) and limit labels (11.5 px) do not grow** (axis ticks
   known); the third schedule lane label is cut by the axis; the dashboard body clips a Stat (172/205).
6. **[Look] The MultiSelect panel at 320×256 has two nested scrollers**, the inner list taller than the
   panel. DatePicker and Combobox simply scroll. Idea: let only the list scroll.
7. **[Look] A dashboard widget title truncates under the 1.4.12 text-spacing CSS** - the only new clipping
   in any component at 900 and 320 px.
8. **[Misfit] A toast appears about 665 px right and 580 px below its trigger and is gone after 5.3 s** - a
   magnifier lens on the button never sees it (focus moves to it, it pauses on hover and focus). Idea: place
   it near the trigger on request, or keep it longer when it is far from focus.

Held up: no sideways page scroll at 320 px in either engine, only the table scrolls (in one direction) ·
every overlay fits 320×256, Modal and Drawer bodies scroll · text spacing clips nothing else · table
verdicts carry glyphs and numbers, Stat verdicts words · forced colours keep checked, switch, radio,
progress, selected tab, focus ring and disabled visible; the schedule's overlaps get a dotted edge, blocked
time is hatched · everything else doubles exactly at root 32 px.

## Screen reader (P10)

German wording and formats, walked only through what a screen reader is given: focus probes per key (role,
name, value, state, description via CDP), ARIA snapshots, a recorder of every live-region change; keyboard
as a screen-reader user drives it. Chromium; WebKit for findings 1 and 2. Not covered: real screen readers,
browse mode, iOS, Firefox. The list at the end says what only a manual pass can settle.

1. **[Break] Dashboard Edit, Done and Cancel drop focus to `<body>`, and Edit announces nothing**: the
   pressed button unmounts (both engines). 4–8 Tabs to find the place again. Idea: focus the first widget
   head and announce edit mode; on leaving, focus Edit.
2. ✓ **[Break] A table column filter cannot be reached by keyboard:** the trigger says expanded, focus stays
   on it, the panel is portalled to the end of `<body>`; 57 Tabs to its first control (`table/src/filter.tsx`
   on core's `Popover`). Same cause as the ColumnMenu (`audit-family.md` 1): a dialog-role `Popover` never
   moves focus in.
3. **[Misfit] A picked date, time or set of chips is not in the trigger's accessible name, value or
   description** (DatePicker, DateTimePicker, MultiSelect): the name is the label, the value text is
   superseded; nothing is announced on pick or Apply. Idea: `aria-describedby` on the value, or a polite
   "Gewählt: 14.11.2026".
4. **[Misfit] Sort and selection are silent:** `aria-sort` sits on the `columnheader` while focus is on its
   inner button; "2 ausgewählt" is plain text outside the status region; export says nothing; search
   announces per keystroke without a noun ("140 von 200", "60 von 200"). See `audit-family.md` 6.
5. **[Misfit] In the DateTimePicker, Enter on a day replaces the grid by hour/minute and says nothing;** the
   hour field is a `textbox`, not a `spinbutton`, and ArrowUp/Down change it silently.
6. **[Misfit] Combobox and CommandPalette announce the active option twice** (`aria-activedescendant` plus a
   polite live region); Enter after typing silently picks the pre-highlighted first entry. Needs a real
   NVDA/JAWS pass.
7. **[Misfit] Every MultiSelect option is its own Tab stop:** 26 Tabs to leave; the count "0 / 20" is static
   text. Idea: roving tabindex, announce the count.
8. **[Misfit] Calculation disclosure buttons announce no figure:** "Herleitung von Positionen zeigen" has no
   description; the values are a sibling only browse mode reads; the root total sits last.
9. **[Misfit] The dashboard's size choice is a "✓" in a plain `menuitem`** (see `audit-family.md` 7).
10. **[Misfit] Form errors are silent by default:** after a failed submit nothing is announced and focus stays
    on Submit. never: ADR-0060 - the Instead (announce plus focus the first invalid field) holds in about 3
    lines, but no helper or recipe is offered.
11. **[Misfit] The schedule announces the same "Abhängigkeit verletzt, 1 Std zu knapp" twice** for one
    incoming and one outgoing violation; "Abhängigkeit 0 Min" reads oddly for no lag.
12. **[Look] The chart summary names no day for its extremes** ("Besucher von 9 bis 31"); a daily axis
    reads clock times ("12. Okt. 12:00") and the range ends a day past the data; no position ("3 von 7"),
    Escape silent.
13. Smaller: Modal and Drawer open on "Schließen" (known); a checkbox in a FormField is named label plus own
    label; NumberInput's "€" is a stray text node outside the name; CSS uppercase makes headers "NR./NAME".

Wishes: an error-summary and announcement helper for forms (GOV.UK Error Summary; the validation itself
stays the app's, ADR-0060) · a findings list for the schedule - `overlaps()` and `violatedDependencies()`
are exported and work, the UI gives only counts (Bryntum conflicts panel). Unlisted.

Held up: all spoken German complete in every state, no English leak, key names right ("Pos1", "Umschalt") ·
fields expose invalid, required and their description · the toast is announced once in a labelled region
"Meldungen (Alt+T)", Alt+T and Escape work · dialog names and focus return on Escape · the chart's keyboard
walk, live readout and data table (caption, row headers) · calculation lists and `aria-expanded` · dashboard
move and size announcements · the schedule's arrow, `]`, `[` and `T` walks announce lane, task, time,
overlap and dependency · table search, `aria-sort`, mixed select-all, the bulk action reachable · palette
"1 Fund", "Nichts gefunden".

Only a manual NVDA/JAWS/VoiceOver pass can settle (Chrome + NVDA, then Safari + VoiceOver): whether a
picked date is read on its button in focus mode; whether the Combobox reads an option once or twice and with
"2 von 2"; what is said on Edit in the dashboard and where Tab lands; whether JAWS offers a route into the
filter panel via `aria-controls`; whether NVDA reads `aria-sort` in focus and table mode; whether
`role=application` on the chart handles the arrows and reads the description on every focus; whether the
toast is read once; what is read first in a Modal; how "→" in a dependency is spoken; the iOS rotor in the
MultiSelect panel. The host for these steps stays in the run's scratch directory (`r3-anna`, `?s=…` scenes).

## Keyboard only and switch (P11)

One app with every interactive component of all six packages, about 99 Tab stops; keyboard only, then a
switch user's Tab and Enter alone; focus rings measured per stop in light, dark and forced colours. Chromium
and WebKit. Not covered: Safari's real full keyboard access, Shift+F10, macOS Option+T, the schedule's
Alt+arrow moves, "focus not obscured" by the toast deck.

1. **[Misfit] A Popover or ColumnMenu panel is 49–80 Tabs away from its trigger** - the third independent
   hit (`audit-family.md` 1, P10 2): focus stays on the trigger, ArrowDown does nothing, the panel is
   portalled to the end of `<body>`. A switch user is fully blocked. Documented only as "does not trap focus".
2. **[Misfit] Tab out of an open DatePicker panel lands on `<body>` with the panel still open;** the next Tab
   restarts at the skip link. With Tab and Enter alone only the focused day or "Today" can be chosen (no
   typed entry).
3. **[Misfit] Tab and Enter alone cannot change** a RadioGroup, SegmentedControl or Tabs (only the selected
   item is a stop), a Slider, a TagGroup (Enter does not remove), the chart, schedule and grid walks (arrows
   only); Enter does not toggle Checkbox, Switch, MultiSelect options or row-select boxes (native Space);
   Enter on a Splitter collapses it to 0 %. These work: the dashboard widget menu (move earlier/later/to
   start/to end, sizes, remove), Combobox typing then Enter, native Select, MultiSelect All/None/Invert.
   Idea: an Enter path or visible previous/next buttons where a choice is arrow-only.
4. **[Misfit] A toast's Undo is 100 Tabs from its trigger** (the deck sits at the end of the DOM); Alt+T
   moves focus into the deck and works, but nothing on screen says so.
5. **[Misfit] The "/" shortcut of `useCommandPaletteShortcut` fires on a focused native `<select>`** (and
   hijacks its type-ahead), opens a second dialog over an open Modal, and cannot be turned off or remapped
   (the hook takes only `onOpen`) - WCAG 2.1.4. The guard covers input, textarea and contenteditable, not
   `<select>` or ARIA textbox/combobox divs. See `mobile-native.md`, `core.md`.
6. **[Misfit] Focus falls to `<body>`** after Pagination's Next reaches the last page (the button disables),
   when a live-removed row held focus, and after confirm-deleting a table row (the trigger is gone). Held:
   sort keeps focus; Escape from Menu, ColumnMenu, Popover, Drawer and Modal returns to the trigger;
   deleting a widget lands on the next widget head.
7. **[Look] Focus rings are two systems:** Checkbox, Radio, Switch, the file input and the skip link show
   the browser's 1 px `outline: auto` blue, not the 2 px petrol ring; the sort-header ring is clipped to an L.
   The petrol ring measures 5.0:1 light, 5.9:1 dark; visible in forced colours.
8. **[Look] The chart legend comes after the plot in Tab order** although it stands above it.
9. **[Trap, minor] A dashboard size outside the set** (under `as any`) gives a menu item "undefined, ½ wide".

Wishes (unlisted): a Popover that moves focus in and out (Radix Popover, MUI `autoFocus`) · a typed date
field (Mantine DateInput, MUI DateField) · a switch to turn off or remap the palette shortcut (Mantine
Spotlight `shortcut`).

Held up: Tab order follows the visual order across about 99 stops · the `VisuallyHidden focusable` skip link
works (without it, main content is 17 Tabs away) · no keyboard trap anywhere; dialogs release on Escape and
return focus · charts, schedule and grid release with Tab; the grid's Escape cancels an edit · rings pass in
dark, forced colours, on coloured buttons and in overlays · the Alt+T deck, the dashboard menu and the
chart's live readout work · no console errors · WebKit's default Tab skips buttons and links (19 stops) -
the browser's, not the library's.
