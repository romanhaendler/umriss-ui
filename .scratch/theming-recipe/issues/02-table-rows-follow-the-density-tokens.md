# 02 - Table rows follow the density tokens

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/theming-recipe/spec.md`

## What to build

A defect fix. An application that sets smaller or larger type, spacing and small-control tokens leaves a
table's rows at 36 px. Density then becomes two systems, the tokens and the provider's `density`
(`design-system.md` 3). A compact table's line is a fixed 18 px, so at a 32 px root its rows stay 27 px
around 22 px type (`design-system.md` 8).

- **What the pitch misses.** The row pitch (ADR-0042) already reads the spaces and the small control
  heights. It does not read the type.
  - The regular line is floored at a fixed 19 px (1.1875rem).
  - The compact line is a literal 18 px.
- **The table's fix.**
  - Each line derives from the type token its cells set: `--u-text-sm` for regular, `--u-text-xs` for
    compact.
  - Each is rounded up to a whole pixel.
  - At a 16 px root they stay 19 and 18 px, so the pitches stay 36 px regular, 27 px compact, and 35 px
    compact under a finger.
- **The calculation.** Its compact line, a literal 18 px today, takes the same derivation. ADR-0051's
  "as close as a compact table's rows" then holds under any tokens.
- **What stays.**
  - The `md` control height does not move the pitch. Under a finger it rises to 44 px
    (`.scratch/under-a-finger/`), and tables keep their pitch there.
  - The virtual table measures its pitch from the rendered head; it needs no change.

## Acceptance criteria

- [ ] A `@quick` check in the table measures a regular and a compact table:
  - [ ] with no tokens set, every line is 36 and 27 px;
  - [ ] under a dense set on an unlayered `:root` (smaller `--u-text-sm`, `--u-text-xs`, `--u-space-1`,
        `--u-space-2` and small control heights), every line is shorter and a whole pixel, and the head, a row
        and the footer are equally tall;
  - [ ] under a roomy set, every line is taller in the same way.
- [ ] The calculation's density suite gains the dense case: a compact line that says one thing is as tall as
      the compact table's row under the same tokens.
- [ ] Under a finger (coarse pointer), the compact row stays 35 px at the defaults.
- [ ] The table's large-text checks pass. At a 32 px root the compact row's line grows with its type.
- [ ] The screenshot suites of table and calculation pass unchanged, and the virtual table still windows its
      rows.
- [ ] The comment on the row pitch says what the line follows now.
- [ ] `pnpm check table`, `pnpm check calculation` and `pnpm check:site` pass.
- [ ] The changelogs of table and calculation note the fix under "Fixed".
