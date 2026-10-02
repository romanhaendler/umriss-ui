# Row pitch

Asked for by the user on 2 Oct 2026: "Mir gefällt nicht, dass die Höhe der
Tabelle springt, wenn die Daten z. B. extern geladen werden ... Was ist mit der
letzten Seite der Pagination ... Umbrüche in Zeilen ... Ich wünsche mir eine
wirklich saubere Lösung." Then, on two Firefox and Safari windows side by
side: "unterschiedliche Höhen in der Demo der Tabelle - 36.5 vs 36 Pixel je
Zeile?" A prototype (local branch `prototype/row-slot`, never pushed) was
accepted on the rendered page with "Top. Erledige dann noch alle anderen
Punkte."

The state of the art behind it: `reports/Datentabellen Stand der Technik.md`
(untracked, in the `control-sizes` worktree) and its notes.

## What was measured (Playwright, all 116 tables of the table demo)

- A row was 13 px type × 1.5 = 19.5 px of line plus 16 px of padding plus a
  1 px line: **36.5 px**, a half pixel each engine rounds its own way. A row
  with a fold measured 37.5 in Chromium, 37.25 in Firefox, 37.188 in WebKit;
  the last row 36 / 36 / 36.5. Heads stood 33, 36.5 or 25 px.
- A checkbox made a row 38.5 px, an alarm's badge 29 px, a fold 37.5 px.
- Text wrapped. **91 of 116** tables had rows of uneven height at 1280 px,
  **98** at 390 px; the pagination demo's body measured 579, 579, 598.5, 579 px
  on its first pages on a phone.
- A short last page and a search that found nothing moved the pagination bar:
  "Next" stood 954, 772, 178 px below the head (1280 px) and 1562, 1262,
  239 px (390 px) on page 1, the last page and an empty result.

## Decided (ADR-0042)

1. **A row's height never follows what it shows.** Every line of a table - the
   head, a row, a group header, a placeholder, the aggregate footer - is one
   **row pitch** tall: one whole-pixel line of text plus the density's padding,
   and never less than a small control plus 4 px above and below. Regular 36,
   compact 27 px under a fine pointer; under a finger a small control stays
   26 px and a compact row grows to 35. A row detail is the one exception: the
   user opens it.
2. **One line, always.** Nothing in a cell wraps; text ends in an ellipsis.
   There is no option for two lines: a data-dense table is read down its
   columns, and the whole record is what the row detail is for.
3. **The table's body sets `ControlSizeProvider size="sm"`**, as its toolbar
   does; a compact (dense) surface already takes `sm` as `xs`. Every core
   control in a cell fits the pitch without the application saying a size.
4. **A column without a width grows with its values up to `min(20rem, 60vw)`**
   (the group span's precedent) and cuts there. A column with a width - given,
   dragged or fitted - cuts at its width and never grows past it.
5. **A cut value shows whole in a tip** under the pointer, and at once on the
   Active cell in grid mode; only where it is actually cut. One tip per table.
6. **A page holds its height.** With a pagination bar a page keeps the most
   lines it has shown, up to `pageSize`: a short last page, a search or a
   condition that leaves a few rows, and an empty result (its message at the
   top) fill up with an unlined filler; the first load shows a page of
   placeholders. Amended after the acceptance: first it held only over more
   than one page, and a status filter leaving seven rows of twenty-four still
   moved the bar from 405 to 297 px.
7. **A grouped page is `pageSize` lines, the repeated headers counted.** A page
   that begins inside a group repeats its headers; they now take their room
   from the page instead of lengthening it.
8. **Loading over rows keeps the rows.** `loading` with rows present dims them
   after 200 ms and takes the pointer from them; placeholders stand only where
   there are no rows. The height of a page being reloaded is the height it had.
9. **`virtual` takes no `rowHeight`.** The pitch is the table's; the window
   reads it from the rendered head. Manual mode no longer measures row heights.

## Tickets

- 01 The pitch: head, rows, group headers, footer, placeholders; the size
  provider; the cell's value box; widths and the cap; the tip
- 02 A page holds its height: filler, first load, empty result
- 03 A grouped page counts its repeated headers
- 04 Loading over rows keeps the rows
- 05 `virtual` without `rowHeight`; manual mode measures no heights
- 06 ADR-0042, CONTEXT (**Row pitch**), design language, changelog, demo
- 07 Tests and baselines, looked at
- 08 Final polish, accepted by the user on the rendered page
