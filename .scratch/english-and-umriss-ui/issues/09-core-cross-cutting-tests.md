# 09 — `core`: the cross-cutting tests

Status: done
Type: task

Blocked by: 07, 08

Spec: `.scratch/english-and-umriss-ui/spec.md` (Testing Decisions)

## Scope

The tests in `core/tests-unit/` and `core/tests-visual/` that belong to no single component, so they could not travel with a subject in 07 or 08. Second wave: it needs both component tickets landed.

- Guards and conformance: `stylesheets.test.ts`, `propsStandard.test.ts`, `kontrast.test.ts` → `contrast`, `themeFallbackKonformitaet.test.ts` → `themeFallbackConformance`, `grenzwertKonformitaet.test.ts` → `limitConformance`, `kennungen.test.ts` → `identifiers`, `readmeTabelle.test.ts` → `readmeTable`.
- Lib-level: `aktualitaet` → `freshness`, `grenzwert` → `limit`, `optionen` → `options`, `suche` → `search`, `virtuell` → `virtual`, `sprache` → `language`, `formateCharakterisierung` → `formatsCharacterisation`, `wortlautQuelle` → `wordingSource`, `anbieter` → `provider`.
- `demo-rauchtest.test.tsx` → `demo-smoke.test.tsx`, `setup.ts`.
- `tests-visual/` (9 files): `barrierefreiheit.spec.ts` → `accessibility.spec.ts`, `funktionen-*.spec.ts` → `features-*.spec.ts`, `seiten.ts` → `pages.ts`, `navigation.ts`.
- `demo/werkzeug/readmeTabelle.ts` → `demo/tooling/readmeTable.ts` and the `readme` script in the manifest.

**Named exceptions carry their justification.** `CONTEXT.md` defines a named exception as a deliberate deviation recorded at its site with a measurement and a reason — several live in `kontrast.test.ts` and `themeFallbackKonformitaet.test.ts`. Translate the reason; never drop it, and never loosen the bound it hangs off.

## Acceptance

- `pnpm --filter @umriss-ui/core typecheck`, `test:unit` and `pnpm lint` pass.
- No German identifier or comment remains under `core/tests-unit` or `core/tests-visual`.
- Every named exception still states its measurement and its reason, in English.

## Notes

**Two files were left untouched, as instructed:** the two conformance tests that
reach into `packages/charts`. They have since been renamed and translated on
`main` to `limitConformance.test.ts` and `themeFallbackConformance.test.ts`, and
already cite `contrast.test.ts`, which is the name used here. This worktree
branched before that landed, so it still carries them under their old names -
untouched either way, and the merge takes `main`'s versions. `limit.test.ts`
names `limitConformance.test.ts` in its header.

**Import paths deliberately left German**, because ticket 10 renames their
targets and ticket 06 renames the charts fixture. Each is one line, and each is
marked with a comment in its file:

- `tests-unit/demo-smoke.test.tsx` — `../demo/Anwendung` (and the `Anwendung`
  binding), `../demo/beispiele`, `../demo/gliederung`.
- `tests-unit/propsStandard.test.ts` — `../demo/gliederung`.
- `tests-visual/pages.ts` — `../demo/gliederung`, and the path segment
  `join(…, "demo", "beispiele")`.
- `tests-visual/navigation.ts` — `../demo/gliederung`.
- `tests-unit/limit.test.ts` — `../../charts/tests-unit/grenzwertFaelle` with
  `GRENZWERT_FAELLE` and `Fall`.

**Values that stay German on purpose.** The limit model's field names
(`wert`, `seite`, `stufe`, `grenzwerte`, `sollwert`, `urteil`,
`ueberschreitung`, `abweichung`) and its `"warnung"`/`"oben"`/`"frisch"`
literals; `FreshnessAges`' `alt`/`abgerissen`; the row window's `anzahl`,
`zeilenHoehe`, `sichtHoehe`, `puffer`, `von`, `bis`, `vorher`, `nachher`,
`kopfHoehe`; the matcher's `kandidat`, `rang`, `fundstellen`, `gruppe`,
`gewicht`; the provider's `dichte` prop and `data-dichte`; the props reader's
`typen`, `beschreibung`, `standard`; the `Page` shell prop `seite`. Every
shipped wording assertion, every demo selector text, every `data-baustein` /
`data-beispiel` / `data-dock` / `data-rolle` / `data-place` selector, and every
`.png` baseline name are unchanged — the baselines belong to ticket 16, the
wording to 13. `readmeTable.ts` still searches for the heading
`"## Komponenten"`, because the shipped README is German until ticket 14.

**Stale pointers my renames created, fixed in the same commit** (filenames only,
no prose): `src/lib/search.ts`, `src/styles/tokens.css`,
`tests-unit/commandPalette.test.tsx`, `packages/demo/checks/accessibility.ts`,
`packages/demo/src/page.css`.

**Left for a later ticket.** `packages/demo/checks/shell.ts` names
`packages/<package>/tests-visual/funktionen-huelle.spec.ts` generically; the
table's spec still carries that name until ticket 11, so renaming it here would
only move which half is wrong. `packages/core/BAUM.md` and root `TESTS.md` name
several of the files renamed here and are ticket 14's.
