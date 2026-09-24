# 01 - The pass-through guard

Status: done
Type: task

Spec: `.scratch/core-passthrough/spec.md`

## Scope

A unit test in core that renders every exported component with a ref, a
`className`, a `style` and `data-probe`, and asserts all four arrive at the
element P1 names. The exceptions of rule 1 stand in the test with their reason.
Red for the 21 components.

## Acceptance

- The test exists, fails for exactly the 21 components, and names them.

## Comments

Delivered as `packages/core/tests-unit/passthrough.test.tsx`. It reads the
package's exports rather than a written list, so a new component that stands in
neither the cases nor the exceptions fails it. Besides ref, class, style and a
data attribute arriving at one element (the element P1 names, checked for the
dialogs, the tree and the fields), it asks for `forwardRef`: React 19 hands a
plain function component its `ref` as a prop, so a component that merely
spreads `...rest` passed the runtime check by accident and would drop the ref
under React 18, where the peer range begins.

Red for 31, not 21: the 21 of the spec and ten exported parts that had no
`forwardRef` either - `CardHeader`, `CardBody`, `ModalHeader`, `ModalBody`,
`ModalFooter`, `TabList`, `Tab`, `TabPanel`, `MenuItem`, `MenuSeparator`. They
are fixed with their parents in 02 and 03. `Checkbox`, `NumberInput`, `Select`
and `SplitButton` stand in the test with their existing split (class on the
wrapper, ref and rest on the control), each with its reason.
