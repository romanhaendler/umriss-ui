# Umriss UI – handoff for the next stage

**This is a historical record, not a description of the workspace as it is.** It
was written for the standalone `umriss-ui_12` state in August 2026 and handed the
library to whoever built it next. It used to lie at the top level of
`packages/core` as `HANDOFF.md`, where a new reader met it as current
documentation; it now stands in `docs/archive/`, and the move changed nothing
about it but its path. It is kept because six comments in the code
still cite it, and because its part A.5 is the only written source for several
conventions the components still obey.

Read it with this in mind:

* **Part A.1–A.4** describes the standalone package: the name `@umriss/ui`, the
  directory `umriss-ui/`, `npm` scripts, and a component roster that still lists
  `Table`, `Th` and `Td`. None of that holds. The workspace is four packages under
  `packages/`, the scope is `@umriss-ui/*`, the commands are `pnpm --filter
  @umriss-ui/core <script>`, and the table left for `@umriss-ui/table` with
  `umriss-table` 14. What describes the workspace now: `CLAUDE.md` for the layout,
  `packages/core/README.md` for the components, `CONTEXT.md` for the vocabulary,
  and ADR-0018 for the decision that everything is English.
* **Part A.5** is translated below, and its identifiers are corrected to the names
  they carry today, because live code points into it: `eslint.config.js` and
  `TimeField.tsx` cite §2, `Popover.tsx` and `popover.test.tsx` cite §1,
  `RangePanel.tsx` cites §5, `packages/core/docs/capabilities-tree.md` cites §7, and the table's `columnFilter.tsx`
  cites the two-click logic of §5. A rule an English codebase points at should not
  be readable only in German.
* **Parts B and C stay in German**, deliberately. Part B's fifteen work packages
  have been delivered or superseded — each by a later effort under `.scratch/`,
  which its own record documents — and part C's acceptance checklist has been
  replaced by `docs/testing.md`, which is executable rather than a list to walk through.
  Translating a superseded specification would make it read as current, which is
  the one thing it is not. The effort's spec records this decision.

The original's top commandment still applies to anyone working here, and is worth
having in English: **nothing that exists may get worse.** Every work package is
additive. Where an existing behaviour is to change, it says so expressly;
everything else stays exactly as it is. In case of doubt, do not change it —
record the question in the delivery report.

---

## Teil A – Das bestehende System

### A.1 Projekt und Werkzeugkette

- Paketname `@umriss/ui`, React ≥ 18 (Entwicklung mit React 19), TypeScript strict, Vite 6.
- Verzeichnis `umriss-ui/`: `src/components/<Name>/` mit jeweils `<Name>.tsx`, `<Name>.module.css`, `index.ts`. Öffentliche API ausschließlich über `src/index.ts` (`export * from "./components/<Name>"`).
- Styling: **CSS Modules**, keine Utility-Frameworks, keine Inline-Styles außer für berechnete Positionen (Popover `top/left`). Klassen werden mit `cx()` aus `src/lib/cx.ts` zusammengesetzt (`cx(a, bedingung && b)`).
- Design-Tokens in `src/styles/tokens.css` (siehe A.3), globale Basis in `src/styles/global.css`. Dark-Modus über `<html data-theme="dark">`.
- Demo als lebende Doku: `demo/Showcase.tsx`, `demo/demo.css`, `demo/main.tsx`. *(Stand Sep. 2026: die Demo ist Dokumentation – `demo/gliederung.ts`, `demo/beispiele/`, die Hülle in `@umriss/demo`; `Showcase.tsx` und `demo.css` gibt es nicht mehr.)* Start: `npm run dev`. Jede neue Komponente und jede neue Option bekommt in der Demo ein Beispiel.
- Prüfen vor Lieferung: `npm run typecheck` (muss ohne Fehler durchlaufen) und `npm run build:demo` (muss durchlaufen). Beides ist Pflicht.
- Sprache: **Code-Kommentare, Bezeichner interner Helfer, Demo-Texte und Doku auf Deutsch**; öffentliche Prop-Namen auf Englisch (`value`, `onChange`, `clearable`, `size`, `disabled`, `invalid`, `presets`). Bestehende deutsche interne Bezeichner (`waehle`, `uebernehmen`, `ansicht`, `aktiv`) beibehalten. Umlaute in CSS-Kommentaren wurden teils als ae/oe/ue geschrieben – beides ist akzeptiert, in TSX-Kommentaren echte Umlaute.
- Es gibt **keine Testinfrastruktur**. Datumsmathematik ist bisher mit kleinen Node-Skripten unter `TZ=Europe/Berlin` verifiziert worden. Für Arbeitspaket B.1 (Datums-Parsing) ist eine Test-Suite Pflicht (siehe dort).
- Ausdrücklich verboten (Entscheidungen des Auftraggebers): Verlaufs-Buttons, auffällige Animationen, „verspielte" Effekte, HKM- oder Stellenplan-Bezug irgendwo (Namen, Demo-Daten, Kommentare), Drawer-Komponente (verworfen), Dark als Standard.

### A.2 Gestaltungskonzept „Tinte & Papier"

