# 01 - The plant generator

Status: done
Type: task

Spec: `.scratch/control-room-demo/spec.md`

## Scope

R2 as a pure, seeded generator.

## Acceptance

- Unit tests: deterministic by seed; one limit crossing produces the alarm and the verdict.

## Comments

Delivered as `packages/core/demo/plant.ts`: a seeded kiln line over an early
shift - readings per minute (zone 3, the exit pyrometer, the belt, tiles fired
and good), a measured tile every ten minutes, the batches through press, dryer
and kiln. `alarmsAt` derives the alarms (the kiln's with the table's dead band,
the silent pyrometer, the belt stopped by the operator as suppressed by design,
the dryer's sensor out of service) and applies the operator's acknowledgements;
`countAt` gives the OEE's figures, a tile fired outside the tolerance counted as
scrap. `tests-unit/plant.test.ts` holds determinism by seed and, over forty
seeds, that the one crossing is the alarm raised at that minute, the alarm
verdict of `assess`, one alarm cleared after the dead band, and the scrap.

The core demo reaches the four neighbours by alias (`vite.demo.config.ts`,
`vitest.config.ts`, `tsconfig.json`) rather than by a devDependency, which would
close a cycle with the table's peer dependency on core; the lint lets
`packages/core/demo/**` import them and keeps them out of everything else.
