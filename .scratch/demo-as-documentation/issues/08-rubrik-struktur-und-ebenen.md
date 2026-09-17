# 08 — Rubrik Struktur und Ebenen: eleven pages

Status: done

Blocked by: 03, 05

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

Tabs · Menu · Tooltip · Popover · Modal · ConfirmDialog · Toast ·
CommandPalette · TreeView · Dock · Stack und Grid

The rubric with the most existing reasoning and the most panels that are really
small applications.

**Demonstrations that stay**: `TreeView` (the flattening, keyboard movement and
virtualisation are one behaviour) and `Dock` (four resting places, the turn, the
grip — a static example would show none of it). Everything else decomposes.

**`Popover` and `Stack und Grid`** have never been shown. `Popover` is the seam
underneath `Menu`, `Tooltip`, `Select` and the pickers
(`.scratch/popover-seam/`); its page is where a reader learns that those five
share one dismissal and one placement policy.

**`CommandPalette`** is a special case worth stating: the demo shell *uses* it
for its own navigation, and its page shows it doing something else — running
commands rather than going places. Both belong on the page, and the distinction
between finding a place and taking an action is already in `CONTEXT.md`.

**JSDoc to write**: Tabs 0/7 · CommandPalette 10/24 · Popover 8/16 ·
ConfirmDialog 2/9 · Modal 2/8 · Layout 3/8 · Menu 3/6 · TreeSearch 0/1. `Tooltip`
(3/3), `TreeView` (4/4) and `Dock` (13/16) are nearly or fully done.

**"Warum so"** — the richest set in the library, and most of it already written
somewhere:
- `TreeView`: ADR-0003 (an active node is not a selection), ADR-0004 (a flat
  accessibility tree). Link them; do not retell them.
- `Dock`: ADR-0013 (a dock snaps), ADR-0014 (a turn that cannot be a
  transition). The two existing `hinweis` paragraphs on the dock panel move here.
- `Modal`, `Popover`, `CommandPalette`: ADR-0012 (a translucent material needs a
  floor), and the palette's own header comment on why it is not a parameterised
  `Modal`.
- `Popover`: `.scratch/popover-seam/` and `.scratch/pure-logic-seams/`.

## Acceptance

- Eleven pages; demonstrations only on `TreeView` and `Dock`.
- `Popover` and `Stack und Grid` have pages with examples that stand on their
  own — not a screenshot of `Menu` relabelled.
- Every ADR listed above is linked from the page it governs, and no ADR's
  content is duplicated into a page.
- The gate fails for any bare prop on these eleven components.
- `useCommandPaletteShortcut` is documented on `CommandPalette`, `useToast` on
  `Toast`.
- Every assertion from `funktionen-baum.spec.ts` and `funktionen-dock.spec.ts`
  survives against the new addresses.
- Baselines regenerated; suite passes.

## Notes

Overlays are the components whose baselines are most likely to be flaky —
`Modal`, `Toast`, `Menu` and the palette all animate in. The existing suite
handles this with `animations: "disabled"`; keep every example in a resting
state and photograph nothing mid-transition, as ADR-0014's own testing note
already argues for the dock.

`Stack und Grid` on one page is the spec's decision and not an oversight. If
writing it proves the two really are separate ideas, say so in the handover
rather than splitting it quietly.

## Comments

**Delivered, together with ticket 03** — see the reasoning there: the bridge was
the way to an intermediate state, and there was none.

Every page of this rubric has at least one example; the JSDoc gaps of these
components are closed, and the gate is unconditional for them.
