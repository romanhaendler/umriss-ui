# Spec: The defects a first visitor sees

Status: done

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-rework/spec.md` (scenarios first, the first example without a heading, worlds with a fixed moment), `.scratch/search-visibility/spec.md` (prerendered pages, `llms.txt` lines).
Blocked by: nothing
ADR: none
Tickets: `issues/01`–`03`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

Three things look broken in the first thirty seconds of a visit, and each comes from one cause that is easy to fix.

**A red "No connection · 199 days ago" on the table's landing page.** The table's first scenario, "Work through the alerts", is the first screen a visitor of `@umriss-ui/table` sees, and it says the feed is dead. The scenario's world is fixed at Tuesday, 17 March 2026, 10:30, and the alarm list is told that moment as the time its data was true (`asOf`), with a freshness rule of five minutes stale and thirty minutes lost. The freshness is measured against the real clock, so the age grows every day the site is up. It looks like a broken demo and reads as an outage. The core service-overview example already does it right: its world is fixed, and its feed's `asOf` is measured from the moment the page was loaded. The table scenario never adopted that convention, and no test would have noticed.

**An empty bar at the top of every page's first example.** The first example on a page is shown without a heading, by design (demo-rework). Its card still renders the head row, with an empty title slot and the "Code" toggle at the right. So the most prominent spot on 133 pages starts with a strip that holds one small word.

**The install command is a word inside a sentence.** On every Installation page the command stands inline in the first paragraph ("Install with `pnpm add @umriss-ui/core` (React 18 or newer)."). It is not a block and cannot be copied with a button. Each package spells it by hand, and the `llms.txt` line spells it a third way, from the package name alone: `pnpm add @umriss-ui/table` there forgets the core peer that the table needs. The front page shows no command at all.

## Solution

- Every feed's freshness on a scenario or example is measured from the moment the page was loaded, while the world keeps its fixed moment for everything else. A test under a clock years ahead proves that no scenario ever shows a lost feed.
- The first example's card has no head row. Its "Code" toggle moves to a slim foot under the stage: one sees the example first, then opens its code.
- One function derives the install command from a package's manifest: npm, the package, and its `@umriss-ui` peers. The Installation pages show it as a block with a copy button under the import line. The landing pages (`shell-across-packages`), the front page (`site-front-page`) and `llms.txt` use the same function. The inline commands in the prose go.

## User Stories

1. As a developer evaluating the table, I want its landing page to show a healthy, live-looking alarm list, so that I judge the component and not an apparent outage.
2. As a developer evaluating umriss-ui months after a release, I want no scenario to age into an error state, so that the site looks as good next year as today.
3. As a developer reading a scenario, I want the times of alarms, tasks and readings to stay those of the scenario's world, so that the story on the screen stays consistent.
4. As a developer learning freshness, I want examples that deliberately show a stale or lost feed to keep doing so, so that the states are still demonstrated where they are the subject.
5. As the maintainer, I want a test that runs every scenario under a clock far in the future, so that a scenario tied to a fixed date fails before it ships.
6. As the maintainer, I want the rule "a world has a fixed moment; a feed's freshness counts from page load" written down once, so that the next scenario follows it.
7. As a developer arriving on any page, I want the first example to start with the component, not an empty bar, so that the first thing I see is the thing I came for.
8. As a developer, I want the first example's "Code" toggle under its stage, so that I can open the code right where I finish looking at the example.
9. As a screen-reader user, I want the first example still named by its title (as its accessible name), so that moving the toggle does not lose the example's label.
10. As a keyboard user, I want the toggle reachable right after the example's content, so that the tab order follows what I see.
11. As a developer on an Installation page, I want the install command as a block with a "Copy" button, so that I copy it in one click without selecting text.
12. As a developer installing the table, the schedule or the calculation, I want the command to include the peers they need, so that the first install does not fail with missing peers.
13. As a developer, I want the same command on the front page, the landing pages, the Installation pages and in `llms.txt`, so that I never meet two different instructions.
14. As a coding agent, I want `llms.txt` to carry the complete install command with peers, so that the code I write installs what it imports.
15. As a reader without JavaScript, I want the install command as text in the prerendered page, so that I can select and copy it by hand.
16. As the maintainer, I want the command derived from the manifest, so that a new peer dependency updates every instruction at once.
17. As a developer, I want the Installation page's prose to explain what the command does (the peers, the stylesheet, React's version), so that the text adds to the command instead of repeating it.

## Implementation Decisions

**Freshness counts from page load.** A scenario or example whose world has a fixed moment keeps it for everything in the world: alarm raised times, acknowledgement times, task times, chart data. Only the value handed as a feed's `asOf` to a freshness-bearing component (AlarmList, Stat, Given, anything taking `asOf` together with freshness ages) is the moment the module was loaded, minus the feed's plausible delay. This is the pattern the core service overview example already uses (`LOADED - 40_000`).

The table scenario "Work through the alerts" adopts it: its alarm list's `asOf` becomes the load moment minus forty seconds. Its acknowledgements and alarm times keep the world's fixed moment. Every other scenario and example that combines a fixed moment with freshness is checked and brought under the same rule: the kiln line scenario, the Stat examples, the Given example and the AlarmList examples. Examples whose subject is a stale or lost feed (AlarmList "Tell quiet from disconnected", the Stat freshness example) keep showing it, but relative to load, as they already do.

The rule is written once as a sentence in the shell's description of worlds. The scenarios do not get a clock of their own; the kiln line keeps its simulated clock, which already moves from load.

**The first example has no head.** The example card renders its head row only for examples with a visible title. The hero renders, in order: lead (if any), stage, then a foot row with the "Code" toggle at its right, styled like the head-row toggle (chevron and word). The hero section keeps its accessible name from the example's title, as today. Nothing changes for the other examples.

**One install command.** The shell tooling gets one function that takes a package manifest and returns `npm install <name> <@umriss-ui peers…>`. Peers come in the order core, charts. Non-`@umriss-ui` peers (React) are not part of the command; the prose names React's version. It is used by:
- the Installation page of every package: the outline marks the page that installs (one flag on the page), and the page renders the command as a code block with the existing copy button, directly under the import line, in the app and in the prerendered HTML;
- the per-package `llms.txt` line ("Install with `…`"), replacing its own spelling;
- the landing page head (`shell-across-packages`) and the front page (`site-front-page`).

The inline "Install with `pnpm add …`" phrases leave the five Installation pages' prose. The sentences around them are kept and rewritten to say what the command brings: the peers and why, the stylesheet, React's version.

npm is used everywhere on the site as the lowest common denominator. The README keeps its pnpm quick start, because the README's readers are contributors to a pnpm workspace.

## Testing Decisions

A good test here renders what a visitor gets and reads the text and structure: what the scenario says about its feed, whether a head row exists, what the command is. It never asserts internal timestamps.

- **Seam: each package's jsdom demo smoke test** (prior art: the table's `demo-smoke` test and its siblings in the other four packages, which already render every scenario and example). Each gains one case: with the system clock set to 1 January 2030 (fake timers, system time only), every scenario renders without the wording entry for a lost feed and without the one for a stale feed. Examples are left out of this case because some show those states on purpose.
- **Seam: the tooling unit tests** for the install function: core alone, table with core, schedule with core and charts, a manifest without peers.
- **Seam: the llms tests** (prior art: the generator against the fixture package): the fixture's `llms.txt` line carries the derived command.
- **Seam: the page suite** (`checkPage`, prior art: the copy test that reads the clipboard): on an Installation page the command block's copy button puts exactly the derived command on the clipboard; on any page the first example has no head row and its toggle sits after the stage.
- **Screenshot baselines:** every page-head baseline (the image from the head to the first example) changes once, because the hero loses its head row. The table landing's baseline changes because the freshness word changes. Both are renewed in the ticket that makes the change.

## Out of Scope

- The scenario "Code" toggle's missing chevron, the mobile callout overlap and the mobile scenario tables (`a11y-and-finish`).
- The title after navigation, the active sidebar entry, the name, the favicon (`shell-across-packages`).
- Internal requirement ids and ADR numbers in prose (`props-table-hygiene`).
- The `/table/table/` address (`sidebar-tree`).
- A package-manager switch (npm / pnpm / yarn tabs): one command, one form.

## Further Notes

- Siblings: `shell-across-packages` and `site-front-page` use the install function; whichever lands first writes it.
- Research: asis_site_ux section 6, items 8, 12 and 13, and section 4 (the `llms.txt` install line). The research put the red freshness word among the defects a first visitor sees within thirty seconds.
- Acceptance:
  - [ ] No landing page shows a stale or lost feed, today or under a clock in 2030.
  - [ ] The rule for fixed worlds and freshness is written once in the shell.
  - [ ] No example card starts with an empty head row; the hero's toggle sits under its stage.
  - [ ] All five Installation pages show the derived command as a copyable block; no `pnpm add` remains in the demos' prose.
  - [ ] `llms.txt` of table, schedule and calculation names their peers in the install line.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
