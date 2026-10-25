# 06 - The schedule's ref is its root

Status: ready-for-agent
Type: task
Size: M

Blocked by: `04-the-table-is-a-composite.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

The schedule becomes a composite with an element `ref`, and its handle moves to the hook.

- **`Schedule`.**
  - Its props take the HTML attributes of a `<div>` and `RefProp<HTMLDivElement>`. `ref`, `className`,
    `style`, `id` and `data-*` reach the root.
  - `aria-label` (required) and `aria-labelledby` name the figure root and the plot, as `ariaLabel` does
    today. A caller's `aria-describedby` is joined to the plot's summary.
  - `ariaLabel` is removed.
- **The handle goes.** `ScheduleHandle` is removed. `positionAt`, `clientPointOf` and `visibleDomain` stand
  on `useSchedule`'s return with the same signatures. While no schedule is mounted, `positionAt` and
  `clientPointOf` return `null`, and `visibleDomain` answers from the scene as it does today.
- **README** names `setDomain(span)` as the way to zoom to a span and `setDomain(null)` as the way to fit
  the work. One line says the schedule's shape.
- **The guard.** The schedule calls the shared guard with:
  - the `Schedule` that a `useSchedule` harness hands back, in the composite shape;
  - the parts as exceptions with their reason: they declare what the schedule draws.
- **Types.** The existing type test asserts that `ref` takes an `HTMLDivElement` and that a ref typed at
  the old handle is an error.
- **Demo.** The handle example ("place a mark") uses the hook's functions. Every `ariaLabel` in the
  schedule's README, capabilities record, demo and tests, and in core's control-room page, moves to
  `aria-label`. Regenerate `API.md`.
- **Changelog** (Changed): the rename; the `ref` is the root `<div>`; `ScheduleHandle` is gone, and its
  three functions are on `useSchedule`'s return.

## Acceptance criteria

- [ ] `<s.Schedule ref={r} data-testid="plan" aria-label="Plan">` gives `r.current` as the root `<div>`,
      which carries the test id.
- [ ] `s.positionAt(x, y)` and `s.clientPointOf(t, lane)` answer as the handle did, in the existing tests
      moved to the hook, and return `null` before mount.
- [ ] `ScheduleHandle` is no longer exported.
- [ ] The guard covers `Schedule`, and the type test covers the ref.
- [ ] `pnpm check schedule`, `pnpm typecheck` and `pnpm check:site` pass, and
      `pnpm test:visual:quick schedule` passes.
- [ ] The changelog carries one migration line per change.
