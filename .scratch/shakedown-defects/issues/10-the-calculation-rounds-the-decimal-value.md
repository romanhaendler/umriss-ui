# 10: The calculation rounds the decimal value

Spec: `.scratch/shakedown-defects/spec.md` (Calculation)
Finding: `calculation.md` 1

**What to build:** a figure rounds the number's shortest decimal
representation half away from zero, so it equals what core's formats write
for the same value and places: 1.005 shows 1.01, 2.675 shows 2.68, 0.285
shows 0.29, and the invoice 1.005 + 2.675 + 0.285 shows 1.01 + 2.68 + 0.29
≈ 3.97 - the "≈" stays, honestly, because the exact sum 3.965 rounds to 3.97
(per-line rounding is not this ticket). A value that rounds to zero is 0,
never −0.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (calculation's evaluate test): each case above compared with core's format at the same places
- [ ] −1.005 shows −1.01; −0.001 at two places shows 0
- [ ] "≈" appears only where the shown operands do not give the shown result
- [ ] `pnpm check calculation` green
- [ ] Finding 1 struck from `.scratch/shakedown/calculation.md`
