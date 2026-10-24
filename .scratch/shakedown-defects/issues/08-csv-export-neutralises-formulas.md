# 08: CSV export neutralises formulas

Spec: `.scratch/shakedown-defects/spec.md` (Table: CSV formulas)
Finding: `table.md` 1

**What to build:** the table's CSV writes a text value - a cell or a column
label - whose first character is `=`, `+`, `-`, `@`, a tab or a carriage
return with a leading apostrophe, before quoting. Numbers, booleans and dates
are untouched, so `-3` stays a number. A file without such text is the same
byte for byte. The clipboard copy of a selection is not changed. ADR-0061 is
amended by one paragraph: such text no longer reads back exactly, and why.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (table's csv test): `=1+1`, `+SUM(A1)`, `-x`, `@SUM(1)`, a leading tab and CR each come out neutralised
- [ ] A quoted formula (`=HYPERLINK("…")`) is neutralised and correctly quoted; a label is neutralised
- [ ] A negative number, a boolean and a date export as before; the German file without triggers is unchanged
- [ ] ADR-0061 amended
- [ ] `pnpm check table` green
- [ ] Finding 1 struck from `.scratch/shakedown/table.md`
