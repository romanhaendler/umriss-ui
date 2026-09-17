/* The German wording, shipped as `@umriss-ui/core/wording/de`.

   It was the default until the library moved to an English scope, and it is
   kept because it was already written and already reviewed: throwing away a
   finished language to publish one is a loss nobody asked for. It is no longer
   the default, and it is deliberately not exported from the main entry. A
   subpath says without explanation that this is freight you take on purpose —
   an application that never imports it never pays for it, and one that does has
   written the language it wants into an import line (ADR-0019).

   Typed `Wording`, like the English default. That is the whole conformance
   mechanism: an entry added to the interface and forgotten here is a compile
   error before it can become a missing label on a screen. What no type and no
   test can catch is drift — a German entry that has come to say something other
   than its English counterpart — and that is accepted as the price of shipping
   two.

   Use it whole, or entry by entry:

       import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

       <UmrissProvider language={{ wording: GERMAN_WORDING }}>

   The texts below are unchanged from when they were the default, down to the
   thin spaces. */

import type { Wording } from "./wording";

/** The German instance. Complete, because it is typed `Wording`. */
export const GERMAN_WORDING: Wording = {
  clearInput: "Eingabe leeren",
  clearSelection: "Auswahl leeren",
  decreaseValue: "Wert verringern",
  increaseValue: "Wert erhöhen",

  comboboxPlaceholder: "Suchen oder wählen",
  noMatches: "Keine Treffer",
  multiSelectPlaceholder: "Auswählen",
  multiSelectSearchPlaceholder: "Suchen",
  searchOptions: "Optionen durchsuchen",
  options: "Optionen",
  optionScope: "Ansicht",
  optionScopeAll: "Alle",
  optionScopeSelected: (count) => `Gewählte (${count})`,
  selectAll: "Alle",
  selectNone: "Keine",
  invertSelection: "Umkehren",
  nothingSelected: "Nichts ausgewählt",
  removeSelectedValue: (beschriftung) => `${beschriftung} entfernen`,
  manageMoreSelected: (count) => `Alle ${count} Gewählten verwalten`,
  multiSelectSummary: (gewaehlt, total) => `${gewaehlt} / ${total}`,

  palettePlaceholder: "Suchen …",
  paletteField: "Suchen",
  palettePanel: "Befehlspalette",
  paletteList: "Funde",
  paletteNoFinds: "Nichts gefunden",
  paletteFindCount: (count) => (count === 1 ? "1 Fund" : `${count} Funde`),
  paletteHintMove: "wählen",
  paletteHintChoose: "öffnen",
  paletteHintClose: "schließen",
  paletteKeyEsc: "Esc",

  dockTools: "Werkzeuge",
  dockGrip: "Dock verschieben",
  dockPlace: (place) => ({ top: "oben", right: "rechts", bottom: "unten", left: "links" })[place],
  dockPlaced: (place) => `Dock ${place}`,
  dockNoPlace: (place) => `Für das Dock ist ${place} kein Platz`,

  datePlaceholder: "Datum wählen",
  datePanel: "Datum wählen",
  dateClear: "Datum leeren",
  dateTimePlaceholder: "Datum und Zeit wählen",
  dateTimePanel: "Datum und Zeit wählen",
  dateTimeClear: "Datum und Zeit leeren",
  dateRangePlaceholder: "Zeitraum wählen",
  dateRangePanel: "Zeitraum wählen",
  dateRangeClear: "Zeitraum leeren",
  dateTimeRangePanel: "Zeitraum mit Uhrzeit wählen",
  dateTimeRangeClear: "Zeitraum mit Uhrzeit leeren",
  previousMonth: "Voriger Monat",
  nextMonth: "Nächster Monat",
  quickSelect: "Schnellwahl",
  today: "Heute",
  now: "Jetzt",
  clear: "Leeren",
  apply: "Übernehmen",
  allDay: "Ganztägig",
  timeOfDay: "Uhrzeit",
  hour: "Stunde",
  minute: "Minute",
  second: "Sekunde",
  sideFrom: "Von",
  sideTo: "Bis",
  startHour: "Startstunde",
  startMinute: "Startminute",
  startSecond: "Startsekunde",
  endHour: "Endstunde",
  endMinute: "Endminute",
  endSecond: "Endsekunde",
  timeFieldIncrease: (feld) => `${feld} erhöhen`,
  timeFieldDecrease: (feld) => `${feld} verringern`,
  chooseStartDate: "Startdatum wählen",
  chooseEndDate: "Enddatum wählen – rückwärts ist erlaubt",
  days: (count) => `${count} ${count === 1 ? "Tag" : "Tage"}`,
  daysSelected: (count) => `${count} ${count === 1 ? "Tag" : "Tage"} gewählt`,
  /* A thin space around the middle dot (U+2009), as in the rest of the
     library: the separator should touch the two halves without pushing them
     together. */
  rangePreview: (from, to, count) =>
    `${from} – ${to}\u2009·\u2009${count} ${count === 1 ? "Tag" : "Tage"}`,
  daysAllDay: (count) => `${count} ${count === 1 ? "Tag" : "Tage"} (ganztägig)`,
  duration: (teile) => `Dauer: ${teile.join(" ")}`,
  hoursShort: (count) => `${count} Std`,
  minutesShort: (count) => `${count} Min`,
  timeMissingHint: (timeOfDay) =>
    `Diese Uhrzeit existiert an diesem Tag nicht (Beginn der Sommerzeit). Es wird ${timeOfDay} Uhr verwendet.`,
  timeMissingHintSide: (side, timeOfDay) =>
    `${side}: Diese Uhrzeit existiert an diesem Tag nicht (Beginn der Sommerzeit). Es wird ${timeOfDay} Uhr verwendet.`,
  timeAmbiguousHint: "Diese Uhrzeit kommt an diesem Tag zweimal vor (Ende der Sommerzeit):",
  timeAmbiguousHintSide: (side) =>
    `${side}: Diese Uhrzeit kommt an diesem Tag zweimal vor (Ende der Sommerzeit):`,
  timeEarlier: (versatz) => `Frühere (${versatz})`,
  timeLater: (versatz) => `Spätere (${versatz})`,
  weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  presets: {
    today: "Heute",
    yesterday: "Gestern",
    last7Days: "Letzte 7 Tage",
    last30Days: "Letzte 30 Tage",
    thisMonth: "Dieser Monat",
    previousMonth: "Voriger Monat",
    thisQuarter: "Dieses Quartal",
    thisYear: "Dieses Jahr",
  },

  pagination: "Seitennavigation",
  rows: "Zeilen",
  rowsPerPage: "Zeilen pro Seite",
  pageOfPages: (page, total) => `Seite ${page} von ${total}`,
  previousPage: "Zurück",
  nextPage: "Weiter",
  filterReset: "Zurücksetzen",
  filterDone: "Fertig",

  columns: "Spalten",
  arrangeColumns: "Spalten ein- und ausblenden, anordnen",
  columnForward: (column) => `${column} nach vorn`,
  columnBackward: (column) => `${column} nach hinten`,
  exportLabel: "Exportieren",
  exportFileName: "tabelle.csv",
  tableSearchPlaceholder: "Suchen …",
  tableSearchLabel: "Tabelle durchsuchen",
  filterColumn: (column) => `${column} filtern`,
  selectRow: (row) => `${row} auswählen`,
  selectAllRows: "Alle auswählen",
  expandRowNamed: (row) => `${row} aufklappen`,
  collapseRowNamed: (row) => `${row} zuklappen`,
  rowActions: "Aktionen",
  rowAction: (aktion, row) => `${aktion}: ${row}`,
  rowActionsMenu: (row) => `Aktionen: ${row}`,
  cellAbsentValue: "Kein Wert",
  booleanYes: "Ja",
  booleanNo: "Nein",
  footerSum: "Summe",
  footerAverage: "Durchschnitt",
  entries: (count, formatted) => (count === 1 ? "1 Eintrag" : `${formatted} Einträge`),
  selectedCount: (_count, formatted) => `${formatted} ausgewählt`,
  noEntries: "Keine Einträge",
  nothingMatchesFilters: "Nichts passt zu Suche und Filtern",

  treeSearchPlaceholder: "Im Baum suchen …",
  treeNoMatches: "Nichts passt zur Suche.",
  conditions: "Aktive Filter",
  removeConditionNamed: (label, wert) => `${label}: ${wert} entfernen`,
  editConditionNamed: (label, wert) => `${label}: ${wert} bearbeiten`,
  moreValues: (_count, formatted) => `+${formatted}`,
  filterFrom: "Von",
  filterTo: "Bis",
  rangeFromTo: (from, to) => `${from}–${to}`,
  rangeFrom: (from) => `ab ${from}`,
  rangeTo: (to) => `bis ${to}`,
  rangeInvalid: "„Von“ liegt hinter „Bis“.",
  resetAll: "Zurücksetzen",
  filteredOfTotal: (matches, total) => `${matches} von ${total}`,

  verdictOk: "In Ordnung",
  verdictWarning: "Warngrenze überschritten",
  verdictAlarm: "Alarmgrenze überschritten",
  verdictUnknown: "Kein Wert",
  statAbsentValue: "—",
  target: "Ziel",
  deviationAbove: (betrag) => `${betrag} über Ziel`,
  deviationBelow: (betrag) => `${betrag} unter Ziel`,
  deviationOnTarget: "auf Ziel",
  freshnessFresh: "Aktuell",
  freshnessStale: "Veraltet",
  freshnessDisconnected: "Keine Verbindung",
  asOfAgo: (dauer) => `Stand: ${dauer}`,
  asOfUnknown: "Stand unbekannt",

  alarms: "Meldungen",
  noAlarms: "Keine Meldungen",
  noAlarmsDisconnected: "Keine Meldungen – die Verbindung steht nicht",
  acknowledgeAlarm: "Quittieren",
  acknowledgeAlarms: (count) =>
    count === 1 ? "1 Meldung quittieren" : `${count} Meldungen quittieren`,
  priorityHigh: "Hoch",
  priorityMedium: "Mittel",
  priorityLow: "Niedrig",
  lifecycleStandingUnacknowledged: "Anstehend, unquittiert",
  lifecycleStandingAcknowledged: "Anstehend, quittiert",
  lifecycleClearedUnacknowledged: "Gegangen, unquittiert",
  lifecycleClearedAcknowledged: "Gegangen, quittiert",
  floodHint: (count) => `Meldungsflut: ${count} in kurzer Folge`,
  chatterHint: (count) => `${count}×`,
  standingUnacknowledged: (count) =>
    count === 1
      ? "1 anstehende Meldung, unquittiert"
      : `${count} anstehende Meldungen, unquittiert`,
  columnAlarm: "Meldung",
  columnLifecycleState: "Zustand",
  columnPriority: "Priorität",
  columnRaised: "Gekommen",
  columnDuration: "Dauer",
  columnFrequency: "Häufigkeit",
  columnAcknowledgement: "Quittierung",
  columnAge: "Alter",

  close: "Schließen",
  closeToast: "Meldung schließen",
  confirm: "Bestätigen",
  cancel: "Abbrechen",
  loading: "Wird geladen",
  fillLevel: "Füllstand",
  show: "Einblenden",
  hide: "Ausblenden",
  moreActions: "Weitere Aktionen",
  remove: "Entfernen",
  removeTag: (beschriftung) => `${beschriftung} entfernen`,
  scheduleOverlap: "Überschneidung",
  scheduleLateTransport: "Transport verspätet",
  scheduleGhostTimes: (from, to) => `${from}–${to}`,
};
