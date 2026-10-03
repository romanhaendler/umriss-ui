# 01: Props are grouped and ordered by one rule everywhere

Status: ready-for-agent
Blocked by: `types-without-holes` 01 (One table model, two writers), `types-without-holes` 03 (`@deprecated` and `@default` are read)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** In the table model, before either writer runs, rows fall into Main (unnamed, first), Events, Accessibility, Styling by the spec's rules; a controlled triple reads `defaultValue`, `value`, `onValueChange` in Main; deprecated rows stand last in their group. The page-level flag that set events apart in two demos is removed; every table in every package and output follows the rule.

- [ ] Table-model fixture: `className`, `aria-label`, `onClick`, `value`, `defaultValue`, `onValueChange` and a deprecated prop yield the groups and order of the spec; a table with only main rows has no sub-headings.
- [ ] The parity test holds groups and order equal in HTML and Markdown.
- [ ] Every table on the built site and in `llms-full` shows Main, then Events, Accessibility, Styling where present.
- [ ] The events flag no longer exists in any outline.
