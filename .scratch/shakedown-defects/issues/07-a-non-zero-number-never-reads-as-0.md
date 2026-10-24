# 07: A non-zero number never reads as 0

Spec: `.scratch/shakedown-defects/spec.md` (Core: tiny numbers; Calculation)
Finding: `data-science.md` 1

**What to build:** core's `number` format without a digit count writes a
non-zero value that would read 0 at ten places in scientific notation with up
to ten significant digits, in the locale's notation. A calculation's given of
1.602e-19 then shows and speaks that number, and the table's 1.6e-19 cell
reads the same. Every other value, and every value with a digit count, reads
as today.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (core's formats characterisation test): 1.6e-19 does not read "0"; English and German notation
- [ ] 1e-9, 0, 1234.5 and a value with a digit count read as today
- [ ] Calculation: a line with a tiny given shows and speaks the number, not 0
- [ ] `pnpm check core` and `calculation` green
- [ ] Finding 1 struck from `.scratch/shakedown/data-science.md` (finding 2's percent part stays open)
