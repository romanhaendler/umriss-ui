# 08 — Lane groups

Status: ready-for-agent
Type: task

Blocked by: 05, 07
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 27, 28, 35–38, 40, 42)

## Scope

- `<LaneGroup id label>` to any depth; `parent` on `LaneConfig` through context; the tree derived in registration order.
- `collapsedGroups`, `defaultCollapsedGroups`, `onCollapsedGroupsChange`; inner entries kept while an outer group is folded.
- Headers: chevron button with `aria-expanded`/`aria-controls`, label, count of lanes, indentation by a token per depth; the wording in English and `wording/de`. `styles.headerRun` settled.
- Open groups show their slim head; a folded group shows an **empty** row of the miniature's height - the drawing is 09.
- The chapter *Lane groups* with examples: a group, nesting, controlled state.

## Acceptance

- Browser: fold by button, by keyboard, from outside; nested state restored on re-opening; subtasks on folded lanes are not drawn on other rows.
- "Nothing in its own way" covers the group headers.
- axe clean on the new chapter; pictures new, count stated.

## Comments
