# 09 - The packages ship ES2022

Status: done
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "The syntax that ships"; user stories 20, 21

## What to build

The five library builds target `es2022`, the target the TypeScript
configuration already names. The helpers for class fields leave the bundles of
charts, table and schedule, and every bundle is a little smaller. The demo
builds are not touched.

Each package's README says in one sentence of its installation passage which
syntax ships, so that an application serving older browsers knows to transpile
the package itself.

## Acceptance

- [ ] No built entry of any package defines a helper for class fields.
- [ ] Each built entry is smaller than before, gzipped; the five figures stand
      in the commit message.
- [ ] Each README names ES2022.
- [ ] `check:dist` passes in all five packages; no screenshot moves.
