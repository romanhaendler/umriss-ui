# 32: Table - `disabled` and `hidden` per row on `Action`

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8. Source: P2 wish ("Cancel" offered on a cancelled order).

- [ ] `Action` takes `disabled` and `hidden` as a boolean or a function of the row; a bulk action applies only to the rows where it is enabled and says how many.
- [ ] A disabled action stays in the menu, announced as unavailable; a hidden one is absent; the row menu disappears when no action is left.
- [ ] Unit tests; an example; `pnpm check table`, `pnpm check:site`.

## Comments
