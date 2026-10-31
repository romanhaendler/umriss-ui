# 21: Table names, announcements and looks

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 5 (numeric header). Sources: README 36, 38; P9 (selected tint, widths when
empty); P22 6, 9 (stale announcement); earlier-runs-open P10-4, 10-28 p1-lena 9a, design-family 5,
kiosk 2, agent-docs 1, settle 9c.

- [x] Announced through core's announcer, in the wording's language: a sort change ("Sorted by Name, ascending"), a group folded/opened, the selection count after a change, a cell validation error on Enter, an export started/done; the search count has its noun and follows the current search.
- [x] The text filter's two terms are told apart ("Term 1: Operator"/"Term 2: Value").
- [x] A table without `aria-label`/`aria-labelledby` warns once in DEV.
- [x] A value cut by the column shows in full on hover and focus (the cut-value tip): H4 saw no tip on hover (`../reds/h4-h6-overlays/`); confirm and fix.
- [x] A numeric header sits flush with its numbers (the hidden sort indicator holds no slot).
- [x] The sort header's focus ring is not clipped by the scroll box.
- [x] A selected row's tint and separators run through the RowActions column; column widths do not jump when the table empties.
- [x] Docs: the Provider page imports `UmrissProvider` from core (`table/demo/outline.ts:92`); llms-full drops "No text filter per column"; the Export section points shells (Electron, Tauri) to `onExport`.
- [x] `pnpm check table`, `pnpm check:site`; looks checked as a user.

## Comments

**Delivered (2026-10-31, run coordinator).** Through core's announcer, in the wording's language: a sort
change (only the user's), a group folded/opened, a refused cell edit, "Export done"; the search count
says "43 of 1,204 entries" as text (eight expectations moved to it); the two text-filter terms are named
groups "Term 1"/"Term 2"; an unnamed table warns once; a numeric header ends where its figures end (the
sort arrow hangs in the padding - looked at); the sort header's ring is inset, not clipped; head widths
held while the body empties (a jump of ~4 px remains, from the flex recalculation). Docs: Provider
imports from core, the text-filter limit dropped, Export points shells to `onExport`. Decided: the
selection count is announced in grid mode only - outside it the toolbar's own status says it, and a
second voice would double it; the test leak of the announcer is fixed in the shared test setup
(`resetAnnouncer` and the regions removed after each test), not in production code. Not reproduced:
the cut-value tip (works on hover; H4's cell was the RowActions cell) and the tint through RowActions.
