# 21: Table names, announcements and looks

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 5 (numeric header). Sources: README 36, 38; P9 (selected tint, widths when
empty); P22 6, 9 (stale announcement); earlier-runs-open P10-4, 10-28 p1-lena 9a, design-family 5,
kiosk 2, agent-docs 1, settle 9c.

- [ ] Announced through core's announcer, in the wording's language: a sort change ("Sorted by Name, ascending"), a group folded/opened, the selection count after a change, a cell validation error on Enter, an export started/done; the search count has its noun and follows the current search.
- [ ] The text filter's two terms are told apart ("Term 1: Operator"/"Term 2: Value").
- [ ] A table without `aria-label`/`aria-labelledby` warns once in DEV.
- [ ] A value cut by the column shows in full on hover and focus (the cut-value tip): H4 saw no tip on hover (`../reds/h4-h6-overlays/`); confirm and fix.
- [ ] A numeric header sits flush with its numbers (the hidden sort indicator holds no slot).
- [ ] The sort header's focus ring is not clipped by the scroll box.
- [ ] A selected row's tint and separators run through the RowActions column; column widths do not jump when the table empties.
- [ ] Docs: the Provider page imports `UmrissProvider` from core (`table/demo/outline.ts:92`); llms-full drops "No text filter per column"; the Export section points shells (Electron, Tauri) to `onExport`.
- [ ] `pnpm check table`, `pnpm check:site`; looks checked as a user.

## Comments
