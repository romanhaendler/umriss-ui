# 05 - The schedule's server summary claims nothing

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/server-components/spec.md`

## What to build

On a server, the schedule renders its labelled frame and empty canvases, as its README says. Its
description no longer reads "0 lanes, 0 subtasks in view from 01/01 01:00 to 01/01 01:00" about a plan that
has lanes and a view.

- While the schedule's snapshot is the server snapshot, its description holds no summary sentence. The key
  help may stay. Once the lanes have registered after mount, the summary reads as today.
- `aria-describedby` keeps pointing at the description. An empty description claims nothing, as the chart's
  does before it draws.
- The schedule's README sentence on the server already says that the summary's counts arrive after mount.
  It now says that the summary does.

This settles the open point in `.scratch/open-points-roadmap/next.md` ("Loose ends"): on a server the
schedule renders its labelled frame and no lane label, by decision.

## Acceptance criteria

- [ ] The schedule's server test that expects "0 lanes, 0 subtasks" expects instead that the server markup
      holds no summary sentence. It still asserts the label, the empty canvas and identical markup on two
      renders.
- [ ] A test in jsdom shows the summary with the right counts after mount, for the same plan.
- [ ] `pnpm check schedule`, `pnpm check:site` and `pnpm test:visual:quick schedule` pass.
- [ ] Changelog: schedule, a patch entry.
