# 06 - Breadcrumb

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

F6, the fold into a Menu measured, not guessed.

## Acceptance

- Current page, fold at narrow widths, keyboard through the menu; screenshots.

## Comments

Delivered as `Breadcrumb` (`src/components/Breadcrumb`): `<nav>` named from the wording, an `<ol>`, the last level `aria-current="page"`; entries as link (`href`), button (`onSelect`) or both (then `onSelect` routes). The fold is measured: a hidden copy gives each level's width, `fold.ts` (`foldedCount`, unit-tested) folds from the root side keeping the first level and the current page, and the folded levels open in a `Menu`. Tests: `tests-unit/breadcrumb.test.tsx` (widths handed in through the getters), the fold at real widths and the keyboard through the menu in `features-basics.spec.ts`. Wording `breadcrumb` and `breadcrumbFolded` in English and German.
