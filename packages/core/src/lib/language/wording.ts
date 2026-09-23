/* What the library says - in exactly one place.

   Not a translation call but a register: every entry is named after what it
   labels, not after what it says. The difference is practical. A `t("clear.
   input")` asks its caller to know a key that nothing checks, and hands back
   the key itself when it is wrong. A field on a type asks nothing: whoever
   leaves it out gets the default, and whoever mistypes it gets a type error.

   English is the default and is what every component renders without a
   provider. German is shipped too, as `GERMAN_WORDING` behind the subpath
   `@umriss-ui/core/wording/de` - freight a caller takes on purpose. Both are
   typed `Wording`, so an entry added below and forgotten in either is a compile
   error rather than a missing label on a screen; what no type can catch is two
   texts drifting apart in meaning, and that is accepted as the price of
   shipping two (ADR-0019). An application overrides single entries, or hands in
   a whole object; selecting a language is not something this library does.

   Parameterised entries are functions. They carry the sentence structure a
   language happens to have - "43 of 1.204", "3 days selected" - and can
   therefore be translated without a component gluing strings together.

   The numbers and dates inside those sentences come from the FORMATS, which are
   a register of their own and still write `de-DE`. An English wording over
   German notation is visible and deliberate; see ADR-0019. */

/** Everything the library puts out as text. */
export interface Wording {
  /* -------- Inputs ------------------------------------------------ */
  /** The cross in the text field. */
  clearInput: string;
  /** The cross in the select and in the combobox. */
  clearSelection: string;
  /** Stepper buttons of the number field. */
  decreaseValue: string;
  increaseValue: string;

  /* -------- Combobox and multi-select ----------------------------- */
  comboboxPlaceholder: string;
  /** Empty state of both lists. */
  noMatches: string;
  multiSelectPlaceholder: string;
  multiSelectSearchPlaceholder: string;
  searchOptions: string;
  /** Group name of the option list. */
  options: string;
  /** Group name of the scope switch. */
  optionScope: string;
  optionScopeAll: string;
  /** The second scope, with the count in the text. */
  optionScopeSelected: (count: number) => string;
  selectAll: string;
  selectNone: string;
  invertSelection: string;
  nothingSelected: string;
  /** The cross on a selected value in the trigger. */
  removeSelectedValue: (beschriftung: string) => string;
  /** The "+N" counter in the trigger. */
  manageMoreSelected: (count: number) => string;
  /** The summary in the panel: "3 / 12". The sentence structure belongs to the
      language, even where it is only a slash here. */
  multiSelectSummary: (gewaehlt: number, total: number) => string;

  /* -------- Command palette --------------------------------------- */
  /* Entries of its own, not the combobox's. `noMatches` belongs there: the
     window here finds FINDS, and the glossary rule (CONTEXT.md, "Finding")
     keeps that word apart from the charts' HIT, which is what hit-testing
     returns. Two meanings, one grep - exactly the case a register like this
     exists to prevent. */
  /** What stands in the empty field. */
  palettePlaceholder: string;
  /** Accessible name of the field. Deliberately kept apart from the
      placeholder - whoever labels the field differently does not thereby
      rename the window. */
  paletteField: string;
  /** Accessible name of the window. */
  palettePanel: string;
  /** Accessible name of the list of finds. */
  paletteList: string;
  /** The one line when the query finds nothing. */
  paletteNoFinds: string;
  /** What the screen reader hears when the number of finds changes. */
  paletteFindCount: (count: number) => string;
  /** The three key hints in the footer, each the text beside the key. */
  paletteHintMove: string;
  paletteHintChoose: string;
  paletteHintClose: string;
  /** The legend on the Escape key. The arrows and the return key are glyphs and
      therefore do not stand here; "Esc" is a word and is called something else
      elsewhere. */
  paletteKeyEsc: string;