Fast monochrom: Tinte `#171717` auf Papier `#fafafa`/`#ffffff`. Ein einziger Akzent (Petrol `#0e7d72`), **ausschließlich für Interaktives** (Fokus, gewählte Zustände, Links, Bänder). Semantikfarben gedeckt (success/warning/danger). Ränder sind **1-px-Schatten ohne Versatz** (`--u-edge`, `--u-edge-strong`), keine `border`-Eigenschaften an Steuerelementen. Ebenen entstehen über Schatten-Stacks (`--u-shadow-card`, `--u-shadow-overlay`). Zahlen laufen immer in **Geist Mono** mit `font-variant-numeric: tabular-nums`, Fließtext in Geist Sans. Bewegung erklärt Zustandswechsel und dekoriert nicht: `--u-transition` (120 ms) für Hover/Farbe, `--u-duration-fast` (140 ms) für Popover, `--u-duration-medium` (240 ms) für Overlays; alles läuft unter `prefers-reduced-motion` auf 0 ms (bereits in tokens.css). Vorbilder laut Auftraggeber: Vercel Geist (Präzision) und Attio („quiet sophistication").

Wiederkehrende Gesten, die neue Komponenten übernehmen müssen:

- **Stille Stepper**: Ghost-Tasten ohne Trennlinien, `opacity: 0.4` in Ruhe, `opacity: 1` bei Hover/Fokus der umgebenden Gruppe (nicht der einzelnen Taste), Hover-Pad `--u-color-surface-sunken`, Press-Feedback nur auf der Glyphe (`svg { transform: scale(0.8) }`), niemals auf der Tastenfläche. Gedrückt halten wiederholt (400 ms Anlauf, dann ×0,9 pro Schritt bis min. 40–60 ms), Werte immer aus einem `useRef`-Spiegel lesen.
- **Leeren-×**: bei Textfeldern sichtbar sobald Inhalt da ist; bei Feldern mit rechtem Icon (Picker, Select) unsichtbar in Ruhe, Einblenden bei Hover/Fokus des Wrappers, sitzt links neben dem Icon, `tabIndex={-1}`, `onMouseDown={e => e.preventDefault()}` damit der Fokus bleibt.
- **Popover-Panels**: `position: fixed`, `z-index: 900`, `--u-shadow-overlay`, `--u-radius-md`, Einblendung `panelIn` (Opazität + 6 px von oben). Sie schließen bei Außenklick und Escape, **schließen nicht beim Scrollen, sondern wandern mit** (Scroll-/Resize-Listener berechnen die Position neu). Nach dem Schließen geht der Fokus zurück auf den Auslöser.
- **Kein Fehlerzustand, wo eine stille Korrektur möglich ist**: Zeiträume „falsch herum" tauschen still, Uhrzeiten außerhalb werden auf 23/59 geklemmt. **Geändert (pure-logic-seams):** der NumberInput klemmt den *gemeldeten* Wert auf jedem Weg, nicht mehr nur beim Verlassen – der angezeigte Text bleibt beim Tippen unangetastet. Vorher gab ein Tastendruck den ungeklemmten Wert heraus und Verlassen den geklemmten, eine Prop mit zwei Verträgen.

### A.3 Token-Übersicht (Auszug, exakte Namen)

Farben: `--u-color-bg`, `--u-color-surface`, `--u-color-surface-sunken`, `--u-color-text`, `--u-color-text-secondary`, `--u-color-text-muted`, `--u-color-primary-bg/fg/hover/active`, `--u-color-accent`, `--u-color-accent-hover/active`, `--u-color-accent-subtle`, `--u-color-accent-text`, `--u-color-on-accent`, `--u-color-success(-subtle)`, `--u-color-warning(-subtle)`, `--u-color-danger(-hover,-subtle)`.
Kanten/Schatten: `--u-edge`, `--u-edge-strong`, `--u-hairline`, `--u-hairline-strong`, `--u-shadow-card`, `--u-shadow-overlay`, `--u-focus-ring`.
Typografie: `--u-font-sans`, `--u-font-mono`, `--u-text-xs` (0.6875 rem) … `--u-text-2xl`, `--u-weight-regular/medium/semibold`, `--u-tracking-caps` (0.07 em), `--u-tracking-tight`, `--u-tracking-display`, `--u-leading-tight/normal`.
Raster: `--u-space-1` (4 px) … `--u-space-8` (40 px), `--u-radius-xs/sm/md/lg/full` (4/6/8/12/999 px), `--u-control-height` (32 px), `--u-control-height-sm` (26 px).
Bewegung: `--u-transition`, `--u-ease-out`, `--u-duration-fast`, `--u-duration-medium`.

Neue Tokens nur anlegen, wenn sie in mindestens zwei Komponenten gebraucht werden; sonst lokale CSS-Variable am Komponenten-Wurzelelement (Beispiel: `--u-kalender-monat: 266px` am `.panel` der Picker).

### A.4 Komponentenbestand (öffentliche Exporte)

Badge, Button, Card/CardHeader/CardBody, Checkbox, Combobox, DataViz (Meter, Sparkline), DatePicker, DateTimePicker, DateRangePicker (+ `STANDARD_PRESETS`, `bereichTage`, Typen `DateRange`, `RangePreset`), DateTimeRangePicker, EmptyState, FormField (+ `useFormField`, `FormFieldBoundary`), Input, Layout (Stack, Grid), Menu/MenuItem/MenuSeparator, Modal/ModalHeader/ModalBody/ModalFooter (+ ConfirmDialog), MultiSelect, NumberInput, Select, Skeleton, Spinner, Table/Th/Td/TableToolbar/TablePagination/TableEmpty/TableSkeletonRows/TableFilter/TableFilterList (+ `useTableSelection`), Tabs/TabList/Tab/TabPanel, Toast (ToastProvider, useToast), Tooltip.

### A.5 Internals one has to know (traps and conventions)

*Translated and corrected: the identifiers below are the names these things carry
today, not the names of August 2026.*

1. **The FormField context and the id collision.** `useFormField()` returns
   `{ id, describedBy, invalid }`. Input, Select, Checkbox, NumberInput and every
   picker trigger adopt `field.id` as their own id when no explicit `id` is passed.
   The consequence: anything rendered **inside a panel** that is itself a form
   element (Checkbox, Input, Select) **must** be wrapped in `<FormFieldBoundary>`,
   or it inherits the field id, its `<label htmlFor>` points at the trigger, and a
   click closes the panel. This mistake happened twice (MultiSelect,
   DateTimeRangePicker). A rule without exceptions.
2. **Never move focus synchronously in `onChange`.** An `element.focus()` inside an
   input event fires the old field's `onBlur` before React has rendered the new
   value; blur handlers that read the prop see the stale one. The rule: move focus
   in a `requestAnimationFrame`, and have blur handlers read
   `event.currentTarget.value` from the DOM, never the state or the prop.
   Reference: `TimeField` in `DatePicker/`, and `onBlur` in `NumberInput.tsx`.
3. **The calendar's building blocks are shared.** `Calendar.tsx` holds the month
   grid together with its range props; the helpers are `startOfMonth`, `addDays`,
   `addMonths`, `sameDay`, `dayOnly`, `monthFormat`, `longFormat` and `WEEKDAYS`.
   `TimeField` and `resolveLocalTime` (the clock change: `ok | missing |
   duplicate`), `offsetLabel`, `pad2` and the type `DstStatus` sit beside them, and
   `DateRangePicker` exports `DEFAULT_PRESETS` and `rangeDays`. **All four pickers
   share `DatePicker.module.css`.** A change to any of these building blocks is felt
   everywhere — check all four pickers in the demo before making one.
4. **One month width for every calendar.** `--_calendar-month: 266px` on the
   `.panel`; single panels are `calc(var(--_calendar-month) + 2 * var(--u-space-3))`
   wide, and range panels have a fixed block on the right of
   `calc(2 * var(--_calendar-month) + var(--u-space-4))`. A panel's width must
   **never** change with its content — nothing may jump. New content in a panel has
   to fit those widths or wrap.
5. **The range pickers' two-click logic.** The first click is the start, the second
   the end; after that the DateRangePicker accepts and closes immediately (there is
   no accept button), while the DateTimeRangePicker moves focus into the first time
   field — or onto "accept" when "all day" is set. A backwards click swaps silently.
   Hovering after the first click shows the preview band and a live day count in the
   footer. This logic is the core of what distinguishes these pickers and must not be
   changed by any work package.
6. **German notation throughout**: a comma as the decimal separator, a full stop for
   thousands, `Intl.NumberFormat("de-DE")`, the date format `DD.MM.YYYY`, weeks
   starting Monday, 24-hour time. (Still true: ticket 13 made the *wording* English
   and deliberately left the *formats* German. The effort's spec records why, and
   that it deserves a ticket of its own.)
7. **Keyboard**: a roving tabindex in grids and lists (exactly one element with
   `tabIndex=0`), `data-active="true"` marks the focusable element in the calendar,
   arrow keys navigate, Enter and Space select, Escape closes and focuses the
   trigger. Every new component keeps to this.
8. **The positioning code is consolidated** (done, package B.4 / `popover-seam`).
   Everything anchored lives in `components/Popover`: the portal, the position
   including clamping and flipping, the outside click, Escape with focus returned,
   travelling along on scroll, stacking order, the entrance — and the reset of the
   FormField context inside the panel (see §1, which is thereby structural rather
   than a rule to remember). New surfaces take the primitive, not the old pattern.
   The tooltip takes only the geometry (`Popover/position.ts`, `align: "center"`,
   `side: "top"`) and keeps its own portal, entrance, and its disappearance on
   scroll. Modal (`<dialog>`) and Toast (a fixed corner area) stay independent.
9. **Sizes**: `size?: "sm" | "md"` (Select historically uses `selectSize`; do not
   rename it). `sm` = 26 px high with `--u-radius-sm`; `md` = 32 px with
   `--u-radius-md`.
10. **Toasts** have a delicate animation history (the exit to the right, the collapse
    without `overflow: hidden`). Do not touch them unless a work package expressly
    calls for it.

---

## Teil B – Arbeitspakete

Empfohlene Reihenfolge: **B.4 (Popover/Tooltip-Primitive) zuerst**, weil B.1, B.5, B.6 und B.10 darauf aufsetzen. Danach B.1 (Freitext-Datum), B.5 (Command Palette), dann der Rest. Jedes Paket ist unabhängig lieferbar; nach jedem Paket gilt Teil C.

Für jedes Paket: neue Datei(en) im Komponentenordner, Export in `index.ts` und – bei neuer Komponente – in `src/index.ts`; Demo-Kachel; Kommentarblock im Kopf der Komponente, der die Bedienlogik in 4–8 Zeilen erklärt (Vorbild: Kopfkommentar von `DateRangePicker`).

---

### B.1 Freitext-Datumseingabe in allen vier Pickern (Priorität 1)

**Ziel.** Der Trigger der Picker wird zusätzlich zu Klick-Bedienung eine Tastatur-Eingabe: Der Nutzer tippt in den Trigger, die Eingabe wird live geparst, das erkannte Ergebnis wird als Vorschau angezeigt und mit Enter übernommen. Klick-Bedienung, Panel und alle bestehenden Props bleiben **exakt** erhalten.

**Neue Datei** `src/components/DatePicker/datumParser.ts` mit reinen Funktionen (kein React):

```ts
export interface ParseErgebnis<T> { wert: T; anzeige: string; }   // anzeige = "Mo, 17.08.2026" bzw. Bereichstext
export function parseDatum(text: string, bezug: Date): ParseErgebnis<Date> | null;
export function parseZeitraum(text: string, bezug: Date): ParseErgebnis<{ von: Date; bis: Date }> | null;
export function parseDatumZeit(text: string, bezug: Date): ParseErgebnis<Date> | null;
```

`bezug` ist „heute" (wird zur Testbarkeit injiziert; die Komponenten übergeben `new Date()`). Ergebnisse sind lokale Daten (Konstruktor `new Date(j, m, t[, h, min])`), Datum ohne Zeit auf 00:00. Groß-/Kleinschreibung egal, Leerzeichen am Rand und mehrfache Leerzeichen ignorieren.

**Grammatik `parseDatum`** (Reihenfolge = Prüfreihenfolge, erster Treffer gewinnt):

| Eingabe | Bedeutung |
|---|---|
| `heute`, `h` | bezug |
| `morgen`, `gestern`, `übermorgen`, `uebermorgen`, `vorgestern` | ±1/±2 Tage |
| `+N`, `-N`, `+Nt`, `-Nt` | ±N Tage |
| `+Nw`, `-Nw` | ±N Wochen |
| `+Nm`, `-Nm` | ±N Monate (Tag geklemmt auf Monatslänge, z. B. 31.01. +1m = 28./29.02.) |
| `mo`, `di`, `mi`, `do`, `fr`, `sa`, `so` (auch ausgeschrieben `montag` …) | nächster solcher Wochentag **nach** heute (heute selbst zählt nicht: ist heute Montag, ist `mo` in 7 Tagen) |
| `T` (1–2 Ziffern, 1–31) | Tag im aktuellen Monat; liegt er in der Vergangenheit, im nächsten Monat |
| `T.M` oder `T.M.` (Ziffern) | Tag.Monat im aktuellen Jahr; liegt das Datum > 6 Monate in der Vergangenheit, nächstes Jahr |
| `T.M.JJ`, `T.M.JJJJ` | vollständig; zweistelliges Jahr → 2000+JJ |
| `TTMM` (4 Ziffern), `TTMMJJ` (6), `TTMMJJJJ` (8) | ohne Trennzeichen, gleiche Regeln |
| `JJJJ-MM-TT` | ISO |
| `kw N`, `kwN`, `KW N` (1–53) | Montag der ISO-Kalenderwoche N im aktuellen Jahr; für `parseDatum` der Montag, für `parseZeitraum` Mo–So |
| `kw N/JJJJ`, `kw N JJJJ` | mit Jahr |

Ungültige Tage (31.02., 30.02.) → `null` (kein Überlauf in den Folgemonat). Nichts erkannt → `null`.

**Grammatik `parseZeitraum`** (zusätzlich zu allem aus `parseDatum`, das dann als Ein-Tages-Bereich gilt):

| Eingabe | Bedeutung |
|---|---|
| `A - B`, `A – B`, `A bis B` (A, B jeweils gültige `parseDatum`-Eingaben) | Bereich; ist B < A, tauschen |
| `A - +N` | B relativ zu A (nicht zu heute): `15.8 - +3` = 15.08.–18.08. |
| `diese woche`, `dw` | Mo–So der aktuellen Woche |
| `letzte woche`, `lw` / `nächste woche`, `nw` | vorige/nächste Woche Mo–So |
| `dieser monat`, `dm` / `letzter monat`, `lm` / `nächster monat`, `nm` | Monatsgrenzen |
| `dieses quartal`, `dq` / `letztes quartal`, `lq` | Quartalsgrenzen |
| `dieses jahr`, `dj` / `letztes jahr`, `lj` | Jahresgrenzen |
| `q1`…`q4`, `q1 2026`, `q1/26` | Quartal |
| Monatsname allein: `august`, `aug`, `märz`, `maerz` | ganzer Monat im aktuellen Jahr (liegt er > 6 Monate zurück, nächstes Jahr) |
| `august 2025`, `aug 25` | ganzer Monat mit Jahr |
| `2026` (4 Ziffern, 1900–2100) | ganzes Jahr |
| `letzte N tage`, `lNt` (z. B. `l7t`) | heute − (N−1) … heute |
| `nächste N tage`, `nNt` | heute … heute + (N−1) |
| `T. - T. M.` (z. B. `3. - 9. 8.`) | Kurzform: beide Tage im genannten Monat |

**Grammatik `parseDatumZeit`**: `parseDatum`-Eingabe, optional gefolgt von Leerzeichen und Uhrzeit `HH:MM`, `HH:MM:SS`, `HHMM`, `HH` (nur Stunde), `H uhr`, `H:MM uhr`; oder Uhrzeit **allein** (dann heute). `jetzt`, `j` = bezug mit aktueller Uhrzeit (Sekunden nur, wenn `withSeconds`; sonst 0). Ohne Uhrzeit → 00:00.

**Integration in die Trigger.** Die Trigger sind heute `<button>`. Sie werden **nicht** ersetzt, sondern der Trigger-Wrapper (`.triggerWrap`) erhält zwei Zustände: *Anzeige* (bestehender Button, unverändert) und *Eingabe* (ein `<input type="text">` in derselben Fläche mit identischer Optik: Höhe, Radius, Kante, Icon rechts, Mono-Schrift). Umschalten in den Eingabe-Zustand geschieht, wenn der Trigger fokussiert ist und der Nutzer eine **Zeichentaste** drückt (Ziffer, Buchstabe, `+`, `-`, `.`, `:`); das Zeichen wird als erstes Zeichen übernommen. Nicht umschalten bei Enter, Leertaste, Pfeiltasten (öffnen wie bisher das Panel). Alternativ: Doppelklick auf den Trigger öffnet den Eingabe-Zustand mit dem aktuellen Wert als Text (formatiert, damit man ihn editieren kann).

Im Eingabe-Zustand:

- Unter dem Feld erscheint eine kleine Vorschau-Zeile (Position wie ein Popover, Breite = Triggerbreite, `--u-shadow-overlay`, Padding `--u-space-2 --u-space-3`, Schrift `--u-text-xs`): links das geparste Ergebnis (`anzeige`, z. B. „Mo, 17.08.2026" bzw. „01.08. – 31.08. · 31 Tage") in `--u-color-text`, bei `null` der Text „Kein Datum erkannt" in `--u-color-text-muted`; rechts ein Hinweis in `--u-color-text-muted`: „Enter übernimmt · Esc bricht ab". Bei leerem Text: drei Beispiele in muted, komponentenspezifisch (`DatePicker`: „z. B. 15.8 · +3 · mo · kw 34", `DateRangePicker`: „z. B. 3.-9.8 · lm · q3 · l7t", `DateTimePicker`: „z. B. 15.8 0900 · jetzt · +1 14:30", `DateTimeRangePicker`: „z. B. 15.8 08:00 - 17:00 · dw").
- **Enter**: bei gültigem Ergebnis `onChange(wert)` aufrufen, zurück in Anzeige-Zustand, Fokus bleibt auf dem Trigger-Button. Bei `null`: Feld kurz „schütteln" ist **verboten** (verspielt) – stattdessen bleibt der Zustand, die Vorschau-Zeile wechselt die Farbe des Textes „Kein Datum erkannt" auf `--u-color-danger` für 1 s und zurück.
- **Escape** oder Blur: zurück in den Anzeige-Zustand ohne Änderung.
- **Pfeil ab** im Eingabe-Zustand: öffnet das normale Panel; falls die Eingabe bereits ein gültiges Datum ergibt, ist dieses im Panel der aktive Tag (bei Range: Ansichtsmonat = von, aber **kein** Entwurf gesetzt).
- Beim DateTimeRangePicker gilt: `parseZeitraum`-Treffer ohne Uhrzeit → ganztägig (00:00–23:59[:59]); Form `A HH:MM - B HH:MM` sowie `A HH:MM - HH:MM` (zweite Zeit auf denselben Tag) werden zusätzlich erkannt.

**Optik der Eingabe.** Der Input hat exakt die Klasse `.trigger` plus eine Zusatzklasse `.triggerEingabe`; kein sichtbarer Sprung beim Umschalten (gleiche Metriken, gleicher Text-Startpunkt). Cursor-Farbe `--u-color-accent`. Fokusring wie bei Input.

**Neue Props** (alle vier Picker): `freeText?: boolean` – Standard `true`. `false` schaltet den Eingabe-Zustand komplett ab (Verhalten wie heute).

**Tests (Pflicht).** Datei `umriss-ui/tests/datumParser.test.ts` mit Vitest (als devDependency ergänzen, Skript `"test": "vitest run"`). Mindestens 60 Fälle, die jede Zeile der drei Tabellen abdecken, plus: Zeitumstellungstage 29.03.2026 und 25.10.2026, Jahreswechsel (`+1m` am 15.12., `lm` am 10.01.), Schaltjahr (`29.2.24` gültig, `29.2.25` ungültig), `31.4.` ungültig, `kw 53` in einem Jahr mit 52 Wochen (→ null), Wochentag-Regel „heute zählt nicht". Alle Tests laufen mit fest gesetztem `bezug` (kein `new Date()` in Tests).

**Nicht verändern:** Panel-Layout, Presets, Bereichslogik, Kalender.

---

### B.2 Tastatur-Ebene im Range-Panel

**Ziel.** Power-User-Bedienung im geöffneten Panel von DateRangePicker und DateTimeRangePicker.

Solange der Fokus im Kalender-Raster liegt (auf einem Tag-Button):

- `Shift+Pfeiltaste`: wenn noch kein Entwurf gesetzt ist, wird der aktive Tag zum Entwurfs-Start und der Fokus wandert; das Vorschau-Band folgt dem Fokus (wie beim Hovern). Wenn ein Entwurf besteht, verschiebt es das Vorschau-Ende. Enter/Leertaste übernimmt (wie zweiter Klick).
- `W`: setzt Entwurf auf Mo–So der Woche des aktiven Tags und übernimmt sofort (DateRangePicker: schließt; DateTimeRangePicker: Fokus wie nach zweitem Klick). `M`: Monat des aktiven Tags. `Q`: Quartal. `J`: Jahr. `T`: springt aktiv/Ansicht auf heute (kein Übernehmen).
- `Bild ab/auf`: Ansicht ±1 Monat (aktiv gleicher Tag im Zielmonat, geklemmt); `Shift+Bild`: ±1 Jahr.
- `Pos1`/`Ende`: aktiv auf ersten/letzten Tag des angezeigten Monats.
- `1`–`8` bei sichtbarer Preset-Spalte: wählt das Preset an dieser Position (nur wenn Fokus im Raster). Presets zeigen ihre Ziffer als kleines `Kbd`-Element rechts (siehe B.9), nur eingeblendet, wenn Fokus im Panel und Maus nicht über der Preset-Spalte.

Alles bestehende Tastaturverhalten (Pfeile, Enter, Escape) bleibt unverändert. In der Fußzeile erscheint rechts vom Hinweistext ein dezenter Link „Tasten" (`--u-text-xs`, muted), der bei Hover/Fokus einen Tooltip (B.4) mit der Kurzübersicht zeigt.

---

### B.3 Vergleichszeitraum im DateRangePicker

**Neue Props** am `DateRangePicker` (nur dort):

```ts
compare?: DateRange | null;               // zweiter Bereich, nur Anzeige
onCompareChange?: (b: DateRange | null) => void;
compareOptions?: Array<{ label: string; ableiten: (basis: DateRange) => DateRange }>;
```

Standard-`compareOptions` (exportiert als `STANDARD_VERGLEICHE`): „Vorperiode" (gleiche Länge direkt davor), „Vorjahr" (gleiche Kalendertage ein Jahr zurück; 29.02. → 28.02.), „Kein Vergleich" (→ null).

**Darstellung.** Im Kalender wird `compare` als zweites, dünneres Band gezeichnet: 3 px hohe Linie am unteren Rand der Tageszellen, Farbe `--u-color-text-muted` bei 50 % Deckkraft, Endpunkte ohne Füllung. Es überlagert das Hauptband nie farblich (liegt darunter/unten). Fußzeile: nach dem Tageszähler „ · vs. 01.07.–31.07." in muted. Trigger: unverändert (Vergleich wird nicht im Trigger angezeigt; wer ihn braucht, zeigt ihn selbst an).

**Bedienung.** Wenn `onCompareChange` gesetzt ist, erscheint in der Preset-Spalte **unter** den Presets, durch eine Haarlinie getrennt, eine Zeile „Vergleich" (caps, xs, muted) und darunter die `compareOptions` als Preset-Buttons; die aktive Option ist markiert. Auswahl setzt `compare` relativ zum aktuellen `value` (bei leerem `value` sind die Optionen deaktiviert). Ändert sich `value` durch Auswahl im Kalender oder Preset, wird `compare` mit der zuletzt gewählten Option neu abgeleitet (Option merken, solange das Panel offen ist; beim Öffnen aus dem übergebenen `compare` rekonstruieren: passt eine Option, ist sie aktiv, sonst „Benutzerdefiniert" ohne Button).

