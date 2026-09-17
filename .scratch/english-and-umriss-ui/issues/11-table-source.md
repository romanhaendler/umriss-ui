# 11 — `@umriss-ui/table`, source and tests

Status: done
Type: task

Blocked by: 04

Spec: `.scratch/english-and-umriss-ui/spec.md` (Two renames avoid a word that is already taken)

## Scope

Runs in parallel with 06, 07 and 08. Owns `packages/table/src` (27 files) and `packages/table/tests-unit` + `tests-visual` (38 files).

The two renames the spec singles out live here:

- **`src/kern/` → `src/model/`.** Not `core/`: the path would be free, but "core" would then name both the package and the table's pure model layer, and `CONTEXT.md` keeps a section specifically to stop a word being used twice.
- **`kern/begleiter.ts` → `model/companion.ts`.** Not `state.ts`: "state" is taken by the charts — state series, state band, ADR-0007.

The rest, against the dictionary: `tabellenModell.ts` → `tableModel.ts`, `ansicht.ts` → `view.ts`, `bausteine.tsx` → `parts.tsx`, `frei.tsx` → `unbound.tsx`, `register.ts` → `registry.ts`, `leiste.tsx` → `toolbar.tsx`, `ausgabe.ts` → `export.ts`, `werte.ts` → `values.ts`, `spalte.ts` → `column.ts`, `spaltenfilter.tsx` → `columnFilter.tsx`, `typen.ts` → `types.ts`, `kontext.ts` → `context.ts`, `useTabelle.tsx` → `useTable.tsx`, `meldeliste/` → `alarms/`, `meldeModell.ts` → `alarmModel.ts`.

- The public API of the table renames with it: `TabellenStand`, `TabellenAnsicht`, `SortierStufe`, `SpaltenEintrag`, `initialeAnsicht`, `alsCsv`, `t.ansicht`, `sichtbareSpalten` and the rest. There are no consumers outside this workspace and its own demo.
- `typen.test-d.tsx` → `types.test-d.tsx` renames with its subjects; the type errors it asserts must still be errors.
- `tests-visual/`: `barrierefreiheit.spec.ts` → `accessibility.spec.ts`, `funktionen-*` → `features-*`, `seiten.ts` → `pages.ts`.

The prose headers here are among the densest in the repo — `registry.ts` states four guarantees that no lint can check, `companion.ts` explains a render-loop defect (table-filters D4). Translate them in full; they are the only record of why that code is shaped as it is.

## Acceptance

- `pnpm --filter @umriss-ui/table typecheck`, `test:unit` and `pnpm lint` pass.
- No German identifier, filename, CSS class or comment remains under `packages/table/src`, `tests-unit` or `tests-visual`.
- The type tests still fail to compile the cases they are meant to reject.
- No behaviour changed. If a rename uncovers a defect, record it here and fix it in a separate commit.

## What was done

27 files under `src`, 29 under `tests-unit`, 9 under `tests-visual`. `kern/` →
`model/`, `kern/begleiter.ts` → `model/companion.ts`, and the rest against the
dictionary. The dense headers — `registry.ts`'s four guarantees, `companion.ts`'s
render-loop defect (table-filters D4), `alarmModel.ts`'s four-valued lifecycle
state, `VerdictColumn.tsx`'s three decisions — were translated in full, not
shortened.

No defect was uncovered, so there is no second commit.

### Where the line was drawn: identifiers move, values stay

Identifiers changed, string-literal **values** did not. A value stayed German
wherever it is a contract with something outside this ticket:

- the limit model and `data-urteil` (pinned by ticket 04),
- freshness values (`"alt"`, `"abgerissen"`) and `VirtualOptions.zeilenHoehe` /
  `puffer`, which belong to `@umriss-ui/core`,
- values a caller writes and the demo passes: `format="prozent" | "anzahl" |
  "datum" | "zeit" | "datumZeit"`, the four lifecycle literals, the three
  priorities, the transitions, `ReturnBand.direction`.

Literal unions internal to this package were translated, because nothing outside
reads them: `PartKind`, `ValueKind`, the result of `checkCondition`, the
`data-direction` values, and the opaque filter-key prefixes. `data-zustand`,
`data-prioritaet` and `data-aktualitaet` kept their names, because their values
stay German and `AlarmList.module.css` selects on the pair.

`AlarmColumn`'s seven column ids were translated (`"type"`, `"lifecycle"`,
`"priority"`, `"acknowledgement"`, `"raised"`, `"age"`, `"frequency"`): they are
this package's own sort and search keys, with no CSS selector and no
cross-package contract.

Developer-facing dev warnings were translated too — one of them named
`useTabelle`, so leaving them would have left the message lying.

### Added to CONTEXT.md

Four names the glossary did not have: `TableProjection` / `AlarmProjection` (the
model's computed output — deliberately not a **View**, which is what an
application keeps), `TableInput` (not `…State`, ADR-0007), `TableRef`, and
`ReturnBand` (avoiding "threshold", an avoided word for a **Limit**).

### What had to be touched in `demo/`

Only what the typecheck demanded — identifier positions, never prose. Imports
and call sites (`useTabelle` → `useTable`, `Tabelle` → `Table`, `spalte`,
`spaltenFilter`, `meldeModell`, `quittiere`, `Meldung`, `Meldungsart`), member
and option names (`initialeAnsicht`, `t.ansicht`, `t.auswahl`, `t.gefiltert`,
`t.sichtbar`, `t.setSeite`, `t.alsCsv`, `vorfilter`, `virtuell`, `nachkomma`),
the alarm-model and own-filter call sites in `beispiele/AlarmList/` and
`beispiele/Filter/`, the `{ spalte, richtung }` sort literals, and the `types:` /
`exports:` name strings in `gliederung.ts` that the props generator reads. German
comments, JSX text and `export const titel` strings in `demo/` were left for
ticket 12.

One rename needed a second thought: `columnFilter.test.tsx` gave its column the
id `stock`, which is also a field of its row type, so the typed `setFilter`
overload applied and rightly rejected the filter's own condition. The id is
`level` again, as the German original's `lage` was — a non-field id is the point
of that case.
