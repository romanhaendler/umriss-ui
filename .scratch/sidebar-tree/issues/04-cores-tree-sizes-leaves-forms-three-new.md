# 04: Core's tree: Sizes leaves Forms, three new rubrics, six orders by the rule

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/sidebar-tree/spec.md`

**What to build:** Core's sidebar reads as the table in the spec:
- **Getting started:** Installation, UmrissProvider.
- **Customising (new):** Sizes, Language. Theming slots in first later.
- **Layout:** Divider before Card.
- **Forms:** nine pages, with FormField right after Input. The rubric gets its new sentence.
- **Choosing (new):** Select, Combobox, MultiSelect.
- **Dates and times (new):** the four pickers.
- **Feedback, Navigation and Data display:** reordered simple to composed.

`CONTEXT.md`'s Rubric entry gains the sentence: when every later page of a rubric uses a page, reading order beats composition order. Prose and README passages that name a rubric for a moved page follow. No address changes.

- [ ] Sizes stands in Customising next to Language. Forms holds exactly Input, FormField, Textarea, NumberInput, Slider, Checkbox, Switch, RadioGroup, FileInput.
- [ ] Choosing and Dates and times exist with their sentences and pages. Customising sits right after Getting started, and the two new rubrics follow Forms.
- [ ] Layout, Feedback, Navigation and Data display run in the orders the spec lists.
- [ ] `CONTEXT.md` Rubric carries the reading-order sentence.
- [ ] Every core page keeps its address. Links to `#/sizes` and `#/language` still land.
- [ ] Core's shell suite probes (rubric id, palette rubric name, neighbours) are updated and green.
- [ ] Only `page-*` images whose rubric label changed move; no `example-*` image changes content; the commit states the counts.

## Comments

**Delivered.** Core's outline (`packages/core/demo/outline.ts`) now reads as the spec's table: Getting started (Installation, UmrissProvider), Customising (Sizes, Language), Layout (Stack and Grid, Divider, Card, Splitter, Dock), Typography, Actions, Forms (Input, FormField, Textarea, NumberInput, Slider, Checkbox, Switch, RadioGroup, FileInput) with its new sentence, Choosing (Select, Combobox, MultiSelect), Dates and times (the four pickers), Feedback (Spinner, ProgressBar, Skeleton, Alert, Toast, EmptyState), Overlays, Navigation (Breadcrumb, Tabs, Accordion, Stepper, TreeView), Data display (Badge, Tag, Stat, Meter, Sparkline). Page blocks were moved verbatim; no page id changed. The outline's head comment names the new cut and the FormField exception. `CONTEXT.md`, **Rubric**, carries the reading-order sentence, and its list of core's rubrics follows.

**Prose.** FormField's about said "Every field of this rubric reads …", which became false once Select and the pickers left Forms; it now says "Every field of Forms, Choosing and Dates and times reads …". No README or page text named "under Forms" or "Getting started" for Sizes or Language, so nothing else needed to follow.

**Tests.** Core's shell probes now run against the new rubrics: `rail` is Sizes in `customising` (the address carries no rubric), `neighbours` are Select and MultiSelect (Choosing), `palettePage` is `daterangepicker` with the rubric name "Dates and times". `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green; `ui-light` and `ui-dark` green except one pre-existing failure (below).

**Baselines.** `page-*`: 110 before, 110 after; 20 moved: sizes, language (Customising), select, combobox, multiselect (Choosing), datepicker, datetimepicker, daterangepicker, datetimerangepicker (Dates and times), light and dark, plus formfield (its about text above). Several of the nine rubric-label changes fell under the 0.1 % threshold and still passed; they were rewritten anyway so the baselines show the true label. Also moved, because they show the sidebar or the palette's rubric groups: `palette-window`, `palette-resting`, `drawer-beside-a-service-list`, `forced-combobox-cursor`, `forced-range` (light and dark, 10 images). `example-*`: 456 before, 456 after, none changed.

**Pre-existing, not touched.** `Example language--own-components` (ui-light) fails with this change and equally with main's outline restored (3 of 3 repeats): the ghost button "Today"/"Heute" renders slightly differently from its baseline. It is not caused by the tree and its baseline was left alone.