Ist keines der drei Props gesetzt, ist die Komponente pixelgleich zu heute.

---

### B.4 Popover- und Tooltip-Primitive (Voraussetzung für mehrere Pakete)

**Ziel.** Positionierung, Außenklick, Escape, Scroll-Mitwandern und Fokus-Rückgabe **einmal** implementieren und alle bestehenden Popover darauf umstellen – **ohne sichtbare Verhaltensänderung**.

**Neue Dateien** `src/components/Popover/Popover.tsx`, `Popover.module.css`, `index.ts`; Export in `src/index.ts`.

```ts
export interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;      // Auslöser
  /** Optionale zusätzliche Elemente, deren Klick NICHT als Außenklick gilt (z. B. Leeren-×). */
  insideRefs?: Array<React.RefObject<HTMLElement | null>>;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";   // Standard bottom-start
  offset?: number;                                     // Standard 6
  /** Panelbreite: "anchor" = Breite des Auslösers, Zahl = px, "auto" = Inhalt. Standard "auto". */
  width?: "anchor" | "auto" | number;
  /** Fokus beim Schließen zurück auf den Anker (Standard true). */
  restoreFocus?: boolean;
  role?: "dialog" | "listbox" | "menu" | "tooltip";
  ariaLabel?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}
export function Popover(props: PopoverProps): JSX.Element | null;
export function usePopoverPosition(...)  // intern, nicht exportieren
```

