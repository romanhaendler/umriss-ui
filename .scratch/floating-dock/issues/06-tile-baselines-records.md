# 06 — Tile, baselines, and the records

Status: done

Spec: `.scratch/floating-dock/spec.md`

## Scope

Everything that makes the dock part of the library rather than a folder in it.

- **Demo tile** in the `@umriss/ui` showcase, with `data-kachel`, added to the
  tile list in the package's `screenshots.spec.ts`. A dock over a stand-in
  surface with a handful of tools, one of them the mode, both gestures usable,
  all four places reachable. Deterministic: no random data, no wall clock.
- **Exports**: `Dock` and its public types from `src/index.ts`. Mind where the
  export is inserted — `index.ts` says in its own comments that export order
  decides bundle order and that two rules of equal specificity are settled by
  it. Check the baselines after inserting, and if something moves, say why in a
  comment there, as the existing entries do.
- **Baselines**: resting states only — four places, light and dark. No frame
  mid-turn.
- **Accessibility**: the tile through axe in both themes, WCAG 2.1 AA. Any
  suppression carries a named reason.
- **Glyphs**: whichever the tile needs. Reuse from `lib/glyphen` where they
  exist; otherwise draw to the `GLYPHEN.md` spec and add them to the set. Any
  deviation goes in that file's table with its reason.
- **Changelog** entry.
- **Header comment** on `Dock.tsx` in the house's manner: what it is, what it
  deliberately is not, and why it stands on neither `Popover` nor
  `TableToolbar`.

## Acceptance

- `pnpm test:unit`, `pnpm test:visual` and `pnpm lint` all pass.
- Baselines for existing tiles are unchanged, or the change is explained in
  `index.ts` where the export was inserted.
- The tile passes axe in both themes.
- `Dock` is importable from `@umriss/ui` and its types are exported with it.
- The changelog names the component and the two ADRs.

## Notes

The export-order note is not ceremony. `index.ts` carries two comments about
exactly this, one of them written after a two-pixel table shift that only the
screenshot baselines caught. Insert, run the visual suite, and read the diff
before assuming alphabetical is safe.

The header comment matters more than usual here, because two of this
component's decisions look like omissions in the code: the dock never holds a
coordinate, and the turn is hand-animated. Both have ADRs; the header comment is
what sends a reader to them.
