# A brand is one token file to copy, and the tokens reach what a brand changes

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "A theme object" (its Answer holds the decisions
below; where it left a mechanism open the decision is marked *(agent)*), and the map's Notes item "Already
decided, straight to `/to-spec`"; findings `.scratch/shakedown/design-system.md` (3, 4, 5, 8, 9 and the
wishes), `.scratch/shakedown/core.md` B7 and B9; ADR-0021, ADR-0042, ADR-0045, ADR-0051.

## Problem Statement

A design-system team that rebrands umriss got every axis through tokens alone: accent, greys, radius, font,
dark, dense and roomy. It still wrote about 50 lines of tokens by trial and error, and wished for a
`createTheme`. Four things made it harder than it has to be.

- **The README's example is a trap.** It sets only `--u-color-accent`. The UI is then half in the new colour
  and half petrol, and the dark `on-accent` stays at 3.23:1. The full accent set appears only on the site and
  in the llms text, and the Theming example's lead counts seven tokens where its block shows six.
- **Density is two systems.** Smaller or larger type, spacing and control tokens leave a table's rows at
  36 px. Only the provider's `density="compact"` reaches the table and the calculation. A compact table's line
  is a fixed 18 px, so at a 32 px root its rows stay 27 px around 22 px type.
- **Layered CSS from a host loses or wrecks, depending on load order.** With Tailwind v4, either its
  utilities lose to umriss, or its preflight wrecks Modal, Toast and Tabs. A wrapper library's own
  `@layer acme` loses when it loads before core. One declaration fixes both, and it is written nowhere.
- **Three styling needs have no token**, against ADR-0045's promise of a token per need:
  - a Modal's width: `className` and `style` land on the full-viewport `<dialog>`, not the sheet;
  - the capitals of eyebrows and heads: nine rules write `text-transform: uppercase` as a literal;
  - the button's press scale: a literal `scale(0.98)`.

## Solution

There is **no theme object**: no `createTheme`, no theme provider. ADR-0045 holds that the tokens are the
styling API, and a second way to the same tokens would need its own types, docs and tests. Instead:

- **One complete token file to copy**, in core's README. It replaces the two-line example and holds every
  colour token a brand changes, each with a light and a dark value:
  - the accent set;
  - the charts' palette;
  - the font.

  A test holds the file to the stylesheets: every token in it exists, the accent set and the palette are
  complete, and the documented colours pass the contrast bounds the library's own colours pass.
- **The cascade-layer order** for Tailwind v4 and for a wrapper library, in the same section, proved by a
  visual test.
