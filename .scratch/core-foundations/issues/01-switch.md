# 01 - Switch

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

F1, with demo examples from simple to full (the examples ladder).

## Acceptance

- Keyboard (Space), label click, disabled, invalid; axe clean; screenshots light/dark.

## Comments

Delivered as `Switch` (`src/components/Switch`): a native checkbox under `role="switch"` (kept after `rest`), label beside it, sizes `sm`/`md`, `invalid` from `FormField`; the thumb travels on `--u-transition-path`. Tests: `tests-unit/switch.test.tsx` (role, label click, controlled/uncontrolled, Space left to the platform, disabled, invalid), Space and label in the browser (`features-basics.spec.ts`), axe on the page, four examples photographed light and dark. The invalid edge is registered in the ISA-101 register.
