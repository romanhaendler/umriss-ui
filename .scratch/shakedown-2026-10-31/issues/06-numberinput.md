# 06: NumberInput reads, steps, rounds and pastes right in every locale

Status:     done
Blocked by: 01

Spec: `../spec.md`. All reds in `../reds/` (`p29-core/p29Numbers.test.tsx`, `h5-forms/t1.mjs`, `t3.mjs`, `t19.mjs`, `h7-table/tests/numedit.spec.ts`).
Sources: README 6, 20, 30, H5 (paste, NaN/∞, step grid, 1.005), H7 F10, P9 (red outlives),
P10 13b (unit not in the name).

**What to build:** a number typed, pasted, stepped or set from outside is the number the user means.

- [x] `separatorsOf` (`core/src/lib/language/formats.ts:266`) measures on a number that every locale groups (e.g. 1234567.5): es writes "12.345,6" and reads it back. U+2212 reads as "-" in `parseNumber` and `filterInput` (sv, nb, hr, fi).
- [x] Property test: `parse(format(n)) === n` for both signs in every locale `formatsFor` knows (at least en, de, fr-CH, de-CH, es, sv, nb, fi, hr, pl, pt-PT).
- [x] Stepping rounds to the decimals of step and base (0.2 + 0.1 = 0.3) and lands on the step grid from `min`; `clampNumber` rounds half away from zero (-2.5 → -3) and survives large `decimals`; 1.005 with `decimals=2` gives 1.01 like 2.345 gives 2.35.
- [x] A value set by the parent while the field is focused replaces the text when it differs from the last emitted value; blur never writes stale text over it.
- [x] Paste: an unreadable paste ("1.234,56" under fr-CH, mixed separators, "-5" with `min=0`) keeps the text, marks it invalid and says so - never empties the field silently or drops the rest. A group separator where none can stand ("0,5" in en) is refused visibly. "e" notation is read or refused visibly, not dropped.
- [x] A value shown in scientific notation (below 0.5e-10, e.g. "1E-11") stays editable: the field reads its own output, typing a digit does not empty or refuse it (`../reds/p29-core/p29Numbers.test.tsx`, "tiny value is editable").
- [x] `NaN` and `±Infinity` as `value` show empty with a DEV warning.
- [x] The unit ("€") is part of the accessible name (or its description).
- [x] The refused-character mark ends with the next valid input.
- [x] `pnpm check core`; the table's number editor checked as well (`pnpm check table`).

## Comments

**Delivered (2026-10-31, run coordinator).** `separatorsOf` measures 1234567.5 and knows U+2212; the round
trip holds in 11 locales (property test in `p29Numbers.test.tsx`); stepping lands on the grid from `min`
and rounds to the places of base and step; `roundTo` half away from zero; a parent value while focused
replaces the text unless it is the field's own; an unreadable paste stays, marked and announced, never
emitted, blur keeps it; "0,5" under en refused; e-notation read, `formats.number` writes "E"; NaN/Infinity
empty with a DEV warning; a unit prefix/suffix joins `aria-describedby`. Decided: the existing
`numberRefused` wording serves unreadable pastes (no new key). Left: whitespace group separators (fr, sv)
are not checked after a leading zero ("0 5" reads 5); host repros not rerun.
