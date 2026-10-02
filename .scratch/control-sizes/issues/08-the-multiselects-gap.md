# 08 — The room a multiselect leaves

Status: needs-info
Type: decision

Left open at the acceptance of control-sizes (05, 2 Oct 2026).

A multiselect's width no longer follows its chips; the chips follow its width.
When the next chip does not fit together with the "+N" counter, it goes into the
counter, and the room up to where it would have ended stays empty - at most a
chip's width beside the chevron. Honest (nothing is cut), but it reads empty,
most visibly at the natural width in a toolbar.

The alternative: let the last visible chip shrink and end in an ellipsis
("Herm…") into the room, before the counter. The measuring in
`MultiSelect.tsx` (`measure`) would count a chip as fitting from a minimum
width on rather than at its full width.

The question for the user: keep the room, or cut the last chip?