- **Table rows that follow the density tokens.** The rows staying at 36 px is a defect, fixed in the table
  (and in the calculation's compact line, which ADR-0051 keeps equal to it). It is not a second density
  system.
- **Three new tokens:** the Modal's widths, the capitals, and the button's press scale. Their defaults are
  today's values, so nothing looks different until an application sets them.

## User Stories

1. As a design-system engineer, I want one block in core's README that I copy and edit, so that my brand
   reaches every component on the first try.
2. As a design-system engineer, I want that block to hold every accent token with a light and a dark value,
   so that no part of the UI stays petrol and the dark theme is not an afterthought.
3. As a design-system engineer, I want the block to hold the charts' palette, so that my charts carry the
   brand's colours in both modes.
4. As an application developer, I want the documented colours to pass AA contrast in light and dark,
   `on-accent` on the accent included, so that copying the example does not ship an inaccessible checkbox
   tick or mode label.
5. As an application developer, I want the README to name the tokens a brand may also change (radius,
   neutrals, the capitals, the press scale, the modal widths) and point at the Theming table, so that I know
   where the full list is without the README repeating it.
6. As the maintainer, I want a test to fail when the README's block names a token that does not exist, so
   that a renamed token cannot leave a dead line in the recipe.
7. As the maintainer, I want a test to fail when the stylesheet gains an accent token or a palette step that
   the README's block lacks, so that the recipe stays complete.
8. As the maintainer, I want the README's colours measured with the same contrast pairs as the library's
   own, so that the example cannot pass with a contrast the library itself would fail.
9. As an application developer using only the charts, I want charts' README to name the palette tokens and
   point at core's block, so that I find them from the package I use.
10. As an application developer on Tailwind v4, I want one documented layer declaration, so that my
    utilities win over umriss and Tailwind's preflight does not wreck a Modal, a Toast or Tabs.
11. As a wrapper-library author, I want the README to give the layer declaration my stylesheet starts with,
    so that my layer wins over umriss whichever stylesheet loads first.
12. As the maintainer, I want a visual test that proves both declarations in both load orders, and shows
    that a layer declared without them loses, so that the documented lines are not right by accident.
13. As a design-system engineer, I want denser or roomier type, spacing and small-control tokens to move a
    table's rows, so that density is one system and not a token set plus a provider prop.
14. As an analyst, I want a compact table's rows to grow with their type at a large root font size, as the
    regular rows already do, so that the text does not fill its row edge to edge.
15. As an application developer, I want a compact calculation's lines to stay as tall as a compact table's
    rows under my tokens too, so that the two still stand side by side.
16. As an application developer, I want the default rows unchanged (36 px regular, 27 px compact, 35 px
    compact under a finger), so that the fix moves nothing I did not set.
17. As an application developer, I want the README to name the tokens a denser or roomier application sets,
    so that I know which ones the table and the calculation follow.
18. As a design-system engineer, I want a Modal's three widths as tokens, so that my dialogs match my grid
    without a selector on internal markup.
19. As a design-system engineer whose brand writes no capitals, I want one token that turns the uppercase off
    on every eyebrow, table head, divider label and group heading, so that the whole library follows.
20. As a design-system engineer, I want the button's press scale as a token, so that I can soften it or turn
    it off.
21. As an application developer, I want each new token listed on the Theming page with its description, so
    that I find it where every other token stands.

## Implementation Decisions

- **No theme object** (the Answer). ADR-0045 stands; no new ADR. Every change below is a commit message and
  a changelog entry.
- **The new tokens** *(agent: names and number)*. Their defaults are today's literals.
  - `--u-modal-width-sm`, `--u-modal-width-md` and `--u-modal-width-lg` (400, 520, 720 px). There are three,
    one per `size`, beside `--u-drawer-width`. The sheet keeps `min(100%, …)`.
  - `--u-transform-caps` (`uppercase`), beside `--u-tracking-caps`. Every rule that writes
    `text-transform: uppercase` today with the caps tracking reads it instead: core's Card eyebrow, Divider
    label, Typography's caps, DatePicker's weekdays and time label, and CommandPalette's group heading; the
    table's head and grouping heading; the dashboard's mode label. Rules that reset the transform for their
    own content stay as they are.
  - `--u-button-press-scale` (`0.98`), beside `--u-button-padding`, read by the button's pressed state.
    Setting it to `1` turns the press off. The glyph presses (0.8) and the panels' entry scales are motion,
    not the button's press, and stay as they are.
  - Each gets a comment in the tokens stylesheet. The Theming page's table is generated from those comments,
    and its build fails on a token without a row (ADR-0045).
- **Density** *(agent: which tokens are "the density tokens")*.
  - The row pitch (ADR-0042) already reads the spacing and the small control heights. What it does not read
    is the type: the regular line is floored at a fixed 19 px (1.1875rem), and the compact line is a literal
    18 px.
  - The fix derives each line from the type token its cells set: `--u-text-sm` for regular,
    `--u-text-xs` for compact. Each is rounded up to a whole pixel, and the defaults keep their sizes at a
    16 px root (19 and 18 px), so the pitches stay 36 / 27 / 35 px.
  - The calculation's compact line takes the same derivation, so that ADR-0051's equality holds under any
    tokens.
  - The density tokens are therefore the type steps, the spaces and the small control heights. The `md`
    control height is not one of them: under a finger it rises to 44 px (`.scratch/under-a-finger/`), and
    tables keep their pitch there.
  - The virtual table measures its pitch from the rendered head, so it needs no change.
- **The brand file.**
  - One fenced CSS block in core's README Styles section. It holds:
    - `--u-font-sans`;
    - the six accent tokens (`--u-color-accent`, `-hover`, `-subtle`, `-subtle-pressed`, `-text`,
      `--u-color-on-accent`);
    - `--u-chart-1` to `--u-chart-6`.

    Every colour is written `light-dark(<hex>, <hex>)`.
  - The values are an example brand, the indigo the Theming page already shows, not the defaults
    *(agent)*. A block of defaults would prove no contrast and would read as "change nothing".
  - The palette is set through `--u-chart-N`, not `--uc-series-N` *(agent)*: the `--uc-` tokens are declared
    on the chart's root, so a `:root` rule cannot reach them, while `--u-chart-N` is what they read.
  - One line after the block names the other tokens a brand may change and points at the Theming table.
    One paragraph names the density tokens that tables and calculations follow.
  - The Theming example "Accent for the application" keeps its live region. Its comment block points at the
    README instead of repeating the file, and its lead counts six tokens.
  - Charts' README names `--u-chart-1` to `--u-chart-6` in its Colours paragraph and points at core's block.
- **The brand file's check** *(agent: seam and scope)*.
  - It is a unit test in core, beside the contrast test, with the same parser and WCAG arithmetic. It finds
    the block by its info string, which names the file (`css brand.css`), as the Testing blocks of
    `.scratch/test-runners/` do. It asserts:
    1. every custom property in the block is declared in core's tokens or read by charts' stylesheet;
    2. every token of the stylesheet's accent section, and every `--u-chart-N` the charts read, stands in the
       block;
    3. every colour in the block has a light and a dark value;
    4. the contrast pairs that name a token the block sets hold their bounds with the block's values laid
       over the stylesheet's.
  - Charts' stylesheet is read as text, by relative path. That is a test's read, not a package dependency,
    like core's demo alias.
  - The stylesheet's own pairs gain "type on the accent surface" (`on-accent` on `accent`, 4.5:1 in both
    themes). The dashboard's mode label is 11 px text on that pair. Today's petrol passes it (5.0 and 5.1).
