# 04: Mean, notches and count

Spec: `.scratch/box-plot/spec.md`

**What to build:** a caller optionally passes `mean`, `notchLower` with
`notchUpper`, and `count`; the mean is drawn as a small ×, the notch as a waist
in the box's outline, and each reads as a tooltip row and data table column
only where given. One notch bound without the other, or five numbers out of
order, warn once in DEV and draw what is given.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Optional named channels, null for every other kind; mean and notch bounds in the extent
- [ ] jsdom: rows and columns only where given, both wordings, the two DEV warnings once each
- [ ] Demo example "mean and notches" (do two medians differ?); baselines light and dark

## Comments
