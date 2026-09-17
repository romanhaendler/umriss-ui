# 04 — What `@umriss/ui` must export for the table

Status: done

Spec: `.scratch/umriss-table/spec.md` · ADR-0016

## Scope

List every internal import of `packages/ui/src/components/Table/`, `components/AlarmList/` and `lib/useTableSelection.ts` that does not point at a module moving to `@umriss/table`, and make each reachable from `@umriss/ui`'s public entry. Known today:

- `useVirtuell`, `sichtFenster`, `scrollFuerZeile` and their types — exported only through the table's index, used by `TreeView`.
- `useDichteFuer` — check whether `lib/anbieter` exports it publicly.
- `cx` — the table should carry its own two lines rather than widen `@umriss/ui`'s surface for it.

Settle the spec's open item on wording: the table entries of `Wortlaut` stay in `@umriss/ui` (recommended) or move to a directory of the table's own.

Remove nothing.

## Acceptance

- Each module listed resolves every non-moving import from `@umriss/ui`'s public entry.
- `@umriss/ui` tests pass and its screenshot baselines do not move.
- The wording decision recorded under `## Comments` and in the spec.

## Comments

**Inventory.** Every import of `components/Table/`, `components/AlarmList/` and `lib/useTableSelection.ts` that does not point at a module moving to `@umriss/table`:

| Import | Used by | Public before | Now |
|---|---|---|---|
| `lib/virtuell` (`sichtFenster`, `scrollFuerZeile`, `Fenster`, `FensterEingang`, `ZeilenLage`) | `Table/index.ts` re-export, `TreeView` | only through the table's index | `export * from "./lib/virtuell"` in `src/index.ts` |
| `lib/useVirtuell` (`useVirtuell`, `VirtuelleZeilen`, `VirtuellOptionen`) | `useTabelle`, `Table`, `TableVirtualBody`, `TreeView` | the types through the table's index, the hook not at all | `export * from "./lib/useVirtuell"` |
| `lib/anbieter/kontext` (`useDichteFuer`) | `Table`, `AlarmList` | no (internal by design) | exported from `lib/anbieter/index.tsx` |
| `lib/cx` | every table module | no | stays internal; `@umriss/table` carries its own two lines |
| `lib/sprache` (`useWortlaut`, `useFormate`, `STANDARD_WORTLAUT`, `STANDARD_FORMATE`, `Formate`, `Wortlaut`) | all | yes | — |
| `lib/useAktualitaet`, `lib/aktualitaet` (types and hook) | `AlarmList` | yes | — |
| `lib/grenzwert` (`bewerte`, `schwere`, types) | `VerdictColumn` (new) | yes | — |
| `Button`, `Checkbox`, `Popover`, `Select`, `Tag`/`TagGruppe`, `Badge`, `VisuallyHidden`, `Menu`, `Input` | components | yes | — |

`lib/sprache/formate` was imported by `tabellenModell` through its file path; the copy imports `STANDARD_FORMATE` from the public entry. Nothing was removed.

**Wording decision: stay.** The table's entries remain in `@umriss/ui`'s `Wortlaut`. The entries `@umriss/table` needs beyond the old table's (column menu, export, search, row-named controls, absent value, booleans, footer kinds, entry counts, empty states) are added in a section headed `@umriss/table` in `lib/sprache/wortlaut.ts`. The reason is the one the spec gave: an application using both packages overrides wording with one `UmrissProvider` and one object, and a second directory would make that two acts with two sets of names. Recorded in the spec.

Verification: `@umriss/ui` typecheck green; the new exports carry no stylesheet, so the order of exports that the index's comments guard (it decides the order of module CSS in the bundle) is untouched. The unit and screenshot suites run with the full suite at the end of the implementation.
