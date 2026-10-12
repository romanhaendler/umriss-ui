# 11 - A benchmark page for the schedule

Status: done
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "Measuring"; user stories 41, 42, 43

## What to build

A page in the schedule's demo on which what the schedule costs can be read,
built as the charts' benchmark page is: a plan whose size can be set (lanes,
subtasks, dependencies - up to several thousand subtasks and as many
dependencies), the figures shown on the page, left out of the screenshot
comparison.

It measures from outside - React's profiler, the clock and the frame times -
and adds no prop to the schedule unless the page cannot be built without one;
in that case the prop gets its place on the site like every export
(ADR-0044). What it shows:

- the first render;
- a scripted pointer walk along one bar and across many: time per pointer
  event, renders of the component, frames;
- a scripted pan and a scripted wheel zoom: time per event, frames.

The schedule gets a capability record (it has none), and the map of documents
points at it. Its first section holds the reference figures at three plan
sizes, with machine, browser and method.

## Acceptance

- [ ] The page is reachable in the schedule's demo, has its place in the
      outline and is excluded from the screenshot comparison.
- [ ] The schedule's `API.md` is unchanged, or the one new prop is on the site
      and the ticket says why the page needed it.
- [ ] The capability record exists with the reference figures and how they
      were taken, and the map of documents names it.
- [ ] `pnpm check schedule`, `pnpm check:site` and
      `pnpm test:visual:quick schedule` pass.
