# Offenders of the own-base checks after ticket 03

The output of `packages/demo/checks/ownBase.ts` on the state after 03, by the ticket that owns the page. A working list for 04–07: each ticket works its section down to empty and says so in its Comments. Regenerate with `npx playwright test own-base --project=ui-light --project=table-light --project=charts-light`.

## 04

### ui › alert

**Own type** (14)

- tones › p.title "State of the data"
- tones › div.text "This view shows the stat"
- tones › p.title "New: sharing views"
- tones › div.text "A table's state now stan"
- tones › p.title "Import finished"
- tones › div.text "1,204 records were impor"
- tones › p.title "Two fields still need at"
- tones › div.text "The cost centre is missi"
- tones › p.title "Import failed"
- tones › div.text "The far end did not answ"
- with-actions-and-dismiss › p.title "Two fields still need at"
- with-actions-and-dismiss › div.text "The cost centre is missi"
- with-actions-and-dismiss › p.title "Import failed"
- with-actions-and-dismiss › div.text "The far end did not answ"

**Visible focus** (3)

- with-actions-and-dismiss › button.button "Go to the first field"
- with-actions-and-dismiss › button.button "Try again"
- with-actions-and-dismiss › button.button "View the log"

### ui › badge

**Own type** (8)

- tones › span.badge "Draft"
- tones › span.badge "New"
- tones › span.badge "Released"
- tones › span.badge "Under review"
- tones › span.badge "Blocked"
- counter › span.badge "3"
- counter › span.badge "12"
- counter › span.badge "99+"

**Visible focus** (1)

- counter › button.button "Inbox 7"

### ui › button

**Visible focus** (7)

- variants › button.button "Save changes"
- variants › button.button "Export"
- variants › button.button "Reset"
- variants › button.button "Delete"
- sizes › button.button "Normal size"
- sizes › button.button "Compact"
- loading-and-disabled › button.button "Apply"

### ui › buttongroup

**Visible focus** (15)

- buttons-that-belong-together › button.button "List"
- buttons-that-belong-together › button.button "Grid"
- buttons-that-belong-together › button.button "Timeline"
- buttons-that-belong-together › button.button "Check"
- buttons-that-belong-together › button.button "Apply"
- buttons-that-belong-together › button.button "Finish"
- buttons-that-belong-together › button.button "Back"
- buttons-that-belong-together › button.button "Forward"
- buttons-that-belong-together › button.button "Refresh"
- buttons-that-belong-together › button.button "One"
- buttons-that-belong-together › button.button "Two"
- buttons-that-belong-together › button.button "Three"
- splitbutton › button.button "Export"
- splitbutton › button.button
- splitbutton › button.button "Save"

### ui › card

**Own type** (8)

- anatomy › span.eyebrow "Production"
- anatomy › h2.title "Line 1 - filling"
- anatomy › span.badge "Running"
- anatomy › span.eyebrow "Log"
- anatomy › h2.title "With a divider"
- collapsible › span.eyebrow "Structure"
- collapsible › h2.title "Activity log"
- collapsible › span.badge "3 entries"

**Visible focus** (1)

- collapsible › button.collapseButton "Show"

### ui › checkbox

**Own type** (5)

- states › span.label "All areas"
- states › span.label "Analysis"
- states › span.label "Backend"
- states › span.label "Sales"
- states › span.label "Disabled"

**Visible focus** (1)

- states › input.input

### ui › combobox

**Own type** (9)

- typing-filters › label.label "Owner"
- typing-filters › p.message "Typing filters the list."
- states › label.label "With a disabled row"
- states › label.label "Invalid"
- states › p.message "Please name a person."
- states › label.label "Disabled"
- states › p.message "Deactivated."
- states › label.label "Empty result"
- states › p.message "Search for "zzz"."

### ui › commandpalette

**Visible focus** (2)

- commands › button.button "Open the palette"
- shortcut › input

### ui › datepicker

**Own type** (8)

- value-contract › label.label "Effective date"
- value-contract › p.message "Typing works too: 5.4. o"
- states › label.label "Deadline"
- states › p.message "Compact size (sm)."
- states › label.label "Effective date"
- states › p.message "The effective date must "
- states › label.label "Billing date"
- states › p.message "Deactivated."

### ui › daterangepicker

**Own type** (8)

- span › label.label "Reporting period"
- span › p.message "Clicking backwards is al"
- presets › label.label "Sprint"
- presets › p.message "Your own presets through"
- presets › label.label "Leave"
- presets › p.message "Without presets (presets"
- presets › label.label "Billing period"
- presets › p.message "Deactivated."

### ui › datetimepicker

**Own type** (8)

- only-on-commit › label.label "Appointment"
- only-on-commit › p.message "Tip: pick 25.10.2026 and"
- with-seconds › label.label "Measurement instant"
- with-seconds › p.message "With seconds."
- with-seconds › label.label "Compact"
- with-seconds › p.message "Compact size (sm)."
- with-seconds › label.label "Disabled"
- with-seconds › p.message "Deactivated."

### ui › datetimerangepicker

**Own type** (6)

- shift-window › label.label "Shift window"
- shift-window › p.message "Click the days, type 080"
- maintenance-window › label.label "Maintenance window"
- maintenance-window › p.message "With seconds; the durati"
- maintenance-window › label.label "Disabled"
- maintenance-window › p.message "Deactivated."

### ui › divider

**Own type** (1)

- horizontal › span.label "Section"

**Visible focus** (3)

- vertical › button.button "Left"
- vertical › button.button "Middle"
- vertical › button.button "Right"

### ui › dock

**Visible focus** (6)

- a-tool-strip › button.grip
- a-tool-strip › button.tool
- the-four-places › button.grip
- the-four-places › button.tool
- demonstration › button.grip
- demonstration › button.tool

### ui › emptystate

**Own type** (2)

- an-invitation › p.title "No reports yet"
- an-invitation › p.description "As soon as the first rep"

**Visible focus** (1)

- an-invitation › button.button "Create a report"

### ui › formfield

**Own type** (5)

- hint-and-error › label.label "Cost centre"
- hint-and-error › p.message "Four digits, as in the c"
- hint-and-error › p.message "4711 does not exist in t"
- hint-and-error › label.label "Project name*"
- hint-and-error › span.required "*"

### ui › input

**Own type** (14)

