# 04: Core's tree: Sizes leaves Forms, three new rubrics, six orders by the rule

Status: ready-for-agent
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