  /* -------- Dock -------------------------------------------------- */
  /* The terms stand in the glossary under "Reaching for a tool" (CONTEXT.md).
     "Werkzeugleiste", "Leiste" and "Symbolleiste" are expressly on the avoid
     list there - a dock is not a bar in the flow but something that lies over
     its host and moves. */
  /** Accessible name of a dock's tools. */
  dockTools: string;
  /** Accessible name of the grip - it says what it does, not what it is. */
  dockGrip: string;
  /** The four resting places, named. The keys are the `Place` type's, and a
      register translates them: the German one answers "oben" where the
      English one answers "top". */
  dockPlace: (place: "top" | "right" | "bottom" | "left") => string;
  /** What the screen reader hears once the dock has taken a place. */
  dockPlaced: (place: string) => string;
  /** And what it hears when a place has refused. A refusal is not a fault: a
      wide, flat host with no room for a standing dock is not a mistake anyone
      made. */
  dockNoPlace: (place: string) => string;

  /* -------- Date and time ----------------------------------------- */
  datePlaceholder: string;
  /** Accessible name of the panel. Deliberately kept apart from the
      placeholder: whoever labels the field differently does not thereby rename
      the dialog. */
  datePanel: string;
  dateClear: string;
  dateTimePlaceholder: string;
  dateTimePanel: string;
  dateTimeClear: string;
  dateRangePlaceholder: string;
  dateRangePanel: string;
  dateRangeClear: string;
  /** Accessible name of the panel in the range with time of day. */
  dateTimeRangePanel: string;
  /** The clearing x of the range with time - kept apart from the range without,
      so that an application can call the two differently. */
  dateTimeRangeClear: string;
  previousMonth: string;
  nextMonth: string;
  /** Group name of the preset column. */
  quickSelect: string;
  today: string;
  now: string;
  clear: string;
  apply: string;
  allDay: string;
  timeOfDay: string;
  hour: string;
  minute: string;
  second: string;
  /** Header of the two time columns in the range with time of day. */
  sideFrom: string;
  sideTo: string;
  /** Accessible name of the time fields, per side. */
  startHour: string;
  startMinute: string;
  startSecond: string;
  endHour: string;
  endMinute: string;
  endSecond: string;
  /** Stepper buttons of a time field; the label comes from above. */
  timeFieldIncrease: (feld: string) => string;
  timeFieldDecrease: (feld: string) => string;
  /** Footer of the range panels. */
  chooseStartDate: string;
  chooseEndDate: string;
  /** "3 days" or "1 day" - the plural belongs to the language. */
  days: (count: number) => string;
  /** "3 days selected" */
  daysSelected: (count: number) => string;
  /** "17.03. – 19.03. · 3 days" while dragging; the dates come from the
      formats. */
  rangePreview: (from: string, to: string, count: number) => string;
  /** "3 days (all day)" */
  daysAllDay: (count: number) => string;
  /** "Duration: 1 day 2 hrs 30 min" */
  duration: (teile: readonly string[]) => string;
  hoursShort: (count: number) => string;
  minutesShort: (count: number) => string;
  /** Daylight-saving change: the hour that does not exist. */
  timeMissingHint: (timeOfDay: string) => string;
  /** The same, with the side put in front ("From"/"To"). */
  timeMissingHintSide: (side: string, timeOfDay: string) => string;
  /** Daylight-saving change: the hour that occurs twice. */
  timeAmbiguousHint: string;
  timeAmbiguousHintSide: (side: string) => string;
  timeEarlier: (versatz: string) => string;
  timeLater: (versatz: string) => string;
  /** The calendar's weekday headers, starting at Monday. */
  weekdays: readonly string[];
  /** The quick-select ranges, in the order of PRESET_LABELS. */
  presets: {
    today: string;
    yesterday: string;
    last7Days: string;
    last30Days: string;
    thisMonth: string;
    previousMonth: string;
    thisQuarter: string;
    thisYear: string;
  };

  /* -------- Table ------------------------------------------------- */
  /* The table's older entries, which moved with it to @umriss-ui/table
     (umriss-table 14); it goes on reading them from here. */
  pagination: string;
  rows: string;
  rowsPerPage: string;
  /** "Page 2 of 7" */
  pageOfPages: (page: number, total: number) => string;
  previousPage: string;
  nextPage: string;
  /** The two buttons in the column filter's footer. */
  filterReset: string;
  filterDone: string;