- states › label.label "Name*"
- states › span.required "*"
- states › label.label "Comment"
- states › p.message "Compact size (sm)."
- states › label.label "Short code"
- states › p.message "That short code is alrea"
- states › label.label "Reference"
- states › p.message "Deactivated."
- clearing › label.label "E-mail"
- clearing › p.message "With a clear button; it "
- clearing › label.label "Reference"
- clearing › p.message "Still empty - no button."
- numeric › label.label "Reference"
- numeric › label.label "Document number"

### ui › menu

**Visible focus** (1)

- actions › button.button "Actions"

### ui › stack-and-grid

**Visible focus** (4)

- stack › button.button "One"
- stack › button.button "Two"
- stack › button.button "Three"
- stack › button.button "Right"

### ui › umrissprovider

**Own type** (22)

- the-second-language › span.label "Furnace 1"
- the-second-language › span.unit "°C"
- the-second-language › span.verdict "Warning limit exceeded"
- the-second-language › span.deviation "34 above target"
- the-second-language › span.label "Furnace 2"
- the-second-language › span.verdict "No value"
- the-second-language › span.label "Units this shift"
- the-second-language › span.verdict "Warngrenze überschritten"
- the-second-language › span.deviation "34 über Ziel"
- the-second-language › span.verdict "Kein Wert"
- entry-by-entry › span.label "Furnace 1"
- entry-by-entry › span.unit "°C"
- entry-by-entry › span.verdict "OK"
- entry-by-entry › span.deviation "2 below target"
- entry-by-entry › span.label "Furnace 2"
- entry-by-entry › span.verdict "Warning limit exceeded"
- entry-by-entry › span.deviation "34 above target"
- entry-by-entry › span.label "Furnace 3"
- entry-by-entry › span.verdict "No value"
- entry-by-entry › span.label "Units this shift"
- entry-by-entry › span.verdict "Within tolerance"
- entry-by-entry › span.verdict "Outside tolerance"

## 05

### ui › confirmdialog

**Visible focus** (1)

- the-one-question › button.button "Delete the batch"

### ui › modal

**Visible focus** (2)

- a-window › button.button "Open the modal"
- long-content › button.button "Open the long modal"

### ui › multiselect

**Own type** (7)

- chips-in-the-field › label.label "Areas"
- chips-in-the-field › p.message "Remove chips by a click;"
- states › label.label "Empty"
- states › label.label "Invalid"
- states › p.message "Choose at least one area"
- states › label.label "Disabled"
- states › p.message "What is chosen stays vis"

### ui › numberinput

**Own type** (15)

- notation › label.label "Budget"
- notation › span.adornment "€"
- notation › p.message "Whole numbers, step 500."
- notation › label.label "Deviation"
- notation › span.adornment "±"
- notation › span.adornment "%"
- notation › p.message "Negative allowed, two de"
- bounds-and-empty › label.label "Target utilisation"
- bounds-and-empty › span.adornment "%"
- bounds-and-empty › p.message "One decimal place, clamp"
- bounds-and-empty › label.label "Weekly hours"
- bounds-and-empty › span.adornment "h"
- bounds-and-empty › p.message "Empty means: no figure g"
- bounds-and-empty › label.label "Fixed value"
- bounds-and-empty › p.message "Deactivated."

### ui › popover

**Visible focus** (2)

- anchored-surface › button.button "Show the surface"
- width-from-anchor › button.button "A wide trigger"

### ui › radiogroup

**Own type** (18)

- with-descriptions › label.label "Delivery"
- with-descriptions › span.label "Standard"
- with-descriptions › span.description "Delivery within three wo"
- with-descriptions › span.label "Express"
- with-descriptions › span.description "On the next working day,"
- with-descriptions › span.label "Collection in person"
- with-descriptions › span.description "Ready from the following"
- with-descriptions › span.label "Freight forwarder"
- with-descriptions › span.description "Currently not available."
- with-descriptions › p.message "The arrow keys travel an"
- side-by-side › label.label "View"
- side-by-side › span.label "List"
- side-by-side › span.label "Grid"
- side-by-side › span.label "Timeline"
- side-by-side › label.label "Disabled"
- side-by-side › span.label "First"
- side-by-side › span.label "Second"
- side-by-side › p.message "The whole group deactiva"

**Visible focus** (2)

- with-descriptions › input.input
- side-by-side › input.input

### ui › select

**Own type** (6)

- native-select › label.label "Role"
- native-select › p.message "With a clear button; it "
- native-select › label.label "Compact"
- native-select › p.message "Compact size (sm)."
- native-select › label.label "Disabled"
- native-select › p.message "Deactivated."

### ui › stat

**Own type** (33)

- value-against-limits › span.label "Furnace 1"
- value-against-limits › span.unit "°C"
- value-against-limits › span.verdict "OK"
- value-against-limits › span.deviation "2 below target"
- value-against-limits › span.label "Furnace 2"
- value-against-limits › span.verdict "Warning limit exceeded"
- value-against-limits › span.deviation "34 above target"
- value-against-limits › span.label "Furnace 3"
- value-against-limits › span.verdict "Alarm limit exceeded"
- value-against-limits › span.deviation "71 above target"
- value-against-limits › span.label "Units this shift"
- the-fourth-outcome › span.label "Furnace 4 · sensor silen"
- the-fourth-outcome › span.verdict "No value"
- the-fourth-outcome › span.label "Furnace 5 · no value"
- the-fourth-outcome › span.label "Furnace 6 · not finite"
- history-and-target › span.label "Utilisation of line 1"
- history-and-target › span.unit "%"
- history-and-target › span.verdict "OK"
- history-and-target › span.deviation "3 below target"
- history-and-target › span.label "Utilisation of line 2"
- history-and-target › span.verdict "Warning limit exceeded"
- history-and-target › span.deviation "21 below target"
- freshness › span.label "Furnace 1 · current"
- freshness › span.unit "°C"
- freshness › span.verdict "Alarm limit exceeded"
- freshness › span.asOf "Freshvor 30 Sekunden"
- freshness › span.age "vor 30 Sekunden"
- freshness › span.label "Furnace 1 · stale"
- freshness › span.asOf "Stalevor 12 Minuten"
- freshness › span.age "vor 12 Minuten"
- freshness › span.label "Furnace 1 · line dead"
- freshness › span.asOf "No connectionvor 1 Stund"
- freshness › span.age "vor 1 Stunde"

