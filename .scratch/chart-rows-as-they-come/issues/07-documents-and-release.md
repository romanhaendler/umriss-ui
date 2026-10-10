# 07 — Documents and release

Status: ready-for-agent
Type: task

Blocked by: 01, 02, 03, 04, 05, 06
Spec: "Implementation Decisions" D3, D27; "Testing Decisions" (the full
check); user stories 48, 49, 52

## What to build

The work reaches the people who use it: a minor release of
`@umriss-ui/charts` whose changelog says what a caller may now leave out - the
position, the tick list and the lookup for a category; `getTime()` for an
instant - and that nothing was taken away. The capability record lists every
new promise with what proves it. The generated documents carry the new
examples and the short form.

## Acceptance

- [ ] The capability record has a row for each promise of tickets 01–04, each
      with its rule and where it is proved; its "Out" and "Known limits" say
      what stays the caller's: one element per series, aggregates, rows sorted
      along a numeric or time axis.
- [ ] Changelog entry and minor version bump of `@umriss-ui/charts`; the
      other packages only where the workspace's release rule moves them.
- [ ] The testing guide names the new tests in the rows where their kind
      already stands.
- [ ] The generated documents (`llms.txt`, the twins, the props tables, the
      API index) show `categories`, `categoryLabel`, `lane` and the new forms
      of `value`; the completeness guard passes.
- [ ] The full check before a release: lint, types, unit, build, visual -
      parallel suites waited for, ports 4173–4177 free, the machine kept
      awake.
- [ ] The spec's status set to `done`, with the delivery report under
      `## Comments`; every ticket's status set to `done`.

## Comments
