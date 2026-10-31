# 32: Table - `disabled` and `hidden` per row on `Action`

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8. Source: P2 wish ("Cancel" offered on a cancelled order).

- [x] `Action` takes `disabled` and `hidden` as a boolean or a function of the row; a bulk action applies only to the rows where it is enabled and says how many.
- [x] A disabled action stays in the menu, announced as unavailable; a hidden one is absent; the row menu disappears when no action is left.
- [x] Unit tests; an example; `pnpm check table`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** `Action` takes `disabled` and `hidden` as a boolean or a
function of the row; a bulk action acts on the selected rows where it is shown and enabled and says how
many ("Cancel (1 of 3)", wording `ofSelected`); a disabled action stays as a disabled item or button, a
hidden one is absent, a row with none left shows no menu. Looked at: disabled and enabled row buttons were
alike at rest (the table paints all actions secondary and lights them on hover) - fixed by the
coordinator: a disabled action dims to about 3:1 and takes no hover. Decided: with "all that match" on a
server, function flags cannot apply (no rows to ask); boolean flags do.