### ui › tabs

**Visible focus** (2)

- tabs › button.tab "Details"
- tabs › div.panel "The tab stands in `value"

### ui › tag

**Own type** (10)

- tones › span.text "Neutral"
- tones › span.text "Accent"
- tones › span.text "Success"
- tones › span.text "Warning"
- tones › span.text "Error"
- removable › span.text "Backend"
- removable › span.text "Frontend"
- removable › span.text "Design"
- removable › span.text "Critical"
- removable › span.text "Disabled"

### ui › textarea

**Own type** (12)

- autogrow-and-counter › label.label "Comment"
- autogrow-and-counter › p.message "Grows with its content, "
- autogrow-and-counter › label.label "Note"
- autogrow-and-counter › p.message "With a character counter"
- states › label.label "Reason"
- states › p.message "Fixed height, draggable "
- states › label.label "Short note"
- states › p.message "Compact size (sm)."
- states › label.label "Remark"
- states › p.message "Please give at least ten"
- states › label.label "Log"
- states › p.message "Deactivated."

**Visible focus** (2)

- autogrow-and-counter › button.button "Set a long text"
- autogrow-and-counter › button.button "Clear"

### ui › toast

**Visible focus** (4)

- feedback › button.button "Show a toast"
- feedback › button.button "Success"
- feedback › button.button "Warning"
- feedback › button.button "Without an expiry"

### ui › tooltip

**Visible focus** (2)

- explanation › button.button "Duplicate"
- explanation › button.button "Without a delay"

### ui › treeview

**Own type** (41)

- a-tree › span.content "Contracts"
- a-tree › span.content "Framework contracts"
- a-tree › span.content "Single orders"
- a-tree › span.content "Documents"
- a-tree › span.content "Statutes.pdf"
- ticking › span.content "Contracts"
- ticking › span.content "Nordwerk GmbH"
- ticking › span.content "Suedbahn AG"
- ticking › span.content "Ostmarkt eG"
- ticking › span.content "Statutes.pdf"
- demonstration › span.content "Contracts"
- demonstration › span.content "Framework contracts"
- demonstration › span.content "Nordwerk GmbH"
- demonstration › span.content "Suedbahn AG"
- demonstration › span.content "Ostmarkt eG"
- demonstration › span.content "Single orders"
- demonstration › span.content "Terminations"
- demonstration › span.content "External mandates"
- demonstration › span.content "Documents"
- demonstration › span.content "2026"
- demonstration › span.content "2025"
- demonstration › span.content "2024 (closed)"
- demonstration › span.content "Statutes.pdf"
- demonstration › span.content "Inbox"
- demonstration › span.content "Quarter 1"
- demonstration › span.content "Quarter 2"
- demonstration › span.content "Folder 0"
- demonstration › span.content "Folder 1"
- demonstration › span.content "Folder 2"
- demonstration › span.content "Folder 3"
- demonstration › span.content "Folder 4"
- demonstration › span.content "Folder 5"
- demonstration › span.content "Folder 6"
- demonstration › span.content "Folder 7"
- demonstration › span.content "Folder 8"
- demonstration › span.content "Folder 9"
- demonstration › span.content "Folder 10"
- demonstration › span.content "Folder 11"
- demonstration › span.content "Folder 12"
- demonstration › span.content "Folder 13"
- demonstration › span.content "Folder 14"

**Visible focus** (3)

- demonstration › button.button "Expand all"
- demonstration › button.button "Collapse all"
- demonstration › button.button "Reveal sheet 33.2"

### ui › visuallyhidden

**Own type** (1)

- skip-link-and-names › a.hidden "Skip to the content"

**Visible focus** (1)

- skip-link-and-names › button.button "Delete - project Aurora,"

## 06

### table › alarmlist

**Own type** (35)

- lifecycle › span.heading "Alarms"
- lifecycle › span.asOf "Fresh · vor 40 Sekunden"
- lifecycle › div.live "2 standing alarms, unack"
- lifecycle › th.th "Alarm"
- lifecycle › th.th "State"
- lifecycle › th.th "Priority"
- lifecycle › th.th "Raised"
- lifecycle › th.th "Duration"
- lifecycle › th.th "Frequency"
- lifecycle › span.label "Furnace 3 · temperature "
- lifecycle › span.lifecycle "Standing, unacknowledged"
- lifecycle › span.badge "High"
- lifecycle › span.label "Press 2 · system pressur"
- lifecycle › span.lifecycle "Standing, acknowledged"
- lifecycle › span.label "Mill 3 · coolant level l"
- lifecycle › span.badge "Medium"
- lifecycle › span.label "Cell 4 · guard door open"
- lifecycle › span.lifecycle "Cleared, unacknowledged"
- lifecycle › span.badge "Low"
- flood-and-chatter › span.heading "Alarms"
- flood-and-chatter › span.badge "Alarm flood: 9 in quick "
- flood-and-chatter › div.live "9 standing alarms, unack"
- flood-and-chatter › th.th "Alarm"
- flood-and-chatter › th.th "State"
- flood-and-chatter › th.th "Priority"
- flood-and-chatter › th.th "Raised"
- flood-and-chatter › th.th "Duration"
- flood-and-chatter › th.th "Frequency"
- flood-and-chatter › span.label "Extraction · filter foul"
- flood-and-chatter › span.lifecycle "Cleared, unacknowledged"
- flood-and-chatter › span.badge "Medium"
- flood-and-chatter › span.label "Labeller · paper almost "
- flood-and-chatter › span.badge "9×"
- flood-and-chatter › span.lifecycle "Standing, unacknowledged"
- flood-and-chatter › span.badge "Low"

**Visible focus** (1)

- lifecycle › input.input

### table › column

**Own type** (110)

