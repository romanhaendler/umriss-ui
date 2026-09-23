# 02 — Evaluating a chain

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: "Model", "Evaluation"; user story 3

## Scope

- The signed sum in evaluation, including the approximation mark from the
  operands as shown.
- Nothing else should need to change; if it does, say why in the ticket.

## Acceptance

- Unit tests: the lead case's numbers; the signed sum in operand order; a
  product after an interim; an absent line making every later interim absent
  with the reason; the approximation mark on an interim; the worst verdict
  inside an interim's derivation.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
