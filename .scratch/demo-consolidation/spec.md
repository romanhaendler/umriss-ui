# Spec: One demo machine, three contents — the charts demo joins the shell

Status: done

Origin: session of 13 Sep 2026, immediately after the documentation proposal in `.scratch/docs-structure/spec.md`. The brief, in the words it was given in: "Ich würde auch gerne die Demo aufräumen." The inventory found one large thing and a handful of small ones. On the large one Roman was asked whether the claim *the charts demo proves the package runs without core* is worth what it costs, and answered: "klar verhandelbar". That answer is why this spec looks the way it does — the expensive alternative is recorded under **Considered and not taken** rather than proposed.

Builds on: `.scratch/demo-as-documentation/spec.md` (page anatomy, examples as files, the props tables and their JSDoc gate, the screenshot rules — all of which apply here unchanged unless stated) and `.scratch/table-demo/spec.md`, decision A, which extracted the shell into `@umriss-ui/demo` and wrote down, in the same breath, the condition under which charts would follow: *"If the charts demo should follow later, the shell is extracted then, from something that has proven itself."* It has now proven itself twice — 52 pages and 115 examples run on it.

Glossary: no new terms. Two entries in `CONTEXT.md` are corrected: the rubric list under **Rubric**, and **Page**, which gains the criterion for "Why it is like this" (see ticket 07).

ADRs: **0020 — The demo shell is shared by all three demos, and R-1.2 binds the package source.** Written in ticket 01. It reverses, deliberately and in writing, the note in `eslint.config.js` that says charts has a shell of its own.

Tickets: `issues/01`–`10`. Serial spine: 01 → 02 → 03 → 04 → 05. Tickets 06–10 hang off it and can be taken in any order once their blocker has landed.

---

## Problem Statement

The shell and the two demos that use it are in good order: examples are files, the list is derived, `parseFileName` is the single opinion about what an example is called, and there is no state in which an example is rendered but not photographed. Almost all of the disorder sits in one place.

**The charts demo is a second implementation of the same thing.** `Shell.tsx` (391 lines) and `shell.css` (623) stand beside `@umriss-ui/demo`, and **18 of their 29 class names are identical** — `shell`, `shellBody`, `rail`, `railEntry`, `railHead`, `overview`, `overviewGrid`, `overviewCount`, `shellKbd` and the rest. Even the jump palette is built a second time by hand (`Palette()`, `Shell.tsx:275`), while the shared shell uses `CommandPalette` from the library — which is a component this workspace ships, tests and photographs.

And it can do less. No source beside the example, no props table, no "Why it is like this", no copy button. The sentence in `TESTS.md` — the demo **is** the documentation — holds for two packages out of three.

**It has exactly the second list that core and table abolished.** The charts examples are written down twice: thirteen `{ id, name }` entries in `demo/outline.ts`, and thirteen `data-example="…"` attributes typed by hand into the JSX (twelve in `Showcase.tsx`, one in `Benchmark.tsx`). A new example that misses the outline is never photographed; an outline entry with no marking sends a test at nothing. In the other two demos both come out of the file name and neither can drift.

**Three words it uses are on the glossary's avoid lists.** `Showcase.tsx` — *Avoid* under **Demonstration**, and core's own `App.tsx` carries the comment explaining why it stopped being called that. `Section` — *Avoid* under **Rubric**. And `summary` where the shell's outline says `sentence`.

**The levels do not line up.** core and table: rubric → page (a component) → example, with a single-segment address (`#/button`) and the rubric deliberately kept out of it. charts: page (a *topic*) → example, address `#series/basic`. By the glossary's definition a page is "everything the demo says about one thing a reader looks up" — that is `Line`, `Bar`, `ControlChart`, not "Axes and area". What charts calls a page is, in this vocabulary, a rubric; the page level is missing, and the rubric sits in the address that core and table keep clean on purpose.

**Two smaller things, in the demos that are otherwise in order.** `Dock` and `TreeView` have no small example at all — only `99-demonstration.tsx`, 151 and 232 lines. The shell's own `examplesOf` argues against exactly that ("whoever saw it first would read six hundred lines before having seen thirty"): the rule is implemented, the examples to go with it were never written. And the criterion for when a page gets a "Why it is like this" exists — it stands in `demo-as-documentation`, *"it appears where there was a real decision and is absent otherwise"* — but it stands in a delivered spec under `.scratch/`, which is the one place a person editing the demo will not look. Fourteen of core's forty pages and six of table's twelve have one, and nothing visible says whether that is a judgement or a gap.

## Solution

**One demo machine, three contents.** What a demo *is* — shell, page, example, source, props table, palette, theme — exists once, in `@umriss-ui/demo`. What a demo *shows* lives in its package. Today that holds for two of three; after this it holds for all three.

Concretely: the charts examples become files under `demo/examples/`, its outline takes the shared shape, its demo moves into the shared shell, and `Shell.tsx`, `shell.css`, `Showcase.tsx` and the hand-built palette are deleted — about a thousand lines. Charts gains source display, props tables, "Why it is like this", the copy button, the real palette and a derived screenshot list.

**R-1.2 stays, and gets a better proof.** The rule that `@umriss-ui/charts` imports nothing from `@umriss-ui/core` is not weakened where it matters: it binds `packages/charts/src/**`, which is what is published. What is given up is the *demo* as a second, softer piece of evidence — and it was always the weaker one, since it proved something about the demo rather than about the package.

