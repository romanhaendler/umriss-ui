# 01 - The pass-through guard

Status: ready-for-agent
Type: task

Spec: `.scratch/core-passthrough/spec.md`

## Scope

A unit test in core that renders every exported component with a ref, a
`className`, a `style` and `data-probe`, and asserts all four arrive at the
element P1 names. The exceptions of rule 1 stand in the test with their reason.
Red for the 21 components.

## Acceptance

- The test exists, fails for exactly the 21 components, and names them.
