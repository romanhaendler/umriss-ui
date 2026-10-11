# 06 — Documents and release

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02, 03, 04, 05
Spec: "Testing Decisions"; user stories 22, 24

## What to build

The work reaches the people who use it. A minor release of
`@umriss-ui/charts` (and the packages the workspace's release rule moves with
it) whose changelog says: `onRange`; Alt with a drag, or a plain drag where
nothing zooms; Space on the keyboard; and, under "Changed", that
`ChartsWording` has three new required keys (`rangeStarted`, `rangeMade`,
`rangeHelp`), so that a wording written out in full needs them.

The capability record (`packages/charts/docs/capabilities.md`) gets a row for
each promise of tickets 01-03 with its rule and where it is proved; the
section "Later" no longer lists the range. The charts README and the pages are
looked at for the word "selection" next to the range. ADR-0056 is not
rewritten. The testing guide names the new tests where their kind stands; the
generated documents carry `onRange` and the new examples, and the completeness
guard passes. Release after the maintainer has looked at it by hand.

## Acceptance

- [ ] Capability rows for the pointer, the band, the keys, the readout, the
      three kinds of axis, the DEV warning; "Out" and "Known limits" say what
      stays out (a kept range, y, lasso, several, touch on a zoomable chart).
- [ ] Changelog entry, minor bump; "Changed" names the wording keys.
- [ ] The testing guide names the new tests.
- [ ] The full check before a release: lint, types, unit, build, visual -
      parallel suites waited for, ports 4173-4177 free, the machine kept
      awake.
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments`; every ticket's status set to `done`.
