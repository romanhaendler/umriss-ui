# 02 — Reading the declaration

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: "Declaration (ADR-0027)", "Operators", "Quantity props"; user stories 11–13

## Scope

- The elements `Calculation`, `Given`, `Sum`, `Difference`, `Product`,
  `Quotient`, `Ref`, with their props as the spec lists them. The operator
  elements render nothing themselves; `Calculation` reads them.
- A pure function from `Calculation`'s children to a model: quantities with
  their operator, operands in order, ids, and references resolved to the
  quantity they name. Fragments and arrays (`.map`) are read through.
- Development errors, each with a message saying which and where: not exactly
  one child in `Calculation`; a wrong operand count (`Sum`, `Product`,
  `Difference` need two or more, `Quotient` exactly two); a duplicate `id`; a
  `Ref` naming no quantity (the message lists the ids that exist); a cycle
  through references; an element that is none of the above (a caller's
  wrapper).

## Acceptance

- Unit tests for the model of the OEE declaration from the spec, for `.map`
  inside an operator, and one per development error asserting its message.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
