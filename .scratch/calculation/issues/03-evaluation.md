# 03 — Evaluation

Status: ready-for-agent
Type: task

Blocked by: 02
Spec: "Evaluation", "Approximation mark", "Quantity props"; user stories 5–8

## Scope

- A pure function from the model to evaluated quantities: each one's number in
  full precision, or absent with a reason (an operand is absent — naming the
  given at the root of it; a quotient by zero). Nothing is carried on as zero.
- Each quantity with a `target` or `limits` gets an **Assessment** through
  core's `assess()`; an absent one gets `unknown`, as `assess()` already
  decides. A given with `asOf` gets its **Freshness** through core.
- The approximation mark: computed from the operands as they will be shown
  (rounded through their format) and compared with the result as shown.
- The worst verdict inside each derivation, for the folded marker in 04.

## Acceptance

- Unit tests: each operator and operand order (`Difference` a − b − c,
  `Quotient` a ÷ b); the OEE numbers; absence propagating through two levels
  with the right reason; division by zero; the approximation mark set and not
  set; assessment and worst verdict.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
