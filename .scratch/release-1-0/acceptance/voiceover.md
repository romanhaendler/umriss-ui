# One pass with VoiceOver in Safari

For condition 8 of [the acceptance criteria](../issues/03-the-acceptance-criteria.md): the maintainer, on the
candidate `0.58.0`, Safari on macOS, VoiceOver on (Cmd+F5). `pnpm start` serves the seven demos. Per step:
what to do, and what must be heard. Write "ok" or what was heard instead in the last column; a miss becomes a
`0.58.x` fix or is expressly declined. VO stands for Ctrl+Option.

Quick Nav off (Left+Right arrows together) unless a step says otherwise, so that the arrow keys reach the
component.

## Core

| # | Page / example | Do | Must be heard | Result |
|---|---|---|---|---|
| 1 | Button / One action | Tab to the button | its text, "button" | |
| 2 | IconButton / first example | Tab to it | the name from `aria-label`, "button" - once, not twice | |
| 3 | FormField / Mark a field as required | Tab into "Invoice number" | the label, "required", "edit text" | |
| 4 | FormField / Check an invoice on submit | Submit empty | the error text of the first invalid field, without moving the VO cursor by hand | |
| 5 | Input / Clear the field | Type, Tab to the cross, press it | the cross's name; after it the field reads empty | |
| 6 | Select / first example | Open with Space, arrow down, Enter | "collapsed" then "expanded", each option with its position, the chosen value after Enter | |
| 7 | Combobox / first example | Type two letters, arrow down | the number of matches, each option as it becomes active | |
| 8 | MultiSelect / first example | Choose two, then remove one chip | each choice announced as selected; the removal announced | |
| 9 | DatePicker / Pick a day | Open, arrow through the grid, Enter | the full date of each day ("Sunday, 15 November 2026"), the chosen date after closing | |
| 10 | Modal / first example | Open, Tab round, Escape | the dialog's title on opening; Tab stays inside; focus returns to the opener | |
| 11 | Toast / first example | Trigger a toast, then Alt+T | the toast's text without moving focus; Alt+T moves into the deck and Escape gives focus back | |
| 12 | Menu / first example | Open, arrow, Escape | "menu", each item, focus back on the trigger | |
| 13 | Tabs / first example | Arrow between tabs | each tab's name, "selected", its position ("2 of 3") | |
| 14 | TreeView / first example | Arrow down, right to open, left to fold | name, level, "expanded" / "collapsed" | |
| 15 | CommandPalette / Commands | Open, type, arrow, Enter | the field's name, the number of finds, each active find | |
| 16 | Alert / Tones | VO+Right through the alerts | each alert's title and text; warning and danger interrupt when they appear (example "Dismissible") | |
| 17 | Meter and ProgressBar / first examples | VO cursor on each | name, value in percent | |

## Table

| # | Page / example | Do | Must be heard | Result |
|---|---|---|---|---|
| 18 | First table / first example | VO+Right into the table, then VO+arrows | "table", the number of rows and columns, each column header with its cell | |
| 19 | Sorting / first example | Press a sortable header | "ascending" / "descending" on the header, and the announcement of the new order | |
| 20 | Filter / Start with a list filter set | Tab to the chip "Severity: Major", remove it | the chip's name; after removal the new count of entries | |
| 21 | Search / React to typing | Type into the search | the count of entries after the pause, not after every key | |
| 22 | Grouping / first example | Fold and unfold a group | the group's name, its row count, "collapsed" / "expanded" | |
| 23 | Grid / first editable example | Enter a cell, type, Enter; then Escape on another | the cell's column and row, "edit text"; saved and cancelled both announced | |
| 24 | Selection / first example | Space on a row, then "select all" | "selected", the count of selected rows | |
| 25 | Width and pinning / Keep the header and the names in view | Scroll sideways with the keyboard | the row header is still read with each cell | |

## Charts

| # | Page / example | Do | Must be heard | Result |
|---|---|---|---|---|
| 26 | Chart / first example | Tab to the plot | the chart's name and its summary (kinds of series, extent) | |
| 27 | Chart / Keyboard section's example | Arrow left and right in the plot | the active point: series, x value, y value, and a labelled limit where one is crossed | |
| 28 | Legend / a legend at the top and one at the bottom | Tab through | the top legend before the plot, the bottom one after it; "pressed" on a hidden series | |
| 29 | DataTable / first example | Open the data table | a real table with headers; the same values as the plot | |

## Schedule

| # | Page / example | Do | Must be heard | Result |
|---|---|---|---|---|
| 30 | Schedule / first example | Tab to the plot, arrow right, arrow down | lane, task, subtask, from-to of each active subtask | |
| 31 | Interactions / move and stretch | Alt+Right, Alt+Shift+Right | the new times after each step | |
| 32 | Stretch / Change lead-in and lead-out | Alt+I three times, Alt+Shift+I once, Alt+O | "Lead-in" / "Lead-out" with its new length after each | |
| 33 | Blocked time / first example with editing | Alt+Right into blocked time; Alt+Down into a blocked lane | a move steps over it; a stretch or lane change that cannot is refused and the refusal is read | |
| 34 | Dependencies / first example | `]` and `[` on a subtask with a dependency | the dependency: predecessor and successor | |

## Calculation, dashboard, alarms

| # | Page / example | Do | Must be heard | Result |
|---|---|---|---|---|
| 35 | Calculation / first example | VO+Right through it | each line in the order it is calculated: label, operator, value, unit; the result last | |
| 36 | Dashboard / Dispatcher | "Edit", move a widget with the keyboard, "Done" | the editing mode announced; the widget's new position; focus on "Edit" after "Done" | |
| 37 | Dashboard / same | Open the catalogue, add a widget | "dialog", each widget type with its sentence; the new widget announced | |
| 38 | AlarmList / Show the alerts | Tab into the list, arrow down | priority as a word ("Critical"), the alarm, its state, raised, duration | |
| 39 | AlarmList / same | Acknowledge the selected alarm | the acknowledgement announced; focus stays in the list | |
| 40 | AlarmBanner / A critical alert arrives | Trigger the arrival | the new alert announced once, with its priority, without moving focus | |
| 41 | AlarmBanner / Tell quiet from disconnected | Switch to disconnected | "Disconnected", never "no alerts" | |

## Everywhere

| # | Do | Must hold | Result |
|---|---|---|---|
| 42 | Tab through one whole page of each demo | no trap, no stop that reads nothing, focus always visible | |
| 43 | Rotor (VO+U), headings and landmarks, on one page of each demo | headings in order, one main landmark, the examples reachable by heading | |
| 44 | Switch the header to German, repeat steps 6, 19 and 38 | the German wording is spoken, with no English left in between | |
