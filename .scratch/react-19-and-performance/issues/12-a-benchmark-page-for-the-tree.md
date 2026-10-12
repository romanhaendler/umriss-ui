# 12 - A benchmark page for the tree

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "Measuring"; user stories 41, 42, 43

## What to build

A page in core's demo on which what a large virtualised tree costs can be
read, built as the charts' benchmark page is: a node count that can be set (up
to 100 000), the figures shown on the page, left out of the screenshot
comparison. It measures from outside and adds no prop.

What it shows: the first render; a scripted walk of the **Active node** with
the arrow keys, as time per key; a scripted scroll, as render time per scroll
event.

The reference figures go into the tree's capability record as a new section,
at three sizes, with machine, browser and method.

## Acceptance

- [ ] The page is reachable in core's demo, has its place in the outline and
      is excluded from the screenshot comparison.
- [ ] Core's `API.md` is unchanged.
- [ ] The tree's capability record holds the reference figures and how they
      were taken.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core`
      pass.
