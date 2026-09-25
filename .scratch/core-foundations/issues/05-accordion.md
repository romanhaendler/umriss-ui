# 05 - Accordion

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

F5.

## Acceptance

- Single/multiple, controlled/uncontrolled, keyboard; screenshots.

## Comments

Delivered as `Accordion` / `AccordionItem` (`src/components/Accordion`): header buttons in a heading (`headingLevel`, default 3) with `aria-expanded`/`aria-controls`, panels as named regions, folded panels inert; `type` single/multiple, `value`/`defaultValue` as a list for both types, arrows/Home/End between the headers (a field inside a panel keeps its keys). Card's collapse is untouched. Tests: `tests-unit/accordion.test.tsx`, arrows and Enter in the browser.
