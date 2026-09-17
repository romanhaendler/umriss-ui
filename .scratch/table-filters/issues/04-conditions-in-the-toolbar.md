# 04 — Conditions in the toolbar

Status: done
Type: task

Blocked by: 03

Spec: `.scratch/table-filters/spec.md` (The table toolbar; defects D1, D2)

## Scope

- Write the Playwright layout-shift guard first against `Table › Vorführung`: the header's top does not move while typing a search, setting a list filter and clearing. It fails.
- Remove `FilterLeiste` and its row (D1) and `sucheBedingung` (D2).
- Chips in the toolbar after its children, in the order set; chip text per the spec; chip content is a button opening the panel anchored at the chip, `onRemove` lifts the condition; chips in a `TagGruppe` named by `aktiveFilter`.
- Right side: "43 von 1.204" in `role="status"` and "Zurücksetzen", before the selection group.
- Implicit toolbar when a column has a filter or a `Search` is connected and no `Toolbar` is placed; document the `of`-after-the-table first-frame caveat in `ToolbarProps`.
- Wording entries in `@umriss/ui` (chip names, "+n", "Zurücksetzen"); `wortlautwache` and `filterleisteWortlaut` follow.
- Rewrite the "Filterleiste" Playwright tests (`funktionen-tabelle.spec.ts` 23–66) against the toolbar; update `Column › listenfilter`, `Search › suche`, `Search › ausserhalb` and their baselines.

## Acceptance

- The layout-shift guard passes in both themes.
- Component tests: chip order, remove one keeps the others, chip opens panel, search without chip but counted, reset scope, implicit toolbar present/absent, `role="status"`.
- The accessibility suite (`barrierefreiheit.spec.ts`) passes on the changed pages.
