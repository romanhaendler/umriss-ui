# 06 — The table carries its own base

Status: done
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

**Delivered.**

- `packages/table/src/own.module.css` carries the same `text`, `ring`, `field` and `scroll` as core's shared module, in the same layers. It is written out a second time because the table enters core only by its public entry (ADR-0016); its head says so.
- **Text context** on the table's frame, the toolbar, the pagination bar and the alarm list. **Ring** on the sort button, the filter button and the header cell a resizable column makes focusable. **Scroll** on the table's scroll container and the filter panel's content. The panels opened through core's `Popover` take their surface from 05.
- **`box-sizing` step, reworked (in `scripts/styles/ownBox.ts`, tests in core).** The own-box check named `VerdictColumn`'s `.value` and the virtual body: classes that only ever stand in compound selectors (`.verdict[data-verdict="warning"] .value`), so the first version gave them a box only in that state. Every class a stylesheet names now gets a rule of its own at the head of its layer, and a subject named by type keeps its full selector. The table's own `box-sizing` line stays - it is declared, and the step leaves it alone.
- **Loose example text:** none in the table demo.
- **Result:** all 46 table pictures that were red after 01 are green in both themes without a renewed baseline. All 12 table pages pass the three checks. Core, rerun after the change to the step, stayed green: 590 passed across both packages and both themes.
