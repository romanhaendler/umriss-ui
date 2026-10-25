# 01 - A modal's width, the capitals and the button's press as tokens

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/theming-recipe/spec.md`

## What to build

Three styling needs that no token reaches get one, by ADR-0045. Each default is today's literal, so nothing
looks different until an application sets a token.

- **A Modal's widths.**
  - `--u-modal-width-sm`, `--u-modal-width-md` and `--u-modal-width-lg` (400, 520 and 720 px) stand in core's
    tokens beside `--u-drawer-width`.
  - The sheet's three sizes read them, and keep `min(100%, …)`.
- **The capitals.**
  - `--u-transform-caps` (`uppercase`) stands beside `--u-tracking-caps`.
  - Every rule that writes `text-transform: uppercase` with the caps tracking reads it:
    - core: Card's eyebrow, Divider's label, Typography's caps, DatePicker's weekdays and time label, and
      CommandPalette's group heading;
    - the table: the head and the grouping heading;
    - the dashboard: the mode label.
  - The table's rules that reset the transform for their own content stay as they are.
- **The button's press.**
  - `--u-button-press-scale` (`0.98`) stands beside `--u-button-padding`, and the button's pressed state
    reads it. `1` turns the press off.
  - The glyph presses (0.8) and the panels' entry scales are motion, and stay as they are.
- **Comments.** Each token gets a comment in the tokens stylesheet that says what it reaches. The Theming
  page's table shows it as the description.

## Acceptance criteria

- [ ] A `@quick` check in core opens a Modal of each size. With an unlayered
      `:root { --u-modal-width-md: 600px }` (and the same for sm and lg), the sheet is that wide in a wide
      window, and no wider than the window in a narrow one.
- [ ] A `@quick` check in core: with `:root { --u-transform-caps: none }`, a Card's eyebrow and a labelled
      Divider compute `text-transform: none`. Without it, they compute `uppercase`.
- [ ] The same check exists in the table's `@quick` suite (the column head) and the dashboard's (the mode
      label).
- [ ] A `@quick` check in core: a Button held under the pointer computes a scale of 0.98. With
      `:root { --u-button-press-scale: 1 }` it is not scaled.
- [ ] No component stylesheet in core, table or dashboard writes `text-transform: uppercase` any more.
- [ ] The Theming page lists the five new tokens with their descriptions, and its token gate passes.
- [ ] The screenshot suites of core, table and dashboard pass unchanged.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check dashboard` and `pnpm check:site` pass.
- [ ] The changelogs of core, table and dashboard note the tokens under "Added".
