# 06 — `@umriss-ui/charts`, whole

Status: done
Type: task

Blocked by: 03

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Scope

Runs in parallel with 07, 08 and 11. Blocked only by 03, not by 04: charts depends on nothing (ADR-0016, R-1.2) and carries its own demo shell, so it shares no file with any other ticket in this wave. It is the smallest complete package and therefore the effort's proving run — what it learns about translating the prose headers is worth writing into its commit message.

- `src/` (38 files): `balken.ts` → `bars.ts`, `betriebszeit.ts` → `operatingTime.ts`, `grenzwert.ts` → `limit.ts`, `regelkarte.ts` → `controlChart.ts`, `spanne.ts` → `span.ts`, `zellen.ts` → `cells.ts`, `zustand.ts` → `state.ts`, and every identifier inside all of them.
- `tests-unit/` (20 files) — they travel with their subject, in this ticket, so no later ticket has to repair an import path.
- `tests-visual/` (4 files) and `demo/` (8 files): `Huelle.tsx` → `Shell.tsx`, `gliederung.ts` → `outline.ts`, `daten.ts` → `data.ts`.
- The German prose headers: **translated in full, not shortened.** They carry the reasoning — see `scene.ts`, `materialize.ts`, `regelkarte.ts`.

Against the dictionary from ticket 02 throughout. Where a word is missing from it, add it there rather than deciding locally.

## Acceptance

- `pnpm --filter @umriss-ui/charts typecheck` and `test:unit` pass; `pnpm lint` clean.
- No German identifier, filename or comment remains under `packages/charts`.
- Baselines are expected to fail where visible text changed; do not update them. Ticket 16 owns that.

## Two things to know before starting

**You must update a test that lives in core.** `themeFallbackKonformitaet.test.ts`
sits in `core/tests-unit/` and reads `charts/src/theme.ts` and
`charts/src/styles/charts.css`: its `Feld` type and its `PAARE` table name
`colorWarnung`, `colorAlarm`, `--uc-color-warnung` and `--uc-color-alarm`. When
you rename those in charts, that test must move with them **in your commit** -
otherwise core is red and ticket 09, which owns the test, does not run until
after your wave. It is the one file outside `packages/charts` this ticket may
touch, and nothing else in that wave touches it.

**The limit model is shared and is pinned by a runtime comparison.**
`charts/src/grenzwert.ts` is one of the two copies ADR-0006 keeps, and
`core/tests-unit/grenzwertKonformitaet.test.ts` runs both from
`charts/tests-unit/grenzwertFaelle.ts` and compares them **structurally** - by
the field names `urteil`, `grenzwert`, `ueberschreitung`, `abweichung` and by
`{ wert, seite, stufe }`. Ticket 04 renamed the types and functions on core's
side only and left those field names and the `"warnung"`/`"oben"` literals
German in both, precisely so this test kept passing.

So: rename the charts file to `limit.ts` and its types and functions to match
core's (`Verdict`, `Assessment`, `assess`, `LimitSet`, `Limit`, `verdictWeight`),
but **do not rename the field names or the string literals** unless you also
move core's copy, the case table and the conformance test in the same commit.
If you do take that on, it is one commit across all four, and it is the last
cheap moment for it. See ticket 04's Findings.

## Finding: three of the filenames this ticket named cannot exist

Two collisions were measured, not guessed, and both changed a name this ticket
had already chosen.

