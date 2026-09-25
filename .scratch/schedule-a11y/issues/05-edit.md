# 05 - Editing by key

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/schedule-a11y/spec.md`

## Scope

S5 through the existing intents.

## Acceptance

- Unit tests: each key proposes exactly the intent the drag would.

## Comments

Alt+Left/Right proposes `move` by one step of the raster, Alt+Shift+Left/Right `stretch` of the end, only where `intents` lists them; without a raster the fine band's step. One arithmetic with the drag: `SceneGestures.shifted` moves a time in OPERATING time and snaps, and both the drag's move and the keys call it - so a key crosses a removed night as a drag does (tested: back from a morning's start to the evening before). The stretch keeps the drag's floor (a step or a minute). Nothing is applied; the readout speaks what stands after the caller answered.

Tests in `keys.test.ts`: each key's intents equal those of the drag of one step, nothing where the intent is not handled, the calendar case.
