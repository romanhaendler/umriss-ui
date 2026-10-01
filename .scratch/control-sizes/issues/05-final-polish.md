# 05 — Final polish

Status: ready-for-human
Type: polish
Blocked by: 01, 02, 03, 04

The look of the new widths, accepted by the user on the rendered pages: the
core demo's **Sizes** page (after FormField) at phone, tablet and desktop width,
the table's **Toolbar controls** page (default `sm` and `md`), and the
acceptance page with the before/after pictures.

Open questions for the user:

1. **The defaults.** 16 characters for a text field, select and combobox (the
   width of the browser's own text field), 20 for a multiselect, 10 for a
   number, 40 for a textarea, a date picker's longest value. Right in your
   bars, or other numbers?
2. **The multiselect's gap.** When the next chip does not fit with the
   counter, the room up to it stays empty. Honest, but it reads empty; the
   alternative is to cut the last chip ("Herm…") instead of counting it.
3. **The slider's readout** stands far from its track in a toolbar (six
   characters of room for the value) - as before. Take it on now?
4. **A field that fills a row** still needs the row's layout (`flex: 1`, a
   grid); there is no prop for it on purpose. Wanted?
