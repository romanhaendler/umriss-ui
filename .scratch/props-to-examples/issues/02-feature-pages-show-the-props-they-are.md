# 02: Feature pages show the props they are about

Status: ready-for-agent
Blocked by: 01 (Every row names the examples that show it)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** A page whose outline lists no types but whose examples use documented rows shows a section "Props on this page" where the API section would stand: exactly those rows, grouped by their table in the full table's order, with type, default and description, a sentence naming and linking the full table and its page, and each row name linking to the full row's anchor. No "Shown in" line inside this section. A page with a table of its own gets no partial table. This lands the table's 15 and the schedule's 17 feature pages without tables.

- [ ] Sorting, Snapping and Ripple each show "Props on this page" with only the rows their examples use
- [ ] Each group is introduced by "From `<Type>` — the full table stands on <Page>." with a link
- [ ] Every row name reaches the full row on its home page (page suite: from a table feature page to First table)
- [ ] A page with its own table never shows the section; a page whose examples use no documented row shows none
- [ ] The section appears identically in the prerendered page, `llms-full.txt` and the demo
- [ ] Screenshot baselines of the affected feature pages renewed
