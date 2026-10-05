# 01 — A head holds its width, never its state

Status: ready-for-human

## Found

Firefox, a column with `width={75}` and a long label, sorted: the sort arrow
was cut at the column's edge, and the column read as unsorted. Chromium and
WebKit let the head widen the column past its width instead - against
ADR-0042, from the other side. The head had no rule for a label wider than its
column.

## Decided (grilled 2026-10-05)

1. The label gives way, with an ellipsis that the cut-value tip completes;
   the sort arrow, the rank and the funnel never do. The column is exactly its
   width.
2. A width below what those take is raised to them, and in development the
   table says so once per column.

A head without a width grows with its label, as before.

## Done

- `Table.module.css`: a sized head's line is a grid whose label track is
  `minmax(0, max-content)`; the arrow, rank and funnel are auto tracks.
- `parts.tsx`: the label in `.headLabel`; the cut-value tip reads it from the
  head's line only (not from the funnel); "fit to content" counts what the
  label hides; the warning `head-without-room`.
- ADR-0042 says it; `docs/testing.md` names `narrowHead.test.tsx`.
- Example: Width and pinning, "A label wider than its column".

## Open

- The look in Firefox, Chromium and WebKit: unseen by the agent (its browser
  runs were stopped).
- **Baselines may move**: the new example needs its screenshots, and the
  Width-and-pinning page's, and any other picture with a sized head, move with
  this ticket.
- The changelog entry, in the release that carries this (docs/releasing.md).
