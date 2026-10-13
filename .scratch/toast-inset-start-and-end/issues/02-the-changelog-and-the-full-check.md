# 02 - The changelog and the full check

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: `.scratch/toast-inset-start-and-end/spec.md`, Implementation Decisions
("No ADR", "Release"); user stories 20, 21

## What to build

The work is handed over ready for a release.

- **A draft of core's changelog entry** under this ticket's `## Comments`, for
  the next minor. A version is released by raising it, so no manifest and no
  `CHANGELOG.md` is touched here. Under **Added**: `--u-toast-inset-start` and
  `--u-toast-inset-end`, the toasts' distance from the window's sides; the
  default is the distance they had; which positions each moves, and that on a
  phone each is the room at its side; that a rule on the region's `data-along`
  is no longer needed, and was never safe (ADR-0045). In the wording of the
  entry for the top and bottom tokens.
- **The full check before a release.**
- **Left to the maintainer**, said plainly in the report: the release itself.

## Acceptance

- [ ] The changelog draft for core stands under `## Comments`.
- [ ] The full check: lint, types, unit, build, visual - parallel suites
      waited for, ports 4173-4177 free, the machine kept awake.
- [ ] Every generated document is current (`pnpm check:site`).
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments`, naming every place where what was built departs from it;
      both tickets set to `done`.
