# 05 — Documents and release

Status: ready-for-agent
Type: task

Blocked by: 01, 02, 03, 04
Spec: "Implementation Decisions" (Release), "Further Notes"; user story 50

## What to build

The work reaches the people who use it: a minor release of
`@umriss-ui/calculation` whose changelog names the relaxed `Sum`, the new
props, and - as a visible change - the contribution rule for negative
additive operands. The generated documents (`llms.txt`, the twins, the props
tables) carry the new page and examples.

## Acceptance

- [ ] Changelog entry and minor version bump of `@umriss-ui/calculation`.
- [ ] Generated documents regenerated and checked into the repo where they
      are checked in today.
- [ ] The full check before a release: lint, types, unit, build, visual -
      parallel suites waited for, ports 4173–4177 free.
- [ ] The spec's status set to `done`, with the delivery report under
      `## Comments`.
