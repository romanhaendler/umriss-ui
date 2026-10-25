# 01 - A table stays within its frame

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/views-in-their-frame/spec.md`

## What to build

A table in a parent of definite height - a dashboard widget's body, a split pane, a grid cell - is never
taller than that parent. Its toolbar and pager stay in view, and its scroll area takes what they leave and
scrolls. In a parent without a definite height, nothing changes.

- **The cap.** The table's outer frame takes `max-height: 100%`. The frame is already a flex column whose
  scroll area may shrink, so nothing else should be needed; if a part beneath the scroll area shrinks with
  it, that part keeps its height. No prop, no option. `maxHeight` keeps bounding the scroll area, and where
  both bound it the smaller wins.
- **The example.** One new example in the table's demo: a table of a few hundred rows, `virtual`, in a pane
  of fixed height, with its toolbar and pager. It must pass the shell's page rules.
- **The README.** The paragraph on `maxHeight` and virtualisation says that a parent of definite height
  bounds the table without it, and that a wrapper between them passes the height on with `height: 100%`.
- **ADR-0050** gets the table's amendment from the spec ("The table"), dated the day of the change.
- **The checks.** `@quick` checks in the table's visual suite, beside `features-virtual`:
  - in the new example, the frame is no taller than the pane, and the pager is in view;
  - the document holds a window of rows, not every row, without `maxHeight` and with `maxHeight="100%"`;
  - the table's existing screenshots are unchanged.

## Acceptance criteria

- [ ] In the new example, the table's frame is at most the pane's height, the pager is in view, and the
      document holds far fewer rows than the table has, in Chromium and WebKit. The check fails against
      today's stylesheet.
- [ ] The same holds with `maxHeight="100%"` on the table.
- [ ] Every existing table screenshot passes unchanged.
- [ ] The README and ADR-0050 say what is stated above.
- [ ] `pnpm check table`, `pnpm check:site` and `pnpm test:visual:quick table` pass, and `API.md` is
      unchanged.
- [ ] The changelog notes that a table in a parent of definite height now scrolls inside it instead of
      overflowing it.
