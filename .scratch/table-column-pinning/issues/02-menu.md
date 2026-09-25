# 02 - Pinning in the column menu

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/table-column-pinning/spec.md`

## Scope

N2, wording EN/DE.

## Acceptance

- Interaction test.

## Comments

**Done (2026-09-25).** Two keys per entry beside the move keys, not a menu of
three entries: a `Menu` inside the column menu's `Popover` portals to the body,
where the outer popover reads its click as an outside click and closes. So the
three wishes live on two keys - "Pin X to start" and "Pin X to end"; the key of
the side a column is pinned to stands in the accent and reads "Unpin X". The
focus stays on the pressed key while the entry moves to its block (the same
mechanism as the move keys, generalised to a selector).

Wording in core's register, English and German: `pinColumnToStart`,
`pinColumnToEnd`, `unpinColumn` ("am Anfang fixieren", "am Ende fixieren",
"lösen"); core's changelog under Changed.

Tests: jsdom (the menu's order, the three labels, pin/move across/unpin, moves
kept inside a block, German); Playwright interaction in
`features-browser.spec.ts` (pin to the end, it sticks, the focus stays, back);
the open menu photographed in both themes (`pinning-menu`).

For 03: the two 10 px glyphs (a bar with an arrow towards it) and whether the
entry wants its keys grouped.
