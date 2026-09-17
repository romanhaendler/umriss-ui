# 06 — The table carries its own base

Status: ready-for-agent
Type: task

Blocked by: 01, 03
Runs in parallel with: 04, 05, 07 (and 02). Owns `packages/table/src/` and `packages/table/demo/` except `demo/App.tsx` (02).

Spec: `.scratch/styles-without-side-effects/spec.md` · ADR-0021

## Scope

- `Table.module.css`, `VerdictColumn.module.css`, `alarms/AlarmList.module.css`:
  text context on the table's root and on the parts that render outside it
  (toolbar, search, column menu, export, pagination, the footer bar portalled by
  `unbound.tsx`); focus rings on sort headers, row toggles, row actions,
  selection checkboxes and every other focusable part; scroll container
  scrollbars.
- The table's own `box-sizing` rule becomes redundant with 01's build step;
  remove it if the pictures stay green.
- Loose example text in the table demo that changes under browser defaults is
  rewritten with core's `Text`/`Heading` and listed under Comments.
- Do not touch core's modules; a table picture that needs a core change is
  written under Comments for 04/05.

## Acceptance

- Every `table-light`/`table-dark` screenshot is green without a renewed
  baseline, except the listed loose-text examples.
- 03's checks report no offender in the table demo.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green; `styleGuard.test.ts`
  green.

## Comments
