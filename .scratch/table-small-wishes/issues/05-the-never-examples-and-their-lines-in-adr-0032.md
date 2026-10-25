# 05 - The "never" examples, and their lines in ADR-0032

Status: ready-for-agent
Type: task
Size: S

Blocked by: `03-an-own-aggregate-takes-a-name.md`, `04-columns-are-dragged-in-the-column-menu.md`, `.scratch/views-in-their-frame/issues/01-a-table-stays-within-its-frame.md`, `.scratch/table-columns-from-the-data/issues/02-a-matrix-with-row-and-column-totals.md`, `.scratch/dashboard-small-wishes/issues/05-the-never-lines-in-adr-0032-and-adr-0064.md`
Spec: `.scratch/table-small-wishes/spec.md`, "The 'never' examples and ADR-0032"

## What to build

Two examples and four lines of the record, so that a reader who asks for an offset token or a rule set
finds the answer in the docs. No source of the table changes.

- **A head below an app bar.** An example on the Width-and-pinning page after "Sticky parts": a pane of
  fixed height with a bar at its top, and a table with `stickyHeader` filling the rest. Its lead:
  - make the main area below the bar the table's frame, a parent of definite height;
  - or give the table `maxHeight="calc(100dvh - 64px)"`;
  - no offset can help, because the head sticks in the table's own scroll area, which carries the
    horizontal scroll, the pinned blocks and the virtual window.
- **Conditional formatting.** A new demo page, "Conditional formatting", under Columns beside Formats. Its
  example has four columns: a data bar with `Meter`, a colour scale with `color-mix` over the tokens, an
  icon with `Badge`, and limits with `VerdictColumn`, each in about three lines of `children`. Its text:
  - a rule set would be a second way to present a cell beside `children` (ADR-0017);
  - a class hook is not offered (ADR-0045);
  - the colour is never the only sign: each column also says it in a word or a number.

  The page passes the shell's page rules: library components in the stage, and `keysOf` in its outline
  entry if the stage takes Tab.
- **ADR-0032**, under "The table", four new items, each a dated amendment ("*Added <date>:*") with its
  *Instead*. The status line is not touched.
  - **Conditional formatting as rules.** *Instead:* `children`, the new page.
  - **A sticky-head offset.** *Instead:* the frame or `maxHeight`, the new example.
  - **A column drag on the header.** The header cell takes the sort click, the resize grip, the pin blocks
    and on touch the pan. *Instead:* the drag in the ColumnMenu's list, and its move buttons.
  - **Built-in median and standard deviation.** *Instead:* an aggregate of one's own with its
    `aggregateLabel`, the Aggregate page's example.

## Acceptance criteria

- [ ] In the app-bar example, the table's head stays visible below the bar while its rows scroll, in
      Chromium and WebKit (a `@quick` check beside `features-virtual`).
- [ ] The conditional formatting page renders, passes the accessibility check, and its screenshots are
      recorded and looked at in light, dark and forced colours.
- [ ] The demo smoke test renders both examples; the shell's page rules pass in the browser suite.
- [ ] ADR-0032 carries the four items; its decision is unchanged.
- [ ] The generated `llms-full.md` carries both examples.
- [ ] `pnpm check table`, `pnpm check:site` and `pnpm test:visual:quick table` pass.
