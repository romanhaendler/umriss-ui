# 01: Props are grouped and ordered by one rule everywhere

Status: done
Blocked by: `types-without-holes` 01 (One table model, two writers), `types-without-holes` 03 (`@deprecated` and `@default` are read)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** In the table model, before either writer runs, rows fall into Main (unnamed, first), Events, Accessibility, Styling by the spec's rules; a controlled triple reads `defaultValue`, `value`, `onValueChange` in Main; deprecated rows stand last in their group. The page-level flag that set events apart in two demos is removed; every table in every package and output follows the rule.

- [x] Table-model fixture: `className`, `aria-label`, `onClick`, `value`, `defaultValue`, `onValueChange` and a deprecated prop yield the groups and order of the spec; a table with only main rows has no sub-headings.
- [x] The parity test holds groups and order equal in HTML and Markdown.
- [x] Every table on the built site and in `llms-full` shows Main, then Events, Accessibility, Styling where present.
- [x] The events flag no longer exists in any outline.

## Comments

Delivered: `tableModel(entry)` in `packages/demo/src/tooling/apiTable.ts` groups every table by rules on the prop's name. It checks them in the spec's order:

- Styling: `className`, `style`, or a name ending in `ClassName` or `Style`.
- Accessibility: `aria-…`, `aria` followed by a capital, or `role`.
- Events: `on` followed by a capital. A controlled `on<X>Change` whose `<x>` is in the same table is not an event and stays with `<x>`.
- Main: everything else.

The groups are written as Main (no heading), then Events, Accessibility and Styling, each only where it has rows. Within a group the order is declaration order, with two moves: `default<X>` just before `<x>` and `on<X>Change` just after it. Deprecated rows come last, with the same moves applied among them.

The second parameter `eventsApart` is gone. So are `EVENTS_APART` in the table and schedule outlines, `Demo.eventsApart`, `DemoSources.eventsApart` and `LlmsJob.eventsApart`. The sub-heading class is now `.apiGroupTitle` (it was `.apiEvents`). In `llms-full`, the sub-headings per package are now:

| Package | Events | Accessibility | Styling |
|---|---|---|---|
| core | 28 | 6 | 1 |
| charts | 3 | 5 | 1 |
| table | 4 | 2 | 5 |
| schedule | 1 | 1 | 1 |
| calculation | 0 | 0 | 0 |

Tests:

- `tests-unit/apiTable.test.ts` has a fixture, `PickerProps`, declared out of order: `className`, `onValueChange`, `aria-label`, a deprecated `label`, `onClick`, `value`, `role`, `defaultValue`, `rowStyle`, `ariaDescription`, `style`, `tone`, `onOpenChange`. It gives:
  - Main: `defaultValue`, `value`, `onValueChange`, `tone`, `label`
  - Events: `onClick`, `onOpenChange`
  - Accessibility: `aria-label`, `role`, `ariaDescription`
  - Styling: `className`, `rowStyle`, `style`
- In the same file, a table with only main rows writes no `<h4>` and no `######`, and a group with no rows is left out. The parity test now also checks that HTML and Markdown have the same sub-headings in the same order.
- `llmsGuard.test.ts` checks that the prerendered page's API section is the app's HTML, for every page of all five demos.
- lint, typecheck and test:unit are green. Core's `propsStandard` timed out once under load and passed when run again.
- In Playwright, before the rebase onto main, the shell, page, screenshot and accessibility suites of all ten projects ran: 1597 passed, 2 failed. One failure is `language--own-components` (ui-light), which differs in the word "Today". That is the known failure, and its baseline was left as it is. The other is the Drawer picture below.
- After the rebase, the shell and page suites ran in ui-light and table-light: 60 passed.
- After the rebase, lint, typecheck and test:unit are green with one package at a time. With all packages in parallel, the smoke tests of core and table hit their 5 s limit. They pass on their own.

Baselines moved: `drawer-beside-a-service-list` (ui-light, ui-dark). The picture shows `DrawerProps` behind the backdrop, and `onClose` moved from the main rows to Events. That move is this ticket's change. The spec expected no baseline to move because it assumed no picture shows an API table, but this one does.

Deviations:

- A controlled callback takes the group of the prop it controls. That is Main in every real case.
- No CHANGELOG entry. As in types-without-holes 01 and 03, only the order inside `docs/llms-full.md` changes.
- Folding, and opening a folded group for an anchor, are left to ticket 02.
