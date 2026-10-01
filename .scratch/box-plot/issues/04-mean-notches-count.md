# 04: Mean, notches and count

Spec: `.scratch/box-plot/spec.md`

**What to build:** a caller optionally passes `mean`, `notchLower` with
`notchUpper`, and `count`; the mean is drawn as a small ×, the notch as a waist
in the box's outline, and each reads as a tooltip row and data table column
only where given. One notch bound without the other, or five numbers out of
order, warn once in DEV and draw what is given.

**Blocked by:** 01

**Status:** done

- [x] Optional named channels, null for every other kind; mean and notch bounds in the extent
- [x] jsdom: rows and columns only where given, both wordings, the two DEV warnings once each
- [x] Demo example "mean and notches" (do two medians differ?); baselines light and dark

## Comments

**2026-10-01, agent:** Built. `BoxChannels.mean`, `notchLower`, `notchUpper`,
`count`, each null where not given. A half-given notch materialises neither
bound: it warns once and draws no notch (not half of one); numbers out of
order warn once and draw as given. The notch reads as one row "Notch" with
both bounds; n is written in the default number format, not the y axis' -
it is no y value. German keeps "Notch" as it keeps "Whisker" (CONTEXT.md
avoids "Kerbe"); to be confirmed by the user. Start values for 05: mean ×
3.5px half-size at 1.5px, notch depth 0.2 of the box width each side.