- value-from-field › span "Part"
- value-from-field › span "Description"
- value-from-field › span "Stock"
- value-from-field › th.td "T-1180"
- value-from-field › td.td "Flange DN 50"
- value-from-field › th.td "T-1204"
- value-from-field › td.td "Shaft Ø 32 × 410"
- value-from-field › th.td "T-1311"
- value-from-field › td.td "Bearing cap"
- computed-value › span "Part"
- computed-value › span "Stock"
- computed-value › span "Unit price"
- computed-value › span "Stock value"
- computed-value › th.td "T-1180"
- computed-value › th.td "T-1204"
- computed-value › th.td "T-1311"
- presentation › span "Machine"
- presentation › span "Status"
- presentation › span "Load"
- presentation › th.td "Mill 2"
- presentation › span.badge "Running"
- presentation › th.td "Lathe 1"
- presentation › span.badge "Setup"
- presentation › th.td "Press 3"
- presentation › span.badge "Fault"
- defaults › span "Text"
- defaults › span "Number"
- defaults › span "Point in time"
- defaults › span "Truth value"
- defaults › span "Absent"
- defaults › th.td "Flange DN 50"
- defaults › td.td "17.03.2026, 09:05"
- defaults › td.td "Yes"
- defaults › th.td "Bearing cap"
- defaults › td.td "16.03.2026, 14:30"
- defaults › td.td "No"
- absent-values › span "Sample"
- absent-values › span "Diameter"
- absent-values › th.td "P-01"
- absent-values › th.td "P-02"
- absent-values › th.td "P-03"
- absent-values › th.td "P-04"
- absent-values › th.td "P-05"
- format › span "Shift"
- format › span "Yield"
- format › span "Parts"
- format › span "Mean"
- format › span "Day"
- format › span "Start"
- format › th.td "Early"
- format › td.td "17.03.2026"
- format › td.td "06:00"
- format › th.td "Late"
- format › td.td "14:00"
- format › th.td "Night"
- format › td.td "22:00"
- footer › span "Lot"
- footer › span "Line"
- footer › span "Pieces"
- footer › span "Scrap"
- footer › th.td "L-5510"
- footer › td.td "Line 1"
- footer › th.td "L-5511"
- footer › td.td "Line 2"
- footer › th.td "L-5512"
- footer › th.td "L-5513"
- row-header › span "Order"
- row-header › span "Customer"
- row-header › span.hidden "Actions"
- row-header › th.td "A-2041"
- row-header › td.td "Brandt Metalworks"
- row-header › th.td "A-2042"
- row-header › td.td "Keller & Sons"
- row-header › th.td "A-2043"
- row-header › td.td "Northworks"
- width › span "Order"
- width › span "Customer"
- width › th.th "Note"
- width › th.td "A-2041"
- width › td.td "Brandt Metalworks"
- width › td.td "Part delivery possible, "
- width › th.td "A-2042"
- width › td.td "Keller & Sons"
- width › td.td "Enclose certificate 3.1"
- width › th.td "A-2043"
- width › td.td "Northworks"
- width › td.td "Call-off in four lots af"
- own-ordering › span "Sheet"
- own-ordering › span "Size (mm)"
- own-ordering › th.td "B-11"
- own-ordering › td.td "1250 × 2500"
- own-ordering › th.td "B-12"
- own-ordering › td.td "1000 × 2000"
- own-ordering › th.td "B-13"
- own-ordering › td.td "1500 × 3000"
- presets › span "Order"
- presets › span "Quantity"
- presets › th.td "A-2041"
- presets › th.td "A-2042"
- presets › span "Delivery note"
- presets › span "Delivered"
- presets › th.td "LS-8801"
- presets › th.td "LS-8802"
- wrapper › span "Order"
- wrapper › span "Priority"
- wrapper › th.td "A-2041"
- wrapper › span.badge "normal"
- wrapper › th.td "A-2042"
- wrapper › span.badge "high"
- wrapper › th.td "A-2043"

**Visible focus** (44)

- value-from-field › button.sortButton "Part"
- value-from-field › button.sortButton "Description"
- value-from-field › button.sortButton "Stock"
- computed-value › button.sortButton "Part"
- computed-value › button.sortButton "Stock"
- computed-value › button.sortButton "Unit price"
- computed-value › button.sortButton "Stock value"
- presentation › button.sortButton "Machine"
- presentation › button.sortButton "Status"
- presentation › button.sortButton "Load"
- defaults › button.sortButton "Text"
- defaults › button.sortButton "Number"
- defaults › button.sortButton "Point in time"
- defaults › button.sortButton "Truth value"
- defaults › button.sortButton "Absent"
- absent-values › button.sortButton "Sample"
- absent-values › button.sortButton "Diameter"
- format › button.sortButton "Shift"
- format › button.sortButton "Yield"
- format › button.sortButton "Parts"
- format › button.sortButton "Mean"
- format › button.sortButton "Day"
- format › button.sortButton "Start"
- footer › button.sortButton "Lot"
- footer › button.sortButton "Line"
- footer › button.sortButton "Pieces"
- footer › button.sortButton "Scrap"
- row-header › button.button "Columns"
- row-header › input.input
- row-header › button.sortButton "Order"
- row-header › button.sortButton "Customer"
- row-header › button.button "Open"
- width › button.sortButton "Order"
- width › button.sortButton "Customer"
- width › th.th "Note"
- own-ordering › button.button "Export"
- own-ordering › button.sortButton "Sheet"
- own-ordering › button.sortButton "Size (mm)"
- presets › button.sortButton "Order"
- presets › button.sortButton "Quantity"
- presets › button.sortButton "Delivery note"
- presets › button.sortButton "Delivered"
- wrapper › button.sortButton "Order"
- wrapper › button.sortButton "Priority"

### table › columnmenu

**Own type** (16)

- show-hide-and-order › span "Order"
- show-hide-and-order › span "Customer"
- show-hide-and-order › span "Line"
- show-hide-and-order › span "Quantity"
- show-hide-and-order › span "Due"
- show-hide-and-order › th.td "A-2041"
- show-hide-and-order › td.td "Brandt Metalworks"
- show-hide-and-order › td.td "Line 1"
- show-hide-and-order › td.td "20.03.2026"
- show-hide-and-order › th.td "A-2042"
- show-hide-and-order › td.td "Keller & Sons"
- show-hide-and-order › td.td "Line 2"
- show-hide-and-order › td.td "24.03.2026"
- show-hide-and-order › th.td "A-2043"
- show-hide-and-order › td.td "Northworks"
- show-hide-and-order › td.td "18.03.2026"

**Visible focus** (6)

- show-hide-and-order › button.button "Columns"
- show-hide-and-order › button.sortButton "Order"
- show-hide-and-order › button.sortButton "Customer"
- show-hide-and-order › button.sortButton "Line"
- show-hide-and-order › button.sortButton "Quantity"
- show-hide-and-order › button.sortButton "Due"

### table › export

**Own type** (22)

