# 02 - The options: action, close reason, update, position, limit

Status: ready-for-agent
Type: task
Blocked by: 01

Spec: `.scratch/toast-refinement/spec.md` (stories 12-22; "Options")

## Scope

- `action`, `onClose(reason)`, `update(id, options)`, the `loading` tone with
  the `Spinner` and without close button or timer.
- `toast.position` (six values, default `bottom-end`) and `toast.limit`
  (default 3, the oldest leaves with `"dismiss"`) in the Provider's
  `ToastConfig`.
- Alt+T moves focus into the region; the countdown stands still while focus is
  inside. Wording for the region's name (English, German).
- JSDoc: the title rule, and that an action is never the only way.
- Demo: a ladder of examples, simple to elaborate - one toast, undo, save with
  loading, a deck, the positions; the existing examples' titles follow the
  rule.

## Acceptance

- Unit tests of the spec's "Testing Decisions" green.
- Pictures of the new examples; `loading` and a top position light and dark;
  every moved baseline looked at one by one.

## Comments
