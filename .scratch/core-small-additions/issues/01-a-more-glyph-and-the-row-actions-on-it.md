# 01 - A "more" glyph, and the table's row actions on it

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/core-small-additions/spec.md`

## What to build

The library's one "more" is drawn to its glyph specification and exported, so that every Menu trigger can
take it.

- **`MoreGlyph`** in core's glyph set:
  - three dots in a row, each a zero-length stroke with round caps, at the specification's stroke width on
    the square nominal box;
  - default size 12;
  - `currentColor`, no fill, `aria-hidden`, a `ref` and the SVG's attributes, like every glyph.
- **Exported** from core's public entry. Core's README glyph row and the glyph document's table of places
  name it.
- **The table's row-actions trigger** draws it through core's public entry instead of the text "⋯". Its
  name, size and variant stay as they are.
- **Core's examples** that write "⋯" in an IconButton (the Menu per row, the IconButton toolbar) draw it too.
- Regenerate core's `API.md`.

## Acceptance criteria

- [ ] Core's glyph check reads `MoreGlyph` and passes; the table's glyph check passes with the row actions
      drawing it.
- [ ] A unit test in the table: the row-actions trigger holds an SVG and no text, and is still named by the
      wording's row-actions name.
- [ ] No source or example in the workspace writes "⋯" as an icon any more.
- [ ] The table's and core's screenshot changes are the trigger only, reviewed in both themes.
- [ ] `pnpm check core`, `pnpm check table` and `pnpm check:site` pass.
- [ ] Core's changelog lists `MoreGlyph` under "Added"; the table's lists the drawn trigger under "Changed".