  /* -------- @umriss-ui/table --------------------------------------- */
  /* These entries belong to the table in @umriss-ui/table. They stand here and
     not in a register of that package, so that one provider switches both
     packages with ONE value - overriding a wording stays a single act
     (umriss-table 04). */
  /** The column menu's button. */
  columns: string;
  /** Accessible name of the list in the column menu. */
  arrangeColumns: string;
  /** The two buttons that move a column in the column menu. */
  columnForward: (column: string) => string;
  columnBackward: (column: string) => string;
  /** The export button. */
  exportLabel: string;
  /** The export's file name, where the application names none. */
  exportFileName: string;
  /** Placeholder and accessible name of the search field. */
  tableSearchPlaceholder: string;
  tableSearchLabel: string;
  /** The filter button of a column: "Filter Line". */
  filterColumn: (column: string) => string;
  /** The selection of one row, named after its row header. */
  selectRow: (row: string) => string;
  /** The selection of every row in the filtered set. */
  selectAllRows: string;
  /** The expand button, named after the row header. */
  expandRowNamed: (row: string) => string;
  collapseRowNamed: (row: string) => string;
  /** Header of the actions column - for the screen reader, not visible. */
  rowActions: string;
  /** One action on a row: "Open: A-2041". */
  rowAction: (aktion: string, row: string) => string;
  /** The menu holding a row's actions. */
  rowActionsMenu: (row: string) => string;
  /** What the screen reader hears for an absent value. Visibly a muted dash
      stands there. */
  cellAbsentValue: string;
  /** A boolean without a presentation of its own. */
  booleanYes: string;
  booleanNo: string;
  /** The kind of a footer number, read out before the number. */
  footerSum: string;
  footerAverage: string;
  /** "128 entries" in the pagination bar; the plural belongs to the language. */
  entries: (count: number, formatted: string) => string;
  /** "3 selected" in the pagination bar and the table toolbar. */
  selectedCount: (count: number, formatted: string) => string;
  /** Empty because there are no rows. */
  noEntries: string;
  /** Empty because search and filters leave nothing - something else. */
  nothingMatchesFilters: string;

  /* Tree */
  treeSearchPlaceholder: string;
  treeNoMatches: string;
  /** Group name of the conditions in the table toolbar. */
  conditions: string;
  /** The button that removes a condition: "Remove Line: Line 1, Line 2". */
  removeConditionNamed: (label: string, value: string) => string;
  /** The condition itself, which opens its filter: "Edit Line: Line 1, Line 2". */
  editConditionNamed: (label: string, value: string) => string;
  /** The remainder of a long list in a condition: "+1". */
  moreValues: (count: number, formatted: string) => string;
  /** The two fields of the range filter. */
  filterFrom: string;
  filterTo: string;
  /** The condition of a range filter: "100–500", "from 100", "to 500". */
  rangeFromTo: (from: string, to: string) => string;
  rangeFrom: (from: string) => string;
  rangeTo: (to: string) => string;
  /** When "From" lies behind "To". The condition stays the last valid one. */
  rangeInvalid: string;
  /** Clears search and conditions - in the table toolbar and in the empty body. */
  resetAll: string;
  /** "43 of 1.204" - the numbers come from the formats. */
  filteredOfTotal: (matches: string, total: string) => string;

  /* -------- Stat, verdict, freshness ------------------------------ */
  /** The four outcomes of an assessment, as a word beside the value. Colour
      alone carries no meaning - the word stands here for that reason. */
  verdictOk: string;
  verdictWarning: string;
  verdictAlarm: string;
  verdictUnknown: string;
  /** What stands in the value field when there is no value. No dash, no zero:
      either could be a value. */
  statAbsentValue: string;
  target: string;
  /** "3,2 above target" or "1,5 below target" - the amount comes from the
      formats, which is where the comma is from. */
  deviationAbove: (betrag: string) => string;
  deviationBelow: (betrag: string) => string;
  deviationOnTarget: string;
  /** The three freshness states. They are a DIFFERENT axis from the verdict: a
      stale value keeps its verdict (ADR-0010). */
  freshnessFresh: string;
  freshnessStale: string;
  freshnessDisconnected: string;
  /** "As of: 3 minutes ago", where the duration comes from the formats. */
  asOfAgo: (duration: string) => string;
  asOfUnknown: string;