## Implementation Decisions

### The standalone claim is moved, not dropped

Four things prove it after this effort, and all four are checkable:

1. `eslint.config.js` forbids `@umriss-ui/core` in `packages/charts/src/**` — unchanged in force, narrowed in scope.
2. `packages/charts/package.json` names core in neither `dependencies` nor `peerDependencies`. It becomes a `devDependency`, alongside `@umriss-ui/demo`, both used only by `demo/`.
3. The package's own unit tests already mount it without core, including the SSR test.
4. `pnpm pack --dry-run` ships `dist/` and `CHANGELOG.md` — the demo is not in `files` and never was.

That is a stronger set than "the demo happens not to import it", and ADR-0020 records both the reversal and the replacement.

### Considered and not taken: making the shell core-free

The alternative was to pull `CommandPalette`, `useCommandPaletteShortcut` and `LanguageProvider` out of the shell behind a `palette?: ReactNode` prop, so that `@umriss-ui/demo` imports nothing from core and R-1.2 survives word for word. It works, and it was the recommendation until the claim turned out to be negotiable.

It is not taken because the price is paid in the wrong place: a seam through the shell, a palette passed in by three call sites, and the demo of `core` no longer showing its own palette in the position a reader meets it. That is architecture bent around a piece of evidence that the lint rule already carries. Recorded here so that it is a decision and not an oversight — reversing it later costs an afternoon.

### The pages of the charts demo *(needs confirmation)*

Ticket 03 has to say what a page is here, and the glossary's answer is "one thing a reader looks up by name". Recommended: **four rubrics, fourteen pages**.

- **Chart** (2): `Chart` (container, axes, layout) · `XAxis`/`YAxis`
- **Series** (6): `Line` · `Area` · `Bar` · `Scatter` · `StateBand` · `Matrix`
- **Monitoring** (4, name per ticket 09): `LimitLine`/`LimitBand` · `ControlChart` · `pareto` · `Span` (schedule and operating time stand with the components that draw them)
- **Around the chart** (2): `Tooltip`/`Legend` · `Benchmark`

The alternative is to keep today's four topics as pages. It reads well and breaks the glossary, the palette's grouping and the rule that an address names one thing — the same trade `table-demo` decision B settled the same way. **Example ids must be carried over unchanged** wherever an example survives: the baselines are named after the example, not the page, so a kept id is a kept picture.

### The benchmark stays out of the pictures

R-5.1 excludes it, and today that is a filter in `screenshots.spec.ts`. Derived lists have no natural place for an exception, so charts' `pages.ts` keeps one named filter with the rule as its reason. An exception with a name and a reason is this repository's own convention (`CONTEXT.md`, **Named exception**); an undocumented gap in a derived list is not.

### The demo data stays one module

`demo/data.ts` (336 lines) is seed-based and deterministic (R-6.2), and several examples share a series. When the examples become files they import from it; nobody inlines a second generator. The examples' *presentation* moves, their data does not.

## Testing Decisions

- **Green at every ticket boundary.** Each ticket leaves `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` and `pnpm test:visual` passing.
- **A baseline moves only where a ticket says so.** Tickets 02–05 keep every example id, so no picture changes. Ticket 03 changes addresses, which the suites read from the outline — that is why they are derived.
- Charts keeps its own Playwright projects (`charts-light`, `charts-dark`) in the root config.
- After ticket 05, charts' shell suite is the shared `checkShell` with probes of its own, as core and table have; the axe run joins `packages/demo/checks/accessibility.ts` with its single tolerated list.

## Sequencing

01 (the rule and the ADR) → 02 (examples become files) → 03 (the outline takes the shared shape) → 04 (the move into the shell) → 05 (the suites follow). Then, in any order: 06 (props tables — the largest single ticket, and the one with unmeasured JSDoc debt), 07 (the criterion and charts' first texts), 08 (small examples for `Dock` and `TreeView`), 09 (the rubric name), 10 (loose ends).

Tickets 02 and 08 are the two that are worth doing even if the effort stops afterwards: 02 removes the only real correctness defect in the demos, 08 fixes the two pages a newcomer is most likely to open first.

## Out of Scope

- One documentation site for all three packages. `table-demo` names it as a spec of its own; this effort is its first step and does not decide it.
- `library-audit` ticket 09 (the `forwardRef`/`className`/`rest` and controlled/uncontrolled renames) — open, touches components rather than demos.
- `visuelle-wertigkeit` 01–05 — open, and its ticket files still carry German names.
- The demos' visible text and the examples' content in core and table. This effort moves structure, not prose.

## Further Notes

**What this effort reverses, said plainly.** `demo-as-documentation` wrote that the two demos "diverge on purpose" and that charts is "a different animal — canvas, few discrete props, nothing a props table would carry". The first half was right at the time and is now the thing being undone; the second half turns out to be half true, and ticket 06 will say by how much. Charts exports **29** `*Props`/`*Config` interfaces. Whether they carry JSDoc is unmeasured — the ticket measures it before it promises anything, because core's gate found 149 undocumented props where the spec had estimated sixty.

**A correction to the session that produced this spec.** It was said in the analysis that no criterion exists for when a page gets a "Why it is like this". One does, in `demo-as-documentation`. The work in ticket 07 is therefore not to invent it but to move it to where the next person will find it — which is a smaller and better-founded ticket.