Verhalten (exakt wie heute in `DateRangePicker.tsx`, dort nachlesen): Portal in `document.body`; `position: fixed`; Position aus `anchorRef.getBoundingClientRect()`; **horizontal in den Viewport klemmen** (mind. 8 px Rand); wenn unten weniger Platz als Panelhöhe und oben mehr, nach oben klappen (Klasse `.oben`, Animation spiegelt sich: von unten einblenden); Listener `mousedown` (Außenklick → `onOpenChange(false)`, wobei Anker und `insideRefs` als „innen" gelten), `keydown` Escape → `onOpenChange(false)` + Fokus auf Anker, `scroll` (capture) und `resize` → Position neu berechnen. `z-index: 900`, `--u-shadow-overlay`, `--u-radius-md`, `--u-color-surface`, `panelIn`-Animation. Panels dürfen im Popover kein eigenes `position/top/left` mehr setzen.

**Migration** (Reihenfolge, nach jeder Komponente Demo prüfen): Tooltip (nur Positionslogik; API von `Tooltip` bleibt: `content`, `children`, `delay`; ergänze `placement?: "top" | "bottom"` Standard `top`, `side` wie heute automatisch flippend), Menu, Combobox, MultiSelect, TableFilter, DatePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker. Für die Picker gilt: `insideRefs=[wrapRef]` (Leeren-× darf das Panel nicht schließen), `restoreFocus=true`, `role="dialog"`, `ariaLabel` wie heute.

**Abnahme dieses Pakets:** Jede migrierte Komponente verhält sich in diesen Punkten identisch: Öffnen-Position, Klemmen am rechten Rand (Fenster schmal machen), Mitwandern beim Scrollen (Demo-Seite scrollen bei offenem Panel), Außenklick, Escape mit Fokusrückgabe, kein Schließen beim Klick auf Leeren-×, kein Breiten-Springen. Bestehende CSS-Klassen der Panels (`.panel`, `.bereichPanel` etc.) bleiben, `position/z-index/animation` wandern in die Primitive.

---

### B.5 Command Palette (⌘K)

**Neue Komponente** `src/components/CommandPalette/` mit `CommandPalette.tsx`, `CommandPalette.module.css`, `index.ts`.

```ts
export interface CommandItem {
  id: string;
  label: string;
  /** Zusatz rechts (z. B. Pfad, Kategorie), muted. */
  hint?: string;
  /** Suchbegriffe zusätzlich zum Label. */
  keywords?: string[];
  icon?: React.ReactNode;              // 14×14, currentColor
  shortcut?: string[];                  // z. B. ["⌘", "K"] – gerendert als Kbd (B.9)
  disabled?: boolean;
  onSelect: () => void;
}
export interface CommandGroup { label: string; items: CommandItem[]; }
export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;                 // Standard "Befehl oder Suche …"
  /** Optionale asynchrone Quelle: wird mit dem Suchtext aufgerufen, Ergebnis wird als eigene Gruppe angehängt. */
  onSearch?: (query: string) => Promise<CommandItem[]>;
  /** Text, wenn nichts passt. Standard "Keine Treffer". */
  emptyText?: string;
  /** Standard-Shortcut registrieren (⌘K / Strg+K). Standard true. */
  hotkey?: boolean;
}
export function CommandPalette(props: CommandPaletteProps): JSX.Element | null;
export function useCommandPalette(): { open: boolean; setOpen: (o: boolean) => void };   // einfacher State-Helfer
```

**Optik.** Modal-Overlay wie `Modal` (gleiches Backdrop, gleiche Einblendung, `--u-duration-medium`), Panel 560 px breit, oben im Fenster (Oberkante bei 18 vh; nicht mittig – wie Linear/Raycast), `--u-radius-lg`, `--u-shadow-overlay`. Kopf: Suchfeld ohne Kante (nur Haarlinie darunter), Schrift `--u-text-md`, Lupe links 14 px muted, rechts `Kbd` „Esc". Liste: max. 360 px hoch, scrollt; Gruppen-Überschrift caps xs muted mit `--u-tracking-caps`, Einträge 34 px hoch, Padding `--u-space-2 --u-space-3`, aktives Element `--u-color-surface-sunken` mit 2-px-Tinte-Balken links (`--u-color-text`), Hover setzt aktiv. Fußzeile: Haarlinie, links „↑↓ wählen · ↵ ausführen" in xs muted (mit `Kbd`), rechts optional Zähler „12 Treffer".

**Verhalten.** Öffnen per Prop oder Hotkey (⌘K auf Mac, Strg+K sonst; nur wenn kein Textfeld fokussiert ist **oder** wenn es fokussiert ist – der Hotkey gilt global, aber `event.preventDefault()` nur, wenn die Palette tatsächlich geöffnet wird). Fokus beim Öffnen im Suchfeld. Suche: unscharf, aber deterministisch: Treffer wenn alle Zeichen des Suchtexts in Reihenfolge in `label` oder einem `keywords`-Eintrag vorkommen (Subsequenz), Groß/Klein egal, Umlaute normalisiert (ä→a, ö→o, ü→u, ß→ss). Sortierung innerhalb einer Gruppe: exakter Präfix-Treffer vor Wortanfangs-Treffer vor Subsequenz; Gruppen behalten ihre Reihenfolge, leere Gruppen werden ausgeblendet. Getroffene Zeichen im Label werden **nicht** farbig hervorgehoben (zu unruhig), sondern in `--u-weight-medium`. Pfeil auf/ab bewegt aktiv (zyklisch), Enter führt `onSelect` des aktiven aus und schließt, Escape schließt, Tab ist gefangen (Fokus bleibt im Panel). Bei `onSearch`: Aufruf 150 ms nach letzter Eingabe, Spinner (bestehende `Spinner`-Komponente, sm) rechts im Suchfeld während des Wartens; Ergebnisse als letzte Gruppe „Suche"; veraltete Antworten (Query hat sich inzwischen geändert) verwerfen. Leerer Suchtext zeigt alle Gruppen. `disabled`-Einträge sind sichtbar, muted, nicht auswählbar. Beim Schließen Fokus zurück auf das zuvor fokussierte Element.

**Demo.** Kachel „Navigation – Command Palette" mit Button „⌘K öffnen", 3 Gruppen (Navigation, Aktionen, Zuletzt), einer asynchronen Quelle (simulierte 400 ms Verzögerung), Einträgen mit Shortcuts und einem deaktivierten Eintrag. Ausgelöste Aktionen zeigen einen Toast.

---

### B.6 Segmented Control und Switch

**SegmentedControl** (`src/components/SegmentedControl/`):

```ts
export interface SegmentedOption<T extends string> { value: T; label: React.ReactNode; disabled?: boolean; }
export interface SegmentedControlProps<T extends string> {
  value: T; onChange: (v: T) => void; options: SegmentedOption<T>[];
  size?: "sm" | "md"; fullWidth?: boolean; "aria-label": string;
}
```

Optik: Container mit `--u-color-surface-sunken`, `--u-radius-md` (sm: `--u-radius-sm`), Innenabstand 2 px; Segmente ohne eigene Fläche, Text sm medium, Farbe muted → aktiv `--u-color-text`; unter dem aktiven Segment liegt ein **gleitender Indikator** (`--u-color-surface`, `--u-edge`, `--u-radius-sm`), der per `transform: translateX()` mit `--u-duration-fast --u-ease-out` zum neuen Segment fährt (Breite/Position aus `getBoundingClientRect` der Segmente, per `ResizeObserver` aktualisiert). Höhe `--u-control-height` (sm 26). Tastatur: `role="radiogroup"`, Segmente `role="radio"`, Pfeiltasten wechseln (zyklisch, überspringen disabled), Roving Tabindex. Fokusring auf dem Container (`focus-within`), nicht auf dem Segment. Maximal 6 Optionen; ab 7 in der Konsole warnen (nur dev).

**Switch** (`src/components/Switch/`): `checked`, `onChange(checked)`, `label?`, `disabled?`, `size?: "sm" | "md"`. Optik: Bahn 32×18 px (sm 26×15), Radius full, aus: `--u-color-surface-sunken` mit `--u-edge-strong`; an: `--u-color-primary-bg` (Tinte, **nicht** Akzent – der Akzent bleibt für Fokus). Knopf weiß, 14 px (sm 11), 2 px Rand, `--u-shadow-card`; Bewegung `transform` mit `--u-duration-fast --u-ease-out`; beim Drücken (`:active`) wird der Knopf 3 px breiter (dehnt sich in Bewegungsrichtung), zurück beim Loslassen – das ist die einzige erlaubte „Kenner"-Geste. `role="switch"`, `aria-checked`, Leertaste toggelt, Label wie bei Checkbox rechts, gleicher Zeilenabstand. Nutzt `useFormField` wie Checkbox (id/describedBy) und wird in Panels in `FormFieldBoundary` gewickelt.

Demo: eigene Kachel „Umschalter" mit beiden, sm/md, disabled, fullWidth.

---

### B.7 Slider und RangeSlider

`src/components/Slider/` mit `Slider` (ein Wert) und `RangeSlider` (zwei Werte).

```ts
interface SliderBasis { min: number; max: number; step?: number; disabled?: boolean; size?: "sm" | "md";
  /** Skalen-Ticks: "none" | "steps" (jeder Step, nur wenn ≤ 20 Steps) | number[] (explizite Werte). */
  ticks?: "none" | "steps" | number[];
  /** Formatierung der Wertanzeige, Standard Intl de-DE ohne Nachkommastellen bei ganzzahligem step. */
  format?: (v: number) => string;
  /** Wertanzeige: "tooltip" (nur beim Ziehen/Fokus) | "inline" (permanent rechts) | "none". Standard "tooltip". */
  valueDisplay?: "tooltip" | "inline" | "none";
  "aria-label": string; }
export interface SliderProps extends SliderBasis { value: number; onChange: (v: number) => void; }
export interface RangeSliderProps extends SliderBasis { value: [number, number]; onChange: (v: [number, number]) => void; minDistance?: number; }
```

Optik: Bahn 4 px hoch (sm 3), `--u-color-surface-sunken` mit `--u-edge`, gefüllter Teil `--u-color-primary-bg` (Tinte); Griff 14 px (sm 12) rund, weiß, `--u-edge-strong` + `--u-shadow-card`; Hover: Griff `--u-edge-strong` wird `--u-color-text`; Fokus: `--u-focus-ring`; beim Ziehen Griff `scale(1.15)`. Ticks: 1 px × 4 px Striche unter der Bahn in `--u-hairline-strong`, Beschriftung nur für ersten/letzten und explizite Ticks (xs mono muted). Wert-Tooltip: kleines Panel über dem Griff (xs mono, `--u-color-primary-bg`/`fg`, Radius xs, kein Pfeil), erscheint mit `--u-transition`. RangeSlider: gefüllt zwischen den Griffen; Griffe dürfen sich nicht kreuzen (`minDistance`, Standard = `step`); beim Überlappen ist der zuletzt bewegte Griff oben. Bedienung: Pointer (Bahn-Klick springt zum nächsten Step, dann ziehen), Tastatur Pfeile ±step, `Shift` ±10 step, Pos1/Ende. `role="slider"`, `aria-valuemin/max/now/text`. Deutsche Notation in allen Anzeigen. Kein Wert-Overflow: Werte werden auf `step`-Raster gerundet und geklemmt.

Demo-Kachel „Schieberegler": Slider mit inline-Wert und Ticks, RangeSlider für Budgetspanne mit €-Format, sm, disabled.

---

### B.8 Stepper (Wizard) für mehrstufige Formulare

`src/components/Stepper/`:

```ts
export interface StepDefinition { id: string; label: string; description?: string; optional?: boolean; }
export type StepStatus = "offen" | "aktiv" | "erledigt" | "fehler";
export interface StepperProps {
  steps: StepDefinition[]; activeId: string; onStepChange?: (id: string) => void;
  status?: Record<string, StepStatus>;              // überschreibt die automatische Ableitung
  orientation?: "horizontal" | "vertical";           // Standard horizontal
  /** Klickbar: "erledigt" (nur zurück, Standard) | "alle" | "keine". */
  navigable?: "erledigt" | "alle" | "keine";
  size?: "sm" | "md";
}
export function Stepper(props: StepperProps): JSX.Element;
export function StepperFooter({ children }: { children: React.ReactNode }): JSX.Element;   // Zurück/Weiter-Zeile mit Haarlinie oben
```

Optik: Kreise 22 px (sm 18) mit Nummer (mono xs), Verbindungslinien 1 px `--u-hairline-strong`, erledigt: Kreis Tinte gefüllt mit Häkchen (das bestehende Checkbox-Häkchen-SVG mit `pathLength` und Zeichen-Animation über 240 ms nachnutzen), aktiv: Kreis mit `--u-edge-strong` in Tinte und Innenpunkt, Label medium; offen: muted; fehler: Kreis `--u-color-danger`, „!" statt Nummer. Beim Fortschreiten füllt sich die Verbindungslinie zum nächsten Schritt von links nach rechts (`transform: scaleX`, `--u-duration-medium`). Horizontal: Labels unter den Kreisen, gleichmäßig verteilt; vertikal: Labels rechts, Beschreibungen darunter, Linie zwischen den Kreisen. Tastatur: klickbare Schritte sind Buttons mit `aria-current="step"` am aktiven. Kein eigener Zustand für Formularinhalte – der Stepper ist reine Anzeige/Navigation; Validierung liefert der Aufrufer über `status`.

Demo: horizontales Beispiel mit vier Schritten in einer Card mit Inhalt pro Schritt und `StepperFooter` (Zurück/Weiter), ein Schritt mit `fehler`; vertikales sm-Beispiel.

---

### B.9 Kleine Bausteine: Kbd, Avatar, AvatarGroup, Progress-Familie

**Kbd** (`src/components/Kbd/`): `<Kbd>⌘</Kbd>`, `<Kbd>K</Kbd>`; Optik: mono xs, `--u-color-surface`, `--u-edge`, unten zusätzlich 1 px dunklere Kante (`box-shadow: var(--u-edge), 0 1px 0 var(--u-edge-color-strong)`), Radius xs, Padding 1 px 5 px, min-width 18 px, zentriert. Helfer `<KbdSequence keys={["⌘","K"]} />` rendert Tasten mit 2 px Abstand ohne „+"-Zeichen. Wird von B.2, B.5 genutzt.

**Avatar** (`src/components/Avatar/`): `name: string` (Initialen automatisch: erste Buchstaben der ersten zwei Wörter, Großbuchstaben, bei einem Wort die ersten zwei Buchstaben), `src?`, `size?: "xs"|"sm"|"md"|"lg"` (20/24/32/40 px), `shape?: "circle"|"rounded"` (Standard circle). Ohne Bild: Fläche in Tinte-Ton abgeleitet aus dem Namen – **keine** bunten Farben; erlaubt sind 6 Graustufen zwischen `--u-color-surface-sunken` und `#3a3a3a` (hell) bzw. entsprechend im Dark-Thema, Textfarbe kontrastsicher (hell auf dunkel ab der dritten Stufe). Auswahl der Stufe deterministisch per einfachem Hash über den Namen. Initialen in sans medium, Größe passend (xs 8 px … lg 15 px). `title` = Name, `aria-label` = Name. **AvatarGroup**: `max?` (Standard 4), überlappend um 25 % mit 2 px Papier-Ring (`box-shadow: 0 0 0 2px var(--u-color-surface)`), Rest als „+N"-Kreis (surface-sunken, mono xs). Hover eines Avatars in der Gruppe hebt ihn nach vorn (z-index), keine Bewegung.

**Progress-Familie** (in `src/components/DataViz/`, neben Meter/Sparkline): 
- `ProgressBar`: `value` (0–100 oder `null` = unbestimmt), `size?: "sm"|"md"` (Höhe 4/6 px), `tone?: "neutral"|"accent"|"success"|"warning"|"danger"` (Standard neutral = Tinte), `label?` (links oben, sm), `showValue?` (rechts oben, mono sm „42 %"). Unbestimmt: 30 %-Segment, das mit 1,2 s linear endlos von links nach rechts läuft (einzige erlaubte Endlos-Animation, unter reduced-motion durch statischen 30-%-Balken bei 35 % Position ersetzt). Wertänderungen animieren die Breite mit `--u-duration-medium`.
- `ProgressRing`: `value`, `size?` (24/32/48 px), `strokeWidth?` (Standard 3), `tone?`, Kind-Inhalt in der Mitte (z. B. „42 %" mono). Ring über SVG `stroke-dasharray`, Übergang `--u-duration-medium`. Bahn `--u-hairline-strong`.
- `Meter` (bestehend) erhält **additiv** `thresholds?: { warning?: number; danger?: number }`: ab dem jeweiligen Wert wechselt der Ton automatisch (nur wenn `tone` nicht explizit gesetzt ist). Bestehende Props und Optik unverändert.

Demo: Kachel „Kleinteile" (Kbd, Avatar/Group) und Erweiterung der DataViz-Kachel (ProgressBar bestimmt/unbestimmt, ProgressRing, Meter mit Schwellen).

---

### B.10 Inline-Bearbeitung in Tabellenzellen

> **Stand (Sep. 2026, `umriss-table` 14):** `@umriss/ui` hat keine Tabelle mehr. Inline-Bearbeitung zielt jetzt auf `@umriss/table`, wo sie ausdrücklich eine spätere Spec ist (`.scratch/umriss-table/spec.md`, Out of Scope). Was unten steht, beschreibt die alte Tabelle aus `Th` und `Td` und gilt nicht mehr wörtlich: eine Zelle ist dort die Darstellung einer `Column`, und eine bearbeitbare Zelle wäre eine Eigenschaft der Spalte, keine Hülle um eine `Td`. Die Anforderungen an Bedienung und Rückmeldung bleiben als Ausgangspunkt dieser Spec stehen.

**Ziel.** Zellen der bestehenden `Table` können per Doppelklick (oder Enter bei fokussierter Zelle) an Ort und Stelle bearbeitet werden – mit den bestehenden Eingabekomponenten. Die Tabelle selbst bleibt unverändert; es kommt eine Zellen-Hülle hinzu.

`src/components/Table/EditableCell.tsx`:

```ts
export interface EditableCellProps<T> {
  value: T; onCommit: (next: T) => void | Promise<void>;
  /** Editor-Typ; "text" | "number" | "select" | "date" | "custom". */
  editor: "text" | "number" | "select" | "date" | { render: (api: EditorApi<T>) => React.ReactNode };
  /** Optionen für den Editor: NumberInput-Props bei "number", Options bei "select", DatePicker-Props bei "date". */
  editorProps?: Record<string, unknown>;
  /** Anzeige im Lesezustand; Standard: formatierter Wert (Zahl de-DE, Datum TT.MM.JJJJ, Text). */
  display?: (value: T) => React.ReactNode;
  disabled?: boolean; align?: "left" | "right";
  /** Navigation nach Commit: Aufrufer erhält Richtung und darf die nächste Zelle aktivieren. */
  onNavigate?: (richtung: "down" | "up" | "right" | "left") => void;
}
```

Verhalten: Lesezustand zeigt den Wert wie eine normale `Td`; Hover zeigt rechts ein 10-px-Stift-Glyph in muted mit `opacity: 0.4` (stille Geste), keine Rahmen. Doppelklick, Enter oder F2 (bei fokussierter Zelle, Zellen sind `tabIndex=0` wenn editierbar) öffnet den Editor **in der Zelle** (Editor füllt die Zelle, `size="sm"`, ohne die Zeilenhöhe zu ändern – die Zellhöhe ist mit `sm`-Controls 26 px + Padding kompatibel; bei `compact` wird der Editor absolut über die Zelle gelegt mit `--u-shadow-card`). Fokus im Editor, Text vorselektiert. **Enter** = Commit + `onNavigate("down")`; **Tab** = Commit + `onNavigate("right")` (Shift+Tab left); **Escape** = Abbrechen ohne Änderung; Blur = Commit. Wenn `onCommit` ein Promise zurückgibt, zeigt die Zelle bis zur Auflösung einen 3-px-Balken am unteren Rand in Akzent (unbestimmt, wie ProgressBar sm) und ist gesperrt; bei Reject bleibt der Editor mit dem eingegebenen Wert offen und die Zelle bekommt `--u-color-danger-subtle` als Hintergrund, bis eine Änderung erfolgt. Für `date` öffnet der DatePicker mit Freitext (B.1) – die Zelle nutzt den Eingabe-Zustand direkt.

Beispiel-Helfer `useCellNavigation(rows, cols)` liefert `activeCell`, `setActiveCell`, `onNavigate` und ist optional. Demo: die bestehende Tabelle bekommt in „Budget" und „Auslastung" editierbare Zellen sowie eine Datumsspalte „Stichtag" (neu in den Demo-Daten), inklusive simuliertem asynchronem Speichern (600 ms) und einem Fehlerfall (Wert < 0 → Reject).

**Nicht verändern:** Table, Th, Td, Toolbar, Pagination, Filter, Selection.

---

### B.11 NumberInput: Ausdrücke und Einheiten

**Additiv** am `NumberInput`:

- Beginnt der Feldtext mit `=`, wird beim Verlassen oder bei Enter der Rest als arithmetischer Ausdruck ausgewertet: Operatoren `+ - * / ( ) %` (Prozent als Faktor: `1200*19%` = 228; `1200+19%` = 1428 – Prozent nach `+`/`-` bezieht sich auf den linken Operanden), Dezimalkomma **und** -punkt akzeptieren, Tausenderpunkte im Ausdruck ignorieren (nur wenn genau drei Ziffern folgen und kein weiterer Punkt/Komma-Konflikt entsteht – im Zweifel als Dezimalpunkt werten). Kein `eval`; eigener kleiner Rekursiv-Absteig-Parser in `src/lib/rechnen.ts` mit Tests (Vitest, mind. 25 Fälle inkl. Division durch 0 → kein Ergebnis, Klammern, Vorrang, negative Zahlen, `%`). Ergebnis wird wie ein normaler Wert geklemmt/gerundet und formatiert; ist der Ausdruck ungültig, bleibt der Text stehen und das Feld zeigt `invalid`-Optik, bis der Text geändert wird.
- Neues Prop `expressions?: boolean` (Standard `true`).
- Neues Prop `unit?: "duration"`: Feld nimmt Dauer-Eingaben an (`4h`, `4h 30min`, `4:30`, `270min`, `1d 2h`) und speichert **Minuten** als Zahl (`value` in Minuten); Anzeige formatiert als `4 h 30 min` (Leerzeichen als schmales geschütztes Leerzeichen U+202F). Stepper zählen in `step` Minuten (Standard 15). Adornments werden bei `unit="duration"` ignoriert.
- Vorschau: Solange ein `=`-Ausdruck oder eine Dauer getippt wird, erscheint das Ergebnis live **rechts im Feld** vor den Adornments in muted mono (`= 1.428`), ohne das Feld zu verbreitern (Ellipsis auf dem Text, wenn nötig).

Demo: Kachel „Zahlen" um zwei Beispiele erweitern („Rechnen: =1200*1,19 tippen", „Dauer").

---

### B.12 Formular-Kit

`src/lib/useForm.ts` + `src/components/Form/`:

```ts
export function useForm<TValues extends Record<string, unknown>>(opts: {
  initial: TValues;
  validate?: (values: TValues) => Partial<Record<keyof TValues, string>> | Promise<...>;   // Feld → Fehlertext
  onSubmit: (values: TValues) => void | Promise<void>;
}): {
  values: TValues; errors: Partial<Record<keyof TValues, string>>; touched: Partial<Record<keyof TValues, boolean>>;
  submitting: boolean; dirty: boolean;
  field<K extends keyof TValues>(name: K): { value: TValues[K]; onChange: (v: TValues[K]) => void; onBlur: () => void; error?: string; name: K };
  setValue, setError, reset, submit(): Promise<void>;
};
export function Form({ form, children, ...rest }): JSX.Element;      // <form> mit onSubmit=form.submit, noValidate
```

Verhalten: Validierung bei Blur des Feldes und bei Submit; Fehler erscheinen nur für berührte Felder oder nach Submit-Versuch; bei Submit mit Fehlern wird das **erste fehlerhafte Feld fokussiert** (Reihenfolge = DOM-Reihenfolge; Felder registrieren sich über eine Ref-Map in `field()`), und das zugehörige `FormField` zeigt `error`. `FormField` erhält **additiv** das Prop `field?: ReturnType<typeof useForm>["field"] extends (n: any) => infer R ? R : never` – wird es übergeben, verdrahtet FormField `error` automatisch und reicht `value/onChange/onBlur` an sein einziges Kind-Element (per `cloneElement`); die bisherigen Props bleiben und haben Vorrang. Ein optionaler Zod-Adapter `zodValidator(schema)` (nur wenn `zod` als optionale Peer-Dependency vorhanden; kein harter Import – dynamisch typisieren über ein minimales Interface `{ safeParse(v): { success: boolean; error?: { issues: Array<{ path: (string|number)[]; message: string }> } } }`). Submit-Button zeigt `loading` während `submitting`.

Demo: Kachel „Formular-Kit" mit fünf Feldern (Text, NumberInput, DatePicker, DateRangePicker, Select), Validierungsregeln, Fokus-auf-Fehler-Demonstration, Toast bei Erfolg.

---

### B.13 Dichte-Umschalter (global)

Neues Token-Set in `tokens.css`: `--u-density: 1` (Standard „komfortabel"). Unter `:root[data-density="compact"]` gelten: `--u-control-height: 28px`, `--u-control-height-sm: 24px`, Tabellenzellen vertikal `--u-space-1` statt `--u-space-2` (über eine neue Variable `--u-cell-pad-y`, die in Table.module.css eingesetzt wird – seit `umriss-table` 14 das Stylesheet von `@umriss/table`), Card-Body `--u-space-3` statt `--u-space-4` (neue Variable `--u-card-pad`), Menü-Items 28 statt 32 px (Variable `--u-item-height`). **Vorgehen:** Zuerst diese drei Variablen in tokens.css mit den heutigen Werten anlegen und in den betroffenen CSS-Modulen einsetzen (Ergebnis pixelgleich zu heute – prüfen!), dann erst den compact-Block ergänzen. Nichts anderes darf sich verändern; insbesondere bleiben Schriftgrößen gleich. Demo: Umschalter im Kopf neben dem Thema („Komfortabel | Kompakt", als SegmentedControl aus B.6, sonst zwei Buttons). Hilfs-Hook `useDensity()` analog zu `useTheme()` in der Demo.

---

### B.14 Druck-Stylesheet und Reduced-Motion-Audit

- `src/styles/print.css` (in `src/index.ts` importieren): unter `@media print` – Tabelle ohne Toolbar/Pagination/Filter-Buttons/Auswahl-Spalte (Klassen aus Table.module.css über `:global`; die Tabelle steht seit `umriss-table` 14 in `@umriss/table`), Karten ohne Schatten mit 1-px-Rahmen `#ccc`, keine Popover/Toasts/Modals (`display: none`), Sticky-Header aufheben, Hintergründe weiß, Text schwarz, Seitenumbrüche `break-inside: avoid` für Karten und Tabellenzeilen. Demo: keine Änderung nötig; Prüfung über Druckvorschau.
- Reduced-Motion-Audit: `tokens.css` setzt die Dauer-Tokens bereits auf 0 ms. Prüfen, dass **jede** Animation und Transition in allen `.module.css`-Dateien ausschließlich diese Tokens nutzt (Suche nach Literalen wie `200ms`, `0.2s`, `linear infinite`); Literale durch Tokens ersetzen bzw. Endlos-Animationen (Spinner, Skeleton-Schimmer, ProgressBar unbestimmt) unter `prefers-reduced-motion` explizit anhalten. Ergebnis im Lieferbericht als Liste „Datei – Fundstelle – Änderung".

---

### B.15 Demo als Spielwiese („Live-Props")

Für die Demo (nicht für die Bibliothek): eine kleine Hilfskomponente `demo/PropSpielwiese.tsx`, die pro Kachel eine kompakte Kontrollleiste rendert (Schalter/Segmente für `size`, `clearable`, `disabled`, `presets`, `withSeconds` etc.) und die Komponente darunter live damit rendert; darunter ein `<pre>` mit dem daraus resultierenden JSX-Aufruf (Text, kopierbar). Optik: nutzt Switch und SegmentedControl (B.6). Anwenden auf: alle Picker, NumberInput, MultiSelect, Table (density/compact/striped; seit `umriss-table` 14 in der Demo von `@umriss/table`), Toast (Ton). Bestehende Beispiele bleiben zusätzlich erhalten (die Spielwiese ergänzt, ersetzt nicht).

---

## Teil C – Abnahme vor jeder Lieferung

1. `npm run typecheck` und `npm run build:demo` laufen fehlerfrei; falls Tests existieren (`npm test`), laufen sie durch.
2. **Regressionsdurchgang in der Demo** (hell **und** dunkel), unabhängig davon, was geändert wurde:
   - NumberInput: „12" tippen bleibt „12"; −/+ Hover-Einblendung, gedrückt halten, min/max deaktivieren die Taste; € / % Adornments; sm.
   - DateTimePicker/DateTimeRangePicker: „12" ins Stundenfeld tippen → Feld zeigt „12" und Fokus im Minutenfeld; 25.10. mit 02:30 → Früher/Später-Wahl; 29.03. mit 02:30 → Hinweis; Klick auf „Ganztägig" schließt das Panel **nicht**.
   - Range-Picker: erster Klick, Hover-Band, Tageszähler in der Fußzeile, zweiter Klick vor dem Start tauscht, Presets markieren sich, Leeren-× am Trigger schließt kein Panel, Panelbreite ist ab dem ersten Frame endgültig und ändert sich nicht (mit/ohne Sekunden, mit/ohne Presets, mit Zeitumstellungs-Hinweis).
   - Alle Popover: schließen bei Außenklick und Escape (Fokus zurück auf Auslöser), schließen **nicht** beim Scrollen, sondern wandern mit; klemmen am rechten Fensterrand.
   - MultiSelect: Klick in das Panel schließt nicht; Chips im Trigger passen sich nach Löschen neu ein.
   - Toast: Abtritt gleitet nach rechts, keine grauen Ecken.
   - Modal mit sehr viel Inhalt: nutzt Platz nach oben, Kopf/Fuß fest, nur Inhalt scrollt.
   - Table (seit `umriss-table` 14 in der Demo von `@umriss/table`): Sortieren, Filter, Auswahl über alle Seiten, Seitengröße, Zebra, compact.
   - Tastatur-Durchgang mit Tab durch eine ganze Kachel: nichts fängt den Fokus, sichtbarer Fokusring überall.
3. Kein Bezug zu HKM/Stellenplan irgendwo (Suche über das gesamte Projekt nach „hkm", „stellenplan").
4. Kein Breiten-/Höhen-Springen bei Zustandswechseln (Hover, Fokus, Öffnen) in neuen Komponenten.
5. Neue Komponenten: Demo-Kachel vorhanden, Kopfkommentar vorhanden, Export in beiden `index.ts`, `size` sm/md wo sinnvoll, dunkles Thema geprüft, `prefers-reduced-motion` respektiert, deutsche Notation.
6. Lieferbericht (kurz, als `CHANGELOG.md`-Eintrag): Was ist neu, was wurde geändert (mit Begründung), was ist offen, welche Entscheidungen wurden getroffen, die hier nicht vorgegeben waren.

Bei Unklarheiten in dieser Spezifikation: nicht raten und nicht „vorsichtshalber" etwas Bestehendes umbauen – die konservativste Lesart wählen und die Frage im Lieferbericht notieren.
