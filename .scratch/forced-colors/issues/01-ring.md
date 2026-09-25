# 01 - The ring survives

Status: done
Type: task

Spec: `.scratch/forced-colors/spec.md`

## Scope

FC1 in the shared `ring` and every place that draws its own ring.

## Acceptance

- Guard in `stylesheets.test.ts`; screenshot of a focused control in forced colours.

## Comments

**Delivered** on the branch `worktree-agent-a4f8ba68570bff8bd` (84d09a0 and the
review commit after it).

- `outline: 2px solid transparent` beside the ring in `#own-styles` `ring` and
  at all 41 sites that draw their own ring (core, table, schedule, calculation,
  and the charts' three). Chromium paints it in `Highlight` on a focused
  element under forced colours.
- The canon guard (`stylesheets.test.ts`): `focusPaints` allows that one
  outline beside the ring token; the new check `outline` refuses a focus rule
  that draws the ring token without it, over every package and own-styles.
  Recorded in `docs/design-language.md` (**Focus**).
- The table's focused virtual row draws its ring as inset shadows on its
  cells, not with the token: under forced colours it draws lines inside its
  cells on a pseudo-element (ticket 03).
- `forced-colors.spec.ts` (core): the outline measured on three kinds of ring
  (composed, a field's own, the box beside a hidden input) and the picture of
  a focused button, light and dark.
