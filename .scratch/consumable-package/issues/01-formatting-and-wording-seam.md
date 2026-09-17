# 01 — Formatting and wording seam

Status: done

Spec: `.scratch/consumable-package/spec.md`

## Scope

Collect the German locale, currently fixed at twelve points across five modules,
and the German wording currently embedded in eleven components, into one
overridable seam.

- Carries every formatter: date, time with and without seconds, the combined
  format, the offset label, number formatting at each decimal precision, the
  percentage format, and text collation.
- Carries the wording as a **dictionary of entries** named for what they label —
  not a translation function. Every entry the library uses is present in the
  default dictionary; a missing override falls back to the default rather than
  rendering an empty string or a key.
- German is the default and the only language shipped. An application may
  override individual entries; it may not select a different bundled language,
  because there is no other bundled language.

## Acceptance

- **Write the characterisation tests first**, against the current scattered
  implementations. Then move the implementations. Then confirm the tests pass
  unchanged. Doing it in the other order proves only that the new code agrees
  with itself.
- Output-identical for every formatter, including the details easiest to lose:
  two-digit padding, the offset label for the ambiguous hour at the end of
  summer time, the collation used to order text, and the thousands separator
  that appears only on leaving a field.
- No screenshot baseline moves. If one does, a formatter was not
  output-identical and that part is reverted rather than re-baselined.

## Notes

Do this first of the six. It is the piece that gets worse with time — every new
component adds another fixing — and it is the riskiest, with all of the risk in
the details.

The summer-time handling is the most carefully built logic in the package and it
constructs its own formatter for the offset label. That is the one place where
"output-identical" must be verified rather than assumed.

## Comments

**Umgesetzt, Aug. 2026.** Der Seam liegt in `packages/ui/src/lib/sprache/`:
`formate.ts` (zehn Formatter), `wortlaut.ts` (das Verzeichnis) und
`index.tsx` (Kontext, `useFormate`, `useWortlaut`, `verschmelzeSprache`,
`SpracheProvider`).

Reihenfolge wie gefordert: `tests-unit/formateCharakterisierung.test.tsx`
wurde **vor** dem Umzug gegen die verstreuten Implementierungen geschrieben
und ist seither unveraendert gruen – inklusive der doppelten Stunde am
25.10.2026, bei der frueh GMT+2 und spaet GMT+1 ergibt. Die Textsortierung
war bereits durch `tabellenModell.test.ts` gebunden, der Zaehler der
Filterleiste durch `filterLeiste.test.tsx`; beides wurde nicht verdoppelt.

Keine Baseline hat sich bewegt (74 Playwright-Tests gruen, kein PNG im Diff).

Zwei Entscheidungen, die im Ticket offen waren:

* **Reine Module lesen keinen Kontext.** `zahl.ts`, `zeit.ts`,
  `tabellenModell.ts` und `DatePicker/format.ts` reichen an die
  Voreinstellung durch; die Komponenten daneben lesen `useFormate()`. Wer
  die Tabelle anders sortieren muss, gibt der Spalte weiterhin ein eigenes
  `vergleich` mit – den Weg gab es schon.
* **Preset-Beschriftungen sind vom Schluessel getrennt.**
  `presetBereich` schaltet auf der kanonischen Bezeichnung; die sichtbare
  Beschriftung kommt aus `wortlaut.presets`. Sonst haette das Umbenennen
  von „Heute" die Rechnung dahinter verloren.
