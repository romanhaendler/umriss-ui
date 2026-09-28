# 02 - The options: action, close reason, update, position, limit

Status: done
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

**Delivered.** `action`, `onClose(reason)`, `update`, `loading`,
`toast.position` (six), `toast.limit` (3). Demo ladder: 01 show, 02 tones, 03
undo (new), 04 until closed, 05 save with loading (new), 06 confirm in a list
(the deck), 07 where they stand (new). JSDoc: the title rule and the action
that is never the only way. Unit tests for every reason, loading without
close and timer, update starting the timer, the alert region for a failed
outcome, a gone id, the limit and its provider setting, a new duration, a
return focus given up once the focus left by other means. Pictures: a toast
with an action, a toast at the top, a `loading` toast, a closed deck on a phone
at 320px with a wrapped title; the three new examples.

**Code review (two axes).** Fixed from it: the return focus kept after the
focus had left, the leaving teardown not cancelled on unmount, `update`
ignoring a new `duration`, the demo's undo restoring at a stale index and its
"Try again" reading a stale switch, `type Ton` renamed `Tone`, a stale line
in the spec, the missing `loading` and long-title pictures. Left as they are,
with the reason: raw pixel values in the stylesheet (the toast's stylesheet
drew its geometry in px before, as the others do); Alt+T taken while a toast
stands, also in a text field (as Sonner does - a keyboard user in a form must
reach the toasts); a click's focus not holding the time (the pointer holds
it by hovering, and the action acts at once).
