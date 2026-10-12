# 24 - Documents and release

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
Spec: `.scratch/react-19-and-performance/spec.md`; user stories 2, 8, 16, 42

## What to build

The work reaches the people who use it. A release of all five packages whose
changelogs say, for a caller:

- **Changed, breaking:** React 19 is required; the version before is the last
  that serves React 18. `ref` is a prop of every component that took one.
- **Changed:** the packages ship ES2022.
- **Fixed:** a table with an aggregate no longer throws above roughly 125 000
  rows; and whatever ticket 22 found about a scrolled virtual tree.
- **Faster, with the figure where there is one:** an import of one component
  from core; scrolling, grouping and re-rendering a large table; a pointer
  moving over a large schedule; walking a large tree - and each candidate the
  benchmark pages kept.

The figures in core's README are taken once more on the release build. The
testing guide names the residue rule and the benchmark pages where their kind
stands. The generated documents are current. Release after the maintainer has
looked at it by hand.

## Acceptance

- [ ] A changelog entry in each of the five packages; the breaking change
      stands first.
- [ ] Core's README figures match a measurement of the release build.
- [ ] The testing guide names the residue rule and says the benchmark pages
      are opened by hand and assert nothing.
- [ ] The full check before a release: lint, types, unit, build, visual -
      parallel suites waited for, ports 4173-4177 free, the machine kept
      awake.
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments`; every ticket's status set to `done`.
