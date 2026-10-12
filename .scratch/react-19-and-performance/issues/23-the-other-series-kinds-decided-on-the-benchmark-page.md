# 23 - The other series kinds, decided on the charts' benchmark page

Status: ready-for-agent
Type: task
Size: M (two candidates, each tried and measured)

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "The charts"; user story 39

## What to build

Lines and areas draw only what the view shows; bars, scatter, the state
series and the matrix walk all their values on every frame of a pan or zoom.
Whether that costs anything a user notices was not measured. Two changes are
tried on the charts' existing benchmark page, which is first extended so that
it can show these kinds at volume, and each is kept only if the page shows
it.

1. **Bars, scatter, the state series and the matrix are windowed to the
   visible range**, as lines and areas are. A mark that is partly in view is
   drawn; the picture is pixel-identical.
2. **A matrix hit test that does not walk every cell.** What is hit is
   unchanged.

## Acceptance

- [ ] The benchmark page can be switched to each of the four kinds, and the
      charts' capability record gains their reference figures.
- [ ] For each of the two candidates: the figure before, the figure after,
      and "kept" or "dropped" in the capability record.
- [ ] A dropped candidate leaves no code behind.
- [ ] No screenshot moves; the charts' canvas pixel tests pass.
- [ ] `pnpm check charts` and `pnpm check:site` pass.