  /* -------- Alarm list -------------------------------------------- */
  alarms: string;
  noAlarms: string;
  /** Empty, but the line is down - that is something other than quiet. */
  noAlarmsDisconnected: string;
  acknowledgeAlarm: string;
  /** Bulk acknowledgement; the number stands in the text on purpose. */
  acknowledgeAlarms: (count: number) => string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  /** The four lifecycle states, written out. */
  lifecycleStandingUnacknowledged: string;
  lifecycleStandingAcknowledged: string;
  lifecycleClearedUnacknowledged: string;
  lifecycleClearedAcknowledged: string;
  /** "Alarm flood: 12 in quick succession" - a flood is marked, never
      suppressed. */
  floodHint: (count: number) => string;
  /** "40×" on a chattering alarm type. */
  chatterHint: (count: number) => string;
  /** The text of the live region: the number of standing unacknowledged alarms. */
  standingUnacknowledged: (count: number) => string;
  columnAlarm: string;
  columnLifecycleState: string;
  columnPriority: string;
  columnRaised: string;
  columnDuration: string;
  columnFrequency: string;
  /** The two columns of the alarm model the list does not show, but which do
      land in the column menu and the CSV header (`alarmColumns`). */
  columnAcknowledgement: string;
  columnAge: string;

  /* -------- Overlays and states ----------------------------------- */
  close: string;
  closeToast: string;
  confirm: string;
  cancel: string;
  loading: string;
  /** Generic name of a fill-level bar, where the caller names none. */
  fillLevel: string;
  show: string;
  hide: string;
  moreActions: string;
  /** The cross on a tag without text content. */
  remove: string;
  /** The cross on a tag with text content. */
  removeTag: (beschriftung: string) => string;

  /* -------- @umriss-ui/schedule ------------------------------------ */
  /* The schedule's entries stand here for the table's reason: one provider
     switches every package with one value (schedule 06). */
  /** The two findings, named on the ghost of a drag. */
  scheduleOverlap: string;
  scheduleLateTransport: string;
  /** The new times on the ghost: "08:15–10:00" - the times come from the
      formats. */
  scheduleGhostTimes: (from: string, to: string) => string;
  /** The parts of a subtask and a transport, named in the tooltip. */
  scheduleSetup: string;
  scheduleTeardown: string;
  scheduleTransport: string;
  /** "A-2041-1 → A-2041-2": where a transport goes. */
  scheduleRoute: (from: string, to: string) => string;
  /** "Overlap with A-2043-2" - the other subtask on the lane. */
  scheduleOverlapWith: (other: string) => string;
  /** "Late transport, 15 min short" - the amount from `minutesShort`. */
  scheduleLateBy: (amount: string) => string;
  /** On the ghost of a drag over a lane the subtask may not go to. */
  scheduleLaneRefused: string;
  /** The chevron of a lane group's header, which folds it into one row and
      unfolds it again. The group's own label stands beside the button, so the
      name is what the ACTION is, not which group it acts on. */
  scheduleFoldGroup: string;
  scheduleUnfoldGroup: string;
  /** How many lanes a group holds, beside its name in the header. */
  scheduleLaneCount: (count: number) => string;