**`span.ts`, `controlChart.ts` and `limit.ts` cannot sit beside `Span.tsx`,
`ControlChart.tsx` and `Limit.tsx`.** macOS is case-insensitive, so an import of
`./Span` resolves to `span.ts`; TypeScript then reports TS1149 ("File name
'Span.ts' differs from already included file name 'span.ts' only in casing")
*and* TS2305, because it found the wrong module. A probe confirmed it before a
line was renamed. `cells.ts` had recorded exactly this hazard in its own header
("on a file system that does not distinguish upper and lower case, matrix.ts and
Matrix.tsx would be the same file") and the ticket's own `bars.ts` and `cells.ts`
avoid it — the three remaining names did not. So: `spanne.ts` → **`spans.ts`**
and `regelkarte.ts` → **`controlLimits.ts`** (named after what it computes, as
`bars.ts` and `cells.ts` are), keeping the components untouched.

**`Grenzwert` → `Limit` collides with the `<Limit>` component.** `index.ts` would
export a component and a type under one name, which is TS2300 ("Duplicate
identifier"), also confirmed by probe. The model won the bare word — it is the
copy ADR-0006 keeps in step with core, and the ticket asked for `Limit`
explicitly — so the **component** yielded: `<Limit>` is now **`LimitLine`** in
`LimitLine.tsx`, beside the unchanged `<LimitBand>`. That let `limit.ts` keep the
name the ticket wanted. Its props moved with it: `von`/`bis` → `from`/`to`,
`stufe` → `severity`, `imBereich` → `inExtent`. This is charts' only public
rename that the language change did not itself require; it is recorded in
`CONTEXT.md` under **Public names** so nobody fixes it back.

## Finding: three files in core had to move, not one

The ticket permits one file outside the package. Renaming
`tests-unit/grenzwertFaelle.ts` → `limitCases.ts` and `src/grenzwert.ts` →
`limit.ts` breaks two *more* core tests that import them by relative path:
`grenzwertKonformitaet.test.ts` (also `bewerte` → `assess`) and
`grenzwert.test.ts`. Both were updated to the minimum: import paths and imported
names, plus the case table's own `gruppe` → `group` and `erwartet` → `expected`.

The table's **model-shaped** fields were deliberately left German — `wert`,
`satz`, and inside the expectations `urteil`, `grenzwert`, `ueberschreitung`,
`abweichung`, `grenzwerte`, `sollwert`, `seite`, `stufe` and the
`"warnung"`/`"oben"` literals. That is the boundary this ticket draws, and it is
why the conformance test still compares both versions structurally without a
single change to its body. `severity` therefore reads `severity="warnung"`:
half-English on purpose, because the value is the wire format and the field name
is not.

## Finding: the example ids moved, so 26 baseline files are now orphaned

The demo's addresses were German (`#betrieb/grenzen-und-zustand`, `uebersicht`,
`mehrserien`, `groessen`, …) and are now English (`#operation/limits-and-state`,
`overview`, `multi-series`, `sizes`, …). A screenshot is named after its example,
so **ticket 16 will not find 26 moved images — it will find 26 missing ones and
26 stale files to delete.** The old names are `achsen`, `basis`, `belegungsplan`,
`betriebszeit`, `gemischt`, `grenzen-und-zustand`, `groessen`, `konfiguration`,
`matrix`, `mehrserien`, `pareto`, `regelkarte`, `uebersicht` × hell/dunkel. The
project names in the filenames (`charts-hell`, `charts-dunkel`) are still German:
they come from the root `playwright.config.ts`, which is shared with core and
table and belongs to no ticket of this package. The two `test.skip` conditions
that read `endsWith("dunkel")` were left as they are for the same reason, with a
comment saying so.

## Not done here, and why

- **`STATUS.md`** (670 lines) and **`CHANGELOG.md`** (104 lines) under
  `packages/charts` are still German. Neither is in this ticket's file list, and
  ticket 14's acceptance ("no German prose remains") covers both — it owns the
  changelogs by name. Both now describe renamed identifiers (`onVerletzungen`,
  `kalender`, the old example ids), so ticket 14 is translating *and* correcting
  them, not only translating.
- The package manifest's `description` was German and owned by nobody; it is
  English now.

## Verification

`pnpm --filter @umriss-ui/charts typecheck` clean · `test:unit` 18 files, 365
tests passed · `pnpm --filter @umriss-ui/core typecheck` clean · `test:unit` 44
files, 940 tests passed · `pnpm lint` clean. `test:visual` deliberately not run:
ticket 16 owns the baselines and the suite pins ports 4173-4175.
