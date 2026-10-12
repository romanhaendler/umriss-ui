# 21 - The schedule, decided on the benchmark page

Status: ready-for-agent
Type: task
Size: M (three candidates, each tried and measured)

Blocked by: 19, 20
Spec: `.scratch/react-19-and-performance/spec.md`, "The schedule", "decided on the benchmark page"; user stories 33, 34

## What to build

Three changes, none of which was measured. Each is tried on its own against
the benchmark page and kept only if the page shows it.

1. **A hit test that does not scan every box.** The lane under the pointer is
   already found by bisection; the boxes and routes tested are those of that
   lane and its neighbours' routes, not of the plan. What is hit is unchanged,
   overlapping subtasks and dependencies included.
2. **Windowed lane headers.** Only the **Lane headers** in view are rendered.
   What a screen reader reaches is unchanged.
3. **The overlap depth of a lane** without comparing every pair of its
   subtasks. The findings are unchanged.

## Acceptance

- [ ] For each of the three: the figure before, the figure after, and "kept"
      or "dropped" in the capability record.
- [ ] A dropped candidate leaves no code behind.
- [ ] The existing tests of hits, lane headers and findings pass unchanged;
      the accessibility check of the schedule's pages passes.
- [ ] No screenshot moves.
- [ ] `pnpm check schedule` passes.