  /* -------- @umriss-ui/calculation --------------------------------- */
  /* The calculation's entries stand here for the table's reason: one provider
     switches every package with one value. */
  /** The four operators as symbols in a formula line. */
  calculationSumSymbol: string;
  calculationDifferenceSymbol: string;
  calculationProductSymbol: string;
  calculationQuotientSymbol: string;
  /** The same four as words, in the accessible sentence of a line. */
  calculationSumWord: string;
  calculationDifferenceWord: string;
  calculationProductWord: string;
  calculationQuotientWord: string;
  /** Between the parts of the sentence: "Availability equals ...". */
  calculationEquals: string;
  /** Before a result marked "≈" in the sentence. */
  calculationApproximately: string;
  /** Beside a result marked "≈": why the rounded operands do not give it. */
  calculationApproximateNote: string;
  /** How a percentage is read out: "91.6 percent". */
  calculationPercent: string;
  /** Why a quantity has no number - the label is the given at the root of it,
      or the divisor that is zero. */
  calculationMissing: (label: string) => string;
  calculationDivisionByZero: (label: string) => string;
  /** The target beside the result, with the target's number and unit. */
  calculationAboveTarget: (target: string) => string;
  calculationBelowTarget: (target: string) => string;
  calculationOnTarget: (target: string) => string;
  /** The quiet marker on a folded quantity whose derivation holds a worse
      verdict than its own; the verdict word comes from `verdict*`. */
  calculationWorstInside: (verdict: string) => string;
  /** Where a given number came from. */
  calculationSource: (source: string) => string;
  /** The disclosure button of a derivation, named after the quantity. */
  calculationShowDerivation: (label: string) => string;
  calculationHideDerivation: (label: string) => string;
}

/** The instance shipped by default. English; German is `GERMAN_WORDING` in
    `@umriss-ui/core/wording/de` (ADR-0019). */
