# 07 — Rows instead of a multiplication

Status: ready-for-agent
Type: task

Spec: `.scratch/schedule-lane-groups/spec.md` ("Lane groups - Rows"; enables user stories 27–41)

## Scope

- ADR-0025 and the `CONTEXT.md` entry **Lane group** first: structure over lanes, never a lane; the miniature is a scale, not a packing.
- A pure module beside `geometry.ts`: tree + collapsed set → rows (`lane`, `groupHead`, `miniature`) with `top` and `height`, and a slot per real lane. Test-first.
- `laneTop`, `laneAt`, `maxScroll`, `lanesBottom`, `subtaskBox`, `drawGrid`, `drawOverlap`, `clientPointOf` and the headers read rows. No group exists yet, so the tree is flat.

## Acceptance

- Unit: the flat case equals today's arithmetic exactly; nested, folded, folded within folded; `laneAt` inverse to `laneTop` over random trees.
- **No picture is renewed.** A flat schedule is pixel-identical; every browser suite green without touching a snapshot.

## Comments
