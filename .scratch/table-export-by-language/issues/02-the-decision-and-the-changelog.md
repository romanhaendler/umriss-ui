# 02 - The decision, the documents, the changelog

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: `.scratch/table-export-by-language/spec.md`

## What to build

The decision is written down and the change announced.

- An ADR, "the CSV follows the language in use" (no number; the next free one at the time): the three sources, the derived separator, the mixed case, and that ADR-0024's open question is closed. ADR-0024 gets a pointer in "What deliberately did not move" and is otherwise unchanged; the ADR index lists the new one. The sentence in `.scratch/umriss-table/spec.md` is not rewritten; the ADR supersedes it by name.
- `packages/table/CHANGELOG.md`, under **Changed**, written for a caller: with the English defaults the CSV now has commas between fields, a decimal point and `yes`/`no`; `asCsv()` without a provider returns that text; a German application (wording and formats from `@umriss-ui/core/wording/de`) gets the file it got before; German wording with English formats gets German words with comma and point - take both halves (ADR-0024). Minor bump of the table.
- The `Export` part's documentation, the capability record and the README line on export say what is written and where each convention comes from.
- The testing guide names the new tests where their kind stands.
- Full check before the release: lint, types, unit, build, visual; parallel suites waited for; ports 4173-4177 free; the machine kept awake.

## Acceptance

- [ ] ADR written; ADR-0024 and the index point to it.
- [ ] Changelog entry under "Changed"; version bumped as the release rule says.
- [ ] Documents and capability record updated; generated documents pass their guards.
- [ ] Full check passes.
- [ ] The spec's status is `done`, with a delivery report under `## Comments`.
