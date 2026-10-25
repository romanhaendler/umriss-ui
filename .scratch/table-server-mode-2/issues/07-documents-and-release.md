# 07 - Documents and release

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02, 03, 04, 05, 06, 08
Spec: `.scratch/table-server-mode-2/spec.md`, all of it

## What to build

The work reaches the people who use it. The demo's server-mode page shows each
piece as a scenario: a slow answer out of order, a failing fetch, select all that
match with a bulk action, an export of all, a footer from the server. The
README's server-mode section, the capability record and the changelog say what
is new, and what stays the application's (the cap on an export, the sums, the
clearing of `error`). The table's `CHANGELOG.md` says that a bulk action's type
in server mode gained a second shape, as the one change a caller may have to
answer. Core takes the new wording keys, and with it table, schedule and
calculation rise as the workspace's release rule says. The generated documents
(`llms.txt`, props tables, API index) show the new props.

`CONTEXT.md` gets the glossary of the spec's last section (the maintainer's
step, or this ticket's if asked). The status of the spec and of every ticket is
set to `done` with a delivery report under `## Comments`.

## Acceptance

- [ ] Changelog, versions, capability record, testing guide updated.
- [ ] The completeness guards pass; the full check before a release: lint, types,
      unit, build, visual - parallel suites waited for, ports 4173-4177 free, the
      machine kept awake.
- [ ] Groups from the server are named in the README as the next piece, with its own spec.
