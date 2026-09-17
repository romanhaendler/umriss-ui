# 08 — `core` components L–Z

Status: done
Type: task

Blocked by: 04

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Scope

Runs in parallel with 06, 07 and 11. Owns 64 files under `packages/core/src/components/` and their unit tests.

Components: **Layout, Menu, Modal, MultiSelect, NumberInput, Popover, RadioGroup, Select, Skeleton, Spinner, Stat, Tabs, Tag, Textarea, Toast, Tooltip, TreeView, Typography, VisuallyHidden.**

- `TreeView/` is the heavy one (6 files): `baumModell.ts` → `treeModel.ts`, `useBaum.ts` → `useTree.ts`, and the flattening vocabulary inside them (`Flachlegung`, `Flacheintrag` — the glossary already has Flattening and Flattening entry).
- `Textarea/mass.ts` → `measure.ts`; `NumberInput/zahl.ts` → `number.ts`; `Popover/position.ts` unchanged.
- `TagGruppe` was already renamed in ticket 04 as a public name; its internals belong here.
- CSS-module class names included.
- Matching tests in `core/tests-unit/`: `baumBedienung`, `baumModell`, `baumSucheUndGroesse`, `mass`, `modal`, `popover`, `position`, `radioGroup`, `stat`, `tag`, `textarea`, `toast`, `tooltip`, `zahl`.

## Acceptance

- `pnpm --filter @umriss-ui/core typecheck` and `test:unit` pass; `pnpm lint` clean.
- No German identifier, filename, CSS class or comment remains in the nineteen directories or their tests.
- Baselines not touched.

## What was found on the way

**The ticket's premise "props are already English" was wrong twice.** `Stat` carried six
German props and `TreeView`/`TreeSearch` one. Both were renamed and the new names are in
`CONTEXT.md` under Public names: `einheit`·`nachkomma`·`grenzwerte`·`verlauf`·`stand`·`schwellen`
→ `unit`·`decimals`·`limits`·`history`·`asOf`·`ages`, and the `baum` prop → `tree`. The blast
radius stayed inside `packages/core` (four `Stat` demo examples, one tree demo, the tests):
nothing in `packages/table` or `charts` uses them, so this did not become a cross-package rename.

**A defect from ticket 04, repaired by the correct rename.** `Stat.tsx` already read
`styles.age` while `Stat.module.css` still defined `.alter`, so that span had been rendering
`className="undefined"` and the as-of line had lost its colour. Renaming the class to `.age`
restores it. This is a deliberate pixel change: a `Stat` baseline will now differ *for a reason*.

**`BaumZustand` became `TreeSnapshot`, not `TreeState`.** **State** is the charts' word
(ADR-0007) and `CONTEXT.md` already renders `TabellenStand` as `TableSnapshot`.

**The tree's `bereich` became `keysBetween`, not `range`.** `DatePicker/bereich.ts` (ticket 07)
will claim `range`, and both leave `core` through the same barrel — one grep, two answers.

**`propsStandard.test.ts` (ticket 09) would have hard-failed this whole wave.** Its guard
regex-matches the German marker word in prop JSDoc and pins three props via `it.each`; the
moment any ticket translates "Standard: …" to "Default: …", those pins read `undefined`. The
regex now accepts both words. Tickets 06, 07 and 11 need this fix too, or their prop JSDoc
translations break the same test.

## Left for other tickets — deliberately not touched

- `lib/useVirtual.ts` / `lib/virtual.ts` still expose German field names (`zeilenHoehe`,
  `puffer`, `von`, `bis`, `fuellerVor`, `fuellerNach`, `zeigeZeile`, `beiScroll`). `TreeView`
  consumes them verbatim. They are ticket 04's surface and `packages/table` shares them.
- `data-zeile` is the measurement contract between `lib/useVirtual` and the table; `TreeView`
  keeps setting it. Renaming it here alone would silently break row measuring.
- `lib/glyphs` still exports `WinkelGlyph`, `KreuzGlyph`, `GriffGlyph`, `RasterGlyph`,
  `MassGlyph`; `lib/dialogChoreography.ts` still returns `beimSchliessen`/`beimAbbrechen`.
  Both are used from A–K as well, so they cannot be renamed from one branch.
- `Tooltip.tsx` references `styles.below`/`styles.above`, which `Tooltip.module.css` never
  defined — `cx` drops them, so nothing renders differently. A pre-existing defect, left
  untouched because fixing it means inventing CSS rules: it wants its own commit.
- German string literals that come from `Wording` (`tag.test.tsx`'s "entfernen", `stat.test.tsx`'s
  „kein Wert") stay until ticket 13, as does `radioGroup.test.tsx`'s verbatim `TESTS.md` quotation.
- `Stat`'s wire format is untouched as instructed: `urteil`, `grenzwerte` inside a `LimitSet`,
  `abweichung`, `wert`, `seite`, `stufe`, `sollwert`, the verdict and freshness string literals,
  and the attribute names `data-urteil` / `data-aktualitaet`.
