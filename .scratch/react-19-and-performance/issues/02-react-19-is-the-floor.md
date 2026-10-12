# 02 - React 19 is the floor

Status: done
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "The floor"; user stories 1, 6, 7, 9, 11

## What to build

The five packages declare React 19 and stop carrying React 18. This is the
"expand" step of the move away from `forwardRef`: after it, a component may be
wrapped or plain, and both pass.

- The peers `react` and `react-dom` become `>=19` in core, charts, table,
  schedule and calculation.
- An ADR, "React 19 is the floor" (the next free number), with its line in
  the ADR index: the floor; a component takes `ref` as a prop and is never
  wrapped; the version switches are gone and not to be restored; what it costs
  (applications on 18 stay on the last version before); why it was worth it
  (the wrapper kept core from shaking).
- The element-ref helper reads the ref where React 19 keeps it and nowhere
  else. The inert helper goes; `inert` is written as the boolean attribute it
  is.
- The pass-through guard's fifth demand is relaxed: the ref has to arrive at
  the root, wrapped or not. Its comment says why both forms pass for now.
- The CI job that resolves React 18.3.1 afresh and runs the unit tests again
  is removed.
- Every place that says "18" is corrected: the README of each package, the
  installation text of each demo, the testing guide, the fixtures of the demo
  shell's tests that carry a peer range.

No component is converted here.

## Acceptance

- [ ] All five manifests name `>=19` for both peers; the install command and
      the dependency line the demo derives from them are unchanged in shape.
- [ ] The ADR exists and is indexed.
- [ ] No source file reads React's `version`.
- [ ] The existing behaviour tests of the tooltip's trigger ref and of the
      inert attribute pass unchanged.
- [ ] The pass-through guard passes with every component still wrapped.
- [ ] No workflow, README, demo text or guide claims React 18.
- [ ] `pnpm check` and `pnpm check:site` pass.
