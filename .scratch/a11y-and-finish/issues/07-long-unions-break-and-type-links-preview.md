# 07: Long unions break, and type links preview

Status: ready-for-agent
Blocked by: `types-without-holes` 05 (Every library type in a type cell is a link, and "Types on this page" defines the rest)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** In a props table's type cell, a union of more than two members stands one member per line, each starting with `|` (the Markdown writer keeps one line). A named type that links to its definition block shows that block's declaration, capped at twelve lines, in core's Tooltip on hover and on keyboard focus; Escape dismisses it; a click follows the link. The preview is not rendered into the prerendered page or the twin.

- [ ] Page suite on Button: `ButtonProps.variant` breaks one member per line; `TextProps.size` likewise on Typography
- [ ] Hover and focus on `ButtonSize` show `"sm" | "md"`; Escape closes it; a click lands on the definition block
- [ ] Axe passes on the Button page with a preview open
- [ ] The prerendered page and the twin carry no preview markup
