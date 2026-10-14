# 07 - The changelog and the full check

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02, 03, 04, 05, 06, 08
Spec: `.scratch/toasts-held/spec.md`, Testing Decisions ("The visual suite",
"Checks"), Further Notes (changelog); user story 46

## What to build

The work is handed over ready for a release.

- **A draft of core's changelog entry** under this ticket's `## Comments`, for
  0.38.0. A version is released by raising it, so no manifest and no
  `CHANGELOG.md` is touched here. **Added:** `held` on `ToastProvider` (what
  it is for, that nothing is lost), `--u-toast-width`. **Changed:** the deck
  glides when its distance changes, also when that change comes with a modal
  dialog opening or closing.
- **The full check before a release.**
- **Left to the maintainer**, said plainly in the report: the release itself.

## Acceptance

- [ ] The changelog draft for core stands under `## Comments`.
- [ ] The full check: lint, types, unit, build, visual - parallel suites
      waited for, ports 4173-4177 free, the machine kept awake.
- [ ] Every generated document is current (`pnpm check:site`).
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments`, naming every place where what was built departs from it;
      every ticket set to `done`.
