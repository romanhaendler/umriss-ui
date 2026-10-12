# 03 - The buttons take `ref` as a prop

Status: done
Type: task
Size: M

Blocked by: 02
Spec: `.scratch/react-19-and-performance/spec.md`, "The floor"; user stories 3, 4, 8

## What to build

The tracer for the move: one small family goes the whole way, and what it
settles is the pattern tickets 04 to 06 repeat.

`Button`, `IconButton`, `ButtonGroup` and `SplitButton` (four wrappers) become
named functions that take `ref` with their props. `ref` stands in each
component's exported props type, typed with the element the pass-through guard
names as its root.

What this ticket decides for the rest, and writes down in the ADR of ticket 02
as one short paragraph:

- how `ref` is declared in a props type, so that it is one line per component
  and reads the same everywhere;
- how the props table and `API.md` show it - the generated documents are
  written again, and `ref` appears with its element type and a description
  that comes from one place;
- the type test for an element root: a `ref` of the wrong element type does
  not compile.

## Acceptance

- [ ] None of the four is a `forwardRef` object; each passes the pass-through
      guard.
- [ ] `ref` is in the four props tables on the site and in core's `API.md`,
      with its element type.
- [ ] A type test: the right element type compiles, a wrong one is a
      `@ts-expect-error`.
- [ ] The pattern stands in the ADR.
- [ ] No screenshot moves.
- [ ] `pnpm check core` and `pnpm check:site` pass.