- download › span "Order"
- download › span "Customer"
- download › span "Quantity"
- download › span "Price"
- download › th.td "A-2041"
- download › td.td "Brandt Metalworks"
- download › th.td "A-2042"
- download › td.td "Keller & Sons"
- download › th.td "A-2043"
- download › td.td "Northworks"
- download › th.td "A-2044"
- download › td.td "Northplate"
- text › span "Order"
- text › span "Quantity"
- text › span "Due"
- text › span "Urgent"
- text › th.td "A-2041"
- text › td.td "20.03.2026"
- text › td.td "No"
- text › th.td "A-2042"
- text › td.td "24.03.2026"
- text › td.td "Yes"

**Visible focus** (10)

- download › button.button "Export"
- download › button.sortButton "Order"
- download › button.sortButton "Customer"
- download › button.sortButton "Quantity"
- download › button.sortButton "Price"
- text › button.button "Export"
- text › button.sortButton "Order"
- text › button.sortButton "Quantity"
- text › button.sortButton "Due"
- text › button.sortButton "Urgent"

### table › filter

**Own type** (90)

- list-filter › span "Fault"
- list-filter › span "Line"
- list-filter › span "Cause"
- list-filter › th.td "S-301"
- list-filter › td.td "Line 1"
- list-filter › td.td "Tool breakage"
- list-filter › th.td "S-302"
- list-filter › td.td "Line 2"
- list-filter › td.td "Material shortage"
- list-filter › th.td "S-303"
- list-filter › span.absent "—"
- list-filter › span.hidden "No value"
- list-filter › th.td "S-304"
- list-filter › td.td "Line 3"
- list-filter › th.td "S-305"
- list-filter › td.td "Sensor fault"
- range-filter › span "Order"
- range-filter › span "Customer"
- range-filter › span "Quantity"
- range-filter › span "Due date"
- range-filter › th.td "A-2041"
- range-filter › td.td "Brandt Metalworks"
- range-filter › td.td "03.09.2026"
- range-filter › th.td "A-2042"
- range-filter › td.td "Keller & Sons"
- range-filter › td.td "12.09.2026"
- range-filter › th.td "A-2043"
- range-filter › td.td "Northworks"
- range-filter › td.td "18.09.2026"
- range-filter › th.td "A-2044"
- range-filter › td.td "Hofmann Drives"
- range-filter › td.td "30.09.2026"
- range-filter › th.td "A-2045"
- range-filter › td.td "Lindner Hydraulics"
- range-filter › td.td "01.10.2026"
- range-filter › th.td "A-2046"
- range-filter › td.td "Sauer Conveyors"
- range-filter › td.td "08.10.2026"
- own-filter-minimal › span "Order"
- own-filter-minimal › span "Customer"
- own-filter-minimal › span "Due date"
- own-filter-minimal › th.td "A-2041"
- own-filter-minimal › td.td "Brandt Metalworks"
- own-filter-minimal › td.td "03.09.2026"
- own-filter-minimal › th.td "A-2042"
- own-filter-minimal › td.td "Keller & Sons"
- own-filter-minimal › td.td "12.09.2026"
- own-filter-minimal › th.td "A-2043"
- own-filter-minimal › td.td "Northworks"
- own-filter-minimal › td.td "24.09.2026"
- own-filter-minimal › th.td "A-2044"
- own-filter-minimal › td.td "Hofmann Drives"
- own-filter-minimal › td.td "18.09.2026"
- own-filter-minimal › th.td "A-2045"
- own-filter-minimal › td.td "Lindner Hydraulics"
- own-filter-minimal › td.td "02.10.2026"
- own-filter › span "Part"
- own-filter › span "Description"
- own-filter › span "Stock"
- own-filter › th.td "T-1180"
- own-filter › td.td "Flange DN 50"
- own-filter › th.td "T-1204"
- own-filter › td.td "Shaft Ø 32 × 410"
- own-filter › th.td "T-1311"
- own-filter › td.td "Bearing cap"
- own-filter › th.td "T-1320"
- own-filter › td.td "Flange DN 80"
- own-filter › th.td "T-1402"
- own-filter › td.td "Sealing ring 40 × 3"
- own-filter › th.td "T-1415"
- own-filter › td.td "Key 8 × 7"
- conditions-from-outside › span "Order"
- conditions-from-outside › span "Customer"
- conditions-from-outside › span "Status"
- conditions-from-outside › th.td "A-2041"
- conditions-from-outside › td.td "Brandt Metalworks"
- conditions-from-outside › span.badge "In progress"
- conditions-from-outside › th.td "A-2042"
- conditions-from-outside › td.td "Keller & Sons"
- conditions-from-outside › span.badge "Open"
- conditions-from-outside › th.td "A-2043"
- conditions-from-outside › td.td "Northworks"
- conditions-from-outside › span.badge "Blocked"
- conditions-from-outside › th.td "A-2044"
- conditions-from-outside › td.td "Hofmann Drives"
- conditions-from-outside › span.badge "Done"
- conditions-from-outside › th.td "A-2045"
- conditions-from-outside › td.td "Lindner Hydraulics"
- conditions-from-outside › th.td "A-2046"
- conditions-from-outside › td.td "Sauer Conveyors"

**Visible focus** (24)

- list-filter › button.sortButton "Fault"
- list-filter › button.sortButton "Line"
- list-filter › button.filterButton
- list-filter › button.sortButton "Cause"
- range-filter › button.sortButton "Order"
- range-filter › button.sortButton "Customer"
- range-filter › button.sortButton "Quantity"
- range-filter › button.filterButton
- range-filter › button.sortButton "Due date"
- own-filter-minimal › button.sortButton "Order"
- own-filter-minimal › button.sortButton "Customer"
- own-filter-minimal › button.sortButton "Due date"
- own-filter-minimal › button.filterButton
- own-filter › button.sortButton "Part"
- own-filter › button.sortButton "Description"
- own-filter › button.sortButton "Stock"
- own-filter › button.filterButton
- conditions-from-outside › button.button "2 open"
- conditions-from-outside › button.button "2 blocked"
- conditions-from-outside › button.button "All statuses"
- conditions-from-outside › button.sortButton "Order"
- conditions-from-outside › button.sortButton "Customer"
- conditions-from-outside › button.sortButton "Status"
- conditions-from-outside › button.filterButton

### table › pagination

**Own type** (29)

