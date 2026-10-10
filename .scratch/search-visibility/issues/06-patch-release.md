# 06 - Patch release of all five

Status: done
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

**Closed as overtaken (2026-10-10).** No release of its own was pushed for this ticket; the releases that followed carried the metadata. Checked on npm today: core 0.30.0, charts 0.13.0, table 0.13.6, schedule 0.5.6 and calculation 0.6.1 each show the new description and a homepage by path.
