# 02 — The dictionary

Status: done
Type: task

Blocked by: 01

Spec: `.scratch/english-and-umriss-ui/spec.md` (Solution; `CONTEXT.md` loses its parentheses)

## Scope

This ticket writes the word list that every later ticket obeys. **No source file is touched.** It exists so that tickets 06–12 can run in parallel without talking to each other: two branches renaming the same German word in different files agree because both read this table, not because one saw the other.

Rewrite `CONTEXT.md`:

- **Drop the German parentheses** from all 86 bilingual entries. "Series (Serie)" becomes "Series". Keep every `_Avoid_` list — after this change they carry more of the disambiguation work, not less.
- **Rewrite the language rule at the top.** It currently says identifiers are German and the German word is the one to grep for. It now says the codebase is English throughout, and points at ADR-0018.
- **Give the 14 German-only terms an English word.** Proposals below; the five marked ⚠ collide with an existing entry and are settled in ticket 15 — carry them over unchanged for now and leave the section's "not yet reconciled" marker in place.
- **Add the `core` sentence**: core is the component library itself, the package you install first — not a shared base. `charts` deliberately depends on nothing.
- **Add a "Module names" section** with the table below, so a later reader can see why a file is called what it is called.

### Glossary terms

| German | English | note |
|---|---|---|
| Vokabular | Vocabulary | |
| Kante | Edge | |
| Ton | Tone | |
| Bewegungsursprung | Motion origin | |
| Maß | Measure | |
| Thema | Theme | |
| Benannte Ausnahme | Named exception | |
| Anbieter | **Provider** | deletes the `_Avoid_: Provider` line — see spec |
| Wortlaut | **Wording** | |
| Ebene | Layer | ⚠ collides with **Level** (tree node) |
| Kachel | Tile | ⚠ collides — already on an `_Avoid_` list above |
| Skala | Scale | ⚠ collides with **Scale** (axis mapping) |
| Raster | Month grid | ⚠ collides — "no layout grid exists or should" |
| Zustands-Kanon | Interaction-state canon | ⚠ collides with **State** (a state is a number, ADR-0007) |

### Module and directory names

| German | English | why not the obvious one |
|---|---|---|
| `table/src/kern/` | `model/` | not `core/` — that would name both the package and the table's model layer |
| `kern/begleiter.ts` | `companion.ts` | not `state.ts` — "state" is taken by the charts |
| `demo/werkzeug/` | `tooling/` | not `tools/` — "Tool" is a tool of a dock |
| `kern/tabellenModell.ts` | `tableModel.ts` | |
| `kern/ansicht.ts` | `view.ts` | |
| `bausteine.tsx` | `parts.tsx` | |
| `frei.tsx` | `unbound.tsx` | the header's own word: they need no binding |
| `register.ts` | `registry.ts` | |
| `leiste.tsx` | `toolbar.tsx` | |
| `ausgabe.ts` | `export.ts` | |
| `werte.ts` | `values.ts` | |
| `spalte.ts` · `spaltenfilter.tsx` · `filter.tsx` | `column.ts` · `columnFilter.tsx` · `filter.tsx` | |
| `typen.ts` · `kontext.ts` · `useTabelle.tsx` | `types.ts` · `context.ts` · `useTable.tsx` | |
| `meldeliste/` · `meldeModell.ts` | `alarms/` · `alarmModel.ts` | |
| `huelle` · `gliederung` · `beispiele` · `pruefung` | `shell` · `outline` · `examples` · `checks` | |
| `lib/sprache/` · `wortlaut.ts` · `formate.ts` | `lib/language/` · `wording.ts` · `formats.ts` | |
| `lib/anbieter/` · `glyphen/` · `aktualitaet.ts` | `lib/provider/` · `glyphs/` · `freshness.ts` | |
| `lib/grenzwert.ts` · `suche.ts` · `virtuell.ts` · `optionen.ts` | `limit.ts` · `search.ts` · `virtual.ts` · `options.ts` | |
| `lib/rolleVonTon.ts` · `portalZiel.ts` · `idTeil.ts` | `roleFromTone.ts` · `portalTarget.ts` · `idPart.ts` | |
| `DatePicker/bereich.ts` · `raster.ts` · `zeit.ts` · `vertrag.ts` | `range.ts` · `grid.ts` · `time.ts` · `contract.ts` | |
| `Kalender.tsx` · `ZeitFeld.tsx` · `BereichsPanel.tsx` · `BereichsTrigger.tsx` | `Calendar.tsx` · `TimeField.tsx` · `RangePanel.tsx` · `RangeTrigger.tsx` | |
| `TreeView/baumModell.ts` · `useBaum.ts` | `treeModel.ts` · `useTree.ts` | |
| `Textarea/mass.ts` · `NumberInput/zahl.ts` · `Dock/platz.ts` · `DataViz/skala.ts` | `measure.ts` · `number.ts` · `place.ts` · `scale.ts` | |

**One open question this ticket must answer, not defer.** The glossary reads "Verdict (Bewertung, Urteil)" — two German words for one English term, and both are public names (`Bewertung`, `Urteil`, plus the function `bewerte`). English needs two words or one. Decide here and record it; ticket 04 renames against whatever this says.

## Acceptance

- `CONTEXT.md` contains no German prose outside the section marked "not yet reconciled".
- Every term in the two tables above has exactly one English word recorded.
- `grep -c '(' ` over the term headings finds no bilingual parentheses.
- The `Bewertung`/`Urteil` split is decided and written down.
- No file outside `CONTEXT.md` changed.
