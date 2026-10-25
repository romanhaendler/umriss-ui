# 02 - A lock reaches an arrangement a reader kept

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-a-locked-widget-moves-and-nothing-else-changes-it.md`
Spec: `.scratch/dashboard-locked-widget/spec.md`

## What to build

No new API. A lock lives in the view, so a lock the application adds in an update is not in the arrangements
readers kept before it. The library does not merge one into the other: only the application knows whether a
widget missing from a kept view was removed before the lock or must come back. The example shows the
application's few lines.

- **The example** "A widget every reader keeps" (ticket 01) gets a second case: a kept arrangement from
  before the lock.
  - It holds the summary unlocked at a small size.
  - It holds a second kept arrangement without the summary at all.
- **The application's function** runs before `initialView`:
  - the mandatory widgets the application names are marked locked;
  - a mandatory widget the kept view lacks is put back, at the start, with its type's starting size and
    default options;
  - every other widget stays as the reader kept it.
- **The lead** says why this is the application's and not the library's, and that a size the reader chose
  before the lock stays (the lock keeps a size, it does not choose one).
- **README.** The lock's bullet (ticket 01) gets one sentence pointing at the example for arrangements kept
  before a lock.

## Acceptance criteria

- [ ] In the example, both kept arrangements show the summary locked: in the first at the reader's size and
      place, in the second at the start.
- [ ] After a move and "Done", the sentence under the dashboard shows the summary still locked.
- [ ] The example renders in the demo's smoke test, its screenshots are new baselines and looked at, and the
      accessibility suite passes on the page.
- [ ] `pnpm check dashboard`, `pnpm check:site` and `pnpm test:visual:quick dashboard` pass, and `API.md` is
      unchanged.
