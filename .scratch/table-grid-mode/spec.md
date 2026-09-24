# The table as a grid: cell by cell, and editable

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

Every mature grid lets a reader move cell by cell with the arrows (the ARIA grid
pattern) and edit a cell in place; umriss's table is a native `<table>` - right
and robust for reading, but it carries no editing. On a plant screen editing is
daily: setpoints, comments, the text an acknowledgement carries. The pattern is
in the house already: the charts' one tab stop with one active position
(ADR-0030) and core's active node (ADR-0003).

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| G1 | Opt-in | `<Table grid>` switches the grid mode on: `role="grid"` (`treegrid` with group lines), one tab stop, an **Active cell** walked by the arrows, Home/End in the row, Ctrl+Home/End to the table's ends, PageUp/PageDown by the visible rows. Without it, the native table stays - reading tables lose nothing. |
| G2 | Interactive content in cells | In the grid, a cell's own controls (row actions, checkbox) are reached with Enter/F2 and left with Escape (the APG grid's widget mode). |
| G3 | Editing | A column declares `edit` (`"text" | "number" | "select" | "date"` or its own render); Enter/F2 or typing starts it, Enter commits, Escape cancels, Tab commits and moves on. Controlled: `onCellEdit({ rowKey, columnId, value })` reports, the table applies nothing (the schedule's intent pattern, ADR-0023). |
| G4 | Validation | `validate(value, row)` per column returns a message or nothing; an invalid edit stays open with the message as the field's error, as `FormField` shows it. |
| G5 | Editors | The core fields: `Input`, `NumberInput`, `Select`, `DatePicker` - table already depends on core (ADR-0016). |
| G6 | Virtualisation | The active cell survives virtualisation: it is state, not DOM focus alone; scrolling it into view is the grid's job (AG Grid's `ensureDomOrder` lesson). |
| G7 | Glossary and ADR | **Active cell**; an ADR "the table becomes a grid only on request" (the trade-off native table vs grid). |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The grid walk as a pure module | M |
| 02 | Grid mode | L |
| 03 | Cell editing | L |
| 04 | Examples and capabilities | S |
| 05 | Final polish round | S |

## Testing

The walk as a pure module first; the edit lifecycle at the table's public
interface; Playwright interaction tests; axe with the grid roles.

## Out of scope

Range selection, clipboard, undo (deliberately not, see the non-goals ADR);
row-level edit forms.
