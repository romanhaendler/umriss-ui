# 06 - Patch release of all five

Status: ready-for-human
Type: task
Blocked by: 04

Spec: `.scratch/search-visibility/spec.md` (D13)

## Scope

A patch release of core, charts, table, schedule and calculation after
`docs/releasing.md`, so that npm shows the new descriptions, keywords and
path links. Changelog entry: documentation and metadata only.

## Acceptance

- npm pages of all five show the new description and keywords.

## Comments

Versions raised (core 0.14.1, charts 0.8.1, table 0.7.1, schedule 0.3.5,
calculation 0.3.5 - after the row-editing release that reached main first) with a changelog entry each. Not pushed: the push to
`main` publishes to npm and deploys the site, which the user starts.
