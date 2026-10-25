# 02 - The pass-through guard is shared

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/root-contract/spec.md`

## What to build

The prefactor. Core's pass-through guard becomes a function in the demo's `tests-support`, beside the style,
wording and glyph guards, and core's test becomes its first caller. Nothing that the guard checks changes,
and no component changes.

The function takes:

- the package's name;
- its exports;
- its cases: render functions that receive the probe;
- its exceptions, each with its reason;
- per case, its shape:
  - **element**: everything on the ref's element;
  - **field**: class and style on an ancestor wrapper, the rest on the ref's element;
  - **split**: class on the wrapper, style with the rest, as `SplitButton` has today;
  - the per-case check of which element the ref must reach (today's `ROOT` table).

It keeps today's checks:

- every export with a capital name is a case or an exception, and no case or exception is stale;
- no export is a `forwardRef` object;
- the four probes arrive together, and one failure names everything missing;
- the data attribute stands on exactly one element.

The "What the rest may not override" tests stay in core's own file.

## Acceptance criteria

- [ ] Core's pass-through test calls the shared function and holds exactly the cases, exceptions and shapes
      it holds today.
- [ ] Its test names and counts are the same before and after, apart from the describe line naming the
      package.
- [ ] Making one core component drop its `data-*` still fails the guard, naming that component.
- [ ] `pnpm check core` and `pnpm check demo` pass.
