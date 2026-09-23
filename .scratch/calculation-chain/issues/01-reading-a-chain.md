# 01 — Reading a chain

Status: done
Type: task

Blocked by: none
Spec: "Elements (ADR-0028)", "Rules", "Model"; user stories 5–8

## Scope

- The elements `Chain`, `Plus`, `Minus`, `Times`, `DividedBy`, `Interim`, with
  their props documented for the props gate.
- The reader turns a chain into interims as derived quantities: the value
  before as a reference operand, the operands since, and the operator — the
  new signed sum, or product, or quotient. A chain as an operand stands for its
  last interim; a line holding a tree reads it as today.
- Development errors, each with a message saying which and where: a first line
  with an operator, a chain not ending with an interim, two interims in a row,
  `Times`/`DividedBy` not alone between two named values, a line tag with both
  props and a child or with more than one child.

## Acceptance

- Unit tests for the model of the lead case in the spec, for `.map` of lines,
  a chain in a tree and a tree in a chain, and one per error asserting its
  message.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
