# 07 - No component is wrapped: the guard turns round

Status: ready-for-agent
Type: task
Size: S

Blocked by: 04, 05, 06
Spec: `.scratch/react-19-and-performance/spec.md`, "The floor" and "Testing Decisions", seam 2; user story 10

## What to build

The "contract" step. With every component plain, the pass-through guard stops
accepting both forms: an export that is a `forwardRef` object fails it, by
name. Its comment is written anew for the floor - it says what the guard asks
and why the wrapper is refused, not how it came to be.

Whatever still names `forwardRef` in the workspace is dealt with: the demos,
the comments of the props tooling that describe the wrapper as one of two
shapes a component has, and the tooling's branch for that shape if nothing
reaches it any more.

## Acceptance

- [ ] The guard fails, naming the component, when a fixture component is
      wrapped; it passes on the workspace.
- [ ] `forwardRef` occurs nowhere in the workspace outside the ADR and the
      guard.
- [ ] `pnpm check` and `pnpm check:site` pass.
