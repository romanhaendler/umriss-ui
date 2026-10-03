# 07: Long unions break, and type links preview

Status: done
Blocked by: `types-without-holes` 05 (Every library type in a type cell is a link, and "Types on this page" defines the rest)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** In a props table's type cell, a union of more than two members stands one member per line, each starting with `|` (the Markdown writer keeps one line). A named type that links to its definition block shows that block's declaration, capped at twelve lines, in core's Tooltip on hover and on keyboard focus; Escape dismisses it; a click follows the link. The preview is not rendered into the prerendered page or the twin.

- [x] Page suite on Button: `ButtonProps.variant` breaks one member per line; `TextProps.size` likewise on Typography
- [x] Hover and focus on `ButtonSize` show `"sm" | "md"`; Escape closes it; a click lands on the definition block
- [x] Axe passes on the Button page with a preview open
- [x] The prerendered page and the twin carry no preview markup

## Comments

Delivered:

- **Long unions** (`packages/demo/src/tooling/apiTable.ts`). `unionMembers` splits a type's spans at each `|` that stands outside brackets and quotes. A function type or a conditional type (a top-level `=>` or `?`) stays one type. The HTML writer (`typeHtml`) writes a union of more than two members one member a line: `| "a"<br>| "b"<br>| "c"`. It does this for the type and for an alias's values beneath it. On the real pages the long unions are those values (`ButtonVariant`'s five, `TextSize`'s six). The Markdown writer is unchanged and keeps one line.
- **The preview** (`Page.tsx`, `ApiTables`). The section's HTML is mounted as before. A ref callback then finds each `#type-X` link whose target stands in "Types on this page". It puts an empty span where the link stood and portals the same link into it, wrapped in core's `Tooltip`. The tooltip shows `previewOf(definition)`: the declaration as written, or the members as `{ name?: type; }`. It is at most twelve lines, and the twelfth is `…` where it is cut. Hover, keyboard focus, Escape and a click that follows the link all come from the `Tooltip` and the shell's click handler. The ref's cleanup puts the written links back. The prerendered page and the twin are written from strings, so they never carry a preview.
- **React 19 rewrites `innerHTML` whenever the `dangerouslySetInnerHTML` object is a new one.** It did this on every render of the page, and that wiped out the swapped-in links. The object is now memoised on the HTML string.

Tests:

- `tests-unit/apiTable.test.ts`, five cases:
  - breaking in a written-out union, in an alias's values, around generics, and with `|` inside string and template literals;
  - two members, and a function whose parameters are unions, each stay on one line;
  - Markdown keeps one line;
  - an alias's values under its declaration, in both writers;
  - the members preview, and the cut at twelve lines.
- `tests-unit/propsReader.test.ts`: a definition that is an alias of an alias carries its values; a declaration that writes its literals itself, and an alias of an interface, carry none.
- `tests-unit/llms.test.ts`: the prerendered page and the twin contain neither `tooltip` nor `apiPreview`.
- `packages/core/tests-visual/features-page.spec.ts`, new describe "The API tables' type cells":
  - `ButtonProps.variant` and `TextProps.size` read one member a line, and `ButtonProps.size` (two members) stays on one line;
  - hover on `ButtonSize` shows `"sm" | "md"`, and the link is described by it;
  - Tab onto the link shows the preview, and Escape closes it;
  - a click lands on `#type-ButtonSize` in the viewport;
  - axe over the whole Button page is clean with the preview open.
- Commands:
  - lint, typecheck and test:unit (all six packages) are green.
  - Playwright `features-page` and `features-shell` in ui-light and table-light: 120 passed, 1 skipped.

Baselines moved: none. No screenshot shows an API table with a union of more than two members, and none has the page scrolled to its API section (no full-page pictures).

Deviations:

1. `ButtonSize`'s definition block held `type ButtonSize = ControlSize;` and not `"sm" | "md"`, so a preview of that block alone could not meet the acceptance. The reader now gives a definition that is an alias of one named literal alias an `expansion`. It uses the same rule as a row's, and today only `ButtonSize` gets one. The block writes it under the declaration as "Resolves to `"sm" | "md"`." in both HTML and Markdown, and the preview shows the same line. So the preview is still the block, and the llms text gains that one line.
2. Links inside the definitions (their declarations and members tables) preview as well, not only links in the props tables' type cells. They are the same kind of link to the same blocks.
3. Core's Tooltip is 260 px wide. A long declaration wraps inside it, and the Tooltip itself is unchanged.
