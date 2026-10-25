# 08 - A Calculation without a name says so

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

An application places a `Calculation` with no `aria-label`. In development it now logs once that the
calculation has no accessible name, as a Chart does.

- **Calculation's `dev.ts`.** It is a copy of the table's: the DEV flag by core's rule, `warnOnce` per key,
  and the prefix `@umriss-ui/calculation:`.
- **The check.** The Calculation warns once when neither `aria-label` nor `aria-labelledby` is among the
  attributes it passes on. This holds on either side of `.scratch/root-contract/`'s changes to where those
  attributes land.

## Acceptance criteria

- [ ] A Calculation without either attribute warns once in DEV.
- [ ] A Calculation with `aria-label`, or with `aria-labelledby`, stays silent.
- [ ] Production is silent (the DEV flag reads `process.env.NODE_ENV` literally, as in the other packages).
- [ ] `pnpm check calculation` passes.
- [ ] The changelog notes the warning under "Added".
