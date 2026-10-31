# 18: Table model - weeks, aggregates, sort, widths, filters, the view

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 5 (date column). Sources: README 2, 9, 15, 16, 18, 26, 38 (editOptions),
H7 (flex below minWidth, Escape during resize), H8 (range and Infinity), settle 3. Reds: P28
`shakedown.test.ts` (isoWeek, sort in the view, flexShares, aggregate), H7 `f06`, P22 `probes/p13.mjs`,
P2 `m-sum`.
All reds named here are in `../reds/` (`../reds/README.md`).

- [x] `isoWeek` (`model/grouping.ts:239`): the sign of the 4-January weekday term; test table plus a Thursday-rule property over 2020-2030 (2024-12-30 is week 1 of 2025, 2026-12-31 week 53).
- [x] A numeric aggregate or a numeric sort that meets a string value in any row warns once in DEV, naming the column and the fix (`Number` in the rows or `sortValue={Number}`); today only the first value of a formatted column is checked. Decided: warn, do not coerce - the app owns the data's shape (after-shakedown 18); README and the aggregate docs say so.
- [x] An empty sort survives `view` → `initialView` when `defaultSort` is set (`tableState.ts:425`).
- [x] `flexShares` never yields NaN (`flex: 0`); a flex column cannot be dragged below its `minWidth`; Escape during a resize drag restores the width.
- [x] `autoSizeColumns()`, "Fit all columns" and the grip double-click shrink a column with a `width` or `flex` to its content (`flexWidths.ts:96-118` measures the body box at its declared width).
- [x] A text condition with `join: undefined` is a valid AND/default condition (`columnFilter.tsx:597`); an open range bound keeps `±Infinity` values.
- [x] `editOptions` that is not an array warns and edits nothing instead of crashing the page.
- [x] A `Date` column without `format` shows only the day when every value is local midnight (decision 5).
- [x] `pnpm check table`.

## Comments

**Delivered (2026-10-31, run coordinator).** `isoWeek` by the Thursday rule (oracle over 2020-2030);
mixed strings in a numeric column or aggregate warn once in DEV (no coercion, documented); a cleared
sort travels in the view as `sort: []`; `flex: 0` no NaN, drag stops at `minWidth`, Escape restores the
width; fit-to-content releases the value box's containment while measuring; `join: undefined` valid,
open range bounds keep ±Infinity; a non-array `editOptions` warns and offers nothing; a date column
without `format` shows only the day when every value (all rows, so a search cannot flip it) is midnight.
Decided: the day-only rule covers body cells; group heads, footers and filter text keep the datetime.
Left: drag floor, Escape mid-drag and the fit shrink are not exercised by a test (jsdom has no layout).
Browser check (coordinator, Chromium, Width and pinning): fit shrinks a wide column (414 → 176,
652 → 535), a drag stops at the floor, Escape mid-drag restores the width. An already fitted column
still grows by 1 px on fit (371 → 372) - left to the review's fix pass.
