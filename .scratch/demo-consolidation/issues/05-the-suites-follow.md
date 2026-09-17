# 05 — The suites follow the shell

Status: done
Type: task

Blocked by: 04

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

Charts' Playwright suites still describe a shell that no longer exists. They move onto the shared checks, which is where core's and table's already are.

- **`pages.ts`** (new, as in core and table): pages from the outline, examples from the files under `demo/examples/` via `exampleAddresses` from `@umriss-ui/demo/checks/pages`. The one exception is the benchmark: it stays out of the screenshots per R-5.1, and it stays out **by a named filter with the rule as its reason**, in the shape of a named exception (`CONTEXT.md`, **Named exception**). An undocumented gap in a derived list is exactly what the derivation is meant to prevent.
- **`navigation.ts`** re-exports `open`/`openExample` from `@umriss-ui/demo/checks/navigation`, taking the address from the outline. The two-frame wait charts needs for its canvas (`requestAnimationFrame` twice) stays — it is charts' own and belongs here, not in the shell.
- **`features-shell.spec.ts`** becomes a `checkShell({ … })` call with probes of its own, in the shape core and table use: `notOnTheFrontDoor`, `chip`, `rail` (with its rubric id), `neighbours`, `deepLink`, `example`, `palettePage`, `abbreviation`, `pointer`. The four hand-written tests it replaces are covered by the shared ones; where one of them checked something charts-specific (the benchmark not running on the front door — it measures the moment it exists), that test stays, beside the shared call.
- **`accessibility.spec.ts`** (new for charts): the shared axe run against a sample of pages, using the one tolerated list in `packages/demo/checks/accessibility.ts`. If charts needs an entry of its own it carries a measurement and a reason, like every other.
- **`screenshots.spec.ts`** derives from `pages.ts` instead of filtering a hand-kept list.
- `features-interaction.spec.ts` stays as it is; it addresses examples, and their ids did not change.

**Baselines.** Every example id was carried through tickets 02 and 03, so the existing 26 pictures stand. New pictures appear where the shared shell photographs something charts never did — the overview and, if pages were split, one head per page. Those are new files, not moved ones: check that no existing baseline is overwritten in the same run.

## Acceptance

- `packages/charts/tests-visual/` holds `pages.ts`, `navigation.ts`, `screenshots.spec.ts`, `features-shell.spec.ts`, `features-interaction.spec.ts` and `accessibility.spec.ts`, and no shell test of its own.
- `pnpm test:visual` is green; `git status` shows added baselines and **no modified** ones.
- The benchmark is not photographed, and the filter that excludes it names R-5.1.
- `docs/testing.md` (or `TESTS.md`, if `.scratch/docs-structure` 05 has not landed) describes charts' layers as they now are.

## Comments

**Delivered, and the baseline claim did not hold.** The ticket says the existing
26 pictures stand because every example id was carried through. The ids were
carried through — but an example is now photographed *inside the shared shell*,
with a page head, a code block and a different width around it, and the shared
suite names a picture after page and example (`example-line--basic-…`) where
charts named it after the example alone (`basic-…`). Both the content and the
names are of something else.

So: the 26 old baselines were removed and the new set taken. Core's and table's
baselines were not touched. Keeping the old files would have meant comparing two
different demos and calling the difference a regression.

**And the new set does not reproduce either.** Two to four of the twenty-seven
example pictures differ from run to run, by 371 to 2338 pixels (a ratio of 0.001
to 0.006 against the bound of 0.001), on the numeric tick labels and along the
marks. Three waits were tried in `navigation.ts` — two frames, the plot
rectangles holding still at full precision, two frames that are pixel-identical
on every canvas — and none changed it; `--repeat-each=3` then showed the same
picture passing one repeat and failing the next within a single run. The variance
is in the rasterisation, not in the timing, and the old demo could not have it
because it drew in a fixed 1080-pixel column in `system-ui`.

Recorded in `docs/testing.md` under Known open, with the three ways out. **This
ticket is therefore not fully green**: core and table are, the charts' example
pictures are not.