- paging › span "Movement"
- paging › span "Item"
- paging › span "Quantity"
- paging › th.td "B-4101"
- paging › td.td "Flange DN 50"
- paging › th.td "B-4102"
- paging › td.td "Bearing cap"
- paging › th.td "B-4103"
- paging › td.td "Shaft Ø 32"
- paging › th.td "B-4104"
- paging › td.td "Bush 20/25"
- paging › th.td "B-4105"
- paging › td.td "Key 8×7"
- paging › span "23 entries"
- paging › label.pageSize "Rows51025"
- without-a-bar › span "Movement"
- without-a-bar › span "Quantity"
- without-a-bar › th.td "B-4201"
- without-a-bar › th.td "B-4202"
- without-a-bar › th.td "B-4203"
- without-a-bar › th.td "B-4204"
- without-a-bar › th.td "B-4205"
- without-a-bar › th.td "B-4206"
- without-a-bar › th.td "B-4207"
- without-a-bar › th.td "B-4208"
- without-a-bar › th.td "B-4209"
- without-a-bar › th.td "B-4210"
- without-a-bar › th.td "B-4211"
- without-a-bar › th.td "B-4212"

**Visible focus** (6)

- paging › button.sortButton "Movement"
- paging › button.sortButton "Item"
- paging › button.sortButton "Quantity"
- paging › button.button "Next"
- without-a-bar › button.sortButton "Movement"
- without-a-bar › button.sortButton "Quantity"

### table › rowactions

**Own type** (27)

- row-actions › span "Order"
- row-actions › span "Customer"
- row-actions › span.hidden "Actions"
- row-actions › th.td "A-2041"
- row-actions › td.td "Brandt Metalworks"
- row-actions › th.td "A-2042"
- row-actions › td.td "Keller & Sons"
- row-actions › th.td "A-2043"
- row-actions › td.td "Northworks"
- bulk-action › span "Order"
- bulk-action › span "Customer"
- bulk-action › span.hidden "Actions"
- bulk-action › th.td "A-2041"
- bulk-action › td.td "Brandt Metalworks"
- bulk-action › th.td "A-2042"
- bulk-action › td.td "Keller & Sons"
- bulk-action › th.td "A-2043"
- bulk-action › td.td "Northworks"
- overflow › span "Order"
- overflow › span "Customer"
- overflow › span.hidden "Actions"
- overflow › th.td "A-2041"
- overflow › td.td "Brandt Metalworks"
- overflow › th.td "A-2042"
- overflow › td.td "Keller & Sons"
- overflow › th.td "A-2043"
- overflow › td.td "Northworks"

**Visible focus** (11)

- row-actions › button.sortButton "Order"
- row-actions › button.sortButton "Customer"
- row-actions › button.button "Open"
- row-actions › button.button "Duplicate"
- bulk-action › input.input
- bulk-action › button.sortButton "Order"
- bulk-action › button.sortButton "Customer"
- bulk-action › button.button "Release"
- overflow › button.sortButton "Order"
- overflow › button.sortButton "Customer"
- overflow › button.button "⋯"

### table › rowdetail

**Own type** (8)

- detail-row › span "Order"
- detail-row › span "Customer"
- detail-row › th.td "A-2041"
- detail-row › td.td "Brandt Metalworks"
- detail-row › th.td "A-2042"
- detail-row › td.td "Keller & Sons"
- detail-row › th.td "A-2043"
- detail-row › td.td "Northworks"

**Visible focus** (2)

- detail-row › button.sortButton "Order"
- detail-row › button.sortButton "Customer"

### table › search

**Own type** (24)

- search › span "Part"
- search › span "Description"
- search › span "Location"
- search › span "Stock"
- search › th.td "T-1180"
- search › td.td "Flange DN 50"
- search › td.td "Rack 4"
- search › th.td "T-1204"
- search › td.td "Shaft Ø 32 × 410"
- search › td.td "Rack 1"
- search › th.td "T-1311"
- search › td.td "Bearing cap"
- search › th.td "T-1320"
- search › td.td "Flange DN 80"
- search › td.td "Rack 2"
- outside › h2.title "Stores"
- outside › span "Part"
- outside › span "Description"
- outside › th.td "T-1180"
- outside › td.td "Flange DN 50"
- outside › th.td "T-1204"
- outside › td.td "Shaft Ø 32 × 410"
- outside › th.td "T-1311"
- outside › td.td "Bearing cap"

**Visible focus** (6)

- search › button.sortButton "Part"
- search › button.sortButton "Description"
- search › button.sortButton "Location"
- search › button.sortButton "Stock"
- outside › button.sortButton "Part"
- outside › button.sortButton "Description"

### table › table

**Own type** (196)

