# 09 — Virtualisation

Status: done

Spec: `.scratch/table-surface/spec.md`

## Scope

Render only the rows in view, so that scanning a very large table is scrolling
rather than a sequence of page turns.

- **Opt-in.** A small table must not pay for a large table's machinery.
- Its own scroll container.
- Must remain compatible with the sticky header and the sticky first column.
  This is the hard part and the reason this ticket is sized larger than the rest
  of the spec.
- When virtualisation is on, paging is **off**. The two are alternative
  strategies for the same problem, and offering both at once produces a control
  that contradicts itself.

## Acceptance

- Its own interaction test; screenshots cannot carry this, because what must be
  proven is behavioural:
  - scrolling reaches rows that were never rendered,
  - the sticky header and the sticky first column stay put throughout,
  - keyboard navigation into an unrendered region works,
  - row selection state survives a row leaving and re-entering the rendered
    window.
- Demo tile with a large generated data set, alongside the existing paged table
  so both strategies are visible.

## Notes

This is the one ticket in the spec that may reasonably be delivered on its own,
separately from the rest, and the one most likely to be deferred. Nothing else
in the spec depends on it.

Keyboard navigation into an unrendered region is the requirement that usually
gets missed. A virtualised table where the focus ring disappears into a region
that has not been rendered is worse than a paged one.

## Comments

**Implemented, Aug 2026.** Split into a pure calculation and what moves it:

* `Table/virtuell.ts` — the viewport window and a row's scroll target, without
  DOM, 18 unit tests. The assurance the scrollbar hangs on stands there as a
  test: `vorher + gerendert + nachher` always yields the full height.
* `Table/useVirtuell.ts` — scroll position, measured heights, `zeigeZeile`.
  The row height is **re-measured** against a real row, not believed: an
  assumption two pixels out adds up over twenty thousand rows to a scrollbar
  that lies by forty thousand pixels.
* `Table/TableVirtualBody.tsx` — filler rows and keyboard.

**Opt-in** via `useTabelle(..., { virtuell: { zeilenHoehe } })`. With that,
paging is off — enforced, not merely documented: the model is handed a page size
of zero, and `ansicht` carries neither `seite` nor `pro`.

**The hard part.** Filler rows rather than padding on the body, because a table
distributes height over its rows. Their single cell is explicitly exempted from
the rule for the sticky first column — otherwise it would lay itself over the
content as an empty surface. The sticky header needed nothing at all: it sticks
to the scroll container the table already had.

**Keyboard into unrendered regions** — the requirement that usually gets missed.
The row carries the focus (not the first control in it), arrow keys move,
<kbd>Home</kbd>/<kbd>End</kbd> jump. `zeigeZeile` subtracts the height of the
sticky header, otherwise the row lands behind it: scrolled to and still
invisible.

`aria-rowcount` on the table and `aria-rowindex` on the row: without them a
screen reader announces "row 3 of 21" in a table with twenty thousand.

**Tests.** 15 interaction tests in
`tests-visual/funktionen-virtuell.spec.ts`, exactly along the acceptance:
scrolling reaches rows never rendered, header and first column stay put, the
keyboard reaches the unrendered, and a selection survives its row leaving the
window. Plus the demo tile `tabelle-virtuell` with twenty thousand seed-based
rows, right beside the paged one.

**Side finding.** The second table on the demo page knocked over four existing
tests: they reached page-wide for `tbody tr` and `th`. The fault was always in
the selector; it is now narrowed to `[data-kachel="tabelle"]` and recorded in
TESTS.md as a convention.