export const DEFAULT_WORDING: Wording = {
  clearInput: "Clear input",
  clearSelection: "Clear selection",
  decreaseValue: "Decrease value",
  increaseValue: "Increase value",

  comboboxPlaceholder: "Search or select",
  noMatches: "No matches",
  multiSelectPlaceholder: "Select",
  multiSelectSearchPlaceholder: "Search",
  searchOptions: "Search options",
  options: "Options",
  optionScope: "View",
  optionScopeAll: "All",
  optionScopeSelected: (count) => `Selected (${count})`,
  selectAll: "All",
  selectNone: "None",
  invertSelection: "Invert",
  nothingSelected: "Nothing selected",
  removeSelectedValue: (beschriftung) => `Remove ${beschriftung}`,
  manageMoreSelected: (count) => `Manage all ${count} selected`,
  multiSelectSummary: (gewaehlt, total) => `${gewaehlt} / ${total}`,

  palettePlaceholder: "Search …",
  paletteField: "Search",
  palettePanel: "Command palette",
  paletteList: "Finds",
  paletteNoFinds: "Nothing found",
  paletteFindCount: (count) => (count === 1 ? "1 find" : `${count} finds`),
  paletteHintMove: "select",
  paletteHintChoose: "open",
  paletteHintClose: "close",
  paletteKeyEsc: "Esc",

  dockTools: "Tools",
  dockGrip: "Move dock",
  dockPlace: (place) => ({ top: "top", right: "right", bottom: "bottom", left: "left" })[place],
  dockPlaced: (place) => `Dock at the ${place}`,
  dockNoPlace: (place) => `No room for the dock on the ${place}`,

  datePlaceholder: "Select date",
  datePanel: "Select date",
  dateClear: "Clear date",
  dateTimePlaceholder: "Select date and time",
  dateTimePanel: "Select date and time",
  dateTimeClear: "Clear date and time",
  dateRangePlaceholder: "Select range",
  dateRangePanel: "Select range",
  dateRangeClear: "Clear range",
  dateTimeRangePanel: "Select range with time",
  dateTimeRangeClear: "Clear range with time",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  quickSelect: "Quick select",
  today: "Today",
  now: "Now",
  clear: "Clear",
  apply: "Apply",
  allDay: "All day",
  timeOfDay: "Time",
  hour: "Hour",
  minute: "Minute",
  second: "Second",
  sideFrom: "From",
  sideTo: "To",
  startHour: "Start hour",
  startMinute: "Start minute",
  startSecond: "Start second",
  endHour: "End hour",
  endMinute: "End minute",
  endSecond: "End second",
  timeFieldIncrease: (feld) => `Increase ${feld}`,
  timeFieldDecrease: (feld) => `Decrease ${feld}`,
  chooseStartDate: "Select start date",
  chooseEndDate: "Select end date – backwards is allowed",
  days: (count) => `${count} ${count === 1 ? "day" : "days"}`,
  daysSelected: (count) => `${count} ${count === 1 ? "day" : "days"} selected`,
  /* A thin space around the middle dot (U+2009), as in the rest of the
     library: the separator should touch the two halves without pushing them
     together. */
  rangePreview: (from, to, count) =>
    `${from} – ${to} · ${count} ${count === 1 ? "day" : "days"}`,
  daysAllDay: (count) => `${count} ${count === 1 ? "day" : "days"} (all day)`,
  duration: (teile) => `Duration: ${teile.join(" ")}`,
  hoursShort: (count) => `${count} hrs`,
  minutesShort: (count) => `${count} min`,
  timeMissingHint: (timeOfDay) =>
    `This time does not exist on this day (start of daylight saving time). ${timeOfDay} is used instead.`,
  timeMissingHintSide: (side, timeOfDay) =>
    `${side}: This time does not exist on this day (start of daylight saving time). ${timeOfDay} is used instead.`,
  timeAmbiguousHint: "This time occurs twice on this day (end of daylight saving time):",
  timeAmbiguousHintSide: (side) =>
    `${side}: This time occurs twice on this day (end of daylight saving time):`,
  timeEarlier: (versatz) => `Earlier (${versatz})`,
  timeLater: (versatz) => `Later (${versatz})`,
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  presets: {
    today: "Today",
    yesterday: "Yesterday",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    thisMonth: "This month",
    previousMonth: "Previous month",
    thisQuarter: "This quarter",
    thisYear: "This year",
  },

  pagination: "Pagination",
  rows: "Rows",
  rowsPerPage: "Rows per page",
  pageOfPages: (page, total) => `Page ${page} of ${total}`,
  previousPage: "Back",
  nextPage: "Next",
  filterReset: "Reset",
  filterDone: "Done",

  columns: "Columns",
  arrangeColumns: "Show, hide and arrange columns",
  columnForward: (column) => `Move ${column} forward`,
  columnBackward: (column) => `Move ${column} backward`,
  exportLabel: "Export",
  exportFileName: "table.csv",
  tableSearchPlaceholder: "Search …",
  tableSearchLabel: "Search table",
  filterColumn: (column) => `Filter ${column}`,
  selectRow: (row) => `Select ${row}`,
  selectAllRows: "Select all",
  expandRowNamed: (row) => `Expand ${row}`,
  collapseRowNamed: (row) => `Collapse ${row}`,
  rowActions: "Actions",
  rowAction: (aktion, row) => `${aktion}: ${row}`,
  rowActionsMenu: (row) => `Actions: ${row}`,
  cellAbsentValue: "No value",
  booleanYes: "Yes",
  booleanNo: "No",
  footerSum: "Sum",
  footerAverage: "Average",
  entries: (count, formatted) => (count === 1 ? "1 entry" : `${formatted} entries`),
  selectedCount: (_count, formatted) => `${formatted} selected`,
  noEntries: "No entries",
  nothingMatchesFilters: "Nothing matches the search and filters",

  treeSearchPlaceholder: "Search the tree …",
  treeNoMatches: "Nothing matches the search.",
  conditions: "Active filters",
  removeConditionNamed: (label, value) => `Remove ${label}: ${value}`,
  editConditionNamed: (label, value) => `Edit ${label}: ${value}`,
  moreValues: (_count, formatted) => `+${formatted}`,
  filterFrom: "From",
  filterTo: "To",
  rangeFromTo: (from, to) => `${from}–${to}`,
  rangeFrom: (from) => `from ${from}`,
  rangeTo: (to) => `to ${to}`,
  rangeInvalid: "“From” lies after “To”.",
  resetAll: "Reset",
  filteredOfTotal: (matches, total) => `${matches} of ${total}`,

  verdictOk: "OK",
  verdictWarning: "Warning limit exceeded",
  verdictAlarm: "Alarm limit exceeded",
  verdictUnknown: "No value",
  statAbsentValue: "—",
  target: "Target",
  deviationAbove: (betrag) => `${betrag} above target`,
  deviationBelow: (betrag) => `${betrag} below target`,
  deviationOnTarget: "on target",
  freshnessFresh: "Fresh",
  freshnessStale: "Stale",
  freshnessDisconnected: "No connection",
  asOfAgo: (dauer) => `As of: ${dauer}`,
  asOfUnknown: "As-of time unknown",

  alarms: "Alarms",
  noAlarms: "No alarms",
  noAlarmsDisconnected: "No alarms – the connection is down",
  acknowledgeAlarm: "Acknowledge",
  acknowledgeAlarms: (count) =>
    count === 1 ? "Acknowledge 1 alarm" : `Acknowledge ${count} alarms`,
  priorityHigh: "High",
  priorityMedium: "Medium",
  priorityLow: "Low",
  lifecycleStandingUnacknowledged: "Standing, unacknowledged",
  lifecycleStandingAcknowledged: "Standing, acknowledged",
  lifecycleClearedUnacknowledged: "Cleared, unacknowledged",
  lifecycleClearedAcknowledged: "Cleared, acknowledged",
  floodHint: (count) => `Alarm flood: ${count} in quick succession`,
  chatterHint: (count) => `${count}×`,
  standingUnacknowledged: (count) =>
    count === 1
      ? "1 standing alarm, unacknowledged"
      : `${count} standing alarms, unacknowledged`,
  columnAlarm: "Alarm",
  columnLifecycleState: "State",
  columnPriority: "Priority",
  columnRaised: "Raised",
  columnDuration: "Duration",
  columnFrequency: "Frequency",
  columnAcknowledgement: "Acknowledgement",
  columnAge: "Age",

  close: "Close",
  closeToast: "Close message",
  confirm: "Confirm",
  cancel: "Cancel",
  loading: "Loading",
  fillLevel: "Fill level",
  show: "Show",
  hide: "Hide",
  moreActions: "More actions",
  remove: "Remove",
  removeTag: (beschriftung) => `Remove ${beschriftung}`,
  scheduleOverlap: "Overlap",
  scheduleLateTransport: "Late transport",
  scheduleGhostTimes: (from, to) => `${from}–${to}`,
  scheduleSetup: "Setup",
  scheduleTeardown: "Teardown",
  scheduleTransport: "Transport",
  scheduleRoute: (from, to) => `${from} → ${to}`,
  scheduleOverlapWith: (other) => `Overlap with ${other}`,
  scheduleLateBy: (amount) => `Late transport, ${amount} short`,
  scheduleLaneRefused: "Not this lane",
  scheduleFoldGroup: "Fold group",
  scheduleUnfoldGroup: "Unfold group",
  scheduleLaneCount: (count) => (count === 1 ? "1 lane" : `${count} lanes`),
  calculationSumSymbol: "+",
  calculationDifferenceSymbol: "−",
  calculationProductSymbol: "×",
  calculationQuotientSymbol: "÷",
  calculationSumWord: "plus",
  calculationDifferenceWord: "minus",
  calculationProductWord: "times",
  calculationQuotientWord: "divided by",
  calculationEquals: "equals",
  calculationApproximately: "approximately",
  calculationApproximateNote: "The rounded figures do not give this exactly; it is computed from the unrounded ones.",
  calculationPercent: "percent",
  calculationMissing: (label) => `${label} is missing`,
  calculationDivisionByZero: (label) => `Division by zero: ${label} is 0`,
  calculationAboveTarget: (target) => `above target ${target}`,
  calculationBelowTarget: (target) => `below target ${target}`,
  calculationOnTarget: (target) => `on target ${target}`,
  calculationWorstInside: (verdict) => `Inside: ${verdict}`,
  calculationSource: (source) => `Source: ${source}`,
  calculationShowDerivation: (label) => `Show how ${label} is derived`,
  calculationHideDerivation: (label) => `Hide how ${label} is derived`,
};