- first-table › span "Order"
- first-table › span "Customer"
- first-table › span "Quantity"
- first-table › th.td "A-2041"
- first-table › td.td "Brandt Metalworks"
- first-table › th.td "A-2042"
- first-table › td.td "Keller & Sons"
- first-table › th.td "A-2043"
- first-table › td.td "Northworks"
- first-table › th.td "A-2044"
- first-table › td.td "Hofmann Drives"
- selection › span "Order"
- selection › span "Customer"
- selection › span "Line"
- selection › th.td "A-2041"
- selection › td.td "Brandt Metalworks"
- selection › td.td "Line 1"
- selection › th.td "A-2042"
- selection › td.td "Northworks"
- selection › td.td "Line 2"
- selection › th.td "A-2043"
- selection › td.td "Keller & Sons"
- selection › th.td "A-2044"
- selection › td.td "Northplate"
- selection › td.td "Line 3"
- selection › th.td "A-2045"
- selection › td.td "Hofmann Drives"
- selection › th.td "A-2046"
- sticky-parts › span "Station"
- sticky-parts › span "Line"
- sticky-parts › span "06:00"
- sticky-parts › span "07:00"
- sticky-parts › span "08:00"
- sticky-parts › span "09:00"
- sticky-parts › span "10:00"
- sticky-parts › span "11:00"
- sticky-parts › span "12:00"
- sticky-parts › span "13:00"
- sticky-parts › span "14:00"
- sticky-parts › span "15:00"
- sticky-parts › th.td "Saw 1"
- sticky-parts › td.td "Line 1"
- sticky-parts › th.td "Mill 1"
- sticky-parts › td.td "Line 2"
- sticky-parts › th.td "Lathe 1"
- sticky-parts › td.td "Line 3"
- sticky-parts › th.td "Boring mill 1"
- sticky-parts › th.td "Grinding 1"
- sticky-parts › th.td "Deburring 1"
- sticky-parts › th.td "Washing 1"
- sticky-parts › th.td "Inspection 1"
- sticky-parts › th.td "Saw 2"
- sticky-parts › th.td "Mill 2"
- sticky-parts › th.td "Lathe 2"
- sticky-parts › th.td "Boring mill 2"
- sticky-parts › th.td "Grinding 2"
- sticky-parts › th.td "Deburring 2"
- sticky-parts › th.td "Washing 2"
- sticky-parts › th.td "Inspection 2"
- density › span "Station"
- density › span "Line"
- density › span "Pieces"
- density › th.td "Saw 1"
- density › td.td "Line 1"
- density › th.td "Mill 2"
- density › th.td "Lathe 1"
- density › td.td "Line 2"
- empty-and-loading › span "Order"
- empty-and-loading › span "Customer"
- empty-and-loading › span "Quantity"
- empty-and-loading › p.title "No open orders"
- empty-and-loading › p.description "New orders appear here a"
- empty-and-loading › p.emptyTitle "Nothing matches the sear"
- styling-rows › span "Order"
- styling-rows › span "Customer"
- styling-rows › span "Due date"
- styling-rows › span "Urgent"
- styling-rows › th.td "A-2041"
- styling-rows › td.td "Brandt Metalworks"
- styling-rows › td.td "27.03.2026"
- styling-rows › td.td "No"
- styling-rows › th.td "A-2042"
- styling-rows › td.td "Keller & Sons"
- styling-rows › td.td "18.03.2026"
- styling-rows › td.td "Yes"
- styling-rows › th.td "A-2043"
- styling-rows › td.td "Northworks"
- styling-rows › td.td "02.04.2026"
- styling-rows › th.td "A-2044"
- styling-rows › td.td "Hofmann Drives"
- styling-rows › td.td "19.03.2026"
- initial-view › span "Order"
- initial-view › span "Customer"
- initial-view › span "Quantity"
- initial-view › th.td "A-2043"
- initial-view › td.td "Northworks"
- initial-view › th.td "A-2044"
- initial-view › td.td "Hofmann Drives"
- initial-view › th.td "A-2041"
- initial-view › td.td "Brandt Metalworks"
- initial-view › th.td "A-2042"
- initial-view › td.td "Keller & Sons"
- virtualisation › span "Tag"
- virtualisation › span "Station"
- virtualisation › span "Reading"
- virtualisation › span "Unit"
- virtualisation › span "Tolerance"
- virtualisation › span "Load"
- virtualisation › span "Status"
- virtualisation › span "Note"
- virtualisation › th.td "MW-00001"
- virtualisation › td.td "East"
- virtualisation › td.td "°C"
- virtualisation › span.badge "Normal"
- virtualisation › td.td "Reported by the plant"
- virtualisation › th.td "MW-00002"
- virtualisation › td.td "bar"
- virtualisation › td.td "Sensor replaced"
- virtualisation › th.td "MW-00003"
- virtualisation › td.td "North"
- virtualisation › th.td "MW-00004"
- virtualisation › span.badge "Elevated"
- virtualisation › th.td "MW-00005"
- virtualisation › td.td "South"
- virtualisation › td.td "kWh"
- virtualisation › td.td "Recalibrated"
- virtualisation › th.td "MW-00006"
- virtualisation › th.td "MW-00007"
- virtualisation › td.td "Captured automatically"
- virtualisation › th.td "MW-00008"
- virtualisation › td.td "West"
- virtualisation › td.td "m³/h"
- virtualisation › span.badge "Critical"
- virtualisation › td.td "Routine measurement"
- virtualisation › th.td "MW-00009"
- virtualisation › th.td "MW-00010"
- virtualisation › td.td "Valley"
- virtualisation › th.td "MW-00011"
- virtualisation › th.td "MW-00012"
- virtualisation › th.td "MW-00013"
- virtualisation › th.td "MW-00014"
- virtualisation › td.td "Centre"
- virtualisation › th.td "MW-00015"
- virtualisation › td.td "Ring"
- provider › span "Batch"
- provider › span "Material"
- provider › span "Received"
- provider › th.td "CH-7710"
- provider › td.td "S235JR"
- provider › td.td "2026-03-09"
- provider › th.td "CH-7712"
- provider › td.td "1.4301"
- provider › td.td "2026-03-12"
- provider › th.td "CH-7715"
- provider › td.td "AlMg3"
- provider › td.td "2026-03-16"
- provider › label.label "Received from"
- pre-filter › span "Order"
- pre-filter › span "Line"
- pre-filter › span "Customer"
- pre-filter › th.td "A-2041"
- pre-filter › td.td "Line 1"
- pre-filter › td.td "Brandt Metalworks"
- pre-filter › th.td "A-2043"
- pre-filter › td.td "Line 2"
- pre-filter › td.td "Northworks"
- pre-filter › th.td "A-2045"
- pre-filter › span "4 entries"
- pre-filter › label.pageSize "Rows310"
- demonstration › span "Order"
- demonstration › span "Customer"
- demonstration › span "Line"
- demonstration › span "Quantity"
- demonstration › span "Reading"
- demonstration › span "Status"
- demonstration › span "Deviation"
- demonstration › th.th "Trend"
- demonstration › span.hidden "Actions"
- demonstration › th.td "A-2041"
- demonstration › td.td "Brandt Metalworks"
- demonstration › td.td "Line 1"
- demonstration › span.badge "In progress"
- demonstration › th.td "A-2042"
- demonstration › td.td "Keller & Sons"
- demonstration › td.td "Line 2"
- demonstration › span.badge "Open"
- demonstration › th.td "A-2043"
- demonstration › td.td "Northworks"
- demonstration › span.badge "Blocked"
- demonstration › th.td "A-2044"
- demonstration › td.td "Hofmann Drives"
- demonstration › td.td "Line 3"
- demonstration › span.badge "Done"
- demonstration › th.td "A-2045"
- demonstration › span "12 entries"
- demonstration › label.pageSize "Rows51025"

**Own box** (5)

- virtualisation › tbody.virtualBody "MW-00001East792,3°C3,585"
- demonstration › span.value "12,08"
- demonstration › span.value "12,47"
- demonstration › span.value "12,71"
- demonstration › span.value "11,93"

