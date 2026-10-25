# 04 - The brand file in core's README

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-a-modal-width-the-capitals-and-the-press-as-tokens.md`,
`02-table-rows-follow-the-density-tokens.md`, `03-the-layer-order-for-tailwind-and-a-wrapper-library.md`,
`05-the-field-labels-size-as-a-token.md` (its line of tokens a brand may also change names `--u-label-size`)
Spec: `.scratch/theming-recipe/spec.md`

## What to build

The README's two-line override becomes one complete file a brand copies and edits, and a test holds that
file to the stylesheets (`core.md` B9). The ticket waits for 01 to 03: its prose names their tokens, and 03
writes in the same section.

- **Core's README, Styles section.** The example that sets `--u-font-sans` and `--u-color-accent` is
  replaced by one fenced block, its info string `css brand.css`. It holds:
  - `--u-font-sans`;
  - the six accent tokens (`--u-color-accent`, `-hover`, `-subtle`, `-subtle-pressed`, `-text`,
    `--u-color-on-accent`);
  - `--u-chart-1` to `--u-chart-6`.

  Every colour is `light-dark(<hex>, <hex>)`. The values are the indigo of the Theming page's example
  "Accent for the application", and a palette chosen to go with it. Around the block:
  - one line names the tokens a brand may also change: the neutrals, the radius, `--u-transform-caps` with
    `--u-tracking-caps`, `--u-button-press-scale` and the modal widths. It points at the Theming page's
    table;
  - one paragraph on density: a denser or roomier application sets the type steps, the spaces and the small
    control heights. A table and a calculation follow them, and the provider's `density` chooses regular or
    compact on top.
- **The check.** It is a unit test in core, beside the contrast test, reusing its parser and WCAG arithmetic.
  It reads the README and charts' stylesheet as text, and asserts:
  1. every custom property in the block is declared in core's tokens or read by charts' stylesheet;
  2. every token of the stylesheet's accent section, and every `--u-chart-N` the charts read, stands in the
     block;
  3. every colour in the block has a light and a dark value;
  4. every contrast pair that names a token the block sets holds its bound with the block's values laid
     over the stylesheet's.
- **A pair of the stylesheet's own.** The contrast test gains "type on the accent surface" (`on-accent` on
  `accent`, 4.5:1 in both themes). The dashboard's mode label is text on it.
- **Theming example "Accent for the application".** Its comment block points at the README instead of
  repeating the tokens, and its lead counts six.
- **Charts' README.** The Colours paragraph names `--u-chart-1` to `--u-chart-6` and points at core's block.

## Acceptance criteria

- [ ] The check passes on the README as written.
- [ ] The check fails, naming the token, in each of these cases:
  - [ ] a misspelt token in the block;
  - [ ] an accent token removed from the block;
  - [ ] a colour written with one value only;
  - [ ] a dark `on-accent` changed to `#ffffff`, which measures 2.98:1 on the dark indigo.
- [ ] The stylesheet's own "type on the accent surface" pair passes for today's petrol.
- [ ] The README no longer shows an override of `--u-color-accent` alone.
- [ ] `pnpm check core`, `pnpm check charts` and `pnpm check:site` pass.
- [ ] The changelogs of core and charts note the README change.
