# 04 — Examples that run as copied

Status: ready-for-agent
Type: task

Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 20, 23, 25, "The demo")

## Scope

- Every schedule example defines its own data, small and made for its feature; `demo/data.ts` stays for `99-demonstration` alone.
- The shell: an example may name sibling files to show as further code tabs; Copy takes the tab in front. The demonstration names `data.ts`.
- A check in `@umriss-ui/demo/checks`: an example imports from the package's `src` and from npm only, shown siblings excepted; called by all four demos' suites.
- No example is renamed or split here - that is 05 and 06.

## Acceptance

- The check fails on a scratch run with one `../../data` import restored, and the ticket says that it did.
- Feature specs that read fixture ids read them from the example they test; `plot.ts` follows.
- Pictures change where the data changed: count stated, no renames.

## Comments
