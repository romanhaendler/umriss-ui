# 03: Every schedule page with a plot says its keys

Status: done
Blocked by: 02 (The silent-page check, with charts and calculation filled)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The check wired into the schedule demo. Every page with a plot gets `keysOf: ["schedule"]`; Dependencies gets its own rows for `]`, `[` and `t`/`T`, and Pan and zoom its own rows for Home/End and PageUp/PageDown (both also staying on First schedule); First schedule gets an Accessibility section for the plot's role, readout and summary.

- [x] The check passes on every schedule page, exceptions reasoned
- [x] Dependencies and Pan and zoom show their own rows plus the link to First schedule's keys
- [x] Screenshot baselines renewed for the pages that gained sections (none had to move: the photographed page heads do not hold the sections)

## Comments

Delivered.

- `packages/schedule/tests-visual/silent-pages.spec.ts` calls `checkSilentPages` with every page but the scenarios page, as charts and calculation do.
- One exception added to `UNANNOUNCED` in `packages/demo/checks/silentPages.ts`: `[data-schedule-plot] ~ [aria-live]`, the schedule's readout beside the plot, for the chart's reason - it speaks only after a key on the plot, and every schedule page's Keyboard section leads by `keysOf` to First schedule, whose Accessibility section describes it. The selector is the plot's data attribute, since the readout's class is a hashed module class of core's `VisuallyHidden`. No other live region stands in a schedule stage.
- `keysOf: ["schedule"]` on every page with a plot - which is every page: all 25 besides First schedule, so also installation, lane-groups, selection, move-and-lane and stretch (not in the spec's list, but their plot is focusable and the spec's acceptance asks every page with a focusable plot to link the root page's keys; lane-groups, selection, move-and-lane and stretch keep their own tables above the link).
- Dependencies has its own rows for `] or t` and `[ or Shift+T`, Pan and zoom for `Home / End` and `PageUp / PageDown` (the view pans to bring the active subtask in), worded as on First schedule, where they stay.
- First schedule has three Accessibility paragraphs: the figure and the plot's role `application` read as "schedule", name and summary, fold buttons, `ariaLabel` required; the polite readout after the keys rest (lane, task, subtask, times, findings by name; a dependency's lag and route), nothing for a pointer, "Belegungsplan" under `wording/de`; forced colours and reduced motion. Its `about` paragraph on the tab stop stays, since the page head is photographed.
- Proof: `tests-unit/demo-smoke.test.tsx` - Dependencies and Pan and zoom show their own keys and link `/schedule/#keyboard-schedule`, First schedule puts Accessibility right after Keyboard (red before the outline change, green after). With Routes' `keysOf` removed, the check failed with "routes: curve › div \"Search results, from layout to polish, curved lines\" takes Tab, and the page has no Keyboard section"; restored, it passes.
- Runs: lint, typecheck, test:unit green. Playwright under the lock: schedule-light × silent-pages, accessibility (its sample holds `schedule`), features-page, features-shell: 91 passed, 1 skipped; schedule-light page heads: 27 passed; charts-light silent-pages (the check file changed): 15 passed.
- Baselines: none moved - the page heads do not hold the new sections, and no example changed.
- `docs/testing.md`'s row names schedule and the second exception; the schedule CHANGELOG says what the pages gained.
