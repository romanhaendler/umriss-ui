# 05 — Hover coupling and the accessible sentence

Status: ready-for-agent
Type: task

Blocked by: 04
Spec: "Hover coupling", "Accessibility"; user stories 9–10

## Scope

- Hovering or focusing a quantity marks its operands and every place it is
  used, references included; leaving clears it.
- The structure is a nested list; every line carries an accessible sentence
  built from wording entries ("Availability equals Run time divided by Planned
  production time, equals 412 min divided by 450 min, equals 91.6 percent,
  above target 90 percent"), including the reason for an absent quantity.
- Disclosure buttons for derivations, reachable and operable by keyboard, with
  `aria-expanded` and `aria-controls`.

## Acceptance

- Tests: the marks on hover and on focus; the sentence for a derived, a given,
  an absent and an approximated quantity, in English and German; keyboard
  folding.
- The package's axe check has no violations.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