**Visible focus** (73)

- first-table › button.sortButton "Order"
- first-table › button.sortButton "Customer"
- first-table › button.sortButton "Quantity"
- selection › input.input
- selection › button.sortButton "Order"
- selection › button.sortButton "Customer"
- selection › button.sortButton "Line"
- sticky-parts › input.input
- sticky-parts › button.sortButton "Station"
- sticky-parts › button.sortButton "Line"
- sticky-parts › button.sortButton "06:00"
- sticky-parts › button.sortButton "07:00"
- sticky-parts › button.sortButton "08:00"
- sticky-parts › button.sortButton "09:00"
- sticky-parts › button.sortButton "10:00"
- sticky-parts › button.sortButton "11:00"
- sticky-parts › button.sortButton "12:00"
- sticky-parts › button.sortButton "13:00"
- sticky-parts › button.sortButton "14:00"
- sticky-parts › button.sortButton "15:00"
- density › button.sortButton "Station"
- density › button.sortButton "Line"
- density › button.sortButton "Pieces"
- empty-and-loading › button.sortButton "Order"
- empty-and-loading › button.sortButton "Customer"
- empty-and-loading › button.sortButton "Quantity"
- empty-and-loading › button.button "Create an order"
- empty-and-loading › button.button "Reset"
- styling-rows › button.sortButton "Order"
- styling-rows › button.sortButton "Customer"
- styling-rows › button.sortButton "Due date"
- styling-rows › button.sortButton "Urgent"
- initial-view › button.button "Columns"
- initial-view › button.sortButton "Order"
- initial-view › button.sortButton "Customer"
- initial-view › button.sortButton "Quantity"
- initial-view › button.button "Start again with this vi"
- initial-view › button.button "Back to the beginning"
- virtualisation › input.input
- virtualisation › button.sortButton "Tag"
- virtualisation › button.sortButton "Station"
- virtualisation › button.sortButton "Reading"
- virtualisation › button.sortButton "Unit"
- virtualisation › button.sortButton "Tolerance"
- virtualisation › button.sortButton "Load"
- virtualisation › button.sortButton "Status"
- virtualisation › button.sortButton "Note"
- provider › button.button "View"
- provider › button.button "Save as CSV"
- provider › button.sortButton "Batch"
- provider › button.sortButton "Material"
- provider › button.sortButton "Received"
- pre-filter › button.sortButton "Order"
- pre-filter › button.sortButton "Line"
- pre-filter › button.filterButton
- pre-filter › button.sortButton "Customer"
- pre-filter › button.button "Next"
- demonstration › button.button "Columns"
- demonstration › button.button "Export"
- demonstration › input.input
- demonstration › button.sortButton "Order"
- demonstration › button.sortButton "Customer"
- demonstration › button.sortButton "Line"
- demonstration › button.filterButton
- demonstration › button.sortButton "Quantity"
- demonstration › button.sortButton "Reading"
- demonstration › button.sortButton "Status"
- demonstration › button.sortButton "Deviation"
- demonstration › button.button "Open"
- demonstration › button.button "Archive"
- demonstration › button.button "Next"
- demonstration › button.button "2 blocked"
- demonstration › button.button "All statuses"

### table › toolbar

**Own type** (18)

- in-the-table › span "Order"
- in-the-table › span "Customer"
- in-the-table › span "Quantity"
- in-the-table › span.hidden "Actions"
- in-the-table › th.td "A-2041"
- in-the-table › td.td "Brandt Metalworks"
- in-the-table › th.td "A-2042"
- in-the-table › td.td "Keller & Sons"
- in-the-table › th.td "A-2043"
- in-the-table › td.td "Northworks"
- outside › span "Order"
- outside › span "Customer"
- outside › th.td "A-2041"
- outside › td.td "Brandt Metalworks"
- outside › th.td "A-2042"
- outside › td.td "Keller & Sons"
- outside › th.td "A-2043"
- outside › td.td "Northworks"

**Visible focus** (10)

- in-the-table › button.button "Columns"
- in-the-table › button.button "Export"
- in-the-table › input.input
- in-the-table › button.sortButton "Order"
- in-the-table › button.sortButton "Customer"
- in-the-table › button.sortButton "Quantity"
- in-the-table › button.button "Block"
- outside › button.button "Export"
- outside › button.sortButton "Order"
- outside › button.sortButton "Customer"

### table › verdictcolumn

**Own type** (19)

- four-verdicts › span "Press"
- four-verdicts › span "Pressure (bar)"
- four-verdicts › th.td "Press 1"
- four-verdicts › th.td "Press 2"
- four-verdicts › th.td "Press 3"
- four-verdicts › th.td "Press 4"
- sorting › span "Furnace"
- sorting › span "Temperature (°C)"
- sorting › th.td "Furnace 2"
- sorting › th.td "Furnace 3"
- sorting › th.td "Furnace 4"
- sorting › th.td "Furnace 5"
- sorting › th.td "Furnace 1"
- format › span "Batch"
- format › span "Good parts"
- format › span "Yield"
- format › th.td "CH-7710"
- format › th.td "CH-7712"
- format › th.td "CH-7715"

**Own box** (10)

- four-verdicts › span.value "212,4"
- four-verdicts › span.value "231,8"
- four-verdicts › span.value "246,1"
- sorting › span.value "912"
- sorting › span.value "781"
- sorting › span.value "887"
- sorting › span.value "846"
- format › span.value "98 %"
- format › span.value "96 %"
- format › span.value "92 %"

**Visible focus** (7)

- four-verdicts › button.sortButton "Press"
- four-verdicts › button.sortButton "Pressure (bar)"
- sorting › button.sortButton "Furnace"
- sorting › button.sortButton "Temperature (°C)"
- format › button.sortButton "Batch"
- format › button.sortButton "Good parts"
- format › button.sortButton "Yield"

## 07

### charts › benchmark

**Own type** (4)

- benchmark › dt "Points"
- benchmark › dt "Materialisation"
- benchmark › dt "Series draw"
- benchmark › dt "FPS (hover)"

**Visible focus** (5)

- benchmark › button "1,000 points"
- benchmark › button "100,000 points"
- benchmark › button "1,000,000 points"
- benchmark › button "Live"
- benchmark › button "Mixed"

### charts › chart

**Visible focus** (1)

- sizes › button "Collapse"
