# 01 - The dashboard takes a heading level

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/root-contract/issues/07-calculation-and-dashboard-take-a-ref.md`
Spec: `.scratch/dashboard-small-wishes/spec.md`

## What to build

A dashboard fits the outline of the page it stands on. Today every widget title and the heading widget are a
fixed `h2` (`.scratch/shakedown/audit-family.md` 7).

- **The prop.** `Dashboard` takes `headingLevel?: 2 | 3 | 4 | 5 | 6`, default 2, worded as core's
  `Accordion` words its own.
  - The heading widget stands at the level.
  - A widget title stands one level below it when the drawn view holds a heading widget, and at the level
    when not. In the editing mode the drawn view is the draft, so adding or undoing the first heading widget
    moves the titles at once.
  - One below 6 is 6.
  - Nothing a reader sees changes: the heading widget keeps its size, and a title its type.
- **The demo.** Every dashboard in the examples takes `headingLevel={4}`, since an example stands under the
  shell's `h3`. The scenario's takes `headingLevel={3}`, under the scenario's `h2`.
- **The unit test**, beside the dashboard's existing ones, asserts on heading roles and their levels:
  - without heading widgets, at the default and at 3;
  - with heading widgets, at the default, at 3 and at 6;
  - in a draft, adding a heading widget moves the titles one level down, and undo moves them back.
- **README.** One sentence beside "Declared like a table", naming the prop and the rule.
- **Changelog**, under "Added": `headingLevel`. It also notes that a dashboard with heading widgets now has
  its titles one level below them.

## Acceptance criteria

- [ ] The unit test passes, and fails if the titles are drawn at a fixed level.
- [ ] In the demo, no dashboard page has a heading level that skips a level or repeats the level of the
      example's or scenario's own title (checked by eye in the browser's accessibility tree, and by the
      accessibility suite passing).
- [ ] The screenshots of the dashboard's examples and scenario are unchanged.
- [ ] `pnpm check dashboard` and `pnpm check:site` pass, and `API.md` is regenerated with the prop.
