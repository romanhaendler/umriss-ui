# Spec: Props tables in order — groups, clean prose, and a gate that keeps both

Status: done

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-as-documentation/spec.md` (the props table and its JSDoc gate), `.scratch/types-without-holes/spec.md` (the one table model and its two writers, `@default` and `@deprecated` read, the thirteen types exported).
Blocked by: types-without-holes
ADR: none
Tickets: `issues/01`–`04`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

The props tables are complete in one sense — every one of 810 props has a description, and CI enforces it — and untidy in three others.

**Order.** A table lists its rows in declaration order, and nothing else. `TableProps` has 20 rows, `TableSnapshot` 41, `ScheduleProps` 28; events, styling hooks, accessibility labels and the props that matter stand interleaved. Only the table and the schedule set `on…` props apart into an Events table, by a flag on the page; the other three packages do not, and the prerendered HTML and the llms text never do. A controlled prop and its uncontrolled twin (`value`, `defaultValue`, `onValueChange`) can stand rows apart.

**Prose a reader cannot follow.** 32 props of the charts cite requirement numbers of a spec that is not on the site: "Binding to a y axis (R-4.12)." eight times, "(R-2.5)", "(R-7.6)". Fifteen ADR numbers stand in descriptions as plain text, linking nowhere. One description sends the reader to a source path: "See `lib/language`."

**A gate that checks only presence.** "Default 10." and "Where it begins." pass it. A default stated in prose is invisible to the Default column. A type a table names may be one the package does not export, so the reader sees a name they cannot import — thirteen such names existed until `types-without-holes` exported them, and nothing stops the fourteenth.

## Solution

- **Rows are grouped by rules, the same in every package and every output.** The main group first; then **Events**, **Accessibility** and **Styling**, each under its own sub-heading. A controlled triple stays together in the main group. Deprecated rows stand last in their group. In a table of more than 15 rows the three secondary groups are folded, with their row count in the summary; everything is in the HTML either way.
- **Prose is cleaned and linked.** Requirement numbers leave the user-facing text for a tag the reader drops; an ADR number in any page text or description becomes a link to the ADR; the source path becomes a link to the Language page.
- **The gate grows by three error classes**, each listing every offender with file and line in one run: a default stated in prose without `@default`; a library type in a type cell that the package does not export; an internal reference (a requirement number or a source path) in user-facing text.

## User Stories

1. As a developer scanning a table, I want the props that shape the component first, so that I read what matters before callbacks and class names.
2. As a developer, I want every `on…` callback in an Events group in every package, so that I find the events in the same place on every page.
3. As a developer, I want `value`, `defaultValue` and `onValueChange` next to each other, so that I see the controlled and the uncontrolled way together.
4. As a developer, I want the accessibility props (`aria-…`, `ariaLabel`, `role`) together, so that I can check I have given every name a screen reader needs.
5. As a developer, I want `className`, `style` and the other styling hooks together and last, so that they do not interrupt the component's own props.
6. As a developer reading `TableSnapshot`, I want long secondary groups folded with their row count, so that a 41-row table is readable.
7. As a developer, I want a folded group still searchable with the browser's find, so that folding hides nothing from me.
8. As a developer, I want deprecated props last in their group, so that the current API reads first.
9. As a developer reading a chart prop, I want no "(R-4.12)" in the text, so that I am not sent to a document I cannot see.
10. As a developer, I want an ADR number in a description to be a link, so that I can read the decision it cites.
11. As a developer reading the provider's `language` prop, I want a link to the Language page instead of "See `lib/language`", so that I land on documentation, not on a folder name.
12. As a developer, I want the grouping identical on the page, in the prerendered HTML and in the llms text, so that every reader sees one table.
13. As a coding agent, I want the groups as sub-headings in the Markdown, so that I can tell events from props.
14. As a maintainer, I want the build to fail when a description states a default that the Default column does not show, so that the column stays true.
15. As a maintainer, I want the build to fail when a table names a library type the package does not export, so that every name a reader sees can be imported.
16. As a maintainer, I want the build to fail on a requirement number or a source path in user-facing text, so that internal references cannot leak back.
17. As a maintainer, I want each failure to list every offender with file and line, so that I fix them in one pass.
18. As a maintainer, I want the requirement numbers kept in the source in a tag, so that the trace to the charts spec is not lost.
19. As a maintainer, I want the grouping decided by rules on the prop's name, so that nobody curates 134 tables by hand.
20. As a maintainer, I want a prop that fits no rule to land in the main group, so that a new prop is never lost.
21. As a reader on a phone, I want the group sub-headings to stay readable and the folded summaries tappable, so that the tables work at 390 px.
22. As a reader using a keyboard or a screen reader, I want the folds to be native disclosure elements, so that they behave as every disclosure does.
23. As a developer, I want the group headings named the same in every table, so that I learn four words once.
24. As a developer, I want a table with only main-group rows to show no empty sub-headings, so that small tables stay small.

## Implementation Decisions

**The groups and their rules, applied in this order to each row.**
1. **Styling**: the name is `className`, `style`, or ends in `ClassName` or `Style`.
2. **Accessibility**: the name begins with `aria-` or `aria` followed by a capital letter, or is `role`.
3. **Events**: the name matches `on` followed by a capital letter — *except* a controlled callback: `on<X>Change` where the same table has a prop `<x>` (first letter lowered) stays in the main group, directly after `<x>`.
4. **Main**: everything else, unnamed (no sub-heading), first.

Order within a group is declaration order, with two moves: `default<X>` stands directly before `<x>`, and `on<X>Change` directly after it, so that the triple reads `defaultValue`, `value`, `onValueChange`; deprecated rows go last in their group. Group order: Main, Events, Accessibility, Styling. Sub-headings: "Events", "Accessibility", "Styling". The page-level flag that set events apart in two demos is removed; the rule applies everywhere.

**Folding.** When a table has more than 15 rows in total, each secondary group is a native disclosure element, closed, its summary naming the group and the row count ("Events · 12"). At 15 rows or fewer every group is open and plain. The main group never folds. The content is in the prerendered HTML in both states. The Markdown writer writes every group as a sub-heading with its rows; folding is an HTML matter. **A fold never hides a target.** When the page is reached with an address whose anchor names a row inside a closed group — a prop anchor of `props-to-examples`, a find of `one-search`, a link typed by hand — the shell opens that group before it scrolls to the row, on a full load and on an in-app jump alike; the browser's own auto-expansion of disclosures on fragment navigation is not relied on, because not every engine does it. Whichever of this spec and `props-to-examples` lands second makes this hold for the anchors of the other.

**One model, both writers.** Grouping and ordering happen in the table model of `types-without-holes`, before either writer runs, so the app, the prerendered page and the llms text cannot disagree.

**Prose.** Requirement numbers (`R-` followed by digits and dots) move out of the 32 charts descriptions into a `@remarks` tag on the same prop; the reader drops `@remarks`, the source keeps the trace. The 15 ADR mentions stay in the text and are rendered as links: every `ADR-` followed by four digits in a description or in any page text (lede, about, alternatives, keys, limits) becomes a link to that ADR's file in the repository on GitHub, resolved by number against the ADR directory at generation time — an ADR number that resolves to no file stops the generator. The "See `lib/language`" sentence becomes a link to the Language page. The two writers render these links identically.

**The gate's three new error classes.** Each runs in the generator that already stops at a missing description, reports all offenders in one run with file, line, type and prop, and fails the build — therefore CI, through the typecheck that runs the generator.
1. *Default in prose*: the description contains the word "default" (any case, as a word) and the row has no default from `@default` or the destructuring. The fix is a `@default` tag, which may be a phrase where the default is not a literal (`types-without-holes` renders a phrase as prose). There is no exception list: a phrase covers every case, including "no default".
2. *Unexported type*: a library type referenced in a type cell, a definition block or a table header is not exported from the package's entry or subpaths. There is no exception list.
3. *Internal reference*: a user-facing text contains a requirement number, or a source path (`src/` or `lib/` followed by a name, or a file name ending in `.ts`, `.tsx` or `.css`). There is no exception list.

No length rule: once `types-without-holes` moves "Default 10." into `@default`, a description that only stated a default is empty and the existing presence rule catches it.

## Testing Decisions

A good test hands the reader a fixture type and asserts the groups, the order and the gate's verdict.

- **Table model** (demo tooling unit tests, fixture package): a fixture with `className`, `aria-label`, `onClick`, `value`, `defaultValue`, `onValueChange` and a deprecated prop yields the groups and the order above; a 16-row fixture folds its secondary groups and a 15-row one does not; a table with only main rows has no sub-headings.
- **Shell suite**: an address whose anchor names a row in a closed group opens that group and shows the row in the viewport, on a full load and after an in-app jump.
- **Writer parity** (the parity test of `types-without-holes`): the groups and their order are the same in HTML and Markdown.
- **Gate tests**: one fixture per error class makes the generator fail and lists the offender with file and line; the corrected fixture passes. An unresolvable ADR number fails.
- **Built-site guard**: no page text on the built site contains `R-` followed by digits; every `ADR-` mention on the built site is inside a link.
- **Screenshot baselines**: none — the API section is not in the page-head or example pictures.

Prior art: the props reader fixture suite, the existing gate behaviour (a fixture with a bare prop), the built-site guard.

## Out of Scope

- Breaking long unions onto lines and hover popovers — `a11y-and-finish`.
- Anchors per prop and "Shown in" links — `props-to-examples`.
- Quality rules on description wording beyond the three classes (length, style).
- A search field inside a props table; site search covers props (`one-search`).
- Rendering ADRs on the site — `concepts-and-changelog-pages` may retarget the ADR links later.

## Further Notes

Siblings: `types-without-holes` (prerequisite: the model, the writers, the tags), `props-to-examples` (adds prop anchors to the same rows), `configurator` (reads the main group's literal-union and boolean props).

The grouping follows React Aria's rule-based groups (`/^on[A-Z]/` to Events, `aria-` to Accessibility) and Base UI's ordering of `defaultX`, `x`, `onXChange`; neither library renders a merged controlled row, and neither does this spec. The gate classes follow MUI's generator (which stops on an untyped callback parameter) and API Extractor's `ae-forgotten-export`.

Motivating numbers (build of `main` @ 3b2fa14): 134 tables, the largest 41 rows; events set apart in 2 of 5 demos and in no prerendered output; 32 requirement numbers, 15 unlinked ADR numbers, one source path in user-facing prose.

Acceptance:
- [ ] Every table in every package and output shows Main, then Events, Accessibility, Styling where present, with controlled triples together and deprecated rows last.
- [ ] Tables over 15 rows fold their secondary groups; nothing is missing from the prerendered HTML.
- [ ] An anchor to a row inside a closed group opens the group and lands on the row.
- [ ] Zero requirement numbers in user-facing text; every ADR mention is a link; no source path.
- [ ] The gate fails on each of the three new classes and the workspace passes it.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