- **The layer order** *(agent: wording, and that it is proved without Tailwind)*.
  - Core's README Styles section gets two declarations, each with the place it must stand:
    - Tailwind v4: `@layer theme, base, umriss.tokens, umriss.base, umriss.components, components, utilities;`
      as the first CSS the page reads, before `@import "tailwindcss"`.
    - A wrapper library: `@layer umriss.tokens, umriss.base, umriss.components, <its layer>;` as its
      stylesheet's first statement, which holds in either load order.
  - The README also says that unlayered CSS always wins, and that a classic unlayered reset (Bootstrap and
    the like) is not fixed by layer order.
  - The proof uses no Tailwind dependency. Two layered rules stand in for preflight and for a utility, and
    one for a wrapper's token override.

## Testing Decisions

- A good test here measures what a user sees, a computed style or a box, after setting tokens the way an
  application does: an unlayered `:root` rule added to the page. It never selects by an internal class or
  `data-*` attribute to *set* a style. It may select by role, or by the library's own attributes, to find
  the element it measures.
- Seams, all existing:
  - core's unit tests (the contrast test and its parser) for the brand file;
  - the `@quick` layout checks of core, table, dashboard and calculation for the tokens, the rows and the
    layer order. Prior art: core's toast-inset tests set tokens with an added style tag and measure the
    box; the calculation's density suite measures lines against the compact table's pitch;
  - the Theming page's token gate for the new tokens' rows;
  - the screenshot suites, unchanged, for "defaults move nothing".
- The layer-order test is a check with a control. The same rules without the declaration, in the losing
  order, must lose; otherwise the test would pass by accident.
- The README is under test through its block. Changing a documented token or colour without the check
  passing is impossible.

## Out of Scope

- A theme object, a theme provider, a typed token map or a function that writes CSS (the Answer).
- The other needs `design-system.md` 9 lists:
  - the button's disabled opacity;
  - the virtual row's focus colour;
  - the 63 fixed px lengths in table, schedule, calculation and dashboard;
  - the matrix gradient, `--uc-shadow`, and schedule task colours;
  - `--uc-` tokens a parent cannot set.

  Each waits for an application that needs it (ADR-0045).
- The `md` control height under a finger: `.scratch/under-a-finger/`.
- Bootstrap and classic unlayered resets (`core.md` B8): layer order cannot fix them.
- The wrapper's `light-dark()` collapse (`design-system.md` 6) and Storybook's props (7).
- Neutral, radius or shadow values in the brand file: a brand that keeps Ink & Paper changes none of them,
  and the Theming table lists them.

## Further Notes

- Measured for the defaults: `on-accent` on `accent` is 5.01:1 light and 5.10:1 dark. The Theming page's
  indigo is 7.90:1 light and 5.36:1 dark. White on the dark indigo would be 2.98:1, which is what the check
  catches.
- The token count of the accent set: the stylesheet holds six. The "seven" of B9 and of the example's lead
  is not a token the stylesheet declares.
