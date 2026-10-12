# 08 - An unused import leaves a residue under budget

Status: done
Type: task
Size: M

Blocked by: 07
Spec: `.scratch/react-19-and-performance/spec.md`, "Paying for what is imported" and "Further Notes"; user stories 12-19

## What to build

A caller pays for what they import, and a check holds it.

- **The marks.** Every call that remains at the top of a module and whose
  result is only held is marked pure at the call, in the source: the
  `createContext` calls of all packages and the table's two built-in filter
  registrations (or these are written so that no call is needed). No build
  plugin adds marks.
- **The provider.** A context is rendered as its own provider
  (`<Context value>`), not through `.Provider`, in every package.
- **The residue check.** The check on the built package gains one rule: an
  entry that imports the package's built entry for its side effects only is
  bundled with Rollup (already in the workspace through Vite) - stylesheets
  resolved to nothing, the peers external - and what remains, minified and
  gzipped, is the residue. It must not exceed 1.5 KB for any package. The
  budget is one constant. On failure the check prints the kept top-level
  statements, largest first.
- **The figures.** Core's README states what one component and what the whole
  package costs, measured the way the spec's notes describe: at least the
  residue, `Button`, `Select`, `DatePicker` and everything.

The single file per package, its stylesheet import and `sideEffects` stay as
they are.

## Acceptance

- [ ] `check:dist` passes in all five packages with the residue rule in it.
- [ ] A unit test of the rule against two small fixture entries: one that
      shakes passes, one with an unmarked top-level call fails and the call is
      named in the output.
- [ ] Every package's residue is under the budget; the five measured figures
      stand in the commit message.
- [ ] No `.Provider` remains in any package's source.
- [ ] The README's figures are the measured ones, and `Button` alone is under
      6 KB gzipped.
- [ ] `pnpm check`, `pnpm check:site` and a build of every package pass.
